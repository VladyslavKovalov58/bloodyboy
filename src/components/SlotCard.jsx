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
                background: 'rgba(0, 0, 0, 0.9)', // Stronger darkening
                backdropFilter: 'blur(5px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '40px 20px',
                textAlign: 'center',
                opacity: 0,
                transition: 'opacity 0.4s ease',
                zIndex: 3
            }}>
                {/* Top: Name and Provider */}
                <div className="hover-top" style={{ transform: 'translateY(-15px)', transition: 'transform 0.4s ease' }}>
                    <h3 style={{
                        margin: '0 0 2px 0',
                        color: '#fff',
                        fontSize: '1.6rem',
                        fontWeight: '900',
                        textTransform: 'uppercase',
                        lineHeight: 1,
                        letterSpacing: '-1px',
                        fontFamily: 'system-ui, -apple-system, sans-serif'
                    }}>
                        {name}
                    </h3>
                    {provider && (
                        <p style={{
                            margin: 0,
                            color: 'rgba(255,255,255,0.5)',
                            fontSize: '0.75rem', // Smaller provider
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
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
                            width: '85px',
                            height: '85px',
                            borderRadius: '50%',
                            background: hasDemo
                                ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                                : 'rgba(255, 255, 255, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textDecoration: 'none',
                            color: hasDemo ? '#fff' : 'rgba(255, 255, 255, 0.3)',
                            boxShadow: hasDemo ? '0 0 35px rgba(37, 99, 235, 0.7)' : 'none',
                            transition: 'all 0.3s ease',
                            cursor: hasDemo ? 'pointer' : 'not-allowed',
                            border: hasDemo ? 'none' : '1px solid rgba(255, 255, 255, 0.1)'
                        }}
                    >
                        <Play size={36} fill={hasDemo ? "white" : "rgba(255, 255, 255, 0.3)"} style={{ marginLeft: hasDemo ? '4px' : '0' }} />
                    </a>
                </div>

                {/* Bottom: RTP Badge */}
                <div className="hover-bottom" style={{ transform: 'translateY(15px)', transition: 'transform 0.4s ease' }}>
                    <div style={{
                        color: 'rgba(255,255,255,0.8)',
                        fontSize: '0.85rem',
                        fontWeight: '700',
                        letterSpacing: '0.5px'
                    }}>
                        {rtp ? `RTP: ${rtp}` : (language === 'ru' ? 'Демо недоступно' : 'No demo')}
                    </div>
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
