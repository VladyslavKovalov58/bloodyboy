import { Users, Calendar, Info, Rocket, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { translations } from '../translations';

const TournamentCard = ({ tournament, language }) => {
    const t = translations[language];

    return (
        <div className="tournament-card" style={{
            background: '#09090b',
            padding: '20px',
            borderRadius: '24px',
            border: '2px solid rgba(255, 107, 0, 0.15)',
            display: 'flex',
            flexDirection: window.innerWidth < 768 ? 'column' : 'row',
            overflow: 'hidden',
            transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
            minHeight: window.innerWidth < 768 ? 'auto' : '420px',
            height: window.innerWidth < 768 ? 'auto' : '420px',
            position: 'relative',
            cursor: 'default',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
            maxWidth: 'none',
            margin: '0 0 20px 0'
        }}
            onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 107, 0, 0.4)';
                e.currentTarget.style.transform = 'scale(1.01)';
                e.currentTarget.style.boxShadow = '0 30px 60px rgba(255, 107, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 107, 0, 0.15)';
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.4)';
            }}>

            {/* Left Column: Content (Tesla Style) */}
            <div style={{
                flex: '1.4',
                padding: window.innerWidth < 768 ? '30px 20px' : '40px 60px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                zIndex: 10,
                background: window.innerWidth < 768 ? 'none' : 'linear-gradient(90deg, #09090b 40%, transparent 100%)'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '12px'
                }}>
                    <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: tournament.isActive ? '#00FF00' : 'var(--primary-orange)',
                        boxShadow: `0 0 10px ${tournament.isActive ? '#00FF00' : 'var(--primary-orange)'}`
                    }} />
                    <span style={{
                        fontSize: '0.8rem',
                        fontWeight: '900',
                        color: 'rgba(255,255,255,0.6)',
                        textTransform: 'uppercase',
                        letterSpacing: '2px'
                    }}>
                        {tournament.isActive ? t.activeTournaments : t.finishedTournaments}
                    </span>
                </div>

                <h2 style={{
                    fontSize: '3rem',
                    fontWeight: '900',
                    color: '#fff',
                    marginBottom: '10px',
                    letterSpacing: '-1.5px',
                    lineHeight: '1',
                    textTransform: 'none'
                }}>
                    {tournament.name}
                </h2>

                <div style={{
                    fontSize: '1.5rem',
                    fontWeight: '800',
                    color: 'var(--primary-orange)',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: '800' }}>{t.prizePool}</span>
                    {tournament.prize}
                </div>

                <p style={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '1.05rem',
                    lineHeight: '1.6',
                    maxWidth: '480px',
                    marginBottom: '30px',
                    fontWeight: '500'
                }}>
                    {tournament.briefDescription}
                </p>

                {/* Info Pills */}
                <div style={{
                    display: 'flex',
                    gap: '25px',
                    marginBottom: '35px',
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: '0.9rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Users size={20} color="var(--primary-orange)" />
                        <span style={{ fontWeight: '800' }}>{tournament.format}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={20} color="var(--primary-orange)" />
                        <span style={{ fontWeight: '800' }}>{tournament.date}</span>
                    </div>
                </div>

                {/* Buttons (Tesla Style Bottom-Left) */}
                <div style={{
                    display: 'flex',
                    gap: '15px'
                }}>
                    {tournament.isActive ? (
                        <button style={{
                            background: 'linear-gradient(135deg, #FFB400 0%, #FF6B00 100%)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '16px',
                            padding: '16px 40px',
                            fontSize: '1.1rem',
                            fontWeight: '900',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            transition: 'all 0.3s',
                            boxShadow: '0 8px 30px rgba(255, 107, 0, 0.3)'
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-3px)';
                                e.currentTarget.style.boxShadow = '0 12px 40px rgba(255, 107, 0, 0.5)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 8px 30px rgba(255, 107, 0, 0.3)';
                            }}>
                            {t.participate} <Rocket size={20} />
                        </button>
                    ) : (
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            color: 'rgba(255, 255, 255, 0.4)',
                            borderRadius: '16px',
                            padding: '16px 40px',
                            fontSize: '1.1rem',
                            fontWeight: '800',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>
                            {t.finishedTournaments} <Trophy size={20} />
                        </div>
                    )}

                    <Link to={`/tournaments/${tournament.id}`} style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: '#fff',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '16px',
                        padding: '16px 40px',
                        fontSize: '1.1rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        transition: 'all 0.3s',
                        textDecoration: 'none'
                    }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                            e.currentTarget.style.borderColor = 'rgba(255, 107, 0, 0.3)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}>
                        {t.learnMore} <Info size={20} />
                    </Link>
                </div>
            </div>

            {/* Right Column: Visual Section */}
            <div style={{
                position: 'absolute',
                right: '-40px',
                bottom: '0',
                width: '45%',
                height: '100%',
                zIndex: 5,
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center'
            }}>
                <div style={{
                    fontSize: '4.5rem',
                    fontWeight: '900',
                    color: 'rgba(255, 255, 255, 0.08)',
                    textTransform: 'uppercase',
                    lineHeight: '0.8',
                    transform: 'rotate(-5deg) translateY(-20px)',
                    whiteSpace: 'nowrap',
                    userSelect: 'none',
                    pointerEvents: 'none',
                    letterSpacing: '-2px',
                    textAlign: 'right',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: '5px'
                }}>
                    <div>Counter</div>
                    <div>Strike 2</div>
                </div>
            </div>

            {/* Subtle Gradient Overlay for integration */}
            <div style={{
                position: 'absolute',
                right: 0,
                top: 0,
                bottom: 0,
                width: '40%',
                background: 'linear-gradient(90deg, #09090b 0%, transparent 100%)',
                zIndex: 1,
                pointerEvents: 'none'
            }} />
        </div>
    );
};

export default TournamentCard;
