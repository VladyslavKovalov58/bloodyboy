import React from 'react';
import { Gift, Tv, Send, Gamepad2 } from 'lucide-react';
import { translations } from '../translations';

const MobileMenu = ({ activeTab, setActiveTab, language, isLive }) => {
    const t = translations[language];

    const navItemStyle = (tabName) => ({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: activeTab === tabName ? '#fff' : 'var(--text-dim)',
        fontSize: '0.7rem',
        background: 'none',
        border: 'none',
        padding: '8px',
        flex: 1,
        gap: '4px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        position: 'relative'
    });

    const iconStyle = (isActive) => ({
        color: isActive ? 'var(--neon-green)' : 'currentColor',
        filter: isActive ? 'drop-shadow(0 0 5px var(--neon-green))' : 'none',
        transition: 'all 0.3s'
    });

    return (
        <div className="mobile-menu" style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '100%',
            background: 'var(--bg-card)', // Dark background
            borderTop: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            justifyContent: 'space-around', // Distribute evenly
            alignItems: 'center',
            padding: '10px 5px',
            zIndex: 1000,
            paddingBottom: 'max(10px, env(safe-area-inset-bottom))' // Handle safe area for iPhone X+
        }}>

            {/* Bonuses Tab */}
            <button
                onClick={() => setActiveTab('bonuses')}
                style={navItemStyle('bonuses')}
            >
                <div style={activeTab === 'bonuses' ? {
                    background: 'rgba(39, 245, 107, 0.1)',
                    borderRadius: '12px',
                    padding: '8px'
                } : { padding: '8px' }}>
                    <Gift size={24} style={iconStyle(activeTab === 'bonuses')} />
                </div>
                <span>{language === 'ru' ? 'Бонусы' : 'Bonuses'}</span>
            </button>

            {/* Slots Tab */}
            <button
                onClick={() => setActiveTab('slots')}
                style={navItemStyle('slots')}
            >
                <div style={activeTab === 'slots' ? {
                    background: 'rgba(39, 245, 107, 0.1)',
                    borderRadius: '12px',
                    padding: '8px'
                } : { padding: '8px' }}>
                    <Gamepad2 size={24} style={iconStyle(activeTab === 'slots')} />
                </div>
                <span>{language === 'ru' ? 'Слоты' : 'Slots'}</span>
            </button>

            {/* Stream Tab */}
            <button
                onClick={() => setActiveTab('streams')}
                style={navItemStyle('streams')}
            >
                <div style={activeTab === 'streams' ? {
                    background: 'rgba(39, 245, 107, 0.1)',
                    borderRadius: '12px',
                    padding: '8px',
                    position: 'relative'
                } : { padding: '8px', position: 'relative' }}>
                    <Tv size={24} style={iconStyle(activeTab === 'streams')} />
                    {isLive && (
                        <div style={{
                            position: 'absolute',
                            top: '6px',
                            right: '6px',
                            width: '8px',
                            height: '8px',
                            background: 'var(--neon-green)',
                            borderRadius: '50%',
                            boxShadow: '0 0 5px var(--neon-green)',
                            border: '1px solid var(--bg-card)'
                        }} />
                    )}
                </div>
                <span>{language === 'ru' ? 'Эфир' : 'Live'}</span>
            </button>

            {/* Telegram Channel Link */}
            <a
                href="https://t.me/KolyanDed"
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...navItemStyle('channel'), textDecoration: 'none' }}
            >
                <div style={{ padding: '8px' }}>
                    <Send size={24} style={iconStyle(false)} />
                </div>
                <span>{language === 'ru' ? 'Канал' : 'Channel'}</span>
            </a>

        </div>
    );
};

export default MobileMenu;
