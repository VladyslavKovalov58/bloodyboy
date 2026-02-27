import { Link } from 'react-router-dom';
import { Gift, Tv, Send, MessageCircle, ChevronLeft, ChevronRight, Gamepad2, Trophy } from 'lucide-react';
import { translations } from '../translations';

const Sidebar = ({ activeTab, language, setLanguage, isCollapsed, setIsCollapsed, isLive }) => {
    const t = translations[language];

    const linkStyle = (tabName) => ({
        background: activeTab === tabName ? 'var(--primary-orange)' : 'transparent',
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
        textDecoration: 'none',
        boxSizing: 'border-box'
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
                    fontSize: isCollapsed ? '2rem' : '1.4rem' // Larger "B" when collapsed
                }}>
                    {isCollapsed ? (
                        // Collapsed Logo
                        <span style={{
                            background: 'linear-gradient(45deg, var(--primary-orange), var(--accent-orange))',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>B</span>
                    ) : (
                        // Expanded Logo
                        <>
                            <img
                                src="https://tgrcas.org/icon%20copy%20copy.svg"
                                alt="Logo"
                                style={{ width: '32px', height: '32px' }}
                            />
                            <span style={{
                                background: 'linear-gradient(45deg, var(--primary-orange), var(--accent-orange))',
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

                <Link
                    to="/bonuses"
                    style={linkStyle('bonuses')}
                    className="sidebar-btn"
                    title={isCollapsed ? t.bestCasinos : ''}
                >
                    <Gift size={20} />
                    {!isCollapsed && t.bestCasinos}
                </Link>

                <Link
                    to="/slots"
                    style={linkStyle('slots')}
                    className="sidebar-btn"
                    title={isCollapsed ? t.bestSlots : ''}
                >
                    <Gamepad2 size={20} />
                    {!isCollapsed && t.bestSlots}
                </Link>

                <Link
                    to="/streams"
                    style={linkStyle('streams')}
                    className="sidebar-btn"
                    title={isCollapsed ? t.liveStream : ''}
                >
                    <div style={{ position: 'relative' }}>
                        <Tv size={20} />
                        {isLive && (
                            <div style={{
                                position: 'absolute',
                                top: '-2px',
                                right: '-2px',
                                width: '8px',
                                height: '8px',
                                background: 'var(--neon-green)',
                                borderRadius: '50%',
                                boxShadow: '0 0 5px var(--neon-green)',
                                border: '1px solid var(--bg-sidebar)'
                            }} />
                        )}
                    </div>
                    {!isCollapsed && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                            {t.liveStream}
                            {isLive && (
                                <div style={{
                                    width: '8px',
                                    height: '8px',
                                    background: 'var(--neon-green)',
                                    borderRadius: '50%',
                                    boxShadow: '0 0 5px var(--neon-green)',
                                    marginLeft: 'auto'
                                }} />
                            )}
                        </div>
                    )}
                </Link>

                <Link
                    to="/tournaments"
                    style={linkStyle('tournaments')}
                    className="sidebar-btn"
                    title={isCollapsed ? t.tournaments : ''}
                >
                    <Trophy size={20} />
                    {!isCollapsed && t.tournaments}
                </Link>
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
                    <a href="https://t.me/bloodyboy58" target="_blank" rel="noopener noreferrer" style={{
                        flex: 1,
                        background: 'rgba(255, 255, 255, 0.03)',
                        color: 'var(--primary-orange)',
                        padding: '12px',
                        borderRadius: '10px',
                        textAlign: 'center',
                        fontSize: '1.2rem',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--primary-orange)';
                            e.currentTarget.style.color = '#fff';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                            e.currentTarget.style.color = 'var(--primary-orange)';
                        }}
                        title="Telegram Channel">
                        <Send size={20} />
                    </a>
                    <a href="https://t.me/+7b4HEtKQoqBkMzgy" target="_blank" rel="noopener noreferrer" style={{
                        flex: 1,
                        background: 'rgba(255, 255, 255, 0.03)',
                        color: 'var(--primary-orange)',
                        padding: '12px',
                        borderRadius: '10px',
                        textAlign: 'center',
                        fontSize: '1.2rem',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--primary-orange)';
                            e.currentTarget.style.color = '#fff';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                            e.currentTarget.style.color = 'var(--primary-orange)';
                        }}
                        title="Telegram Chat">
                        <MessageCircle size={20} />
                    </a>
                </div>
            </div>



        </aside>
    );
};

export default Sidebar;
