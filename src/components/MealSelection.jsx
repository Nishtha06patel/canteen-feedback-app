import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Utensils, Sun, Moon, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { format, addDays } from 'date-fns';

const MealSelection = () => {
    const [meals, setMeals] = useState({
        today: { lunch: false, dinner: false },
        tomorrow: { lunch: false, dinner: false }
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    const today = new Date();
    const tomorrow = addDays(today, 1);
    
    const todayStr = format(today, 'yyyy-MM-dd');
    const tomorrowStr = format(tomorrow, 'yyyy-MM-dd');
    
    const currentHour = today.getHours();
    const isDinnerClosed = currentHour >= 10;

    useEffect(() => {
        fetchMeals();
    }, []);

    const fetchMeals = async () => {
        try {
            setLoading(true);
            const [resToday, resTomorrow] = await Promise.all([
                api.get(`/meal?date=${todayStr}`),
                api.get(`/meal?date=${tomorrowStr}`)
            ]);
            
            setMeals({
                today: resToday.data.meal || { lunch: false, dinner: false },
                tomorrow: resTomorrow.data.meal || { lunch: false, dinner: false }
            });
        } catch (error) {
            console.error('Error fetching meals:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (dateStr, mealType, currentValue) => {
        const newValue = !currentValue;
        
        // Optimistic update
        const dateKey = dateStr === todayStr ? 'today' : 'tomorrow';
        const updatedMeals = { ...meals };
        updatedMeals[dateKey][mealType] = newValue;
        setMeals(updatedMeals);

        try {
            setSaving(true);
            await api.post('/meal', {
                date: dateStr,
                lunch: mealType === 'lunch' ? newValue : updatedMeals[dateKey].lunch,
                dinner: mealType === 'dinner' ? newValue : updatedMeals[dateKey].dinner
            });
            setMessage({ text: 'Selection updated!', type: 'success' });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            console.error('Error saving meal:', error);
            // Rollback
            updatedMeals[dateKey][mealType] = currentValue;
            setMeals(updatedMeals);
            setMessage({ text: error.response?.data?.message || 'Failed to update selection', type: 'error' });
            setTimeout(() => setMessage(null), 5000);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
                <Clock className="animate-spin" style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
                <p>Loading meal selections...</p>
            </div>
        );
    }

    return (
        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem', border: '1.5px solid var(--primary-light)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ background: 'var(--primary-light)', padding: '0.5rem', borderRadius: '10px', display: 'flex' }}>
                        <Utensils size={24} color="var(--primary)" />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>Meal Selection</h2>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Track your presence for better food planning</p>
                    </div>
                </div>
                {message && (
                    <div className="animate-fade-in" style={{ 
                        fontSize: '0.85rem', 
                        fontWeight: '600', 
                        color: message.type === 'error' ? 'var(--danger)' : 'var(--success)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                    }}>
                        {message.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
                        {message.text}
                    </div>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {/* Dinner Today Section */}
                <div style={{ 
                    padding: '1.25rem', 
                    borderRadius: '16px', 
                    background: isDinnerClosed ? 'rgba(0,0,0,0.02)' : 'var(--bg-main)',
                    border: '1px solid var(--border-light)',
                    position: 'relative'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div>
                            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Today</div>
                            <div style={{ fontSize: '1rem', fontWeight: '700' }}>{format(today, 'EEE, d MMM')}</div>
                        </div>
                        <Moon size={20} color={isDinnerClosed ? 'var(--text-muted)' : '#334155'} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', padding: '1rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ fontWeight: '600' }}>Dinner</div>
                            {isDinnerClosed && <span style={{ fontSize: '0.7rem', background: '#fee2e2', color: '#ef4444', padding: '2px 8px', borderRadius: '10px', fontWeight: '700' }}>CLOSED</span>}
                        </div>
                        
                        <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px', opacity: isDinnerClosed ? 0.5 : 1 }}>
                            <input 
                                type="checkbox" 
                                checked={meals.today.dinner} 
                                disabled={isDinnerClosed || saving}
                                onChange={() => handleToggle(todayStr, 'dinner', meals.today.dinner)}
                                style={{ opacity: 0, width: 0, height: 0 }}
                            />
                            <span className={`slider ${meals.today.dinner ? 'checked' : ''}`} style={{
                                position: 'absolute', cursor: isDinnerClosed ? 'not-allowed' : 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                                backgroundColor: meals.today.dinner ? 'var(--primary)' : '#ccc',
                                transition: '.4s', borderRadius: '24px'
                            }}>
                                <span style={{
                                    position: 'absolute', content: '""', height: '18px', width: '18px', left: meals.today.dinner ? '22px' : '4px', bottom: '3px',
                                    backgroundColor: 'white', transition: '.4s', borderRadius: '50%'
                                }}></span>
                            </span>
                        </label>
                    </div>

                    {isDinnerClosed && (
                        <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '500' }}>
                            <Clock size={12} /> Dinner selection closed after 10 AM
                        </div>
                    )}
                </div>

                {/* Lunch Tomorrow Section */}
                <div style={{ 
                    padding: '1.25rem', 
                    borderRadius: '16px', 
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border-light)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div>
                            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tomorrow</div>
                            <div style={{ fontSize: '1rem', fontWeight: '700' }}>{format(tomorrow, 'EEE, d MMM')}</div>
                        </div>
                        <Sun size={20} color="#f59e0b" />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', padding: '1rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <div style={{ fontWeight: '600' }}>Lunch</div>
                        
                        <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
                            <input 
                                type="checkbox" 
                                checked={meals.tomorrow.lunch} 
                                disabled={saving}
                                onChange={() => handleToggle(tomorrowStr, 'lunch', meals.tomorrow.lunch)}
                                style={{ opacity: 0, width: 0, height: 0 }}
                            />
                            <span className={`slider ${meals.tomorrow.lunch ? 'checked' : ''}`} style={{
                                position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                                backgroundColor: meals.tomorrow.lunch ? 'var(--primary)' : '#ccc',
                                transition: '.4s', borderRadius: '24px'
                            }}>
                                <span style={{
                                    position: 'absolute', content: '""', height: '18px', width: '18px', left: meals.tomorrow.lunch ? '22px' : '4px', bottom: '3px',
                                    backgroundColor: 'white', transition: '.4s', borderRadius: '50%'
                                }}></span>
                            </span>
                        </label>
                    </div>
                    
                    <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '500' }}>
                        <CheckCircle size={12} color="var(--success)" /> Selection allowed for next day only
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MealSelection;
