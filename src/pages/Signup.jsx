import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { UserPlus, Lock, Smartphone, Mail } from 'lucide-react';

const Signup = () => {
    const { registerUser, loginUser } = useAppContext();
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [mockOtp, setMockOtp] = useState('');
    const [inputOtp, setInputOtp] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [toastMessage, setToastMessage] = useState('');

    const generateOtp = () => Math.floor(1000 + Math.random() * 9000).toString();

    const handleSendOTP = (e) => {
        e.preventDefault();
        setError('');
        if (!email.toLowerCase().endsWith('@iar.ac.in')) {
            setError('Please use a valid @iar.ac.in email address.');
            return;
        }
        const newOtp = generateOtp();
        setMockOtp(newOtp);
        setToastMessage(`[MOCK EMAIL] Your IAR Canteen OTP is: ${newOtp}`);
        setTimeout(() => setToastMessage(''), 6000);
        setStep(2);
    };

    const handleVerifyOTP = (e) => {
        e.preventDefault();
        setError('');
        if (inputOtp !== mockOtp) {
            setError('Invalid OTP code. Please try again.');
            return;
        }
        setStep(3);
    };

    const handleFinalSignup = async (e) => {
        e.preventDefault();
        setError('');
        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }
        try {
            await registerUser(email, password);
            setToastMessage('Password saved Successful');
            setTimeout(() => {
                navigate('/login');
            }, 1500);
        } catch (err) {
            if (err.message === 'Email is already registered.') {
                navigate('/login');
            } else {
                setError(err.message);
            }
        }
    };

    return (
        <div className="animate-fade-in" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="glass-panel animate-slide-up" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem', textAlign: 'center' }}>
                
                {step === 1 && (
                    <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', padding: '1rem', borderRadius: '50%' }}>
                                <UserPlus size={32} color="white" />
                            </div>
                        </div>
                        <h1 style={{ marginBottom: '0.5rem', fontSize: '1.75rem' }}>Create Account</h1>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Sign up using your IAR email.</p>
                        
                        <div style={{ textAlign: 'left' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>IAR Email Address</label>
                            <input type="email" value={email} onChange={(e) => { setEmail(e.target.value.toLowerCase().trim()); setError(''); }} placeholder="student@iar.ac.in" className="input-field" required />
                        </div>

                        {error && <p style={{ color: 'var(--danger)', fontSize: '0.875rem', marginTop: '0.5rem' }}>{error}</p>}
                        <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>Send OTP</button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleVerifyOTP} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', padding: '1rem', borderRadius: '50%' }}>
                                <Mail size={32} color="white" />
                            </div>
                        </div>
                        <h1 style={{ marginBottom: '0.5rem', fontSize: '1.75rem' }}>Verify OTP</h1>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>A 4-digit code was sent to {email}</p>
                        
                        <div style={{ textAlign: 'left' }}>
                            <input type="text" maxLength={4} value={inputOtp} onChange={(e) => { setInputOtp(e.target.value); setError(''); }} placeholder="----" className="input-field" style={{ textAlign: 'center', fontSize: '2rem', letterSpacing: '0.5rem' }} required />
                        </div>
                        {error && <p style={{ color: 'var(--danger)', fontSize: '0.875rem', marginTop: '0.5rem' }}>{error}</p>}
                        <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>Verify OTP</button>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handleFinalSignup} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', padding: '1rem', borderRadius: '50%' }}>
                                <Lock size={32} color="white" />
                            </div>
                        </div>
                        <h1 style={{ marginBottom: '0.5rem', fontSize: '1.75rem' }}>Secure Account</h1>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Set the password you will use for login.</p>

                        <div style={{ textAlign: 'left' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>New Password</label>
                            <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} placeholder="Secure password" className="input-field" required />
                        </div>
                        {error && <p style={{ color: 'var(--danger)', fontSize: '0.875rem', marginTop: '0.5rem' }}>{error}</p>}
                        <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>Save Password</button>
                    </form>
                )}

                {step === 1 && (
                    <div style={{ marginTop: '2rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
                        <Link to="/login" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem', transition: 'color 0.2s' }}>
                            Already have an account? <span style={{ color: 'var(--primary)' }}>Log in &rarr;</span>
                        </Link>
                    </div>
                )}
            </div>
            
            {toastMessage && (
                <div style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    background: 'var(--success)',
                    color: 'white',
                    padding: '1rem 1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    zIndex: 1000,
                    animation: 'slideUp 0.3s ease-out'
                }}>
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
