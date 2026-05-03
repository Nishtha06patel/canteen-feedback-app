import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import api from '../utils/api';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { TrendingUp, Star, AlertCircle, ThumbsUp, MessageSquare, List, Utensils, Moon, Sun } from 'lucide-react';

const AdminAnalytics = () => {
    const { feedbackStats, fetchStats } = useAppContext();
    const [mealSummary, setMealSummary] = useState({ dinnerToday: 0, lunchTomorrow: 0 });

    useEffect(() => {
        fetchStats();
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

    if (!feedbackStats) {
        return (
            <div className="flex-center" style={{ height: '60vh' }}>
                <div className="animate-fade-in" style={{ textAlign: 'center' }}>
                    <div className="btn-primary" style={{ padding: '1rem', borderRadius: '50%', marginBottom: '1rem', display: 'inline-flex' }}>
                        <TrendingUp size={32} />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Loading Analytics...</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Calculating statistics from feedback data.</p>
                </div>
            </div>
        );
    }

    const { summary, ratingDistribution, typeDistribution, trend, topItems } = feedbackStats;

    // Format rating distribution for BarChart
    const ratingData = [1, 2, 3, 4, 5].map(r => {
        const item = ratingDistribution.find(d => d.rating === r);
        return { rating: `${r} ★`, count: item ? parseInt(item.count) : 0 };
    });

    // Format type distribution for PieChart
    const typeData = typeDistribution.map(d => {
        const typeName = d.type || 'unknown';
        return {
            name: typeName.charAt(0).toUpperCase() + typeName.slice(1),
            value: parseInt(d.count || 0)
        };
    });

    // COLORS for charts
    const COLORS = ['#6236ff', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

    const StatCard = ({ title, value, icon, color }) => (
        <div className="glass-card animate-slide-up" style={{ padding: '1.5rem', flex: 1, minWidth: '200px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <p style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>{title}</p>
                    <h3 style={{ fontSize: '1.75rem', fontWeight: '800', margin: 0 }}>{value}</h3>
                </div>
                <div style={{ background: `${color}15`, color: color, padding: '0.75rem', borderRadius: '12px' }}>
                    {icon}
                </div>
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '2rem' }}>Statistical Report</h1>

            {/* Meal Selection Summary Row */}
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                <div className="glass-card animate-slide-up" style={{ padding: '1.5rem', flex: 1, minWidth: '300px', border: '1.5px solid var(--primary-light)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Students for Dinner Today</p>
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
                            <p style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Students for Lunch Tomorrow</p>
                            <h3 style={{ fontSize: '2rem', fontWeight: '800', margin: 0, color: '#f59e0b' }}>{mealSummary.lunchTomorrow}</h3>
                        </div>
                        <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '1rem', borderRadius: '15px' }}>
                            <Sun size={32} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Row */}
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
                <StatCard 
                    title="Total Feedback" 
                    value={summary?.total_count || 0} 
                    icon={<MessageSquare size={24} />} 
                    color="#6236ff" 
                />
                <StatCard 
                    title="Average Rating" 
                    value={parseFloat(summary?.avg_rating || 0).toFixed(1)} 
                    icon={<Star size={24} />} 
                    color="#f59e0b" 
                />
                <StatCard 
                    title="Complaints" 
                    value={summary?.complaint_count || 0} 
                    icon={<AlertCircle size={24} />} 
                    color="#ef4444" 
                />
                <StatCard 
                    title="Praise" 
                    value={summary?.praise_count || 0} 
                    icon={<ThumbsUp size={24} />} 
                    color="#10b981" 
                />
            </div>

            <div className="analytics-grid">
                {/* Trend Chart */}
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <TrendingUp size={20} color="var(--primary)" /> Feedback Trend (Last 30 Days)
                    </h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <AreaChart data={trend}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6236ff" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#6236ff" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                                <XAxis dataKey="date" tickFormatter={(str) => new Date(str).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} fontSize={12} tick={{fill: 'var(--text-muted)'}} />
                                <YAxis fontSize={12} tick={{fill: 'var(--text-muted)'}} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid var(--border-light)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <Area type="monotone" dataKey="count" stroke="#6236ff" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Rating Distribution */}
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Star size={20} color="#f59e0b" /> Rating Distribution
                    </h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={ratingData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                                <XAxis dataKey="rating" fontSize={12} tick={{fill: 'var(--text-muted)'}} />
                                <YAxis fontSize={12} tick={{fill: 'var(--text-muted)'}} />
                                <Tooltip cursor={{fill: 'rgba(98, 54, 255, 0.05)'}} contentStyle={{ borderRadius: '12px', border: '1px solid var(--border-light)' }} />
                                <Bar dataKey="count" fill="#6236ff" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="analytics-grid">
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.5rem' }}>Feedback Categories</h3>
                    <div className="pie-chart-container">
                        <div className="pie-chart-main">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={typeData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {typeData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid var(--border-light)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="pie-chart-legend">
                            {typeData.map((entry, index) => (
                                <div key={entry.name} className="legend-item">
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLORS[index % COLORS.length], flexShrink: 0 }}></div>
                                    <span className="legend-text">{entry.name}</span>
                                    <span className="legend-value">({entry.value})</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Top Items List */}
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <List size={20} color="var(--primary)" /> Most Mentioned Food Items
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {topItems.length === 0 ? (
                            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No item data available yet.</p>
                        ) : (
                            topItems.map((item, index) => (
                                <div key={item.item_name} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ 
                                        width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: 'white', 
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.9rem' 
                                    }}>
                                        {index + 1}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                            <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>{item.item_name}</span>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.count} mentions</span>
                                        </div>
                                        <div style={{ width: '100%', height: '6px', background: 'var(--border-light)', borderRadius: '3px', overflow: 'hidden' }}>
                                            <div style={{ 
                                                width: `${topItems[0]?.count ? (parseInt(item.count) / parseInt(topItems[0].count)) * 100 : 0}%`, 
                                                height: '100%', background: 'var(--primary)', borderRadius: '3px' 
                                            }}></div>
                                        </div>
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

export default AdminAnalytics;
