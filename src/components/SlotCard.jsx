import React from 'react';
import { Play } from 'lucide-react';
import { translations } from '../translations';

const SlotCard = ({ name, image, hasDemo, link, language }) => {
    const t = translations[language];

    return (
        <div className="slot-card" style={{
            background: 'var(--bg-card)',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.05)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            aspectRatio: '16/9',
            cursor: 'default'
        }}>
            {/* Slot Image */}
            <img
                src={image}
                alt={name}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
            />

            {/* Content Overlay */}
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '15px',
                background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                zIndex: 2
            }}>
                <h3 style={{
                    margin: 0,
                    color: '#fff',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                }}>
                    {name}
                </h3>
            </div>

            {/* Hover State */}
            <div className="slot-overlay" style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0,
                transition: 'opacity 0.3s ease',
                zIndex: 3
            }}>
                {hasDemo && (
                    <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="play-btn"
                        style={{
                            background: 'var(--neon-purple)',
                            color: '#fff',
                            padding: '12px 24px',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            textDecoration: 'none',
                            fontWeight: '600',
                            transform: 'translateY(10px)',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)'
                        }}
                    >
                        <Play size={20} fill="currentColor" />
                        {t.play}
                    </a>
                )}
                {!hasDemo && (
                    <div style={{
                        color: 'rgba(255,255,255,0.7)',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        textAlign: 'center',
                        padding: '0 20px'
                    }}>
                        {language === 'ru' ? 'Демо-режим недоступен' : 'Demo mode unavailable'}
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .slot-card:hover img {
                    transform: scale(1.1);
                }
                .slot-card:hover .slot-overlay {
                    opacity: 1;
                }
                .slot-card:hover .play-btn {
                    transform: translateY(0);
                }
                .play-btn:hover {
                    background: #9333ea;
                    box-shadow: 0 0 25px rgba(168, 85, 247, 0.6);
                    transform: scale(1.05) !important;
                }
            `}} />
        </div>
    );
};

export default SlotCard;
