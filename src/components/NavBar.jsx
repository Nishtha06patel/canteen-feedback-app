import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { LogOut, User, Sun, Moon, ChevronDown } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const NavBar = () => {
    const { currentUser, logout, theme, toggleTheme } = useAppContext();
    const location = useLocation();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Initial for avatar
    const userInitial = currentUser?.username ? currentUser.username.charAt(0).toUpperCase() : '?';

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <nav style={{ 
            padding: '0.75rem 2rem', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            background: 'var(--bg-card)',
            borderBottom: '1px solid var(--border-light)',
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
        }}>
            {/* Left: Branding Logo */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <img 
                    src="/iar-logo-full.png" 
                    alt="IAR University Logo" 
                    style={{ height: '55px', width: 'auto', objectFit: 'contain' }} 
                />
            </div>

            {/* Center: App Title (Branded) */}
            <div style={{
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                textAlign: 'center'
            }}>
                <h1 style={{
                    fontSize: '1.5rem',
                    fontWeight: '800',
                    margin: 0,
                    letterSpacing: '1.5px',
                    color: 'var(--primary)',
                    fontFamily: "'Outfit', sans-serif",
                    textTransform: 'uppercase'
                }}>
                    Canteen Feedback
                </h1>
            </div>

            {/* Right: Profile Menu */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {currentUser && (
                    <div style={{ position: 'relative' }} ref={dropdownRef}>
                        <button 
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                background: 'transparent',
                                border: '1px solid var(--border-light)',
                                padding: '0.4rem 0.6rem',
                                borderRadius: '30px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                            className="hover-grow"
                        >
                            <div style={{ 
                                width: '32px', 
                                height: '32px', 
                                background: 'var(--primary)', 
                                color: '#fff', 
                                borderRadius: '50%', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                fontWeight: '700',
                                fontSize: '0.9rem',
                                boxShadow: '0 2px 5px rgba(98, 54, 255, 0.2)'
                            }}>
                                {userInitial}
                            </div>
                            <ChevronDown size={16} color="var(--text-muted)" style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                        </button>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <div className="animate-pop-in" style={{
                                position: 'absolute',
                                top: 'calc(100% + 10px)',
                                right: 0,
                                width: '220px',
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border-light)',
                                borderRadius: '12px',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                padding: '0.75rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.25rem',
                                zIndex: 1001
                            }}>
                                <div style={{ padding: '0.5rem', marginBottom: '0.5rem' }}>
                                    <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', wordBreak: 'break-all' }}>
                                        {currentUser.username}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.2rem', fontWeight: '800' }}>
                                        {currentUser.role}
                                    </div>
                                </div>
                                
                                <div style={{ height: '1px', background: 'var(--border-light)', margin: '0.25rem 0' }}></div>
                                
                                <button 
                                    onClick={() => { toggleTheme(); setIsDropdownOpen(false); }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '0.6rem 0.75rem',
                                        width: '100%',
                                        background: 'transparent',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        color: 'var(--text-main)',
                                        fontSize: '0.9rem',
                                        textAlign: 'left',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-main)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                                    <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                                </button>
                                
                                <button 
                                    onClick={() => { logout(); setIsDropdownOpen(false); }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '0.6rem 0.75rem',
                                        width: '100%',
                                        background: 'transparent',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        color: '#ef4444',
                                        fontSize: '0.9rem',
                                        textAlign: 'left',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <LogOut size={16} />
                                    <span>Logout</span>
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default NavBar;
