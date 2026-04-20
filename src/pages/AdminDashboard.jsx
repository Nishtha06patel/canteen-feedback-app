import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { getPhotoRecord } from '../utils/db';

const FeedbackPhotoRenderer = ({ photoId }) => {
    const [imgSrc, setImgSrc] = useState(null);
    useEffect(() => {
        getPhotoRecord(photoId).then(record => {
            if (record && record.base64) setImgSrc(record.base64);
        }).catch(err => console.error(err));
    }, [photoId]);
    
    if (!imgSrc) return <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic', padding: '0.5rem 0' }}>Resolving Photographic Evidence Vault...</div>;
    
    return (
        <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
            <img src={imgSrc} style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '8px', border: '1px solid var(--glass-border)', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }} alt='Feedback Upload' />
            <div>
                <a 
                    href={imgSrc} 
                    download={`Evidence_${photoId}.jpg`} 
                    className="btn btn-outline hover-grow" 
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', padding: '0.4rem 0.8rem', textDecoration: 'none', color: 'var(--text-main)', borderColor: 'var(--glass-border)', borderRadius: '6px' }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    Download Image
                </a>
            </div>
        </div>
    );
};

const AdminDashboard = () => {
    const { feedbacks, registeredUsers } = useAppContext();
    const [filter, setFilter] = useState('All Feedback');

    const filters = ['All Feedback', 'Morning Snack', 'Lunch', 'Evening Snack', 'Dinner', 'Full Day', 'Facility'];

    // Filter out orphaned feedbacks from deleted users
    const validFeedbacks = feedbacks.filter(fb => registeredUsers.some(u => u.email === fb.username) || fb.username === 'Anonymous');

    const filteredFeedbacks = validFeedbacks.filter(fb => {
        if (filter === 'All Feedback') return true;
        if (filter === 'Morning Snack') return fb.mealType === 'Breakfast';
        if (filter === 'Lunch') return fb.mealType === 'Lunch';
        if (filter === 'Evening Snack') return fb.mealType === 'Evening Snack';
        if (filter === 'Dinner') return fb.mealType === 'Dinner';
        if (filter === 'Full Day') return fb.mealType === 'General Canteen Menu';
        if (filter === 'Facility') return fb.mealType === 'Facility';
        return true;
    });

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
            if (fb.photoId) {
                try {
                    const record = await getPhotoRecord(fb.photoId);
                    if (record && record.base64) {
                        imageMarkup = `<img src="${record.base64}" style="max-width: 120px; max-height: 120px; border-radius: 6px; border: 1px solid #ddd; display: block;" alt="Evidence" />`;
                    }
                } catch (e) {
                    console.error('Failed to attach internal image layout mapping', e);
                }
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
                // Bypass unreliable window.onload for injected DOMs by deferring execution securely 
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
        <div className="animate-fade-in" style={{ flex: 1, padding: '1rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Feedback Feed</h1>

            {/* Top Bar Actions */}
            <div style={{ display: 'flex', marginBottom: '2rem', flexWrap: 'wrap' }}>
                {/* Filter Pills */}
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {filters.map(f => (
                        <button 
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`btn ${filter === f ? 'btn-primary' : 'btn-outline'}`}
                            style={{ padding: '0.4rem 1rem', fontSize: '0.875rem', borderRadius: '20px' }}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {filteredFeedbacks.length === 0 ? (
                <div className="glass-panel animate-slide-up" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No feedback matches this filter</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Feedback submissions will appear here instantly.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {filteredFeedbacks.map((fb) => (
                        <div key={fb.id} className="glass-panel animate-slide-up" style={{ padding: '1.5rem', borderLeft: `4px solid var(--primary)` }}>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.6' }}>
                                <p style={{ fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>
                                    User: <span style={{ fontWeight: 'normal', color: 'var(--text-main)' }}>{fb.username}</span>
                                </p>
                                <p><span style={{ fontWeight: 'bold' }}>Meal:</span> {fb.mealType || 'Lunch'}</p>
                                <p style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <span style={{ fontWeight: 'bold' }}>Rating: </span>
                                    <span>{'⭐'.repeat(fb.starRating)}</span>
                                </p>
                                <p><span style={{ fontWeight: 'bold' }}>Feedback: </span> {fb.feedbackText || 'None'}</p>
                                
                                {(fb.photoId || fb.photoName) && (
                                    <div style={{ marginTop: '0.75rem' }}>
                                        {fb.photoId ? (
                                            <FeedbackPhotoRenderer photoId={fb.photoId} />
                                        ) : (
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>[Legacy System File: {fb.photoName}]</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    
                    {/* Export Button At The End */}
                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
                        <button 
                            onClick={handleExportPDF} 
                            className="btn btn-primary hover-grow" 
                            style={{ 
                                padding: '0.8rem 2.5rem', 
                                fontWeight: 'bold', 
                                fontSize: '1rem',
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.75rem', 
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, var(--danger), #ff4757)',
                                border: 'none',
                                color: 'white'
                            }}
                        >
                            📄 Export PDF Document
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
