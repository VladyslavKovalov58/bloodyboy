import React from 'react';
import { Play } from 'lucide-react';
import { translations } from '../translations';

const SlotCard = ({ name, image, hasDemo, link, language, rtp, provider }) => {
    const t = translations[language];

    return (
        <div className="slot-card" style={{
            background: 'var(--bg-card)',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.05)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            aspectRatio: '3/4', // Poster style
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
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
                background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.7) 100%)',
                backdropFilter: 'blur(3px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                textAlign: 'center',
                opacity: 0,
                transition: 'opacity 0.3s ease',
                zIndex: 3
            }}>
                <div style={{ transform: 'translateY(15px)', transition: 'transform 0.4s ease' }} className="hover-content">
                    <h3 style={{
                        margin: '0 0 5px 0',
                        color: '#fff',
                        fontSize: '1.3rem',
                        fontWeight: '800',
                        textTransform: 'uppercase',
                        lineHeight: 1.1
                    }}>
                        {name}
                    </h3>

                    {provider && (
                        <p style={{
                            margin: '0 0 10px 0',
                            color: 'rgba(255,255,255,0.6)',
                            fontSize: '0.8rem',
                            fontWeight: '500',
                            letterSpacing: '1px'
                        }}>
                            {provider}
                        </p>
                    )}

                    {rtp && (
                        <div style={{
                            background: 'rgba(34, 197, 94, 0.2)',
                            color: '#4ade80',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            fontWeight: '700',
                            display: 'inline-block',
                            marginBottom: '15px',
                            border: '1px solid rgba(74, 222, 128, 0.2)'
                        }}>
                            {rtp} RTP
                        </div>
                    )}

                    <div style={{ marginTop: '5px' }}>
                        {hasDemo && (
                            <a
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="play-btn"
                                style={{
                                    background: 'var(--neon-purple)',
                                    color: '#fff',
                                    padding: '10px 20px',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    textDecoration: 'none',
                                    fontWeight: '700',
                                    fontSize: '0.9rem',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 0 15px rgba(168, 85, 247, 0.5)'
                                }}
                            >
                                <Play size={18} fill="currentColor" />
                                {t.play}
                            </a>
                        )}
                        {!hasDemo && (
                            <p style={{
                                color: 'rgba(255,255,255,0.5)',
                                fontSize: '0.8rem',
                                fontStyle: 'italic'
                            }}>
                                {language === 'ru' ? 'Демо недоступно' : 'No demo'}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .slot-card:hover {
                    transform: translateY(-5px);
                    border-color: var(--neon-purple);
                    box-shadow: 0 10px 25px rgba(0,0,0,0.5);
                }
                .slot-card:hover img {
                    transform: scale(1.1);
                }
                .slot-card:hover .slot-overlay {
                    opacity: 1;
                }
                .slot-card:hover .hover-content {
                    transform: translateY(0);
                }
                .play-btn:hover {
                    background: #9333ea;
                    transform: scale(1.05);
                    box-shadow: 0 0 20px rgba(168, 85, 247, 0.7);
                }
            `}} />
        </div>
    );
};

export default SlotCard;
