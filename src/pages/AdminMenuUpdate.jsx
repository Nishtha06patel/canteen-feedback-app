import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Upload, Download, Archive, ArrowLeft } from 'lucide-react';
import { processMenuUpload } from '../utils/pdfParser';
import { savePdfRecord, getAllPdfRecords, fileToBase64 } from '../utils/db';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const AdminMenuUpdate = () => {
    const { getMenuForDate, updateMenuForDate } = useAppContext();
    const navigate = useNavigate();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [editingBlock, setEditingBlock] = useState(null);
    const [editValue, setEditValue] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadHistory, setUploadHistory] = useState([]);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const history = await getAllPdfRecords();
            setUploadHistory(history);
        } catch (e) {
            console.error("Failed to load PDF history", e);
        }
    };

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const menuForSelectedDate = getMenuForDate(dateStr);

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const onDateClick = (day) => {
        setSelectedDate(day);
        setEditingBlock(null);
        setIsModalOpen(true);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsUploading(true);
        try {
            const { daysUpdated, itemsParsed } = await processMenuUpload(file, updateMenuForDate);
            
            // Generate DB record
            const base64Data = await fileToBase64(file);
            await savePdfRecord({
                id: Date.now(),
                filename: file.name,
                timestamp: Date.now(),
                daysUpdated,
                itemsParsed,
                base64: base64Data
            });
            await fetchHistory();
            
            alert(`Successfully loaded ${itemsParsed} items across ${daysUpdated} dates from the PDF!`);
        } catch (error) {
            alert(`Failed to process PDF: ${error.message}`);
        } finally {
            setIsUploading(false);
            e.target.value = null; // reset input
        }
    };

    const handleDownloadIndividual = (record) => {
        saveAs(record.base64, record.filename);
    };

    const handleExportAll = async () => {
        if (uploadHistory.length === 0) return alert("No PDFs to export");
        const zip = new JSZip();
        uploadHistory.forEach((record, index) => {
            // Strip the standard base64 data URI wrapper
            const b64Data = record.base64.split(',')[1];
            const safeFileName = `${index + 1}_${record.filename}`;
            zip.file(safeFileName, b64Data, { base64: true });
        });
        
        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(content, `canteen_pdfs_export_${format(new Date(), 'yyyy-MM-dd')}.zip`);
    };

    const renderHeader = () => (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '0 1rem' }}>
            <button onClick={prevMonth} className="btn btn-outline" style={{ padding: '0.4rem 1rem' }}>&larr; Prev</button>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{format(currentMonth, 'MMMM yyyy')}</h2>
            <button onClick={nextMonth} className="btn btn-outline" style={{ padding: '0.4rem 1rem' }}>Next &rarr;</button>
        </div>
    );

    const renderDays = () => {
        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '0.5rem' }}>
                {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                    <div key={d} style={{textAlign:'center', fontWeight:'bold', color:'var(--text-muted)'}}>{d}</div>
                ))}
            </div>
        );
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const days = eachDayOfInterval({ start: startDate, end: endDate });

        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
                {days.map(day => {
                    const isSelected = isSameDay(day, selectedDate);
                    const isCurrentMonth = isSameMonth(day, monthStart);
                    
                    return (
                        <div
                            key={day.toISOString()}
                            onClick={() => onDateClick(day)}
                            style={{
                                padding: '1rem',
                                textAlign: 'center',
                                cursor: 'pointer',
                                borderRadius: '8px',
                                background: isSelected ? 'var(--primary)' : (isCurrentMonth ? 'rgba(255,255,255,0.05)' : 'transparent'),
                                border: isSelected ? '1px solid var(--highlight-cyan)' : '1px solid transparent',
                                color: isCurrentMonth ? 'var(--text-main)' : 'var(--text-muted)',
                                transition: 'all 0.2s',
                                fontWeight: isSelected ? 'bold' : 'normal'
                            }}
                            className="hover-grow"
                        >
                            <span style={{ color: isSelected ? '#000' : 'inherit' }}>{format(day, 'd')}</span>
                        </div>
                    );
                })}
            </div>
        );
    };

    const MEAL_BLOCKS = [
        { id: 'breakfast', title: 'Morning Snack', isCombo: false },
        { id: 'lunch', title: 'Lunch', isCombo: true },
        { id: 'evening_snack', title: 'Evening Snack', isCombo: false },
        { id: 'dinner', title: 'Dinner', isCombo: true },
        { id: 'full_day', title: 'Full Day', isCombo: false }
    ];

    const convertItemsToText = (items, isCombo) => {
        if (!items || items.length === 0) return '';
        if (isCombo) {
            const block = items[0];
            const price = block?.price || 60;
            const sub = block?.subItems ? block.subItems.join(', ') : '';
            return `${price} | ${sub}`;
        } else {
            return items.map(item => `${item.name} - ${item.price}`).join(', ');
        }
    };

    const handleEditClick = (block) => {
        const items = menuForSelectedDate[block.id];
        setEditValue(convertItemsToText(items, block.isCombo));
        setEditingBlock(block.id);
    };

    const handleSave = async (block) => {
        let newItemsArray = [];
        
        if (block.isCombo) {
            let price = 60;
            let subItemsText = editValue;
            if (editValue.includes('|')) {
                const parts = editValue.split('|');
                const parsedPrice = parseInt(parts[0].trim(), 10);
                if (!isNaN(parsedPrice)) {
                    price = parsedPrice;
                }
                subItemsText = parts.slice(1).join('|'); // Join in case there are multiple |
            }
            const itemsList = subItemsText.split(',').map(s => s.trim()).filter(s => s);
            
            newItemsArray = [{
                name: `Full ${block.title.split(' ')[0]}`,
                price: price,
                isCombo: true,
                subItems: itemsList
            }];
        } else {
            const itemsList = editValue.split(',').map(s => s.trim()).filter(s => s);
            newItemsArray = itemsList.map(itemStr => {
                let name = itemStr;
                let price = 30; // default
                
                if (itemStr.includes('-')) {
                    const lastDashIdx = itemStr.lastIndexOf('-');
                    const potentialPrice = parseInt(itemStr.substring(lastDashIdx + 1).trim(), 10);
                    if (!isNaN(potentialPrice)) {
                        price = potentialPrice;
                        name = itemStr.substring(0, lastDashIdx).trim();
                    }
                } else {
                    const lower = name.toLowerCase();
                    if (lower.includes('tea') || lower.includes('coffee') || lower.includes('milk')) price = 10;
                    else if (lower.includes('pulav')) price = 70;
                    else if (lower.includes('paneer')) price = 60;
                    else if (lower.includes('maggi') || lower.includes('pasta')) price = 50;
                }
                
                return { name, price };
            });
        }

        try {
            await updateMenuForDate(dateStr, block.id, newItemsArray);
            setEditingBlock(null);
        } catch (error) {
            alert(error.message || 'Failed to save menu.');
        }
    };

    return (
        <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <button 
                    onClick={() => navigate('/admin/dashboard')} 
                    className="btn btn-outline hover-grow" 
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderColor: 'var(--glass-border)' }}
                >
                    <ArrowLeft size={18} /> Back to Dashboard
                </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', margin: 0 }}>Menu Update</h1>
                <label className="btn btn-primary hover-grow" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: isUploading ? 'not-allowed' : 'pointer', opacity: isUploading ? 0.7 : 1 }}>
                    <Upload size={20} />
                    {isUploading ? 'Parsing PDF...' : 'Bulk Upload PDF'}
                    <input type="file" accept="application/pdf" style={{ display: 'none' }} onChange={handleFileUpload} disabled={isUploading} />
                </label>
            </div>
            
            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                {renderHeader()}
                {renderDays()}
                {renderCells()}
            </div>

            {isModalOpen && selectedDate && (
                <div className="feedback-modal-wrapper" style={{ zIndex: 3000, alignItems: 'flex-start', paddingTop: '5vh' }}>
                    <div className="feedback-modal animate-pop-in" style={{ maxWidth: '800px', width: '95%', maxHeight: '90vh', flexDirection: 'column' }}>
                        <div className="feedback-modal-content" style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            <div style={{ marginTop: '0.5rem' }}></div>

                            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', paddingRight: '0.5rem' }}>
                                <button onClick={() => setIsModalOpen(false)} className="back-btn" style={{ marginTop: '0.5rem' }}>
                                    <span style={{ fontSize: '1.2rem' }}>←</span> BACK
                                </button>
                                
                                <h2 style={{ fontSize: '1.25rem', fontWeight: '900', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Menu for {format(selectedDate, 'eeee, MMMM do, yyyy')}
                                </h2>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', paddingBottom: '1rem' }}>
                                {MEAL_BLOCKS.map(block => {
                                    const items = menuForSelectedDate[block.id] || [];
                                    const isEditing = editingBlock === block.id;

                                    return (
                                        <div key={block.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.03)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                                <h3 style={{ margin: 0, color: 'var(--highlight-cyan)' }}>{block.title}</h3>
                                                {!isEditing && (
                                                    <button onClick={() => handleEditClick(block)} className="btn btn-outline" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}>Edit</button>
                                                )}
                                            </div>

                                            {isEditing ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                                                    <textarea 
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        className="input-field"
                                                        style={{ width: '100%', minHeight: '100px', resize: 'vertical', fontSize: '0.9rem' }}
                                                        placeholder={block.isCombo ? "e.g. 60 | Sabji, Dal, Rice, Roti" : "e.g. Tea - 15, Coffee - 20, Soda"}
                                                    />
                                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: 'auto' }}>
                                                        <button onClick={() => setEditingBlock(null)} className="btn btn-outline" style={{ padding: '0.4rem 1rem' }}>Cancel</button>
                                                        <button onClick={() => handleSave(block)} className="btn btn-primary" style={{ padding: '0.4rem 1rem' }}>Save</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', opacity: 0.9 }}>
                                                    {items.length === 0 ? (
                                                        <div style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>No items</div>
                                                    ) : (
                                                        block.isCombo && items[0]?.subItems ? (
                                                            <div style={{ whiteSpace: 'pre-line', lineHeight: '1.8' }}>
                                                                {items[0].subItems.join('\n')}
                                                                <br/><span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>(Combo - ₹{items[0].price})</span>
                                                            </div>
                                                        ) : (
                                                            <div style={{ whiteSpace: 'pre-line', lineHeight: '1.8' }}>
                                                                {items.map(i => `${i.name} (₹${i.price})`).join('\n')}
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Upload History Section */}
            <div className="glass-panel" style={{ padding: '2rem', marginTop: '3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1.5rem', color: 'var(--text-main)', margin: 0 }}>Uploaded PDF History</h2>
                    <button onClick={handleExportAll} disabled={uploadHistory.length === 0} className="btn btn-outline hover-grow" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: uploadHistory.length === 0 ? 0.5 : 1, cursor: uploadHistory.length === 0 ? 'not-allowed' : 'pointer' }}>
                        <Archive size={18} /> Export All PDFs (ZIP)
                    </button>
                </div>
                
                {uploadHistory.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        No PDFs uploaded yet. Upload a menu PDF using the button at the top to record its history here.
                    </div>
                ) : (
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--glass-border)' }}>
                                <th style={{ padding: '1rem' }}>Date Uploaded</th>
                                <th style={{ padding: '1rem' }}>File Name</th>
                                <th style={{ padding: '1rem' }}>Data Extracted</th>
                                <th style={{ padding: '1rem', textAlign: 'center' }}>Download</th>
                            </tr>
                        </thead>
                        <tbody>
                            {uploadHistory.map(record => (
                                <tr key={record.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s', ':hover': { background: 'rgba(255,255,255,0.02)' } }}>
                                    <td style={{ padding: '1rem' }}>{format(new Date(record.timestamp), 'dd MMM yyyy, HH:mm')}</td>
                                    <td style={{ padding: '1rem', fontWeight: '500', color: 'var(--highlight-cyan)' }}>{record.filename}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ background: 'var(--glass-bg)', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.8rem' }}>
                                            {record.itemsParsed} items ({record.daysUpdated} days)
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <button 
                                            onClick={() => handleDownloadIndividual(record)} 
                                            className="btn btn-outline hover-grow" 
                                            style={{ color: 'var(--primary)', borderColor: 'var(--primary)', padding: '0.3rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto' }}
                                        >
                                            <Download size={14} /> Download File
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AdminMenuUpdate;
