import React from 'react';
import { useAppContext } from '../context/AppContext';
import { LogOut, User, Sun, Moon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const NavBar = () => {
    const { currentUser, logout, theme, toggleTheme } = useAppContext();
    const location = useLocation();


    return (
        <nav style={{ 
            padding: '1rem 2rem', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            background: 'var(--bg-card)',
            borderBottom: '1px solid var(--border-light)',
            position: 'sticky',
            top: 0,
            zIndex: 100
        }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <img 
                    src="/iar-logo-full.png" 
                    alt="IAR University Logo" 
                    style={{ height: '65px', width: 'auto', objectFit: 'contain' }} 
                />
            </div>

            {/* Center: App Title */}
            <div style={{
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--text-main)',
                fontSize: '1.25rem',
                fontWeight: '800',
                letterSpacing: '1px'
            }}>
                CANTEEN FEEDBACK
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    {currentUser ? (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ background: 'rgba(98, 54, 255, 0.1)', padding: '0.5rem', borderRadius: '50%' }}>
                                    <User size={16} color="var(--primary)" />
                                </div>
                                <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>{currentUser.username}</span>
                                <span style={{ 
                                    fontSize: '0.7rem', 
                                    padding: '0.2rem 0.6rem', 
                                    background: currentUser.role === 'admin' ? 'rgba(98, 54, 255, 0.1)' : '#f1f5f9',
                                    color: currentUser.role === 'admin' ? 'var(--primary)' : 'var(--text-muted)',
                                    borderRadius: '12px',
                                    fontWeight: '700',
                                    letterSpacing: '0.5px'
                                }}>
                                    {currentUser.role.toUpperCase()}
                                </span>
                            </div>
                            
                            <button 
                                onClick={logout}
                                className="btn btn-outline hover-grow"
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '8px' }}
                            >
                                <LogOut size={16} /> Logout
                            </button>
                        </>
                    ) : null}

                    {/* Theme Toggle Button */}
                    <button 
                        onClick={toggleTheme}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.6rem', borderRadius: '50%', color: 'var(--text-muted)', background: 'var(--bg-main)', border: 'none', cursor: 'pointer', transition: 'all 0.2s ease' }}
                        title="Toggle Light/Dark Mode"
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--border-light)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-main)'}
                    >
                        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default NavBar;
