import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Send, Bell, AlertTriangle, Clock, MessageCircle } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

const BroadcastMessages = () => {
    const { currentUser, messages, sendBroadcastMessage, fetchMessages } = useAppContext();

    useEffect(() => {
        fetchMessages(true);
    }, []);

    const [content, setContent] = useState('');
    const [type, setType] = useState('normal');
    const [recipientRole, setRecipientRole] = useState(currentUser?.role === 'admin' ? 'staff' : 'admin');
    const [isSending, setIsSending] = useState(false);
    const [expiryOption, setExpiryOption] = useState('24'); // Default 24 hours

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsSending(true);
        try {
            await sendBroadcastMessage(content, type, recipientRole, expiryOption);
            setContent('');
            setType('normal');
        } catch (error) {
            alert(error.message || 'Failed to send message');
        } finally {
            setIsSending(false);
        }
    };

    const getRemainingTime = (expiryDate) => {
        if (!expiryDate) return null;
        const now = new Date();
        const expiry = new Date(expiryDate);
        if (expiry < now) return 'Expired';
        return `Expires in ${formatDistanceToNow(expiry)}`;
    };

    const getTypeColor = (msgType) => {
        switch (msgType) {
            case 'emergency': return '#ef4444';
            case 'delay': return '#f59e0b';
            default: return 'var(--primary)';
        }
    };

    const getTypeIcon = (msgType) => {
        switch (msgType) {
            case 'emergency': return <AlertTriangle size={18} />;
            case 'delay': return <Clock size={18} />;
            default: return <Bell size={18} />;
        }
    };

    return (
        <div className="animate-fade-in" style={{ display: 'flex', gap: '2rem', flexDirection: 'column', maxWidth: '1000px', margin: '0 auto' }}>
            <div className="announcement-header-section" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <MessageCircle size={28} color="var(--primary)" />
                <h1 style={{ fontSize: '1.75rem', fontWeight: '700', margin: 0 }}>Announcements</h1>
            </div>

            <div className="responsive-grid">
                {/* Message Creation Panel */}
                <div className="glass-card" style={{ padding: '2rem', height: 'fit-content' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: '700' }}>New Broadcast</h2>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label className="input-label">Recipient Audience</label>
                            <select 
                                className="input-field" 
                                value={recipientRole} 
                                onChange={(e) => setRecipientRole(e.target.value)}
                            >
                                {currentUser?.role === 'admin' ? (
                                    <>
                                        <option value="staff">Canteen Staff Only</option>
                                        <option value="user">All Students</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="admin">Administrator</option>
                                        <option value="user">All Students</option>
                                    </>
                                )}
                            </select>
                        </div>

                        <div>
                            <label className="input-label">Message Priority</label>
                            <div className="priority-btn-group" style={{ display: 'flex', gap: '0.5rem' }}>
                                {['normal', 'delay', 'emergency'].map((t) => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setType(t)}
                                        className="priority-btn"
                                        style={{
                                            flex: 1,
                                            padding: '0.6rem',
                                            borderRadius: '8px',
                                            fontSize: '0.85rem',
                                            fontWeight: '700',
                                            textTransform: 'capitalize',
                                            cursor: 'pointer',
                                            border: `1px solid ${type === t ? getTypeColor(t) : 'var(--border-light)'}`,
                                            background: type === t ? getTypeColor(t) : 'transparent',
                                            color: type === t ? 'white' : 'var(--text-muted)',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.4rem'
                                        }}
                                    >
                                        {getTypeIcon(t)} {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <div>
                            <label className="input-label">Visibility Duration</label>
                            <select 
                                className="input-field" 
                                value={expiryOption} 
                                onChange={(e) => setExpiryOption(e.target.value)}
                            >
                                <option value="1">1 Hour</option>
                                <option value="2">2 Hours</option>
                                <option value="5">5 Hours</option>
                                <option value="12">12 Hours</option>
                                <option value="24">24 Hours (Standard)</option>
                                <option value="48">48 Hours</option>
                            </select>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                                Message will be visible for this time and then auto-disappear for users.
                            </div>
                        </div>

                        <div>
                            <label className="input-label">Message Content</label>
                            <textarea 
                                className="input-field" 
                                placeholder="Type your announcement here..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                style={{ height: '120px', resize: 'none' }}
                                maxLength={500}
                                required
                            />
                            <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                {content.length}/500
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            className="btn btn-primary" 
                            disabled={isSending}
                            style={{ 
                                padding: '1rem', 
                                display: 'flex', 
                                justifyContent: 'center', 
                                alignItems: 'center', 
                                gap: '0.75rem',
                                background: getTypeColor(type),
                                border: 'none'
                            }}
                        >
                            <Send size={18} /> {isSending ? 'Sending...' : 'Send Announcement'}
                        </button>
                    </form>
                </div>

                {/* Sent History Panel */}
                <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Announcement History</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '600px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                        {messages.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                <MessageCircle size={40} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                <p>No messages sent yet.</p>
                            </div>
                        ) : (
                            messages.map((msg) => {
                                const remaining = getRemainingTime(msg.expires_at);
                                const isExpired = remaining === 'Expired';
                                
                                return (
                                    <div key={msg.id} className="announcement-item" style={{ 
                                        padding: '1.25rem', 
                                        borderRadius: '12px', 
                                        background: isExpired ? 'rgba(0,0,0,0.02)' : 'var(--bg-main)', 
                                        border: `1px solid ${isExpired ? 'var(--border-light)' : msg.type === 'emergency' ? '#fee2e2' : 'var(--border-light)'}`,
                                        borderLeft: `4px solid ${isExpired ? '#94a3b8' : getTypeColor(msg.type)}`,
                                        opacity: isExpired ? 0.7 : 1
                                    }}>
                                        <div className="announcement-item-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: isExpired ? '#64748b' : getTypeColor(msg.type), textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                {getTypeIcon(msg.type)} {msg.type}
                                                {isExpired && <span style={{ background: '#e2e8f0', color: '#64748b', padding: '1px 6px', borderRadius: '4px', fontSize: '0.6rem' }}>EXPIRED</span>}
                                            </span>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                                                {remaining}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', margin: 0, lineHeight: '1.5', fontWeight: '500' }}>
                                            {msg.content}
                                        </p>
                                        <div className="announcement-item-footer" style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '0.5rem' }}>
                                            <span>To: <strong style={{ textTransform: 'capitalize' }}>{msg.recipient_role === 'user' ? 'Students' : msg.recipient_role}</strong></span>
                                            <span style={{ fontSize: '0.65rem' }}>{format(new Date(msg.created_at), 'MMM d, h:mm a')}</span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BroadcastMessages;
