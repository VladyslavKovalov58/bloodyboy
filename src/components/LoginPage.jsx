import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { LogIn, ShieldAlert, Loader2 } from 'lucide-react';

const LoginPage = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { data, error: loginError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (loginError) {
            setError(loginError.message);
            setLoading(false);
        } else {
            onLogin(data.user);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-dark)',
            padding: '20px'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '400px',
                background: 'var(--bg-card)',
                padding: '40px',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
                textAlign: 'center'
            }}>
                <div style={{
                    width: '60px',
                    height: '60px',
                    background: 'rgba(255, 107, 0, 0.1)',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary-orange)',
                    margin: '0 auto 24px'
                }}>
                    <LogIn size={32} />
                </div>

                <h2 style={{ color: '#fff', fontSize: '1.75rem', fontWeight: '800', marginBottom: '8px' }}>Admin Access</h2>
                <p style={{ color: 'var(--text-dim)', marginBottom: '32px' }}>Please login to manage site content</p>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ textAlign: 'left' }}>
                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '8px', fontWeight: '600' }}>EMAIL</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{
                                width: '100%',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                padding: '14px',
                                color: '#fff',
                                outline: 'none',
                                fontSize: '1rem',
                                boxSizing: 'border-box'
                            }}
                            required
                        />
                    </div>

                    <div style={{ textAlign: 'left' }}>
                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '8px', fontWeight: '600' }}>PASSWORD</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                width: '100%',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                padding: '14px',
                                color: '#fff',
                                outline: 'none',
                                fontSize: '1rem',
                                boxSizing: 'border-box'
                            }}
                            required
                        />
                    </div>

                    {error && (
                        <div style={{
                            background: 'rgba(255, 68, 68, 0.1)',
                            border: '1px solid rgba(255, 68, 68, 0.2)',
                            padding: '12px',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            color: '#ff4444',
                            fontSize: '0.9rem',
                            textAlign: 'left'
                        }}>
                            <ShieldAlert size={18} />
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            background: 'var(--primary-orange)',
                            color: '#fff',
                            border: 'none',
                            padding: '16px',
                            borderRadius: '12px',
                            fontSize: '1rem',
                            fontWeight: '800',
                            cursor: 'pointer',
                            marginTop: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.filter = 'brightness(1)'}
                    >
                        {loading ? <Loader2 size={20} className="animate-spin" /> : 'LOGIN TO DASHBOARD'}
                    </button>
                </form>
            </div>

            <style>{`
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default LoginPage;
