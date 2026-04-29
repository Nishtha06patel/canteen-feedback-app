import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ShieldCheck } from 'lucide-react';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { loginAdmin } = useAppContext();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await loginAdmin(email, password);
            navigate('/admin/dashboard');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="animate-fade-in" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="glass-panel animate-slide-up" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ background: 'var(--glass-highlight)', border: '1px solid var(--glass-border)', padding: '1rem', borderRadius: '50%' }}>
                        <ShieldCheck size={32} color="var(--primary)" />
                    </div>
                </div>
                <h1 style={{ marginBottom: '0.5rem', fontSize: '1.75rem' }}>Admin Portal</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Secure Area. Authorized Personnel Only.</p>
                
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ textAlign: 'left' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Admin Email ID</label>
                        <input
                            type="email"
                            placeholder="admin@iar.ac.in"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setError(''); }}
                            className="input-field"
                            required
                        />
                    </div>
                    
                    <div style={{ textAlign: 'left' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setError(''); }}
                            className="input-field"
                            required
                        />
                        {error && <p style={{ color: 'var(--danger)', fontSize: '0.875rem', marginTop: '0.5rem' }}>{error}</p>}
                    </div>
                    
                    <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                        Authenticate
                    </button>
                    
                    <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                        <Link to="/admin/forgot-password" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: '500', transition: 'opacity 0.2s' }}>
                            Forgot your password?
                        </Link>
                    </div>
                </form>

                <div style={{ marginTop: '2rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
                    <Link to="/login" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem', transition: 'color 0.2s' }}>
                        &larr; Back to Student Portal
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
