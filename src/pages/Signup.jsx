import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { UserPlus, Eye, EyeOff } from 'lucide-react';

const Signup = () => {
    const { registerUser } = useAppContext();
    const navigate = useNavigate();

    const [role, setRole] = useState('user'); // 'user' or 'admin'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    const [secretCode, setSecretCode] = useState('');
    const [showSecretCode, setShowSecretCode] = useState(false);
    
    const [otpValues, setOtpValues] = useState(['', '', '', '']);
    const [mockOtp, setMockOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const generateOtp = () => {
        if (!email.toLowerCase().endsWith('@iar.ac.in')) {
            setError("Students must use a valid @iar.ac.in email address.");
            return;
        }
        setError('');
        const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
        setMockOtp(newOtp);
        setOtpSent(true);
        setToastMessage(`[MOCK EMAIL] Signup OTP: ${newOtp}`);
        setTimeout(() => setToastMessage(''), 6000);
    };

    const handleOtpChange = (index, value) => {
        if (isNaN(value)) return;
        const newOtp = [...otpValues];
        newOtp[index] = value.substring(value.length - 1);
        setOtpValues(newOtp);

        if (value && index < 3) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            if (prevInput) prevInput.focus();
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        
        if (role === 'user' && !email.toLowerCase().endsWith('@iar.ac.in')) {
            setError('Students must use a valid @iar.ac.in email address.');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        if (role === 'user') {
            const enteredOtp = otpValues.join('');
            if (!otpSent || enteredOtp !== mockOtp) {
                setError('Invalid OTP code. Please request and enter a valid 4-digit OTP.');
                return;
            }
        }

        if (role === 'admin' && !secretCode) {
            setError('Admin secret code is required.');
            return;
        }

        setIsLoading(true);
        try {
            await registerUser(email.toLowerCase().trim(), password, role, secretCode);
            setToastMessage('Account created successfully!');
            setTimeout(() => {
                navigate(role === 'admin' ? '/admin/dashboard' : '/user/dashboard');
            }, 1000);
        } catch (err) {
            if (err.message === 'Email is already registered.') {
                setError('Email is already registered. Please login.');
            } else {
                setError(err.message);
            }
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
                        <UserPlus size={32} color="var(--primary)" />
                    </div>
                </div>
                
                {/* Role Switcher */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                     <div style={{ display: 'flex', background: 'var(--toggle-bg)', borderRadius: '30px', padding: '4px' }}>
                        <button
                            type="button"
                            onClick={() => { setRole('user'); setError(''); setOtpValues(['', '', '', '']); setOtpSent(false); }}
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

                <h1 style={{ marginBottom: '0.5rem', fontSize: '1.5rem', fontWeight: '700' }}>Create Account</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>Join the Canteen Feedback system.</p>
                
                <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ textAlign: 'left' }}>
                        <label className="input-label">Email Address</label>
                        <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} placeholder={role === 'user' ? "student@iar.ac.in" : "admin@iar.ac.in"} className="input-field" required />
                    </div>

                    {role === 'user' && (
                        <div className="animate-fade-in" style={{ textAlign: 'left' }}>
                            <label className="input-label">Verification OTP</label>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: '0.5rem', flex: 1 }}>
                                    {[0, 1, 2, 3].map((index) => (
                                        <input
                                            key={index}
                                            id={`otp-${index}`}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={otpValues[index]}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                            disabled={!otpSent}
                                            className="input-field"
                                            style={{ flex: 1, textAlign: 'center', padding: '0.75rem 0', fontSize: '1.25rem', fontWeight: 'bold' }}
                                        />
                                    ))}
                                </div>
                                <button type="button" onClick={generateOtp} className="btn btn-outline" style={{ padding: '0 1rem', fontSize: '0.875rem', whiteSpace: 'nowrap', height: '100%', borderColor: 'var(--primary)', color: 'var(--primary)' }}>
                                    {otpSent ? 'Resend' : 'Get OTP'}
                                </button>
                            </div>
                        </div>
                    )}

                    <div style={{ textAlign: 'left' }}>
                        <label className="input-label">Password</label>
                        <div style={{ position: 'relative' }}>
                            <input 
                                type={showPassword ? 'text' : 'password'} 
                                value={password} 
                                onChange={(e) => { setPassword(e.target.value); setError(''); }} 
                                placeholder="Secure password" 
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
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }}></div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>OR</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }}></div>
                </div>

                <Link to="/login" style={{ color: 'var(--text-main)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '500' }}>
                    Already have an account? <span style={{ color: 'var(--primary)', fontWeight: '700' }}>Log In</span>
                </Link>
            </div>
            
            {toastMessage && (
                <div style={{ position: 'fixed', bottom: '24px', right: '24px', background: 'var(--success)', color: 'white', padding: '1rem 1.5rem', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)', display: 'flex', alignItems: 'center', gap: '0.75rem', zIndex: 1000, animation: 'slideUp 0.3s ease-out' }}>
                    <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '50%', padding: '4px', display: 'flex' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <strong style={{ fontWeight: '500' }}>{toastMessage}</strong>
                </div>
            )}
        </div>
    );
};
export default Signup;
