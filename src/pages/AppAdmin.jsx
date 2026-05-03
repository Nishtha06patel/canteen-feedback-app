import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Shield, Trash2, UserPlus, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AppAdmin = () => {
    const { admins, addAdminAccount, deleteAdminEmail } = useAppContext();
    const navigate = useNavigate();
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');

    const handleAddAdmin = async (e) => {
        e.preventDefault();
        setError('');
        
        if (admins.length >= 2) {
            setError('Admin limit reached. Only 2 admins are allowed.');
            return;
        }

        try {
            await addAdminAccount(newEmail, newPassword);
            setNewEmail('');
            setNewPassword('');
        } catch (err) {
            setError(err.message || 'Failed to add admin.');
        }
    };

    const handleDelete = async (email) => {
        if (window.confirm(`WARNING: Are you sure you want to revoke admin powers for ${email}?`)) {
            try {
                await deleteAdminEmail(email);
            } catch (err) {
                alert(err.message || 'Failed to delete admin.');
            }
        }
    };

    const isLimitReached = admins.length >= 2;

    return (
        <div className="animate-fade-in" style={{ flex: 1, maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                <Shield size={28} color="var(--primary)" />
                <h1 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>App Administrators</h1>
            </div>

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                {/* Admin List Panel */}
                <div className="glass-card" style={{ flex: '1 1 500px', padding: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-main)', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem', fontWeight: '700' }}>Current Admins</h2>
                    <div className="responsive-table-container">
                        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)' }}>
                                    <th style={{ padding: '1rem', fontWeight: '600', fontSize: '0.85rem' }}>Email ID</th>
                                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', fontSize: '0.85rem' }}>Role</th>
                                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', fontSize: '0.85rem' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {admins.map((admin) => (
                                    <tr key={admin.email} style={{ borderBottom: '1px solid var(--border-light)', transition: 'background 0.2s' }}>
                                        <td data-label="Email ID" style={{ padding: '1rem', fontWeight: '600', color: 'var(--text-main)' }}>{admin.email}</td>
                                        <td data-label="Role" style={{ padding: '1rem', textAlign: 'center' }}>
                                            <span style={{ background: 'rgba(98, 54, 255, 0.1)', color: 'var(--primary)', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '700' }}>
                                                ADMIN
                                            </span>
                                        </td>
                                        <td data-label="Actions" style={{ padding: '1rem', textAlign: 'center' }}>
                                            <button 
                                                onClick={() => handleDelete(admin.email)} 
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
                                                    border: 'none',
                                                    opacity: admins.length === 1 ? 0.5 : 1,
                                                    cursor: admins.length === 1 ? 'not-allowed' : 'pointer'
                                                }}
                                                disabled={admins.length === 1}
                                                title={admins.length === 1 ? "Cannot delete the only remaining admin" : "Remove Admin"}
                                            >
                                                <Trash2 size={16} /> Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Add Admin Panel */}
                <div className="glass-card" style={{ flex: '1 1 350px', padding: '2rem' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: '700' }}>
                        <div style={{ background: 'rgba(98, 54, 255, 0.1)', padding: '0.5rem', borderRadius: '50%', display: 'flex' }}>
                            <UserPlus size={20} color="var(--primary)" /> 
                        </div>
                        Add New Admin
                    </h2>
                    
                    <form onSubmit={handleAddAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                            <label className="input-label">Admin Email ID</label>
                            <input 
                                type="email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                className="input-field"
                                placeholder="new.admin@iar.ac.in"
                                required
                                disabled={isLimitReached}
                            />
                        </div>
                        <div>
                            <label className="input-label">Initial Password</label>
                            <input 
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="input-field"
                                placeholder="Enter secure password..."
                                required
                                disabled={isLimitReached}
                            />
                        </div>

                        {(error || isLimitReached) && (
                            <div style={{ 
                                padding: '0.75rem', 
                                background: isLimitReached && !error ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                                border: `1px solid ${isLimitReached && !error ? 'var(--warning)' : 'var(--danger)'}`, 
                                borderRadius: '8px', 
                                color: isLimitReached && !error ? 'var(--warning)' : 'var(--danger)', 
                                fontSize: '0.85rem', 
                                fontWeight: '600' 
                            }}>
                                {error || "Maximum admin limit reached (2). Remove an admin to add a new one."}
                            </div>
                        )}

                        <button 
                            type="submit" 
                            className="btn btn-primary" 
                            style={{ 
                                marginTop: '0.5rem', 
                                display: 'flex', 
                                justifyContent: 'center', 
                                width: '100%', 
                                padding: '0.8rem',
                                opacity: isLimitReached ? 0.5 : 1,
                                cursor: isLimitReached ? 'not-allowed' : 'pointer'
                            }}
                            disabled={isLimitReached}
                        >
                            Authorize Account
                        </button>
                    </form>

                    <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                        <strong>Note:</strong> All administrators share a single universal security password. Adding an admin simply authorizes their requested username to leverage these credentials for system entry.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppAdmin;
