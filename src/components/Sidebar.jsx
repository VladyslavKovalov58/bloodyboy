import React from 'react';
import { Home, Tv, Send, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { translations } from '../translations';

const Sidebar = ({ activeTab, setActiveTab, language, setLanguage, isCollapsed, setIsCollapsed }) => {
    const t = translations[language];

    const buttonStyle = (tabName) => ({
        background: activeTab === tabName ? 'var(--neon-purple)' : 'transparent',
        color: activeTab === tabName ? '#fff' : 'var(--text-dim)',
        width: '100%',
        padding: '12px',
        textAlign: isCollapsed ? 'center' : 'left',
        fontSize: '1rem',
        borderRadius: '12px',
        marginBottom: '8px',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: isCollapsed ? 'center' : 'flex-start',
        gap: isCollapsed ? '0' : '12px',
        fontWeight: activeTab === tabName ? '600' : '400',
        border: '1px solid transparent',
        cursor: 'pointer',
        position: 'relative' // For tooltip if needed later
    });

    return (
        <aside style={{
            width: isCollapsed ? '80px' : '260px',
            height: '100vh',
            background: 'var(--bg-sidebar)',
            padding: '25px 15px',
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed',
            left: 0,
            top: 0,
            borderRight: '1px solid rgba(255,255,255,0.05)',
            zIndex: 100,
            transition: 'width 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
        }}>

            {/* Toggle Button */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                style={{
                    position: 'absolute',
                    right: '-12px',
                    top: '30px',
                    background: 'var(--bg-card)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    cursor: 'pointer',
                    zIndex: 101,
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                }}
            >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            {/* Logo Area */}
            <div style={{ marginBottom: '40px', paddingLeft: isCollapsed ? '0' : '10px', textAlign: isCollapsed ? 'center' : 'left' }}>
                <h1 style={{
                    color: '#fff',
                    fontWeight: '800',
                    letterSpacing: '0.5px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    gap: '10px',
                    fontSize: isCollapsed ? '2rem' : '1.4rem' // Larger "D" when collapsed
                }}>
                    {isCollapsed ? (
                        // Collapsed Logo
                        <span style={{
                            background: 'linear-gradient(45deg, var(--neon-purple), var(--neon-green))',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>D</span>
                    ) : (
                        // Expanded Logo
                        <>
                            <span style={{ fontSize: '1.8rem' }}>🎰</span>
                            <span style={{
                                background: 'linear-gradient(45deg, var(--neon-purple), var(--neon-green))',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>
                                {t.logo}
                            </span>
                        </>
                    )}
                </h1>
            </div>

            {/* Navigation - Pushes everything else to bottom */}
            <nav style={{ marginBottom: 'auto' }}>
                {!isCollapsed && (
                    <p style={{
                        color: 'var(--text-dim)',
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        marginBottom: '10px',
                        paddingLeft: '15px',
                        letterSpacing: '1px',
                        opacity: 0.7,
                        whiteSpace: 'nowrap'
                    }}>
                        {t.menu}
                    </p>
                )}

                <button
                    onClick={() => setActiveTab('bonuses')}
                    style={buttonStyle('bonuses')}
                    className="sidebar-btn"
                    title={isCollapsed ? t.bestCasinos : ''}
                >
                    <Home size={20} />
                    {!isCollapsed && t.bestCasinos}
                </button>

                <button
                    onClick={() => setActiveTab('streams')}
                    style={buttonStyle('streams')}
                    className="sidebar-btn"
                    title={isCollapsed ? t.liveStream : ''}
                >
                    <Tv size={20} />
                    {!isCollapsed && t.liveStream}
                </button>
            </nav>

            {/* Socials - At Bottom, above Lang Switcher */}
            <div style={{ marginBottom: '20px' }}>
                {!isCollapsed && (
                    <p style={{
                        color: 'var(--text-dim)',
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        marginBottom: '10px',
                        paddingLeft: '15px',
                        letterSpacing: '1px',
                        opacity: 0.7,
                        whiteSpace: 'nowrap'
                    }}>
                        {t.socials}
                    </p>
                )}

                <div style={{
                    display: 'flex',
                    flexDirection: isCollapsed ? 'column' : 'row', // Stack in collapsed mode
                    gap: '8px',
                    padding: '0 5px'
                }}>
                    <a href="https://t.me/KolyanDed" target="_blank" rel="noopener noreferrer" style={{
                        flex: 1,
                        background: '#2AABEE',
                        color: '#fff',
                        padding: '12px',
                        borderRadius: '10px',
                        textAlign: 'center',
                        fontSize: '1.2rem',
                        transition: 'transform 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid rgba(42, 171, 238, 0.2)'
                    }} title="Telegram Channel">
                        <Send size={20} />
                    </a>
                    <a href="https://t.me/+LvSLwlOnmLdmN2Ni" target="_blank" rel="noopener noreferrer" style={{
                        flex: 1,
                        background: '#2AABEE',
                        color: '#fff',
                        padding: '12px',
                        borderRadius: '10px',
                        textAlign: 'center',
                        fontSize: '1.2rem',
                        transition: 'transform 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid rgba(42, 171, 238, 0.2)'
                    }} title="Telegram Chat">
                        <MessageCircle size={20} />
                    </a>
                </div>
            </div>

            {/* Language Switcher - Absolute Bottom */}
            <div style={{ padding: '0 5px' }}>
                <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '8px',
                    padding: '5px',
                    display: 'flex',
                    flexDirection: isCollapsed ? 'column' : 'row',
                    justifyContent: 'space-between',
                    gap: isCollapsed ? '5px' : '0'
                }}>
                    <button
                        onClick={() => setLanguage('ru')}
                        style={{
                            flex: 1,
                            background: language === 'ru' ? 'var(--accent-purple)' : 'transparent',
                            color: language === 'ru' ? '#fff' : 'var(--text-dim)',
                            border: 'none',
                            padding: '8px',
                            borderRadius: '6px',
                            fontSize: '0.9rem',
                            fontWeight: language === 'ru' ? 'bold' : 'normal',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            textAlign: 'center'
                        }}
                        title="Russian"
                    >
                        {isCollapsed ? 'RU' : '🇷🇺 RU'}
                    </button>
                    <button
                        onClick={() => setLanguage('en')}
                        style={{
                            flex: 1,
                            background: language === 'en' ? 'var(--accent-purple)' : 'transparent',
                            color: language === 'en' ? '#fff' : 'var(--text-dim)',
                            border: 'none',
                            padding: '8px',
                            borderRadius: '6px',
                            fontSize: '0.9rem',
                            fontWeight: language === 'en' ? 'bold' : 'normal',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            textAlign: 'center'
                        }}
                        title="English"
                    >
                        {isCollapsed ? 'EN' : '🇺🇸 EN'}
                    </button>
                </div>
            </div>

        </aside>
    );
};

export default Sidebar;
