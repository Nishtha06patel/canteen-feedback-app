import React from 'react';
import { Link } from 'react-router-dom';
import { Utensils, ArrowRight, ShieldCheck, Users } from 'lucide-react';

const Landing = () => {
    return (
        <div className="animate-fade-in" style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: 'clamp(2rem, 5vw, 4rem)',
            background: 'linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.9)), url("/campus-bg.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: 'calc(100vh - 80px)'
        }}>
            <div style={{ textAlign: 'center', marginBottom: 'clamp(2rem, 6vw, 4rem)', maxWidth: '800px' }}>
                <div style={{ display: 'inline-flex', background: 'linear-gradient(135deg, var(--primary), var(--accent))', padding: '1.5rem', borderRadius: '50%', marginBottom: '1.5rem', boxShadow: '0 10px 25px rgba(99, 102, 241, 0.4)' }}>
                    <Utensils size={48} color="white" />
                </div>
                <h1 style={{ fontSize: 'clamp(2.25rem, 8vw, 3.5rem)', fontWeight: '800', marginBottom: '1rem', color: 'var(--text-main)' }}>
                    IAR Canteen Feedback
                </h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
                    Shape your dining experience. Share your feedback, view daily menus, and help us serve you better every day.
                </p>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <Link to="/login" style={{ textDecoration: 'none' }}>
                    <button className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        Login to Account
                        <ArrowRight size={20} />
                    </button>
                </Link>
                <Link to="/signup" style={{ textDecoration: 'none' }}>
                    <button className="btn" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', background: 'var(--surface-hover)', color: 'var(--text)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        Create New Account
                    </button>
                </Link>
            </div>

            <div style={{ display: 'flex', gap: '2rem', marginTop: '4rem', opacity: 0.8, flexWrap: 'wrap', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                    <ShieldCheck size={20} />
                    <span>Secure Access</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                    <Users size={20} />
                    <span>Student & Admin Portals</span>
                </div>
            </div>
        </div>
    );
};

export default Landing;
