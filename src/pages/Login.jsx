import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Utensils, Eye, EyeOff, GraduationCap, Shield, ChefHat, User } from 'lucide-react';

const Login = () => {
    const { loginUser } = useAppContext();
    const navigate = useNavigate();

    const [role, setRole] = useState(''); // Default to empty to force selection
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

        if (!role) {
            setError('Please select your role.');
            return;
        }

        if (role === 'admin' && !secretCode) {
            setError('Admin secret code is required.');
            return;
        }

        setIsLoading(true);
        try {
            // Map UI labels to backend role keys
            // Admin -> 'admin', Canteen Staff -> 'staff', Student -> 'user'
            await loginUser(email.trim().toLowerCase(), password, role, secretCode);
            
            // Redirection logic
            if (role === 'admin') navigate('/admin/dashboard');
            else if (role === 'staff') navigate('/staff/dashboard');
            else navigate('/user/dashboard');
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
                maxWidth: '420px', 
                padding: '3rem 2.5rem', 
                textAlign: 'center',
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(20px)',
                borderRadius: '24px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ background: 'rgba(98, 54, 255, 0.1)', padding: '1rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <GraduationCap size={40} color="var(--primary)" />
                    </div>
                </div>
                
                <h1 style={{ marginBottom: '0.25rem', fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)' }}>
                    Welcome Back
                </h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', fontSize: '0.95rem', fontWeight: '500' }}>Sign in to your account</p>
                
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ textAlign: 'left' }}>
                        <label className="input-label" style={{ fontWeight: '700' }}>Registered Email</label>
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex' }}>
                                <User size={18} />
                            </div>
                            <input 
                                type="email" 
                                value={email} 
                                onChange={(e) => { setEmail(e.target.value); setError(''); }} 
                                placeholder="your.name@iar.ac.in" 
                                className="input-field" 
                                style={{ paddingLeft: '3rem' }}
                                required 
                            />
                        </div>
                    </div>
                    
                    <div style={{ textAlign: 'left' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', alignItems: 'center' }}>
                            <label className="input-label" style={{ marginBottom: 0, fontWeight: '700' }}>Password</label>
                            <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: '700' }}>Forgot password?</Link>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex' }}>
                                <Shield size={18} />
                            </div>
                            <input 
                                type={showPassword ? 'text' : 'password'} 
                                value={password} 
                                onChange={(e) => { setPassword(e.target.value); setError(''); }} 
                                placeholder="Enter your password" 
                                className="input-field" 
                                style={{ paddingLeft: '3rem', paddingRight: '2.5rem' }}
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

                    <div style={{ textAlign: 'left' }}>
                        <label className="input-label" style={{ fontWeight: '700' }}>Role</label>
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex', pointerEvents: 'none' }}>
                                {role === 'admin' ? <Shield size={18} /> : role === 'staff' ? <ChefHat size={18} /> : <GraduationCap size={18} />}
                            </div>
                            <select 
                                value={role} 
                                onChange={(e) => { setRole(e.target.value); setError(''); }} 
                                className="input-field" 
                                style={{ paddingLeft: '3rem', cursor: 'pointer', appearance: 'none' }}
                                required
                            >
                                <option value="" disabled>Select your role</option>
                                <option value="admin">Admin</option>
                                <option value="staff">Canteen Staff</option>
                                <option value="user">Student</option>
                            </select>
                            <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none', display: 'flex' }}>
                                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                        </div>
                    </div>

                    {role === 'admin' && (
                        <div className="animate-fade-in" style={{ textAlign: 'left' }}>
                            <label className="input-label" style={{ fontWeight: '700' }}>Admin Secret Code</label>
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

                    {error && <p className="animate-fade-in" style={{ color: 'var(--danger)', fontSize: '0.85rem', fontWeight: '600', marginTop: '-0.5rem' }}>{error}</p>}
                    
                    <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', width: '100%', padding: '1rem', fontSize: '1rem', borderRadius: '12px' }} disabled={isLoading}>
                        {isLoading ? 'Logging In...' : 'Log In'}
                    </button>
                </form>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '2rem 0' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }}></div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>OR</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }}></div>
                </div>

                <Link to="/signup" style={{ color: 'var(--text-main)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600' }}>
                    Don't have an account? <span style={{ color: 'var(--primary)', fontWeight: '800' }}>Sign Up</span>
                </Link>
            </div>
        </div>
    );
};
export default Login;
