import React from 'react';
import { Play } from 'lucide-react';
import { translations } from '../translations';

const SlotCard = ({ name, image, hasDemo, link, language, rtp, provider }) => {
    const t = translations[language];

    return (
        <div className="slot-card" style={{
            background: 'var(--bg-card)',
            borderRadius: '24px',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.05)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            aspectRatio: '3/4',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
        }}>
            {/* Slot Image */}
            <img
                src={image}
                alt={name}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
            />

            {/* Hover State Overlay */}
            <div className="slot-overlay" style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(15, 23, 42, 0.85)', // Darker, cleaner backdrop
                backdropFilter: 'blur(8px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '30px 20px',
                textAlign: 'center',
                opacity: 0,
                transition: 'opacity 0.4s ease',
                zIndex: 3
            }}>
                {/* Top: Name and Provider */}
                <div className="hover-top" style={{ transform: 'translateY(-10px)', transition: 'transform 0.4s ease' }}>
                    <h3 style={{
                        margin: '0 0 4px 0',
                        color: '#fff',
                        fontSize: '1.4rem',
                        fontWeight: '800',
                        letterSpacing: '-0.5px'
                    }}>
                        {name}
                    </h3>
                    {provider && (
                        <p style={{
                            margin: 0,
                            color: 'rgba(255,255,255,0.4)',
                            fontSize: '0.9rem',
                            fontWeight: '500'
                        }}>
                            {provider}
                        </p>
                    )}
                </div>

                {/* Center: Circular Play Button */}
                <div className="hover-center" style={{ scale: '0.8', transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
                    <a
                        href={hasDemo ? link : undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`circular-play-btn ${!hasDemo ? 'disabled' : ''}`}
                        onClick={e => !hasDemo && e.preventDefault()}
                        style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: hasDemo
                                ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                                : 'rgba(255, 255, 255, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textDecoration: 'none',
                            color: hasDemo ? '#fff' : 'rgba(255, 255, 255, 0.3)',
                            boxShadow: hasDemo ? '0 0 30px rgba(37, 99, 235, 0.6)' : 'none',
                            transition: 'all 0.3s ease',
                            cursor: hasDemo ? 'pointer' : 'not-allowed',
                            border: hasDemo ? 'none' : '1px solid rgba(255, 255, 255, 0.1)'
                        }}
                    >
                        <Play size={32} fill={hasDemo ? "white" : "rgba(255, 255, 255, 0.3)"} style={{ marginLeft: hasDemo ? '4px' : '0' }} />
                    </a>
                </div>

                {/* Bottom: RTP Badge */}
                <div className="hover-bottom" style={{ transform: 'translateY(10px)', transition: 'transform 0.4s ease' }}>
                    {rtp && (
                        <div style={{
                            color: 'rgba(255,255,255,0.7)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px'
                        }}>
                            <div style={{ fontSize: '1.2rem' }}>💜</div>
                            <span style={{ fontSize: '0.85rem', fontWeight: '800', letterSpacing: '0.5px' }}>{rtp} RTP</span>
                        </div>
                    )}
                    {!rtp && (
                        <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)' }}>
                            {language === 'ru' ? 'Демо недоступно' : 'No demo'}
                        </span>
                    )}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .slot-card:hover {
                    box-shadow: 0 15px 35px rgba(0,0,0,0.6);
                    border-color: rgba(37, 99, 235, 0.3);
                }
                .slot-card:hover img {
                    transform: scale(1.1);
                }
                .slot-card:hover .slot-overlay {
                    opacity: 1;
                }
                .slot-card:hover .hover-top,
                .slot-card:hover .hover-bottom {
                    transform: translateY(0) !important;
                }
                .slot-card:hover .hover-center {
                    scale: 1 !important;
                }
                .circular-play-btn:hover {
                    transform: scale(1.1);
                    box-shadow: 0 0 40px rgba(37, 99, 235, 0.8) !important;
                    background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%) !important;
                }
            `}} />
        </div>
    );
};

export default SlotCard;
