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

    const handleAddAdmin = (e) => {
        e.preventDefault();
        setError('');
        try {
            addAdminAccount(newEmail, newPassword);
            setNewEmail('');
            setNewPassword('');
        } catch (err) {
            setError(err.message || 'Failed to add admin.');
        }
    };

    const handleDelete = (email) => {
        if (window.confirm(`WARNING: Are you sure you want to revoke admin powers for ${email}?`)) {
            try {
                deleteAdminEmail(email);
            } catch (err) {
                alert(err.message || 'Failed to delete admin.');
            }
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
                <Shield size={32} color="var(--primary)" />
                <h1 style={{ fontSize: '2rem' }}>App Administrators</h1>
            </div>

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                {/* Admin List Panel */}
                <div className="glass-panel" style={{ flex: '1 1 500px', overflowX: 'auto', padding: '1rem' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-main)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Current Admins</h2>
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>
                                <th style={{ padding: '1rem' }}>Email ID</th>
                                <th style={{ padding: '1rem', textAlign: 'center' }}>Role</th>
                                <th style={{ padding: '1rem', textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {admins.map((admin) => (
                                <tr key={admin.email} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s', ':hover': { background: 'rgba(255,255,255,0.02)' } }}>
                                    <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--highlight-cyan)' }}>{admin.email}</td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <span style={{ background: 'rgba(79, 70, 229, 0.2)', color: '#a5b4fc', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                            ADMIN
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <button 
                                            onClick={() => handleDelete(admin.email)} 
                                            className="btn btn-outline hover-grow" 
                                            style={{ 
                                                color: 'var(--danger)', 
                                                borderColor: 'var(--danger)', 
                                                padding: '0.4rem 0.75rem', 
                                                fontSize: '0.875rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                margin: '0 auto',
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

                {/* Add Admin Panel */}
                <div className="glass-panel" style={{ flex: '1 1 350px', padding: '2rem' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <UserPlus size={20} color="var(--primary)" /> Add New Admin
                    </h2>
                    
                    <form onSubmit={handleAddAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Admin Email ID</label>
                            <input 
                                type="email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                className="input-field"
                                placeholder="new.admin@iar.ac.in"
                                required
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Initial Password</label>
                            <input 
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="input-field"
                                placeholder="Enter secure password..."
                                required
                            />
                        </div>

                        {error && (
                            <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', borderRadius: '8px', color: '#fca5a5', fontSize: '0.875rem' }}>
                                {error}
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'center', fontWeight: 'bold' }}>
                            Authorize Account
                        </button>
                    </form>

                    <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px dashed var(--glass-border)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <strong>Note:</strong> All administrators share a single universal security password. Adding an admin simply authorizes their requested username to leverage these credentials for system entry.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppAdmin;
