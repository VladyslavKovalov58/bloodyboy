import { ArrowLeft, Users, Calendar, Rocket, ShieldCheck, Trophy, Info } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { translations } from '../translations';
import CountdownTimer from './CountdownTimer';

const TournamentDetail = ({ tournaments, language }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const t = translations[language];

    const tournament = tournaments.find(t => t.id === id);

    if (!tournament) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: '#fff' }}>
                <h2>Tournament not found</h2>
                <Link to="/tournaments" style={{ color: 'var(--primary-orange)' }}>Back to list</Link>
            </div>
        );
    }

    const isTigerTournament = tournament.name === 'TIGER Wingmans Tournament' || tournament.name === 'Tiger Duo Cup';

    return (
        <div className="tournament-detail-container" style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: window.innerWidth < 768 ? '15px' : '20px',
            color: '#fff'
        }}>
            {/* Styles for animation */}
            <style>
                {`
                    @keyframes float {
                        0% { transform: translateY(0px) rotate(-5deg); filter: drop-shadow(0 5px 15px rgba(255,107,0,0.2)); }
                        50% { transform: translateY(-20px) rotate(-3deg); filter: drop-shadow(0 25px 35px rgba(255,107,0,0.4)); }
                        100% { transform: translateY(0px) rotate(-5deg); filter: drop-shadow(0 5px 15px rgba(255,107,0,0.2)); }
                    }
                    @keyframes glow {
                        0% { opacity: 0.3; transform: scale(1); }
                        50% { opacity: 0.6; transform: scale(1.1); }
                        100% { opacity: 0.3; transform: scale(1); }
                    }
                `}
            </style>

            {/* Header / Back Navigation */}
            <button
                onClick={() => navigate(-1)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255, 255, 255, 0.6)',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    marginBottom: '30px',
                    padding: '0',
                    transition: 'color 0.3s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'}
            >
                <ArrowLeft size={20} />
                {language === 'ru' ? 'Назад' : 'Back'}
            </button>

            {/* New Title Section */}
            <div style={{ marginBottom: '40px' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '10px'
                }}>
                    <div style={{
                        background: 'var(--primary-orange)',
                        color: '#fff',
                        padding: '4px 12px',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: '900',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                    }}>
                        {tournament.isActive ? t.activeTournaments : t.finishedTournaments}
                    </div>
                    <div style={{
                        color: 'rgba(255,255,255,0.4)',
                        fontSize: '0.8rem',
                        fontWeight: '800',
                        textTransform: 'uppercase',
                        letterSpacing: '2px'
                    }}>
                        {tournament.type}
                    </div>
                </div>

                <h1 style={{
                    fontSize: window.innerWidth < 768 ? '2.2rem' : '3.5rem',
                    fontWeight: '900',
                    margin: '0',
                    letterSpacing: '-1.5px',
                    lineHeight: '1.1',
                    color: '#fff'
                }}>
                    {tournament.name}
                </h1>
            </div>

            {/* Content Grid */}
            <div className="detail-content-grid" style={{
                display: 'grid',
                gridTemplateColumns: window.innerWidth < 1024 ? '1fr' : '1.8fr 1fr',
                gap: window.innerWidth < 768 ? '30px' : '40px'
            }}>
                {/* Left Column: Info */}
                <div>
                    {!tournament.isActive && (tournament.winner1 || tournament.winner2 || tournament.winner3) && (
                        <section style={{ marginBottom: '50px', animation: 'fadeIn 0.8s ease-out' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '15px',
                                marginBottom: '40px',
                                justifyContent: window.innerWidth < 1024 ? 'center' : 'flex-start'
                            }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '12px',
                                    background: 'rgba(255, 107, 0, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--primary-orange)'
                                }}>
                                    <Trophy size={24} />
                                </div>
                                <h2 style={{
                                    fontSize: '2rem',
                                    fontWeight: '900',
                                    margin: 0,
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    background: 'linear-gradient(to right, #fff, rgba(255,255,255,0.7))',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}>
                                    {language === 'ru' ? 'Победители турнира' : 'Tournament Winners'}
                                </h2>
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(3, 1fr)',
                                gap: '40px',
                                alignItems: 'flex-end',
                                maxWidth: '1000px',
                                margin: '0 auto',
                                paddingTop: '45px'
                            }}>
                                {[
                                    { rank: 2, name: tournament.winner2, prize: tournament.winner2Prize, medal: '🥈', color: '#c0c0c0', label: language === 'ru' ? 'II МЕСТО' : '2ND PLACE', scale: '1.0', order: window.innerWidth < 768 ? 2 : 1 },
                                    { rank: 1, name: tournament.winner1, prize: tournament.winner1Prize, medal: '🥇', color: '#FFD700', label: language === 'ru' ? 'I МЕСТО' : '1ST PLACE', scale: '1.15', order: window.innerWidth < 768 ? 1 : 2, isMain: true },
                                    { rank: 3, name: tournament.winner3, prize: tournament.winner3Prize, medal: '🥉', color: '#cd7f32', label: language === 'ru' ? 'III МЕСТО' : '3RD PLACE', scale: '0.95', order: window.innerWidth < 768 ? 3 : 3 }
                                ].filter(w => w.name).sort((a, b) => a.order - b.order).map((w, i) => (
                                    <div key={i} style={{
                                        background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 100%)',
                                        padding: w.isMain ? '45px 30px' : '35px 25px',
                                        borderRadius: '35px',
                                        border: `1px solid ${w.isMain ? 'rgba(255, 180, 0, 0.2)' : 'rgba(255,255,255,0.05)'}`,
                                        textAlign: 'center',
                                        position: 'relative',
                                        transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                        transform: `scale(${w.scale})`,
                                        boxShadow: w.isMain ? '0 20px 50px rgba(0,0,0,0.4), 0 0 30px rgba(255, 180, 0, 0.05)' : '0 15px 40px rgba(0,0,0,0.3)',
                                        zIndex: w.isMain ? 2 : 1
                                    }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = `scale(${parseFloat(w.scale) + 0.05}) translateY(-10px)`;
                                            e.currentTarget.style.borderColor = w.isMain ? 'rgba(255, 180, 0, 0.4)' : 'rgba(255,255,255,0.15)';
                                            e.currentTarget.style.background = 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.03) 100%)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = `scale(${w.scale})`;
                                            e.currentTarget.style.borderColor = w.isMain ? 'rgba(255, 180, 0, 0.2)' : 'rgba(255,255,255,0.05)';
                                            e.currentTarget.style.background = 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 100%)';
                                        }}>
                                        <div style={{
                                            fontSize: '0.7rem',
                                            fontWeight: '900',
                                            color: w.color,
                                            letterSpacing: '3px',
                                            marginBottom: '15px',
                                            opacity: 0.9,
                                            textShadow: `0 0 10px ${w.color}40`
                                        }}>
                                            {w.label}
                                        </div>
                                        <div style={{
                                            fontSize: w.isMain ? '4.5rem' : '3.5rem',
                                            marginBottom: '15px',
                                            filter: `drop-shadow(0 0 15px ${w.color}30)`,
                                            lineHeight: 1
                                        }}>
                                            {w.medal}
                                        </div>
                                        <div style={{
                                            fontWeight: '900',
                                            fontSize: w.isMain ? '1.6rem' : '1.3rem',
                                            color: '#fff',
                                            lineHeight: '1.2',
                                            marginBottom: w.prize ? '12px' : '0'
                                        }}>
                                            {w.name}
                                        </div>
                                        {w.prize && (
                                            <div style={{
                                                display: 'inline-block',
                                                padding: '6px 16px',
                                                background: w.isMain ? 'rgba(255, 180, 0, 0.15)' : 'rgba(255,255,255,0.05)',
                                                borderRadius: '12px',
                                                fontSize: '1rem',
                                                color: w.isMain ? '#FFB400' : 'var(--primary-orange)',
                                                fontWeight: '900',
                                                border: `1px solid ${w.isMain ? 'rgba(255, 180, 0, 0.2)' : 'rgba(255,255,255,0.05)'}`
                                            }}>
                                                {w.prize}
                                            </div>
                                        )}
                                        <div style={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            transform: 'translate(-50%, -50%)',
                                            width: '120%',
                                            height: '120%',
                                            background: `radial-gradient(circle, ${w.color}08 0%, transparent 70%)`,
                                            pointerEvents: 'none',
                                            zIndex: -1
                                        }} />
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    <section style={{ marginBottom: '50px' }}>
                        <h2 style={{
                            fontSize: '2rem',
                            fontWeight: '900',
                            marginBottom: '25px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px'
                        }}>
                            <Info size={28} color="var(--primary-orange)" />
                            {t.description}
                        </h2>
                        <p style={{
                            fontSize: '1.2rem',
                            lineHeight: '1.8',
                            color: 'rgba(255, 255, 255, 0.8)',
                            whiteSpace: 'pre-line',
                            fontWeight: '500'
                        }}>
                            {tournament.fullDescription}
                        </p>
                    </section>

                    <section>
                        <h2 style={{
                            fontSize: '2rem',
                            fontWeight: '900',
                            marginBottom: '25px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px'
                        }}>
                            <ShieldCheck size={28} color="var(--primary-orange)" />
                            {t.rules}
                        </h2>
                        <ul style={{
                            paddingLeft: '0',
                            listStyle: 'none',
                            color: 'rgba(255, 255, 255, 0.8)',
                            fontSize: '1.1rem',
                            lineHeight: '2.5'
                        }}>
                            {tournament.rules ? tournament.rules.split('\n').filter(r => r.trim()).map((rule, idx) => (
                                <li key={idx} style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '12px',
                                    padding: '12px 20px',
                                    background: 'rgba(255, 255, 255, 0.02)',
                                    borderRadius: '12px',
                                    marginBottom: '8px',
                                    border: '1px solid rgba(255, 255, 255, 0.03)'
                                }}>
                                    <div style={{
                                        minWidth: '24px',
                                        height: '24px',
                                        borderRadius: '8px',
                                        background: 'rgba(255, 107, 0, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'var(--primary-orange)',
                                        fontSize: '0.85rem',
                                        fontWeight: '900',
                                        marginTop: '4px'
                                    }}>
                                        {idx + 1}
                                    </div>
                                    <span style={{ paddingTop: '2px' }}>{rule.replace(/^\d+\.\s*/, '')}</span>
                                </li>
                            )) : (
                                <>
                                    <li>Fair play policy and anti-cheat requirements.</li>
                                    <li>Team registration must be confirmed 24h prior.</li>
                                    <li>Players must be 18+ or have parental consent.</li>
                                </>
                            )}
                        </ul>
                    </section>
                </div>

                {/* Right Column: Sidebar Stats */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '30px',
                    padding: window.innerWidth < 768 ? '25px' : '40px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    height: 'fit-content',
                    position: window.innerWidth < 1024 ? 'static' : 'sticky',
                    top: '100px',
                    order: window.innerWidth < 1024 ? -1 : 1
                }}>
                    <div style={{ marginBottom: '35px' }}>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', textTransform: 'uppercase', fontWeight: '800', marginBottom: '8px', letterSpacing: '1px' }}>{t.prizePool}</div>
                        <div style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--primary-orange)', letterSpacing: '-1px' }}>{tournament.prize}</div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', marginBottom: '45px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px' }}>
                            <div style={{ width: '50px', height: '50px', borderRadius: '15px', background: 'rgba(255, 107, 0, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-orange)' }}>
                                <Users size={24} />
                            </div>
                            <div>
                                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', fontWeight: '700' }}>{t.format}</div>
                                <div style={{ fontWeight: '900', fontSize: '1.1rem' }}>{tournament.format}</div>
                            </div>
                        </div>
                        <div style={{ padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{ width: '50px', height: '50px', borderRadius: '15px', background: 'rgba(255, 107, 0, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-orange)' }}>
                                    <Calendar size={24} />
                                </div>
                                <div>
                                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', fontWeight: '700' }}>{t.date}</div>
                                    <div style={{ fontWeight: '900', fontSize: '1.1rem' }}>{tournament.date}</div>
                                </div>
                            </div>
                            {tournament.targetDate && tournament.isActive && (
                                <div style={{ marginTop: '10px', marginLeft: '70px' }}>
                                    <CountdownTimer targetDate={tournament.targetDate} language={language} />
                                </div>
                            )}
                        </div>

                        {tournament.sponsorName && (
                            <div
                                onClick={() => window.open(tournament.sponsorLink, '_blank')}
                                style={{
                                    padding: '15px',
                                    background: 'rgba(255,255,255,0.02)',
                                    borderRadius: '20px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                    border: '1px solid rgba(255, 255, 255, 0.05)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-3px)';
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                                    e.currentTarget.style.borderColor = 'rgba(255, 107, 0, 0.2)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <div style={{
                                        width: '50px',
                                        height: '50px',
                                        borderRadius: '15px',
                                        background: 'rgba(255, 107, 0, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <img src={tournament.sponsorIcon} alt="Sponsor" style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
                                    </div>
                                    <div>
                                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', fontWeight: '700' }}>{t.sponsor}</div>
                                        <div style={{ fontWeight: '900', fontSize: '1.2rem', color: '#fff' }}>{tournament.sponsorName}</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => tournament.link && window.open(tournament.link, '_blank')}
                        style={{
                            width: '100%',
                            background: tournament.isActive ? 'linear-gradient(135deg, #FFB400 0%, #FF6B00 100%)' : 'rgba(255, 255, 255, 0.05)',
                            color: tournament.isActive ? '#fff' : 'rgba(255, 255, 255, 0.4)',
                            border: tournament.isActive ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '20px',
                            padding: '20px',
                            fontSize: '1.25rem',
                            fontWeight: '900',
                            cursor: tournament.link ? 'pointer' : 'default',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '15px',
                            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                            boxShadow: tournament.isActive ? '0 10px 40px rgba(255, 107, 0, 0.4)' : 'none'
                        }}
                        onMouseEnter={(e) => {
                            if (tournament.link) {
                                e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)';
                                if (tournament.isActive) {
                                    e.currentTarget.style.boxShadow = '0 15px 50px rgba(255, 107, 0, 0.6)';
                                } else {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                                }
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (tournament.link) {
                                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                if (tournament.isActive) {
                                    e.currentTarget.style.boxShadow = '0 10px 40px rgba(255, 107, 0, 0.4)';
                                } else {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                }
                            }
                        }}>
                        {tournament.isActive ? <Rocket size={24} /> : <Trophy size={24} />}
                        {tournament.isActive ? t.participate : t.viewResults}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '25px', color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', fontWeight: '600' }}>
                        Join over {tournament.joinedCount || '2,400'} players
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TournamentDetail;
