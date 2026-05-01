import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageSquare, Users, CalendarDays, Settings, BarChart3 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const Sidebar = () => {
    const location = useLocation();
    const { currentUser } = useAppContext();

    const menuItems = [
        { path: '/admin/dashboard', label: 'Feedbacks', icon: <MessageSquare size={20} /> },
        { path: '/admin/analytics', label: 'Analytics', icon: <BarChart3 size={20} /> },
        { path: '/admin/users', label: 'Users', icon: <Users size={20} /> },
        { path: '/admin/menu-update', label: 'Menu Update', icon: <CalendarDays size={20} /> },
        { path: '/admin/app-admin', label: 'App Admin', icon: <Settings size={20} />, adminOnly: true }
    ].filter(item => !item.adminOnly || currentUser?.role === 'admin');

    return (
        <aside style={{
            width: 'var(--sidebar-width)',
            background: 'var(--bg-card)',
            borderRight: '1px solid var(--border-light)',
            display: 'flex',
            flexDirection: 'column',
            padding: '2rem 1.5rem',
            height: '100%',
            overflowY: 'auto'
        }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '1rem 1.25rem',
                                borderRadius: '12px',
                                textDecoration: 'none',
                                color: isActive ? 'var(--primary)' : 'var(--text-main)',
                                background: isActive ? 'rgba(98, 54, 255, 0.08)' : 'transparent',
                                fontWeight: isActive ? '600' : '500',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <div style={{ color: isActive ? 'var(--primary)' : 'var(--text-muted)' }}>
                                {item.icon}
                            </div>
                            {item.label}
                        </Link>
                    );
                })}
            </div>
        </aside>
    );
};

export default Sidebar;
