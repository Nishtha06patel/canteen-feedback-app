import * as pdfjsLib from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Provide local worker resolving via Vite to ensure exact version matching and avoid CDN issues
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

/**
 * Extracts raw textual layout from an uploaded PDF blob
 */
const extractTextFromPDF = async (file) => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullLines = [];
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            
            // Reconstruct lines naively by Y coordinate
            let lastY = -1;
            let currentLine = '';
            
            // Sort items by Y descending (top to bottom), then X ascending (left to right)
            const items = textContent.items.sort((a, b) => {
                if (Math.abs(a.transform[5] - b.transform[5]) > 5) {
                    return b.transform[5] - a.transform[5];
                }
                return a.transform[4] - b.transform[4];
            });

            for (const item of items) {
                if (lastY !== -1 && Math.abs(item.transform[5] - lastY) > 5) {
                    fullLines.push(currentLine.trim());
                    currentLine = '';
                }
                currentLine += item.str + ' ';
                lastY = item.transform[5];
            }
            if (currentLine) fullLines.push(currentLine.trim());
        }
        return fullLines;
    } catch (e) {
        console.error("PDF Parsing Error:", e);
        throw new Error("Failed to extract data from PDF. Ensure the file is not corrupted.");
    }
};

/**
 * Attempts to parse the raw text lines and infer the menu.
 * Uses a heuristic match for dates and meal blocks.
 */
export const processMenuUpload = async (file, updateMenuFunction) => {
    const lines = await extractTextFromPDF(file);
    if (!lines || lines.length === 0) throw new Error("No text found in PDF");

    // We'll track state as we march down the lines
    let currentDate = null;
    let currentBlock = null;
    let itemsParsed = 0;

    let parsedPayload = {}; // map of date -> { block: [items] }

    const blockIdentifiers = {
        'morning': 'breakfast',
        'breakfast': 'breakfast',
        'snack': 'evening_snack',
        'evening': 'evening_snack',
        'lunch': 'lunch',
        'dinner': 'dinner',
        'full': 'full_day'
    };

    lines.forEach(line => {
        const lowerLine = line.toLowerCase();
        
        // Match a date string (YYYY-MM-DD or DD/MM/YYYY)
        const dateMatch = line.match(/(\d{4}-\d{2}-\d{2})|(\d{1,2}\/\d{1,2}\/\d{4})/);
        if (dateMatch) {
            let matched = dateMatch[0];
            if (matched.includes('/')) {
                const parts = matched.split('/');
                matched = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }
            currentDate = matched;
            if (!parsedPayload[currentDate]) parsedPayload[currentDate] = {};
            return;
        }

        if (!currentDate) return; // Skip everything until we find a date

        // Match a meal block header
        for (const [key, id] of Object.entries(blockIdentifiers)) {
            if (lowerLine.includes(key)) {
                currentBlock = id;
                if (!parsedPayload[currentDate][currentBlock]) parsedPayload[currentDate][currentBlock] = [];
                return;
            }
        }

        // If we have a date and block, parse items
        if (currentDate && currentBlock && line.trim().length > 2) {
            // Very naive parser: 'Idli - 30, Dosa - 40' OR 'Sabji, Roti'
            // Check if it's supposed to be a combo
            const isComboBlock = currentBlock === 'lunch' || currentBlock === 'dinner';
            
            if (isComboBlock) {
                // If the block is empty, initialize the single combo item
                if (parsedPayload[currentDate][currentBlock].length === 0) {
                    parsedPayload[currentDate][currentBlock].push({
                        name: `Full ${currentBlock === 'lunch' ? 'Lunch' : 'Dinner'}`,
                        price: 60,
                        isCombo: true,
                        subItems: []
                    });
                }
                const itemsList = line.split(',').map(s => s.trim()).filter(s => s);
                parsedPayload[currentDate][currentBlock][0].subItems.push(...itemsList);
                itemsParsed++;
            } else {
                // Individual items
                const itemStrs = line.split(',').map(s => s.trim()).filter(s => s);
                itemStrs.forEach(i => {
                    let price = 30;
                    let name = i;
                    if (i.includes('-')) {
                        const parts = i.split('-');
                        const parsedP = parseInt(parts[parts.length - 1].trim());
                        if (!isNaN(parsedP)) {
                            price = parsedP;
                            parts.pop();
                            name = parts.join('-');
                        }
                    } else if (name.toLowerCase().includes('tea') || name.toLowerCase().includes('coffee')) {
                        price = 10;
                    }
                    parsedPayload[currentDate][currentBlock].push({ name, price });
                    itemsParsed++;
                });
            }
        }
    });

    if (itemsParsed === 0) {
        throw new Error("Could not definitively extract any meal items or dates. The PDF format must contain dates (YYYY-MM-DD) and headers (Breakfast, Lunch) followed by items.");
    }

    // Apply the extracted data
    let daysUpdated = 0;
    for (const [dateStr, blocks] of Object.entries(parsedPayload)) {
        for (const [blockId, items] of Object.entries(blocks)) {
            // Clean up combo subitems if necessary
            await updateMenuFunction(dateStr, blockId, items);
        }
        daysUpdated++;
    }

    return { daysUpdated, itemsParsed };
};
