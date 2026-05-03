import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import api from '../utils/api';
import { Utensils, Clock, CheckCircle, Bell, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StaffDashboard = () => {
    const { currentUser, logout } = useAppContext();
    const navigate = useNavigate();
    const [mealSummary, setMealSummary] = useState({ dinnerToday: 0, lunchTomorrow: 0 });

    useEffect(() => {
        fetchMealSummary();
    }, []);

    const fetchMealSummary = async () => {
        try {
            const res = await api.get('/meal/summary');
            setMealSummary(res.data);
        } catch (error) {
            console.error('Error fetching meal summary:', error);
        }
    };

    return (
        <div className="animate-fade-in" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                <Utensils size={28} color="var(--primary)" />
                <h1 style={{ fontSize: '1.75rem', fontWeight: '700', margin: 0 }}>Staff Dashboard</h1>
            </div>

            {/* Meal Selection Summary Row */}
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                <div className="glass-card animate-slide-up" style={{ padding: '1.5rem', flex: 1, minWidth: '300px', border: '1.5px solid var(--primary-light)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Dinner Today</p>
                            <h3 style={{ fontSize: '2rem', fontWeight: '800', margin: 0, color: '#334155' }}>{mealSummary.dinnerToday}</h3>
                        </div>
                        <div style={{ background: 'rgba(51, 65, 85, 0.1)', color: '#334155', padding: '1rem', borderRadius: '15px' }}>
                            <Moon size={32} />
                        </div>
                    </div>
                </div>
                <div className="glass-card animate-slide-up" style={{ padding: '1.5rem', flex: 1, minWidth: '300px', border: '1.5px solid var(--primary-light)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Lunch Tomorrow</p>
                            <h3 style={{ fontSize: '2rem', fontWeight: '800', margin: 0, color: '#f59e0b' }}>{mealSummary.lunchTomorrow}</h3>
                        </div>
                        <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '1rem', borderRadius: '15px' }}>
                            <Sun size={32} />
                        </div>
                    </div>
                </div>
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
