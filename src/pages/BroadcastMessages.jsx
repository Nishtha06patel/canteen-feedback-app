import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Send, Bell, AlertTriangle, Clock, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';

const BroadcastMessages = () => {
    const { currentUser, messages, sendBroadcastMessage } = useAppContext();
    const [content, setContent] = useState('');
    const [type, setType] = useState('normal');
    const [recipientRole, setRecipientRole] = useState(currentUser?.role === 'admin' ? 'staff' : 'user');
    const [isSending, setIsSending] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsSending(true);
        try {
            await sendBroadcastMessage(content, type, recipientRole);
            setContent('');
            setType('normal');
        } catch (error) {
            alert(error.message || 'Failed to send message');
        } finally {
            setIsSending(false);
        }
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <MessageCircle size={28} color="var(--primary)" />
                <h1 style={{ fontSize: '1.75rem', fontWeight: '700', margin: 0 }}>Announcements</h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
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
                                disabled={currentUser?.role !== 'admin'}
                            >
                                {currentUser?.role === 'admin' && <option value="staff">Canteen Staff Only</option>}
                                <option value="user">All Students</option>
                            </select>
                        </div>

                        <div>
                            <label className="input-label">Message Priority</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {['normal', 'delay', 'emergency'].map((t) => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setType(t)}
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
                            <Send size={18} /> {isSending ? 'Sending...' : 'Broadcast Message'}
                        </button>
                    </form>
                </div>

                {/* Sent History Panel */}
                <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Recent Broadcasts</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '500px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                        {messages.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                <MessageCircle size={40} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                <p>No messages sent yet.</p>
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div key={msg.id} style={{ 
                                    padding: '1rem', 
                                    borderRadius: '12px', 
                                    background: 'var(--bg-main)', 
                                    border: `1px solid ${msg.type === 'emergency' ? '#fee2e2' : 'var(--border-light)'}`,
                                    borderLeft: `4px solid ${getTypeColor(msg.type)}`
                                }}>
                                    <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: getTypeColor(msg.type), textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                            {getTypeIcon(msg.type)} {msg.type}
                                        </span>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                            {format(new Date(msg.created_at), 'dd MMM, hh:mm a')}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', margin: 0, lineHeight: '1.4' }}>
                                        {msg.content}
                                    </p>
                                    <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                                        <span>To: <strong style={{ textTransform: 'capitalize' }}>{msg.recipient_role === 'user' ? 'Students' : msg.recipient_role}</strong></span>
                                        {currentUser?.role === 'admin' && <span>By: {msg.sender_email}</span>}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BroadcastMessages;
