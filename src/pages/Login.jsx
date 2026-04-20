import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Utensils } from 'lucide-react';

const Login = () => {
    const { loginUser } = useAppContext();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        setError('');
        try {
            loginUser(email.trim().toLowerCase(), password);
            navigate('/user/dashboard');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="animate-fade-in" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="glass-panel animate-slide-up" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', padding: '1rem', borderRadius: '50%' }}>
                        <Utensils size={32} color="white" />
                    </div>
                </div>
                <h1 style={{ marginBottom: '0.5rem', fontSize: '1.75rem' }}>Student Portal</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Sign in to provide canteen feedback</p>
                
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ textAlign: 'left' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Registered Email</label>
                        <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} placeholder="your.name@iar.ac.in" className="input-field" required />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem' }}>Password</label>
                            <Link to="/forgot-password" style={{ fontSize: '0.75rem', color: 'var(--primary)', textDecoration: 'none' }}>Forgot password?</Link>
                        </div>
                        <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} placeholder="Enter password" className="input-field" required />
                        {error && <p style={{ color: 'var(--danger)', fontSize: '0.875rem', marginTop: '0.5rem' }}>{error}</p>}
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>Log In</button>
                </form>

                <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Link to="/signup" style={{ color: 'var(--text-main)', textDecoration: 'none', fontSize: '0.875rem' }}>
                        Don't have an account? <span style={{ color: 'var(--accent)', fontWeight: '600' }}>Sign Up</span>
                    </Link>
                    <div style={{ borderTop: '1px solid var(--glass-border)', margin: '0.5rem 0' }}></div>
                    <Link to="/admin/login" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem', transition: 'color 0.2s' }}>
                        Staff Portal Login &rarr;
                    </Link>
                </div>
            </div>
        </div>
    );
};
export default Login;
