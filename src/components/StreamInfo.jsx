import React from 'react';
import { translations } from '../translations';
import { Play } from 'lucide-react';

const StreamInfo = ({ language = 'en', isLive = false, kickLink, twitchLink }) => {
    const t = translations[language];

    const statusColor = isLive ? 'var(--primary-orange)' : '#ff4444';
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

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 400px))',
                gap: '20px',
                justifyContent: 'center',
                maxWidth: '900px',
                margin: '0 auto'
            }}>
                {/* Kick Platform Card */}
                <a
                    href={kickLink || "https://kick.com/bloodyboy58"}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        background: 'rgba(83, 252, 24, 0.03)',
                        border: '1px solid rgba(83, 252, 24, 0.15)',
                        backdropFilter: 'blur(10px)',
                        padding: '20px',
                        borderRadius: '20px',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '15px',
                        transition: 'all 0.3s ease',
                        position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-5px)';
                        e.currentTarget.style.background = 'rgba(83, 252, 24, 0.08)';
                        e.currentTarget.style.borderColor = 'rgba(83, 252, 24, 0.4)';
                        e.currentTarget.style.boxShadow = '0 15px 30px rgba(83, 252, 24, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.background = 'rgba(83, 252, 24, 0.03)';
                        e.currentTarget.style.borderColor = 'rgba(83, 252, 24, 0.15)';
                        e.currentTarget.style.boxShadow = 'none';
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{
                            width: '45px',
                            height: '45px',
                            background: 'linear-gradient(135deg, #53FC18 0%, #29B200 100%)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 5px 15px rgba(83, 252, 24, 0.2)'
                        }}>
                            <Play size={22} color="#000" fill="#000" />
                        </div>
                        <span style={{ color: '#53FC18', fontWeight: '900', fontSize: '1.2rem', letterSpacing: '1px' }}>KICK</span>
                    </div>

                    <div style={{
                        padding: '8px 20px',
                        background: '#53FC18',
                        color: '#000',
                        borderRadius: '100px',
                        fontWeight: '800',
                        fontSize: '0.8rem',
                        textTransform: 'uppercase',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 4px 15px rgba(83, 252, 24, 0.3)',
                        transition: 'all 0.3s ease'
                    }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(83, 252, 24, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(83, 252, 24, 0.3)';
                        }}>
                        <div className="shimmer-effect" style={{ opacity: 0.4 }} />
                        {isLive ? t.watchStream : t.subscribe}
                    </div>
                </a>

                {/* Twitch Platform Card */}
                <a
                    href={twitchLink || "https://www.twitch.tv/bloodyboy41"}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        background: 'rgba(145, 70, 255, 0.03)',
                        border: '1px solid rgba(145, 70, 255, 0.15)',
                        backdropFilter: 'blur(10px)',
                        padding: '20px',
                        borderRadius: '20px',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '15px',
                        transition: 'all 0.3s ease',
                        position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-5px)';
                        e.currentTarget.style.background = 'rgba(145, 70, 255, 0.08)';
                        e.currentTarget.style.borderColor = 'rgba(145, 70, 255, 0.4)';
                        e.currentTarget.style.boxShadow = '0 15px 30px rgba(145, 70, 255, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.background = 'rgba(145, 70, 255, 0.03)';
                        e.currentTarget.style.borderColor = 'rgba(145, 70, 255, 0.15)';
                        e.currentTarget.style.boxShadow = 'none';
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{
                            width: '45px',
                            height: '45px',
                            background: 'linear-gradient(135deg, #9146FF 0%, #6441A5 100%)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 5px 15px rgba(145, 70, 255, 0.2)'
                        }}>
                            <Play size={22} color="#fff" fill="#fff" />
                        </div>
                        <span style={{ color: '#9146FF', fontWeight: '900', fontSize: '1.2rem', letterSpacing: '1px' }}>TWITCH</span>
                    </div>

                    <div style={{
                        padding: '8px 20px',
                        background: '#9146FF',
                        color: '#fff',
                        borderRadius: '100px',
                        fontWeight: '800',
                        fontSize: '0.8rem',
                        textTransform: 'uppercase',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 4px 15px rgba(145, 70, 255, 0.3)',
                        transition: 'all 0.3s ease'
                    }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(145, 70, 255, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(145, 70, 255, 0.3)';
                        }}>
                        <div className="shimmer-effect" style={{ opacity: 0.4 }} />
                        {isLive ? t.watchStream : t.subscribe}
                    </div>
                </a>
            </div>

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
