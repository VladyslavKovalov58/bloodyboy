import React, { useState } from 'react';
import { translations } from '../translations';
import { ArrowRight, Info } from 'lucide-react';

const BonusCard = ({ siteName, offer, promo, link, color = 'var(--neon-purple)', language = 'en', image, disableHover = false }) => {
    const [isHovered, setIsHovered] = useState(false);
    const t = translations[language];

    // Card container
    const cardStyle = {
        background: 'var(--bg-card)',
        borderRadius: '16px',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        height: '240px', // Slightly taller to accommodate 3 lines comfortably
        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
        transform: isHovered && !disableHover ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: isHovered && !disableHover ? `0 15px 30px -10px ${color}30` : 'none',
        cursor: disableHover ? 'default' : 'pointer'
    };

    // Background gradient/image 
    const headerStyle = {
        height: '100%',
        width: '100%',
        // Use image if provided, otherwise gradient
        background: image
            ? `url(${image}) center/cover no-repeat`
            : `linear-gradient(135deg, ${color}15 0%, var(--bg-card) 60%)`,
        padding: '25px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        zIndex: 1,
        position: 'relative'
    };

    // Hover overlay
    const overlayStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(15, 11, 26, 0.96)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        opacity: isHovered && !disableHover ? 1 : 0,
        transition: 'opacity 0.2s ease',
        zIndex: 2,
        backdropFilter: 'blur(4px)',
        pointerEvents: isHovered && !disableHover ? 'auto' : 'none'
    };

    const buttonStyle = {
        background: color,
        color: '#000',
        padding: '12px 24px',
        borderRadius: '8px',
        fontWeight: '700',
        textTransform: 'uppercase',
        fontSize: '0.9rem',
        marginTop: '15px',
        transition: 'transform 0.2s',
        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        textDecoration: 'none',
        boxShadow: `0 0 20px ${color}50`
    };

    return (
        <div
            className="bonus-card"
            style={cardStyle}
            onMouseEnter={() => !disableHover && setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Main Content */}
            <div style={headerStyle}>

                {/* Only show Title & Offer if NO IMAGE is present */}
                {!image && (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <h3 style={{
                                fontSize: '1.8rem',
                                fontWeight: '800',
                                color: '#fff',
                                marginBottom: '8px',
                                textShadow: '0 2px 10px rgba(0,0,0,0.8)'
                            }}>
                                {siteName}
                            </h3>
                            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: color, opacity: 0.8, boxShadow: '0 0 10px rgba(0,0,0,0.5)' }}></div>
                        </div>

                        {/* Offer Line */}
                        <p style={{
                            fontSize: '1.2rem',
                            color: 'var(--text-light)',
                            fontWeight: '700',
                            marginBottom: '10px',
                            lineHeight: '1.3'
                        }}>
                            {offer}
                        </p>

                        {/* Promo Code Badge/Line */}
                        {promo && (
                            <div style={{
                                display: 'inline-block',
                                background: 'rgba(255, 255, 255, 0.1)',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                color: color, // Mix brand color into text
                                fontWeight: '600',
                                letterSpacing: '0.5px',
                                border: `1px solid ${color}40`
                            }}>
                                {promo}
                            </div>
                        )}

                        {/* Fake "Info" badge */}
                        <div style={{
                            marginTop: 'auto',
                            alignSelf: 'flex-start',
                            background: 'rgba(255,255,255,0.05)',
                            padding: '6px 14px',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            color: 'var(--text-dim)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                        }}>
                            <Info size={12} /> {t.hoverText}
                        </div>
                    </>
                )}

            </div>

            {/* Hover Overlay */}
            <div style={overlayStyle}>
                <h4 style={{ color: '#fff', marginBottom: '15px', fontSize: '1.1rem', fontWeight: '600' }}>
                    {t.exclusiveOffer}
                </h4>
                <ul style={{
                    color: 'var(--text-dim)',
                    textAlign: 'left',
                    marginBottom: '25px',
                    paddingLeft: '0',
                    listStyle: 'none',
                    fontSize: '0.9rem',
                    lineHeight: '1.8'
                }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: 'var(--neon-green)' }}>✓</span> {t.instantPayouts}
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: 'var(--neon-green)' }}>✓</span> {t.support247}
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: 'var(--neon-green)' }}>✓</span> {t.verifiedSafe}
                    </li>
                </ul>
                <a href={link} target="_blank" rel="noopener noreferrer" style={buttonStyle}>
                    {t.claimBonus} <ArrowRight size={18} />
                </a>
            </div>
        </div>
    );
};

export default BonusCard;
