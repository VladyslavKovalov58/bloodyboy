import { useState, useEffect } from 'react';
import { X, Heart, CreditCard } from 'lucide-react';
import { translations } from '../translations';

const DonationPrompt = ({ language, onOpenSupport }) => {
    const [isVisible, setIsVisible] = useState(false);
    const t = translations[language];

    useEffect(() => {
        // Test event listener - always active for testing
        const handleTest = () => setIsVisible(true);
        window.addEventListener('show-donation-prompt-test', handleTest);

        // Check if user has already seen/closed the prompt in this session
        const hasSeen = sessionStorage.getItem('donation_prompt_seen');
        if (!hasSeen) {
            // Show prompt after 1 minute (60,000 ms)
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 60000);

            return () => {
                clearTimeout(timer);
                window.removeEventListener('show-donation-prompt-test', handleTest);
            };
        }

        return () => {
            window.removeEventListener('show-donation-prompt-test', handleTest);
        };
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        sessionStorage.setItem('donation_prompt_seen', 'true');
    };

    const handleAction = () => {
        handleClose();
        onOpenSupport();
    };

    if (!isVisible) return null;

    return (
        <div className="donation-prompt-container" style={{
            position: 'fixed',
            zIndex: 10000,
            background: 'rgba(20, 20, 20, 0.95)',
            backdropFilter: 'blur(15px)',
            border: '1px solid rgba(255, 107, 0, 0.3)',
            borderRadius: '24px',
            padding: '25px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 20px rgba(255, 107, 0, 0.1)',
            animation: 'slideUp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
            color: '#fff'
        }}>
            <button
                onClick={handleClose}
                style={{
                    position: 'absolute',
                    top: '15px',
                    right: '15px',
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255,255,255,0.3)',
                    cursor: 'pointer',
                    padding: '5px'
                }}
            >
                <X size={18} />
            </button>

            {/* Icon */}
            <div style={{
                width: '50px',
                height: '50px',
                background: 'linear-gradient(135deg, #FF6B00 0%, #FF3D00 100%)',
                borderRadius: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '15px',
                boxShadow: '0 8px 20px rgba(255, 107, 0, 0.3)'
            }}>
                <Heart size={26} fill="#fff" />
            </div>

            {/* Text */}
            <h4 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', fontWeight: '800' }}>
                {t.donationPromptTitle}
            </h4>
            <p style={{ margin: '0 0 20px 0', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.4' }}>
                {t.donationPromptMessage}
            </p>

            {/* Button */}
            <button
                onClick={handleAction}
                style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #FF6B00 0%, #FF3D00 100%)',
                    color: '#fff',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '12px',
                    fontWeight: '800',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 5px 15px rgba(255, 61, 0, 0.3)',
                    transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
                <div className="shimmer-effect" style={{ opacity: 0.5 }} />
                <CreditCard size={18} />
                {t.donationPromptButton}
            </button>

            <style>{`
                .donation-prompt-container {
                    bottom: 30px;
                    right: 30px;
                    width: 320px;
                }
                @media (max-width: 768px) {
                    .donation-prompt-container {
                        bottom: 110px !important;
                        right: 15px !important;
                        left: 15px !important;
                        width: auto !important;
                        padding: 20px !important;
                    }
                }
                @keyframes slideUp {
                    from { transform: translateY(100px) scale(0.9); opacity: 0; }
                    to { transform: translateY(0) scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default DonationPrompt;
