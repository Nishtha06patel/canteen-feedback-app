import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Upload, Download, Archive, CalendarDays } from 'lucide-react';
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
            e.target.value = null; 
        }
    };

    const handleDownloadIndividual = (record) => {
        saveAs(record.base64, record.filename);
    };

    const handleExportAll = async () => {
        if (uploadHistory.length === 0) return alert("No PDFs to export");
        const zip = new JSZip();
        uploadHistory.forEach((record, index) => {
            const b64Data = record.base64.split(',')[1];
            const safeFileName = `${index + 1}_${record.filename}`;
            zip.file(safeFileName, b64Data, { base64: true });
        });
        
        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(content, `canteen_pdfs_export_${format(new Date(), 'yyyy-MM-dd')}.zip`);
    };

    const renderHeader = () => (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', padding: '0 1rem' }}>
            <button onClick={prevMonth} className="btn btn-outline" style={{ padding: '0.4rem 1rem' }}>&larr; Prev</button>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>{format(currentMonth, 'MMMM yyyy')}</h2>
            <button onClick={nextMonth} className="btn btn-outline" style={{ padding: '0.4rem 1rem' }}>Next &rarr;</button>
        </div>
    );

    const renderDays = () => {
        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '0.5rem' }}>
                {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                    <div key={d} style={{textAlign:'center', fontWeight:'700', color:'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>{d}</div>
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
                                borderRadius: '12px',
                                background: isSelected ? 'var(--primary)' : (isCurrentMonth ? '#f8fafc' : 'transparent'),
                                border: isSelected ? '1px solid var(--primary)' : '1px solid transparent',
                                color: isSelected ? '#fff' : (isCurrentMonth ? 'var(--text-main)' : 'var(--text-muted)'),
                                transition: 'all 0.2s',
                                fontWeight: isSelected ? '700' : '500',
                                boxShadow: isSelected ? '0 4px 12px rgba(98, 54, 255, 0.2)' : 'none'
                            }}
                            className="hover-grow"
                        >
                            <span>{format(day, 'd')}</span>
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
                subItemsText = parts.slice(1).join('|');
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
                let price = 30; 
                
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
        <div className="animate-fade-in" style={{ padding: '0 1rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <CalendarDays size={28} color="var(--primary)" />
                    <h1 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>Menu Update</h1>
                </div>
                <label className="btn btn-primary hover-grow" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: isUploading ? 'not-allowed' : 'pointer', opacity: isUploading ? 0.7 : 1 }}>
                    <Upload size={18} />
                    {isUploading ? 'Parsing...' : 'Bulk Upload PDF'}
                    <input type="file" accept="application/pdf" style={{ display: 'none' }} onChange={handleFileUpload} disabled={isUploading} />
                </label>
            </div>
            
            <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
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
                                
                                <h2 style={{ fontSize: '1.25rem', fontWeight: '900', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-main)' }}>
                                    Menu for {format(selectedDate, 'eeee, MMMM do, yyyy')}
                               </h2>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', paddingBottom: '1rem' }}>
                                {MEAL_BLOCKS.map(block => {
                                    const items = menuForSelectedDate[block.id] || [];
                                    const isEditing = editingBlock === block.id;

                                    return (
                                        <div key={block.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', background: '#f8fafc', boxShadow: 'none' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                                <h3 style={{ margin: 0, color: 'var(--primary)', fontWeight: '700', fontSize: '1.1rem' }}>{block.title}</h3>
                                                {!isEditing && (
                                                    <button onClick={() => handleEditClick(block)} className="btn btn-outline" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', background: '#fff' }}>Edit</button>
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
                                                            <div style={{ whiteSpace: 'pre-line', lineHeight: '1.8', fontWeight: '500' }}>
                                                                {items[0].subItems.join('\n')}
                                                                <br/><span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '700' }}>(Combo - ₹{items[0].price})</span>
                                                            </div>
                                                        ) : (
                                                            <div style={{ whiteSpace: 'pre-line', lineHeight: '1.8', fontWeight: '500' }}>
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
            <div className="glass-card" style={{ padding: '2rem', marginTop: '3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)', margin: 0, fontWeight: '700' }}>Uploaded PDF History</h2>
                    <button onClick={handleExportAll} disabled={uploadHistory.length === 0} className="btn btn-outline hover-grow" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: uploadHistory.length === 0 ? 0.5 : 1, cursor: uploadHistory.length === 0 ? 'not-allowed' : 'pointer' }}>
                        <Archive size={16} /> Export ZIP
                    </button>
                </div>
                
                {uploadHistory.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.9rem' }}>
                        No PDFs uploaded yet. Upload a menu PDF using the button at the top.
                    </div>
                ) : (
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-light)' }}>
                                <th style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: '600' }}>Date Uploaded</th>
                                <th style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: '600' }}>File Name</th>
                                <th style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: '600' }}>Data Extracted</th>
                                <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.85rem', fontWeight: '600' }}>Download</th>
                            </tr>
                        </thead>
                        <tbody>
                            {uploadHistory.map(record => (
                                <tr key={record.id} style={{ borderBottom: '1px solid var(--border-light)', transition: 'background 0.2s', ':hover': { background: '#f8fafc' } }}>
                                    <td style={{ padding: '1rem', fontSize: '0.9rem', fontWeight: '500' }}>{format(new Date(record.timestamp), 'dd MMM yyyy, HH:mm')}</td>
                                    <td style={{ padding: '1rem', fontWeight: '600', color: 'var(--text-main)', fontSize: '0.9rem' }}>{record.filename}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ background: 'rgba(98, 54, 255, 0.1)', color: 'var(--primary)', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '600' }}>
                                            {record.itemsParsed} items ({record.daysUpdated} days)
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <button 
                                            onClick={() => handleDownloadIndividual(record)} 
                                            className="btn btn-outline hover-grow" 
                                            style={{ color: 'var(--primary)', borderColor: 'var(--primary)', padding: '0.3rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto', background: '#fff' }}
                                        >
                                            <Download size={14} /> File
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
