import React from 'react';
import { MessageSquare, Send, Gamepad2, Users } from 'lucide-react';
import { translations } from '../translations';

const CommunityBanner = ({ language }) => {
    const t = translations[language];

    const platforms = [
        {
            name: 'Faceit',
            label: t.joinFaceit,
            icon: <Gamepad2 size={22} />,
            color: '#ff5500',
            link: 'https://www.faceit.com/ru/club/44e432a6-3d12-49b8-b591-8b4f820e5d9e/parties',
            shortDesc: language === 'ru' ? 'Хабы и лиги' : 'Hubs & Leagues'
        },
        {
            name: 'Discord',
            label: 'Discord',
            icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.23 10.23 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.196.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
            ),
            color: '#5865F2',
            link: 'https://discord.gg/gTkYrBDf',
            shortDesc: language === 'ru' ? 'Общение и тусовка' : 'Chat & Hangout'
        },
        {
            name: 'Telegram',
            label: 'Telegram',
            icon: <Send size={22} />,
            color: '#0088cc',
            link: 'https://t.me/tigercasinoofficial',
            shortDesc: language === 'ru' ? 'Группа и новости' : 'Group & News'
        }
    ];

    return (
        <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '24px',
            padding: '24px',
            width: window.innerWidth < 768 ? '100%' : '300px',
            height: 'fit-content',
            backdropFilter: 'blur(10px)',
            position: window.innerWidth < 768 ? 'static' : 'sticky',
            top: '20px',
            boxSizing: 'border-box'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--primary-orange)',
                fontSize: '0.8rem',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '16px'
            }}>
                <Users size={14} /> {language === 'ru' ? 'Сообщество' : 'Community'}
            </div>

            <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '800',
                color: '#fff',
                marginBottom: '20px',
                lineHeight: '1.2'
            }}>
                {t.communityTitle}
            </h3>

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
            }}>
                {platforms.map((p) => (
                    <div
                        key={p.name}
                        onClick={() => window.open(p.link, '_blank')}
                        style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            borderRadius: '16px',
                            padding: '16px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                            e.currentTarget.style.borderColor = p.color + '44';
                            e.currentTarget.style.transform = 'translateX(4px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                            e.currentTarget.style.transform = 'translateX(0)';
                        }}
                    >
                        <div style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '12px',
                            background: p.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            boxShadow: `0 4px 15px ${p.color}33`,
                            flexShrink: 0
                        }}>
                            {p.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '1rem', fontWeight: '800', color: '#fff' }}>{p.label}</div>
                            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>{p.shortDesc}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CommunityBanner;
