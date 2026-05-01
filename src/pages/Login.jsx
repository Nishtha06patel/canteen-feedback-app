import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Utensils, Eye, EyeOff } from 'lucide-react';

const Login = () => {
    const { loginUser } = useAppContext();
    const navigate = useNavigate();

    const [role, setRole] = useState('user'); // 'user' or 'admin'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    const [secretCode, setSecretCode] = useState('');
    const [showSecretCode, setShowSecretCode] = useState(false);
    
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        if (role === 'admin' && !secretCode) {
            setError('Admin secret code is required.');
            return;
        }

        setIsLoading(true);
        try {
            await loginUser(email.trim().toLowerCase(), password, role, secretCode);
            navigate(role === 'admin' ? '/admin/dashboard' : '/user/dashboard');
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    return (
        <div className="animate-fade-in" style={{ 
            flex: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '2rem',
            background: 'linear-gradient(var(--bg-overlay), var(--bg-overlay)), url("/campus-bg.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: 'calc(100vh - 73px)'
        }}>
            <div className="glass-card animate-slide-up" style={{ 
                width: '100%', 
                maxWidth: '400px', 
                padding: '3rem 2rem', 
                textAlign: 'center',
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(20px)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ background: 'rgba(98, 54, 255, 0.1)', padding: '1rem', borderRadius: '50%' }}>
                        <Utensils size={32} color="var(--primary)" />
                    </div>
                </div>
                
                {/* Role Switcher */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                     <div style={{ display: 'flex', background: 'var(--toggle-bg)', borderRadius: '30px', padding: '4px' }}>
                        <button
                            type="button"
                            onClick={() => { setRole('user'); setError(''); }}
                            style={{ padding: '0.4rem 1.25rem', borderRadius: '30px', border: 'none', background: role === 'user' ? 'var(--toggle-active)' : 'transparent', color: role === 'user' ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s', fontWeight: '700', fontSize: '0.8rem', boxShadow: role === 'user' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none' }}
                        >
                            STUDENT
                        </button>
                        <button
                            type="button"
                            onClick={() => { setRole('admin'); setError(''); }}
                            style={{ padding: '0.4rem 1.25rem', borderRadius: '30px', border: 'none', background: role === 'admin' ? 'var(--toggle-active)' : 'transparent', color: role === 'admin' ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s', fontWeight: '700', fontSize: '0.8rem', boxShadow: role === 'admin' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none' }}
                        >
                            ADMIN
                        </button>
                    </div>
                </div>

                <h1 style={{ marginBottom: '0.5rem', fontSize: '1.5rem', fontWeight: '700' }}>
                    {role === 'user' ? 'Student Portal' : 'Admin Portal'}
                </h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>Sign in to your account</p>
                
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ textAlign: 'left' }}>
                        <label className="input-label">Registered Email</label>
                        <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} placeholder={role === 'user' ? "your.name@iar.ac.in" : "admin@iar.ac.in"} className="input-field" required />
                    </div>
                    
                    <div style={{ textAlign: 'left' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', alignItems: 'center' }}>
                            <label className="input-label" style={{ marginBottom: 0 }}>Password</label>
                            {role === 'user' && (
                                <Link to="/forgot-password" style={{ fontSize: '0.75rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>Forgot password?</Link>
                            )}
                        </div>
                        <div style={{ position: 'relative' }}>
                            <input 
                                type={showPassword ? 'text' : 'password'} 
                                value={password} 
                                onChange={(e) => { setPassword(e.target.value); setError(''); }} 
                                placeholder="Enter your password" 
                                className="input-field" 
                                style={{ paddingRight: '2.5rem' }}
                                required 
                            />
                            <button 
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, display: 'flex' }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {role === 'admin' && (
                        <div className="animate-fade-in" style={{ textAlign: 'left' }}>
                            <label className="input-label">Admin Secret Code</label>
                            <div style={{ position: 'relative' }}>
                                <input 
                                    type={showSecretCode ? 'text' : 'password'} 
                                    value={secretCode} 
                                    onChange={(e) => { setSecretCode(e.target.value); setError(''); }} 
                                    placeholder="Enter verification code" 
                                    className="input-field" 
                                    style={{ paddingRight: '2.5rem' }} 
                                    required 
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowSecretCode(!showSecretCode)}
                                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, display: 'flex' }}
                                >
                                    {showSecretCode ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                    )}

                    {error && <p className="animate-fade-in" style={{ color: 'var(--danger)', fontSize: '0.85rem', fontWeight: '600' }}>{error}</p>}
                    
                    <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', width: '100%', padding: '0.8rem' }} disabled={isLoading}>
                        {isLoading ? 'Logging In...' : 'Log In'}
                    </button>
                </form>

                {role === 'user' && (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0' }}>
                            <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }}></div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>OR</span>
                            <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }}></div>
                        </div>

                        <Link to="/signup" style={{ color: 'var(--text-main)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '500' }}>
                            Don't have an account? <span style={{ color: 'var(--primary)', fontWeight: '700' }}>Sign Up</span>
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
};
export default Login;
