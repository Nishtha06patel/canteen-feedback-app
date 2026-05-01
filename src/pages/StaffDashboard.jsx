import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Utensils, Clock, CheckCircle, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StaffDashboard = () => {
    const { currentUser, logout } = useAppContext();
    const navigate = useNavigate();

    return (
        <div className="animate-fade-in" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
            <div className="flex-between" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Utensils size={28} color="var(--primary)" />
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '700', margin: 0 }}>Staff Dashboard</h1>
                </div>
                <button 
                    onClick={() => navigate('/admin/broadcast')} 
                    className="btn btn-primary hover-grow" 
                    style={{ padding: '0.6rem 1.25rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <Bell size={18} /> Send Broadcast
                </button>
            </div>

            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1.5rem', borderRadius: '50%' }}>
                        <CheckCircle size={48} color="var(--success)" />
                    </div>
                </div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Welcome, {currentUser?.username}</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>The Staff Dashboard is currently under development. You will soon be able to manage orders and view daily feedback here.</p>
                
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                    <div style={{ padding: '1rem', background: 'var(--bg-main)', borderRadius: '12px', border: '1px solid var(--border-light)', minWidth: '150px' }}>
                        <Clock size={20} color="var(--primary)" style={{ marginBottom: '0.5rem' }} />
                        <div style={{ fontWeight: '700' }}>Active Duty</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Canteen Staff</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffDashboard;
