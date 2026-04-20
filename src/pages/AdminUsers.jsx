import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Users, Trash2, UserPlus, Lock, Mail, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminUsers = () => {
    const { registeredUsers, feedbacks, deleteUser, registerUser } = useAppContext();
    const navigate = useNavigate();
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const getUserStats = (email) => {
        const userFeedbacks = feedbacks.filter(fb => fb.username === email);
        return {
            count: userFeedbacks.length,
            lastDate: userFeedbacks.length > 0 ? userFeedbacks[0].timestamp : null // assuming feedbacks are unshifted (newest first)
        };
    };

    const handleDelete = (email) => {
        if (window.confirm(`WARNING: Are you sure you want to completely delete the student account for ${email}?`)) {
            deleteUser(email);
        }
    };

    const handleAddUser = (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        try {
            registerUser(newEmail, newPassword);
            setSuccessMsg(`Successfully registered ${newEmail}`);
            setNewEmail('');
            setNewPassword('');
        } catch (err) {
            setError(err.message || 'Failed to add user.');
        }
    };

    return (
        <div className="animate-fade-in" style={{ flex: 1, padding: '1rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <button 
                    onClick={() => navigate('/admin/dashboard')} 
                    className="btn btn-outline hover-grow" 
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderColor: 'var(--glass-border)' }}
                >
                    <ArrowLeft size={18} /> Back to Dashboard
                </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <Users size={32} color="var(--primary)" />
                <h1 style={{ fontSize: '2rem' }}>Users Directory</h1>
            </div>

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                
                {/* Users Directory List */}
                <div className="glass-panel" style={{ flex: '1 1 500px', overflowX: 'auto', padding: '1rem' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-main)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Registered Students</h2>
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>
                                <th style={{ padding: '1rem' }}>Email ID</th>
                                <th style={{ padding: '1rem' }}>Total Feedbacks</th>
                                <th style={{ padding: '1rem' }}>Last Feedback Date</th>
                                <th style={{ padding: '1rem', textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {registeredUsers.length === 0 && (
                                <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No students currently registered.</td></tr>
                            )}
                            {registeredUsers.map((user) => {
                                const stats = getUserStats(user.email);
                                return (
                                    <tr key={user.email} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s', ':hover': { background: 'rgba(255,255,255,0.02)' } }}>
                                        <td style={{ padding: '1rem', fontWeight: '500', color: 'var(--highlight-cyan)' }}>{user.email}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{ background: 'var(--glass-bg)', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.875rem' }}>
                                                {stats.count}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                            {stats.lastDate ? new Date(stats.lastDate).toLocaleDateString('en-GB') : 'Never'}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            <button 
                                                onClick={() => handleDelete(user.email)} 
                                                className="btn btn-outline hover-grow" 
                                                style={{ 
                                                    color: 'var(--danger)', 
                                                    borderColor: 'var(--danger)', 
                                                    padding: '0.4rem 0.75rem', 
                                                    fontSize: '0.875rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    margin: '0 auto'
                                                }}
                                            >
                                                <Trash2 size={16} /> Delete
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Add New Student Panel */}
                <div className="glass-panel" style={{ flex: '1 1 350px', padding: '2rem' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <UserPlus size={20} color="var(--primary)" /> Pre-Register Student
                    </h2>
                    
                    <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Mail size={14}/> Student Email ID</label>
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
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Lock size={14}/> Initial Password</label>
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
                            <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', borderRadius: '8px', color: '#fca5a5', fontSize: '0.875rem' }}>
                                {error}
                            </div>
                        )}
                        {successMsg && (
                            <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', borderRadius: '8px', color: '#6ee7b7', fontSize: '0.875rem' }}>
                                {successMsg}
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'center', fontWeight: 'bold' }}>
                            Create Account
                        </button>
                    </form>

                    <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px dashed var(--glass-border)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <strong>Note:</strong> Students must be registered with a valid `@iar.ac.in` email structure. They can later reset their password dynamically using the Forgot Password gateway.
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminUsers;
