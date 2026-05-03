import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Download, MoreVertical, Star, Bell } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const { currentUser, feedbacks, registeredUsers, updateFeedbackStatus } = useAppContext();
    const navigate = useNavigate();
    const [filter, setFilter] = useState('All');
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);

    const filters = ['All', 'Breakfast', 'Lunch', 'Evening Snack', 'Dinner', 'Full Day', 'Facility'];

    // Filter out orphaned feedbacks from deleted users and parse JSON messages
    const mappedFeedbacks = feedbacks.map(fb => {
        let details = {};
        try {
            details = JSON.parse(fb.message);
        } catch (e) {
            const messageStr = fb.message || '';
            details = { text: messageStr };
            // Try to parse legacy string format like "[Breakfast] Samosa - 3 Stars: not good"
            const match = messageStr.match(/\[(.*?)\] .*? - (\d+) Stars?:?\s*(.*)/);
            if (match) {
                details.mealType = match[1];
                details.stars = parseInt(match[2], 10);
                details.text = match[3] || 'None';
            }
        }

        return {
            id: fb.id,
            username: fb.user_email,
            timestamp: fb.created_at,
            mealType: details.mealType || 'Unknown',
            mealItem: details.mealItem || '',
            starRating: details.stars || 0,
            feedbackText: details.text || (details.text === '' ? '' : fb.message),
            photoBase64: details.photoBase64 || null,
            photoName: details.photoName || null,
            status: fb.status || 'Open' // Use real status from DB, fallback to Open
        };
    });

    const validFeedbacks = mappedFeedbacks.filter(fb => registeredUsers.some(u => u.email === fb.username) || fb.username === 'Anonymous');

    const filteredFeedbacks = validFeedbacks.filter(fb => {
        if (filter === 'All') return true;
        if (filter === 'Breakfast') return fb.mealType === 'Breakfast';
        if (filter === 'Lunch') return fb.mealType === 'Lunch';
        if (filter === 'Evening Snack') return fb.mealType === 'Evening Snack';
        if (filter === 'Dinner') return fb.mealType === 'Dinner';
        if (filter === 'Full Day') return fb.mealType === 'General Canteen Menu';
        if (filter === 'Facility') return fb.mealType === 'Facility';
        return true;
    });

    const handleStatusChange = async (id, newStatus) => {
        setUpdatingId(id);
        try {
            await updateFeedbackStatus(id, newStatus);
            setOpenDropdownId(null);
        } catch (error) {
            alert(error.message || 'Failed to update status');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleExportPDF = async () => {
        if (filteredFeedbacks.length === 0) {
            alert('No data to export!');
            return;
        }

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Popup blocker prevented the export. Please explicitly allow popups for this site.');
            return;
        }
        
        let htmlContent = `
        <html>
        <head>
            <title>Canteen Feedback Export</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; background: white; }
                h1 { text-align: center; color: #2c3e50; font-size: 28px; margin-bottom: 5px; }
                .meta { text-align: center; color: #7f8c8d; margin-bottom: 40px; font-size: 14px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 15px; }
                th { background-color: #f8f9fa; color: #2c3e50; padding: 15px; text-align: left; border-bottom: 2px solid #dee2e6; }
                td { padding: 15px; border-bottom: 1px solid #dee2e6; vertical-align: middle; }
                tr:nth-child(even) { background-color: #fcfcfc; }
                .rating { color: #f39c12; letter-spacing: 2px; }
            </style>
        </head>
        <body>
            <h1>📋 Canteen Feedback Report</h1>
            <div class="meta">Exported on: ${new Date().toLocaleString()} &nbsp;&nbsp;|&nbsp;&nbsp; Filter applied: ${filter}</div>
            <table>
                <thead>
                    <tr>
                        <th style="width: 15%;">Date</th>
                        <th style="width: 20%;">User</th>
                        <th style="width: 15%;">Meal</th>
                        <th style="width: 15%;">Rating</th>
                        <th style="width: 25%;">Feedback</th>
                        <th style="width: 10%;">Evidence</th>
                    </tr>
                </thead>
                <tbody>
        `;

        for (const fb of filteredFeedbacks) {
            let imageMarkup = 'No';
            if (fb.photoBase64) {
                imageMarkup = `<img src="${fb.photoBase64}" style="max-width: 120px; max-height: 120px; border-radius: 6px; border: 1px solid #ddd; display: block;" alt="Evidence" />`;
            } else if (fb.photoName) {
                imageMarkup = `<span style="font-size:11px; font-style:italic;">Legacy File:<br/>${fb.photoName}</span>`;
            }

            htmlContent += `
                <tr>
                    <td>${new Date(fb.timestamp).toLocaleString('en-GB')}</td>
                    <td><strong style="color: #2c3e50;">${fb.username.split('@')[0]}</strong><br><span style="font-size:12px; color:#7f8c8d;">@${fb.username.split('@')[1] || ''}</span></td>
                    <td><strong>${fb.mealType || 'N/A'}</strong></td>
                    <td class="rating">${'★'.repeat(fb.starRating)}</td>
                    <td>${fb.feedbackText || '<i>None</i>'}</td>
                    <td style="text-align: center;">${imageMarkup}</td>
                </tr>
            `;
        }

        htmlContent += `
                </tbody>
            </table>
            <script>
                setTimeout(function() {
                    window.print();
                }, 500);
            </script>
        </body>
        </html>
        `;

        printWindow.document.write(htmlContent);
        printWindow.document.close();
    };

    return (
        <div className="animate-fade-in" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
            <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>Feedback Feed</h1>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button 
                        onClick={handleExportPDF} 
                        className="btn btn-outline hover-grow" 
                        style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', borderRadius: '8px' }}
                    >
                        <Download size={16} /> Export
                    </button>
                </div>
            </div>

            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                {filters.map(f => {
                    const isActive = filter === f;
                    return (
                        <button 
                            key={f}
                            onClick={() => setFilter(f)}
                            style={{ 
                                padding: '0.4rem 1.25rem', 
                                fontSize: '0.85rem', 
                                borderRadius: '20px',
                                border: `1px solid ${isActive ? 'var(--primary)' : 'var(--border-light)'}`,
                                background: isActive ? 'var(--primary)' : 'var(--bg-card)',
                                color: isActive ? '#fff' : 'var(--text-muted)',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: isActive ? '0 4px 10px rgba(98, 54, 255, 0.2)' : 'none'
                            }}
                        >
                            {f}
                        </button>
                    );
                })}
            </div>

            {filteredFeedbacks.length === 0 ? (
                <div className="glass-card animate-slide-up" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: '600' }}>No feedback matches this filter</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Feedback submissions will appear here instantly.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {filteredFeedbacks.map((fb) => (
                        <div key={fb.id} className="glass-card animate-slide-up" style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                            {/* Avatar */}
                            <div style={{ 
                                width: '48px', 
                                height: '48px', 
                                borderRadius: '50%', 
                                background: 'var(--primary)', 
                                color: 'white', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                fontWeight: '700',
                                fontSize: '1.25rem',
                                flexShrink: 0
                            }}>
                                {fb.username.substring(0, 2).toUpperCase()}
                            </div>
                            
                            {/* Content */}
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div className="flex-between">
                                    <div style={{ fontWeight: '700', fontSize: '1.05rem', color: 'var(--text-main)' }}>{fb.username}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                                            {format(new Date(fb.timestamp), 'dd MMM yyyy, hh:mm a')}
                                        </span>
                                        <span className={`status-pill status-${fb.status.toLowerCase()}`}>
                                            {fb.status}
                                        </span>
                                        {(currentUser?.role === 'admin' || currentUser?.role === 'staff') && (
                                            <div style={{ position: 'relative' }}>
                                                <button 
                                                    onClick={() => setOpenDropdownId(openDropdownId === fb.id ? null : fb.id)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.2rem' }}
                                                    disabled={updatingId === fb.id}
                                                >
                                                    <MoreVertical size={18} />
                                                </button>
                                                
                                                {openDropdownId === fb.id && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '100%',
                                                        right: 0,
                                                        background: 'var(--bg-card)',
                                                        border: '1px solid var(--border-light)',
                                                        borderRadius: '8px',
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                        zIndex: 10,
                                                        minWidth: '120px',
                                                        overflow: 'hidden',
                                                        display: 'flex',
                                                        flexDirection: 'column'
                                                    }}>
                                                        {['Open', 'Pending', 'Resolved'].map(s => (
                                                            <button
                                                                key={s}
                                                                onClick={() => handleStatusChange(fb.id, s)}
                                                                style={{
                                                                    padding: '0.75rem 1rem',
                                                                    background: 'none',
                                                                    border: 'none',
                                                                    textAlign: 'left',
                                                                    cursor: 'pointer',
                                                                    color: fb.status === s ? 'var(--primary)' : 'var(--text-main)',
                                                                    fontWeight: fb.status === s ? '700' : '500',
                                                                    borderBottom: s !== 'Resolved' ? '1px solid var(--border-light)' : 'none',
                                                                    transition: 'background 0.2s',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'space-between'
                                                                }}
                                                                onMouseEnter={(e) => e.target.style.background = 'var(--bg-main)'}
                                                                onMouseLeave={(e) => e.target.style.background = 'none'}
                                                            >
                                                                {s}
                                                                {updatingId === fb.id && s === fb.status && <span style={{ fontSize: '0.75rem' }}>...</span>}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: '600' }}>
                                    Meal: <span style={{ color: 'var(--primary)' }}>{fb.mealType} {fb.mealItem ? `(${fb.mealItem})` : ''}</span>
                                </div>
                                
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>
                                    Rating: 
                                    <div style={{ display: 'flex', gap: '2px' }}>
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <Star key={star} size={16} fill={star <= fb.starRating ? '#f59e0b' : 'none'} color={star <= fb.starRating ? '#f59e0b' : '#cbd5e1'} strokeWidth={star <= fb.starRating ? 0 : 2} />
                                        ))}
                                    </div>
                                    <span style={{ color: 'var(--text-muted)' }}>{fb.starRating}/5</span>
                                </div>
                                
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: '500', marginTop: '0.25rem', lineHeight: '1.5' }}>
                                    <span style={{ fontWeight: '600' }}>Feedback:</span> {fb.feedbackText || 'None'}
                                </div>
                                
                                {/* Photo rendering */}
                                {(fb.photoBase64 || fb.photoName) && (
                                    <div style={{ marginTop: '1rem' }}>
                                        {fb.photoBase64 ? (
                                            <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                <img src={fb.photoBase64} style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', border: '1px solid var(--border-light)' }} alt='Feedback Evidence' />
                                            </div>
                                        ) : (
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>[Legacy System File: {fb.photoName}]</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
