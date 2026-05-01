import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Users, Trash2, UserPlus, Lock, Mail } from 'lucide-react';

const AdminUsers = () => {
    const { registeredUsers, feedbacks, deleteUser } = useAppContext();
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const getUserStats = (email) => {
        const userFeedbacks = feedbacks.filter(fb => fb.user_email === email);
        return {
            count: userFeedbacks.length,
            lastDate: userFeedbacks.length > 0 ? userFeedbacks[0].created_at : null 
        };
    };

    const handleDelete = (email) => {
        if (window.confirm(`WARNING: Are you sure you want to completely delete the student account for ${email}?`)) {
            deleteUser(email);
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        try {
            const { default: api } = await import('../utils/api');
            await api.post('/auth/register', { email: newEmail, password: newPassword });
            
            window.location.reload(); 
            
            setSuccessMsg(`Successfully registered ${newEmail}`);
            setNewEmail('');
            setNewPassword('');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to add user.');
        }
    };

    return (
        <div className="animate-fade-in" style={{ flex: 1, maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                <Users size={28} color="var(--primary)" />
                <h1 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>Users Directory</h1>
            </div>

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                
                {/* Users Directory List */}
                <div className="glass-card" style={{ flex: '1 1 500px', overflowX: 'auto', padding: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-main)', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem', fontWeight: '700' }}>Registered Students</h2>
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)' }}>
                                <th style={{ padding: '1rem', fontWeight: '600', fontSize: '0.85rem' }}>Email ID</th>
                                <th style={{ padding: '1rem', fontWeight: '600', fontSize: '0.85rem' }}>Total Feedbacks</th>
                                <th style={{ padding: '1rem', fontWeight: '600', fontSize: '0.85rem' }}>Last Feedback Date</th>
                                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', fontSize: '0.85rem' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {registeredUsers.length === 0 && (
                                <tr><td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No students currently registered.</td></tr>
                            )}
                            {registeredUsers.map((user) => {
                                const stats = getUserStats(user.email);
                                return (
                                    <tr key={user.email} style={{ borderBottom: '1px solid var(--border-light)', transition: 'background 0.2s', ':hover': { background: '#f8fafc' } }}>
                                        <td style={{ padding: '1rem', fontWeight: '600', color: 'var(--text-main)' }}>{user.email}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{ background: 'rgba(98, 54, 255, 0.1)', color: 'var(--primary)', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '700' }}>
                                                {stats.count}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '500' }}>
                                            {stats.lastDate ? new Date(stats.lastDate).toLocaleDateString('en-GB') : 'Never'}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            <button 
                                                onClick={() => handleDelete(user.email)} 
                                                className="btn" 
                                                style={{ 
                                                    color: 'var(--danger)', 
                                                    background: 'rgba(239, 68, 68, 0.1)',
                                                    padding: '0.4rem 0.75rem', 
                                                    fontSize: '0.85rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    margin: '0 auto',
                                                    border: 'none'
                                                }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Add New Student Panel */}
                <div className="glass-card" style={{ flex: '1 1 350px', padding: '2rem' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: '700' }}>
                        <div style={{ background: 'rgba(98, 54, 255, 0.1)', padding: '0.5rem', borderRadius: '50%', display: 'flex' }}>
                            <UserPlus size={20} color="var(--primary)" />
                        </div>
                        Register New Student
                    </h2>
                    
                    <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Mail size={14}/> Student Email ID</label>
                            <input 
                                type="email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                className="input-field"
                                placeholder="student@iar.ac.in"
                                required
                            />
                        </div>
                        <div>
                            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Lock size={14}/> Initial Password</label>
                            <input 
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="input-field"
                                placeholder="Minimum 6 characters"
                                required
                            />
                        </div>

                        {error && (
                            <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', borderRadius: '8px', color: 'var(--danger)', fontSize: '0.85rem', fontWeight: '600' }}>
                                {error}
                            </div>
                        )}
                        {successMsg && (
                            <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', borderRadius: '8px', color: 'var(--success)', fontSize: '0.85rem', fontWeight: '600' }}>
                                {successMsg}
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'center', width: '100%', padding: '0.8rem' }}>
                            Create Account
                        </button>
                    </form>

                    <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                        <strong>Note:</strong> Students must be registered with a valid <code>@iar.ac.in</code> email structure. They can later reset their password dynamically using the Forgot Password gateway.
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminUsers;
