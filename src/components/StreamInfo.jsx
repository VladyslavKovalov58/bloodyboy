import React from 'react';
import { translations } from '../translations';
import { Play } from 'lucide-react';

const StreamInfo = ({ language = 'en' }) => {
    const t = translations[language];

    return (
        <div style={{
            background: 'var(--bg-card)',
            borderRadius: '24px',
            padding: '50px',
            textAlign: 'center',
            border: '1px solid var(--neon-green)',
            boxShadow: '0 0 40px var(--neon-green)10',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background glow */}
            <div style={{
                position: 'absolute',
                top: '-50%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '50%',
                height: '50%',
                background: 'radial-gradient(circle, var(--neon-green)20 0%, transparent 70%)',
                pointerEvents: 'none'
            }} />

            <div style={{
                width: '80px',
                height: '80px',
                background: 'rgba(0, 255, 65, 0.1)',
                borderRadius: '50%',
                margin: '0 auto 25px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid var(--neon-green)',
                animation: 'pulse 2s infinite'
            }}>
                <div style={{ width: '12px', height: '12px', background: 'var(--neon-green)', borderRadius: '50%' }}></div>
            </div>

            <h2 style={{ marginBottom: '15px', color: 'var(--text-light)', fontSize: '2rem', fontWeight: '800' }}>
                {t.streamerLive}
            </h2>

            <p style={{ marginBottom: '35px', color: 'var(--text-dim)', fontSize: '1.2rem' }}>
                {t.joinAction}
            </p>

            <a
                href="https://kick.com/ded-kolyan"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                    background: 'var(--neon-green)',
                    color: 'var(--bg-dark)',
                    padding: '16px 40px',
                    borderRadius: '12px',
                    fontWeight: '800',
                    fontSize: '1.1rem',
                    textTransform: 'uppercase',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    boxShadow: '0 0 20px var(--neon-green)40',
                    transition: 'transform 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
                <Play size={24} fill="currentColor" /> {t.watchStream}
            </a>

            <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(0, 255, 65, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(0, 255, 65, 0); }
          100% { box-shadow: 0 0 0 0 rgba(0, 255, 65, 0); }
        }
      `}</style>
        </div>
    );
};

export default StreamInfo;
