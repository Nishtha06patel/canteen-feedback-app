import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageSquare, Users, CalendarDays, Settings, BarChart, Bell } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const Sidebar = ({ isOpen, closeSidebar }) => {
    const location = useLocation();
    const { currentUser, messages } = useAppContext();
    const [unreadCount, setUnreadCount] = useState(0);

    // Calculate unread count (only messages from the last 24 hours)
    useEffect(() => {
        if (location.pathname === '/admin/broadcast') {
            setUnreadCount(0);
        } else {
            const now = new Date();
            const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            
            const freshMessagesCount = messages.filter(msg => {
                const msgDate = new Date(msg.created_at);
                return msgDate > oneDayAgo;
            }).length;

            setUnreadCount(freshMessagesCount);
        }
    }, [messages, location.pathname]);

    const menuItems = [
        { path: '/admin/dashboard', label: 'Feedbacks', icon: <MessageSquare size={20} /> },
        { path: '/admin/analytics', label: 'Analytics', icon: <BarChart size={20} /> },
        { path: '/admin/broadcast', label: 'Announcements', icon: <Bell size={20} />, badge: unreadCount },
        { path: '/admin/users', label: 'Users', icon: <Users size={20} /> },
        { path: '/admin/menu-update', label: 'Menu Update', icon: <CalendarDays size={20} /> },
        { path: '/admin/app-admin', label: 'App Admin', icon: <Settings size={20} />, adminOnly: true }
    ].filter(item => !item.adminOnly || currentUser?.role === 'admin');

    return (
        <>
            {/* Mobile Overlay */}
            <div 
                className={`sidebar-overlay ${isOpen ? 'visible' : ''}`} 
                onClick={closeSidebar}
            ></div>

            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => { if (window.innerWidth <= 768) closeSidebar(); }}
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
                                    transition: 'all 0.2s ease',
                                    position: 'relative'
                                }}
                            >
                                <div style={{ color: isActive ? 'var(--primary)' : 'var(--text-muted)' }}>
                                    {item.icon}
                                </div>
                                <span style={{ flex: 1 }}>{item.label}</span>
                                {item.badge > 0 && !isActive && (
                                    <span style={{ 
                                        background: 'var(--danger)', 
                                        color: 'white', 
                                        fontSize: '0.65rem', 
                                        padding: '0.1rem 0.4rem', 
                                        borderRadius: '10px',
                                        fontWeight: '800',
                                        minWidth: '18px',
                                        textAlign: 'center'
                                    }}>
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
