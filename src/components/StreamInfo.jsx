import React from 'react';
import { translations } from '../translations';
import { Play } from 'lucide-react';

const StreamInfo = ({ language = 'en', isLive = false }) => {
    const t = translations[language];

    const statusColor = isLive ? 'var(--primary-orange)' : '#ff4444'; // Orange or Red
    const statusShadow = isLive ? 'var(--primary-orange)' : '#ff4444';

    return (
        <div style={{
            background: 'var(--bg-card)',
            borderRadius: '24px',
            padding: '50px',
            textAlign: 'center',
            border: `1px solid ${statusColor}40`,
            boxShadow: `0 0 40px ${statusShadow}10`,
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s ease'
        }}>
            {/* Background glow */}
            <div style={{
                position: 'absolute',
                top: '-50%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '50%',
                height: '50%',
                background: `radial-gradient(circle, ${statusShadow}20 0%, transparent 70%)`,
                pointerEvents: 'none'
            }} />

            {/* Status Indicator Circle */}
            <div style={{
                width: '80px',
                height: '80px',
                background: isLive ? 'rgba(255, 107, 0, 0.1)' : 'rgba(255, 68, 68, 0.1)',
                borderRadius: '50%',
                margin: '0 auto 25px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `2px solid ${statusColor}`,
                animation: isLive ? 'pulse 2s infinite' : 'none',
                boxShadow: isLive ? 'none' : `0 0 15px ${statusShadow}40`
            }}>
                <div style={{
                    width: '12px',
                    height: '12px',
                    background: statusColor,
                    borderRadius: '50%',
                    boxShadow: `0 0 10px ${statusColor}`
                }}></div>
            </div>

            <h2 style={{ marginBottom: '15px', color: 'var(--text-light)', fontSize: '2rem', fontWeight: '800' }}>
                {isLive ? t.streamerLive : t.streamerOffline}
            </h2>

            <p style={{ marginBottom: '35px', color: 'var(--text-dim)', fontSize: '1.2rem' }}>
                {isLive ? t.joinAction : t.offlineMessage}
            </p>

            <a
                href="https://kick.com/ded-kolyan"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                    background: statusColor,
                    color: '#fff',
                    padding: '16px 40px',
                    borderRadius: '12px',
                    fontWeight: '800',
                    fontSize: '1.1rem',
                    textTransform: 'uppercase',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    boxShadow: `0 0 20px ${statusShadow}40`,
                    transition: 'transform 0.2s',
                    textDecoration: 'none'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
                <Play size={24} fill="currentColor" /> {isLive ? t.watchStream : t.subscribe}
            </a>

            <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(255, 107, 0, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(255, 107, 0, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 107, 0, 0); }
        }
      `}</style>
        </div>
    );
};

export default StreamInfo;
