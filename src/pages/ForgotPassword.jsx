import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { KeyRound, Smartphone, Lock, Mail } from 'lucide-react';

const ForgotPassword = () => {
    const { registeredUsers, resetPassword } = useAppContext();
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [mockOtp, setMockOtp] = useState('');
    const [inputOtp, setInputOtp] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [toastMessage, setToastMessage] = useState('');

    const generateOtp = () => Math.floor(1000 + Math.random() * 9000).toString();

    const handleSearchEmail = (e) => {
        e.preventDefault();
        setError('');
        const lower = email.toLowerCase().trim();
        if (!lower.endsWith('@iar.ac.in')) {
            setError('System Access Denied: Only valid @iar.ac.in domains are permitted.');
            return;
        }

        const user = registeredUsers.find(u => u.email === lower);
        if (!user) {
            setError('This email is not registered in the student database.');
            return;
        }
        const newOtp = generateOtp();
        setMockOtp(newOtp);
        setToastMessage(`[MOCK EMAIL] Security Alert: Your password reset OTP is: ${newOtp}`);
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

    const handleSetNewPassword = (e) => {
        e.preventDefault();
        setError('');
        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }
        try {
            resetPassword(email, password);
            setToastMessage('Password updated');
            setTimeout(() => {
                navigate('/login');
            }, 1500);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="animate-fade-in" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="glass-panel animate-slide-up" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem', textAlign: 'center' }}>
                
                {step === 1 && (
                    <form onSubmit={handleSearchEmail} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--danger))', padding: '1rem', borderRadius: '50%' }}>
                                <KeyRound size={32} color="white" />
                            </div>
                        </div>
                        <h1 style={{ marginBottom: '0.5rem', fontSize: '1.75rem' }}>Forgot Password</h1>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Enter your registered email ID.</p>
                        
                        <div style={{ textAlign: 'left' }}>
                            <input type="email" value={email} onChange={(e) => { setEmail(e.target.value.toLowerCase()); setError(''); }} placeholder="student@iar.ac.in" className="input-field" required />
                        </div>
                        {error && <p style={{ color: 'var(--danger)', fontSize: '0.875rem', marginTop: '0.5rem' }}>{error}</p>}
                        <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>Find Account & Send OTP</button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleVerifyOTP} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--danger))', padding: '1rem', borderRadius: '50%' }}>
                                <Mail size={32} color="white" />
                            </div>
                        </div>
                        <h1 style={{ marginBottom: '0.5rem', fontSize: '1.75rem' }}>Verify OTP</h1>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>OTP has been sent to {email}</p>
                        
                        <div style={{ textAlign: 'left' }}>
                            <input type="text" maxLength={4} value={inputOtp} onChange={(e) => { setInputOtp(e.target.value); setError(''); }} placeholder="----" className="input-field" style={{ textAlign: 'center', fontSize: '2rem', letterSpacing: '0.5rem' }} required />
                        </div>
                        {error && <p style={{ color: 'var(--danger)', fontSize: '0.875rem', marginTop: '0.5rem' }}>{error}</p>}
                        <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>Verify OTP</button>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handleSetNewPassword} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--danger))', padding: '1rem', borderRadius: '50%' }}>
                                <Lock size={32} color="white" />
                            </div>
                        </div>
                        <h1 style={{ marginBottom: '0.5rem', fontSize: '1.75rem' }}>Reset Password</h1>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Set your new continuous password.</p>

                        <div style={{ textAlign: 'left' }}>
                            <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} placeholder="New password" className="input-field" required />
                        </div>
                        {error && <p style={{ color: 'var(--danger)', fontSize: '0.875rem', marginTop: '0.5rem' }}>{error}</p>}
                        <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>Set New Password</button>
                    </form>
                )}

                {step === 1 && (
                    <div style={{ marginTop: '2rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
                        <Link to="/login" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem', transition: 'color 0.2s' }}>
                            Remembered your password? <span style={{ color: 'var(--primary)' }}>Log in &rarr;</span>
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
export default ForgotPassword;
