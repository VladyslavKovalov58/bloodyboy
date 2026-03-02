import React, { useEffect } from 'react';
import { Sparkles, X } from 'lucide-react';

const ThanksPopup = ({ isVisible, onClose, language }) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, 8000); // Close after 8 seconds
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    return (
        <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 3000,
            animation: 'slideIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            maxWidth: '320px',
            width: 'calc(100% - 40px)'
        }}>
            <div style={{
                background: 'rgba(255, 107, 0, 0.15)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 107, 0, 0.3)',
                borderRadius: '20px',
                padding: '20px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Glow Effect */}
                <div style={{
                    position: 'absolute',
                    top: '-50%',
                    left: '-50%',
                    width: '200%',
                    height: '200%',
                    background: 'radial-gradient(circle, rgba(255, 107, 0, 0.1) 0%, transparent 70%)',
                    pointerEvents: 'none'
                }} />

                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'none',
                        border: 'none',
                        color: '#fff',
                        opacity: 0.5,
                        cursor: 'pointer',
                        padding: '4px'
                    }}
                >
                    <X size={16} />
                </button>

                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <div style={{
                        width: '44px',
                        height: '44px',
                        background: 'linear-gradient(135deg, #FFB400 0%, #FF6B00 100%)',
                        borderRadius: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 15px rgba(255, 107, 0, 0.3)',
                        flexShrink: 0
                    }}>
                        <Sparkles size={24} color="#fff" />
                    </div>
                    <div>
                        <h4 style={{
                            color: '#fff',
                            fontSize: '1rem',
                            fontWeight: '800',
                            margin: '0 0 4px',
                            textTransform: 'uppercase'
                        }}>
                            {language === 'ru' ? 'Новая поддержка!' : 'New support!'}
                        </h4>
                        <p style={{
                            color: 'rgba(255,255,255,0.7)',
                            fontSize: '0.85rem',
                            margin: 0,
                            lineHeight: '1.4'
                        }}>
                            {language === 'ru'
                                ? 'Кто-то только что поддержал стримера. Огромное спасибо!'
                                : 'Someone just supported the streamer. Thank you so much!'}
                        </p>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(100%) scale(0.9); opacity: 0; }
                    to { transform: translateX(0) scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default ThanksPopup;
