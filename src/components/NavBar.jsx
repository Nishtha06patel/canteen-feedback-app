import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { LogOut, Clock, User, Sun, Moon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const NavBar = () => {
    const { currentUser, logout, theme, toggleTheme } = useAppContext();
    const location = useLocation();
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);


    return (
        <nav className="glass-panel" style={{ 
            padding: '1rem 2rem', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            position: 'sticky',
            top: 0,
            zIndex: 100
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img 
                    src="/logo.jpg" 
                    alt="IAR Logo" 
                    style={{ 
                        height: '50px', 
                        width: 'auto',
                        objectFit: 'contain'
                    }} 
                />
                <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>Canteen Feedback</h2>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>Institute of Advanced Research</p>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                
                {/* Admin Navigation Links */}
                {currentUser?.role === 'admin' && (
                    <div style={{ display: 'flex', gap: '1rem', borderRight: '1px solid var(--glass-border)', paddingRight: '1.5rem' }}>
                        <Link 
                            to="/admin/dashboard" 
                            className={`btn ${location.pathname === '/admin/dashboard' ? 'btn-primary' : 'btn-outline'}`} 
                            style={{ textDecoration: 'none', padding: '0.5rem 1rem', fontSize: '0.875rem', borderRadius: '8px' }}
                        >
                            Feedbacks
                        </Link>
                        <Link 
                            to="/admin/users" 
                            className={`btn ${location.pathname === '/admin/users' ? 'btn-primary' : 'btn-outline'}`} 
                            style={{ textDecoration: 'none', padding: '0.5rem 1rem', fontSize: '0.875rem', borderRadius: '8px' }}
                        >
                            Users
                        </Link>
                        <Link 
                            to="/admin/menu-update" 
                            className={`btn ${location.pathname === '/admin/menu-update' ? 'btn-primary' : 'btn-outline'}`} 
                            style={{ textDecoration: 'none', padding: '0.5rem 1rem', fontSize: '0.875rem', borderRadius: '8px' }}
                        >
                            Menu Update
                        </Link>
                        <Link 
                            to="/admin/app-admin" 
                            className={`btn ${location.pathname === '/admin/app-admin' ? 'btn-primary' : 'btn-outline'}`} 
                            style={{ textDecoration: 'none', padding: '0.5rem 1rem', fontSize: '0.875rem', borderRadius: '8px' }}
                        >
                            App Admin
                        </Link>
                    </div>
                )}


                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                    <Clock size={16} />
                    <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: '500' }}>
                        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', borderLeft: '1px solid var(--glass-border)', paddingLeft: '1.5rem' }}>
                    {currentUser ? (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ background: 'var(--glass-bg)', padding: '0.5rem', borderRadius: '50%' }}>
                                    <User size={16} color="var(--primary)" />
                                </div>
                                <span style={{ fontWeight: '500' }}>{currentUser.username}</span>
                                <span style={{ 
                                    fontSize: '0.75rem', 
                                    padding: '0.1rem 0.5rem', 
                                    background: currentUser.role === 'admin' ? 'var(--accent)' : 'var(--glass-bg)',
                                    color: currentUser.role === 'admin' ? '#000' : 'var(--text-muted)',
                                    borderRadius: '10px',
                                    marginLeft: '0.5rem'
                                }}>
                                    {currentUser.role.toUpperCase()}
                                </span>
                            </div>
                            
                            <button 
                                onClick={logout}
                                className="btn btn-outline hover-grow"
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderColor: 'var(--danger)', color: 'var(--danger)' }}
                            >
                                <LogOut size={16} /> Logout
                            </button>
                        </>
                    ) : (
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <Link to="/login" className="btn btn-outline" style={{ textDecoration: 'none', padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Login</Link>
                            <Link to="/signup" className="btn btn-primary" style={{ textDecoration: 'none', padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Signup</Link>
                        </div>
                    )}

                    {/* Theme Toggle Button */}
                    <button 
                        onClick={toggleTheme}
                        className="btn btn-outline hover-grow"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.6rem', borderRadius: '50%', color: 'var(--text-main)', borderColor: 'var(--glass-border)' }}
                        title="Toggle Light/Dark Mode"
                    >
                        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default NavBar;
