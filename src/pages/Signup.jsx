import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { UserPlus, Eye, EyeOff, GraduationCap, Shield, User, Mail, Lock } from 'lucide-react';

const Signup = () => {
    const { registerUser } = useAppContext();
    const navigate = useNavigate();

    const [role, setRole] = useState(''); // Default empty to force selection
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    const [secretCode, setSecretCode] = useState('');
    const [showSecretCode, setShowSecretCode] = useState(false);
    
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');

        if (!role) {
            setError('Please select your role.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        if (role === 'admin' && !secretCode) {
            setError('Admin secret code is required.');
            return;
        }

        setIsLoading(true);
        try {
            await registerUser(email.toLowerCase().trim(), password, role, secretCode, fullName);
            setToastMessage('Account created successfully!');
            setTimeout(() => {
                navigate(role === 'admin' ? '/admin/dashboard' : '/user/dashboard');
            }, 1000);
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
                maxWidth: '440px', 
                padding: '3rem 2.5rem', 
                textAlign: 'center',
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(20px)',
                borderRadius: '24px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ background: 'rgba(98, 54, 255, 0.1)', padding: '1rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <UserPlus size={40} color="var(--primary)" />
                    </div>
                </div>
                
                <h1 style={{ marginBottom: '0.25rem', fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)' }}>
                    Create Account
                </h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', fontSize: '0.95rem', fontWeight: '500' }}>Join the Canteen Feedback system.</p>
                
                <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ textAlign: 'left' }}>
                        <label className="input-label" style={{ fontWeight: '700' }}>Full Name</label>
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex' }}>
                                <User size={18} />
                            </div>
                            <input 
                                type="text" 
                                value={fullName} 
                                onChange={(e) => { setFullName(e.target.value); setError(''); }} 
                                placeholder="Enter your full name" 
                                className="input-field" 
                                style={{ paddingLeft: '3rem' }}
                                required 
                            />
                        </div>
                    </div>

                    <div style={{ textAlign: 'left' }}>
                        <label className="input-label" style={{ fontWeight: '700' }}>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex' }}>
                                <Mail size={18} />
                            </div>
                            <input 
                                type="email" 
                                value={email} 
                                onChange={(e) => { setEmail(e.target.value); setError(''); }} 
                                placeholder={role === 'admin' ? "admin@iar.ac.in" : "student@iar.ac.in"} 
                                className="input-field" 
                                style={{ paddingLeft: '3rem' }}
                                required 
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ textAlign: 'left' }}>
                            <label className="input-label" style={{ fontWeight: '700' }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex' }}>
                                    <Lock size={16} />
                                </div>
                                <input 
                                    type={showPassword ? 'text' : 'password'} 
                                    value={password} 
                                    onChange={(e) => { setPassword(e.target.value); setError(''); }} 
                                    placeholder="Password" 
                                    className="input-field" 
                                    style={{ paddingLeft: '2.5rem' }}
                                    required 
                                />
                            </div>
                        </div>
                        <div style={{ textAlign: 'left' }}>
                            <label className="input-label" style={{ fontWeight: '700' }}>Confirm</label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex' }}>
                                    <Lock size={16} />
                                </div>
                                <input 
                                    type={showPassword ? 'text' : 'password'} 
                                    value={confirmPassword} 
                                    onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }} 
                                    placeholder="Confirm" 
                                    className="input-field" 
                                    style={{ paddingLeft: '2.5rem' }}
                                    required 
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ textAlign: 'left' }}>
                        <label className="input-label" style={{ fontWeight: '700' }}>Select Role</label>
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex', pointerEvents: 'none' }}>
                                {role === 'admin' ? <Shield size={18} /> : <GraduationCap size={18} />}
                            </div>
                            <select 
                                value={role} 
                                onChange={(e) => { setRole(e.target.value); setError(''); }} 
                                className="input-field" 
                                style={{ paddingLeft: '3rem', cursor: 'pointer', appearance: 'none' }}
                                required
                            >
                                <option value="" disabled>Select your role</option>
                                <option value="user">Student</option>
                                <option value="admin">Admin</option>
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
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '2rem 0' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }}></div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>OR</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }}></div>
                </div>

                <Link to="/login" style={{ color: 'var(--text-main)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600' }}>
                    Already have an account? <span style={{ color: 'var(--primary)', fontWeight: '800' }}>Log In</span>
                </Link>
            </div>
            
            {toastMessage && (
                <div className="animate-slide-up" style={{ position: 'fixed', bottom: '24px', right: '24px', background: 'var(--success)', color: 'white', padding: '1rem 1.5rem', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)', display: 'flex', alignItems: 'center', gap: '0.75rem', zIndex: 1000 }}>
                    <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '50%', padding: '4px', display: 'flex' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <strong style={{ fontWeight: '600' }}>{toastMessage}</strong>
                </div>
            )}
        </div>
    );
};

export default Signup;
