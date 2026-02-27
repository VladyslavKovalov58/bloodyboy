import { Link } from 'react-router-dom';
import { Gift, Tv, Send, Gamepad2, Trophy } from 'lucide-react';
import { translations } from '../translations';

const MobileMenu = ({ activeTab, language, isLive }) => {
    const t = translations[language];

    const navItemStyle = (tabName) => ({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: activeTab === tabName ? '#fff' : 'rgba(255, 255, 255, 0.4)',
        fontSize: '0.65rem',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        background: 'none',
        border: 'none',
        padding: '0',
        flex: 1,
        gap: '6px',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        textDecoration: 'none'
    });

    const iconContainerStyle = (isActive) => ({
        background: isActive ? 'linear-gradient(135deg, rgba(255, 179, 0, 0.15) 0%, rgba(255, 107, 0, 0.15) 100%)' : 'transparent',
        borderRadius: '14px',
        padding: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        border: isActive ? '1px solid rgba(255, 107, 0, 0.2)' : '1px solid transparent',
        boxShadow: isActive ? '0 4px 15px rgba(255, 107, 0, 0.1)' : 'none'
    });

    const iconStyle = (isActive) => ({
        color: isActive ? 'var(--primary-orange)' : 'currentColor',
        filter: isActive ? 'drop-shadow(0 0 8px rgba(255, 107, 0, 0.5))' : 'none',
        transition: 'all 0.3s'
    });

    return (
        <div className="mobile-menu" style={{
            position: 'fixed',
            bottom: '15px',
            left: '15px',
            right: '15px',
            background: 'rgba(20, 20, 20, 0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            padding: '8px 5px',
            zIndex: 1000,
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
            marginBottom: 'env(safe-area-inset-bottom)'
        }}>

            {/* Bonuses Tab */}
            <Link
                to="/bonuses"
                style={navItemStyle('bonuses')}
            >
                <div style={iconContainerStyle(activeTab === 'bonuses')}>
                    <Gift size={22} style={iconStyle(activeTab === 'bonuses')} />
                </div>
                <span>{language === 'ru' ? 'Бонусы' : 'Bonuses'}</span>
            </Link>

            {/* Slots Tab */}
            <Link
                to="/slots"
                style={navItemStyle('slots')}
            >
                <div style={iconContainerStyle(activeTab === 'slots')}>
                    <Gamepad2 size={22} style={iconStyle(activeTab === 'slots')} />
                </div>
                <span>{language === 'ru' ? 'Слоты' : 'Slots'}</span>
            </Link>

            {/* Tournaments Tab */}
            <Link
                to="/tournaments"
                style={navItemStyle('tournaments')}
            >
                <div style={iconContainerStyle(activeTab === 'tournaments')}>
                    <Trophy size={22} style={iconStyle(activeTab === 'tournaments')} />
                </div>
                <span>{language === 'ru' ? 'Турниры' : 'Tours'}</span>
            </Link>

            {/* Stream Tab */}
            <Link
                to="/streams"
                style={navItemStyle('streams')}
            >
                <div style={{ ...iconContainerStyle(activeTab === 'streams'), position: 'relative' }}>
                    <Tv size={22} style={iconStyle(activeTab === 'streams')} />
                    {isLive && (
                        <div style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            width: '7px',
                            height: '7px',
                            background: 'var(--primary-orange)',
                            borderRadius: '50%',
                            boxShadow: '0 0 8px var(--primary-orange)',
                            border: '1.5px solid #141414'
                        }} />
                    )}
                </div>
                <span>{language === 'ru' ? 'Эфир' : 'Live'}</span>
            </Link>

            {/* Telegram Channel Link */}
            <a
                href="https://t.me/KolyanDed"
                target="_blank"
                rel="noopener noreferrer"
                style={navItemStyle('channel')}
            >
                <div style={iconContainerStyle(false)}>
                    <Send size={22} style={iconStyle(true)} />
                </div>
                <span style={{ color: 'var(--primary-orange)' }}>{language === 'ru' ? 'Канал' : 'Channel'}</span>
            </a>

        </div>
    );
};

export default MobileMenu;
