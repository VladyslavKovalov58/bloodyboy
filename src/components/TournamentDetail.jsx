import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Users, Calendar, Rocket, ShieldCheck, Trophy, Info, LayoutGrid, Map as MapIcon, Activity, ChevronRight, User, Loader2, Bell, BellRing, HelpCircle, X } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { fetchChampionshipDetails, fetchChampionshipMatches, fetchChampionshipParticipants, fetchMatchDetails, fetchMatchStats } from '../services/faceit';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { translations } from '../translations';
import CountdownTimer from './CountdownTimer';
import MatchModal from './MatchModal';
import { sendTelegramMessage, getTelegramBotInfo } from '../services/telegram';

const TournamentDetail = ({ tournaments, language }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const t = translations[language];

    const tournament = tournaments.find(t => t.id === id);

    const [faceitData, setFaceitData] = useState(null);
    const [matches, setMatches] = useState([]);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('info'); // info, bracket, teams
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [selectedMatchDetails, setSelectedMatchDetails] = useState(null);
    const [selectedMatchStats, setSelectedMatchStats] = useState(null);
    const [loadingMatchDetails, setLoadingMatchDetails] = useState(false);

    // Telegram Notification State
    const [telegramId, setTelegramId] = useState(localStorage.getItem('telegramId') || '');
    const [isSubscribing, setIsSubscribing] = useState(false);
    const [subscriptionDone, setSubscriptionDone] = useState(false);
    const [showTelegramInput, setShowTelegramInput] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [needsBotStart, setNeedsBotStart] = useState(false);
    const [botUsername, setBotUsername] = useState('TigerNotifyBot');

    const handleTelegramSubscribe = async () => {
        if (!telegramId || telegramId.length < 5) {
            setShowTelegramInput(true);
            return;
        }

        setIsSubmitting(true);
        setNeedsBotStart(false);
        try {
            // Verify if user has started the bot by sending a test message
            const testMsg = `👋 *ПОДПИСКА АКТИВНА*\nВы успешно подписались на уведомления о турнире *${tournament.name}*!`;
            const testResult = await sendTelegramMessage(telegramId, testMsg);

            if (!testResult) {
                // If message fails, user probably didn't press /start
                getTelegramBotInfo().then(info => {
                    if (info && info.username) setBotUsername(info.username);
                });
                setNeedsBotStart(true);
                setIsSubmitting(false);
                return;
            }

            // First check if already subscribed to avoid primary key conflict errors
            const { data: existing, error: checkError } = await supabase
                .from('tournament_subscriptions')
                .select('id')
                .eq('tournament_id', id)
                .eq('telegram_user_id', telegramId)
                .limit(1);

            if (existing && existing.length > 0) {
                setSubscriptionDone(true);
                localStorage.setItem('telegramId', telegramId);
                setTimeout(() => {
                    setSubscriptionDone(false);
                    setShowTelegramInput(false);
                }, 3000);
                return;
            }

            const { error: insertError } = await supabase
                .from('tournament_subscriptions')
                .insert({
                    tournament_id: id,
                    telegram_user_id: telegramId,
                    tournament_title: tournament.name
                });

            if (insertError && insertError.code !== '23505') throw insertError;

            localStorage.setItem('telegramId', telegramId);
            setSubscriptionDone(true);
            setTimeout(() => {
                setSubscriptionDone(false);
                setShowTelegramInput(false);
            }, 3000);
        } catch (err) {
            console.error('Subscription error:', err);
            if (err.code !== '23505') {
                alert(t.subscribeError);
            } else {
                setSubscriptionDone(true);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const contentRef = React.useRef(null);

    const handleMatchClick = async (match) => {
        setSelectedMatch(match);
        setSelectedMatchDetails(null);
        setSelectedMatchStats(null);
        setLoadingMatchDetails(true);
        if (match.match_id) {
            const [details, stats] = await Promise.all([
                fetchMatchDetails(match.match_id),
                fetchMatchStats(match.match_id)
            ]);
            setSelectedMatchDetails(details);
            setSelectedMatchStats(stats);
        }
        setLoadingMatchDetails(false);
    };

    // Helper to render text with clickable links (Markdown style [Text](URL) or raw URLs)
    const renderClickableText = (text) => {
        if (!text) return null;

        const combinedRegex = /(\[([^\]]+)\]\s*\((https?:\/\/[^\s)]+)\)|https?:\/\/[^\s]+)/g;
        const elements = [];
        let lastIndex = 0;
        let match;

        combinedRegex.lastIndex = 0;
        while ((match = combinedRegex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                elements.push(text.substring(lastIndex, match.index));
            }

            const fullMatch = match[0];
            const isMarkdownLink = fullMatch.startsWith('[');
            const linkTitle = isMarkdownLink ? match[2] : fullMatch;
            const linkUrl = isMarkdownLink ? match[3] : fullMatch;

            elements.push(
                <a
                    key={match.index}
                    href={linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        color: 'var(--primary-orange)',
                        textDecoration: 'none',
                        fontWeight: '800',
                        borderBottom: '1px solid rgba(255, 107, 0, 0.3)',
                        transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderBottomColor = 'var(--primary-orange)';
                        e.currentTarget.style.opacity = '0.8';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderBottomColor = 'rgba(255, 107, 0, 0.3)';
                        e.currentTarget.style.opacity = '1';
                    }}
                >
                    {linkTitle}
                </a>
            );

            lastIndex = combinedRegex.lastIndex;
        }

        if (lastIndex < text.length) {
            elements.push(text.substring(lastIndex));
        }

        return elements.length > 0 ? elements : text;
    };

    // Scroll to content when tab changes (especially on mobile)
    useEffect(() => {
        if (activeTab !== 'info' && contentRef.current) {
            const yOffset = -80; // offset for sticky tabs/header
            const element = contentRef.current;
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    }, [activeTab]);

    useEffect(() => {
        if (tournament?.faceitId && tournament.faceitSyncEnabled) {
            const loadData = async (showLoading = true) => {
                if (showLoading) setLoading(true);
                const [details, mData, sData] = await Promise.all([
                    fetchChampionshipDetails(tournament.faceitId),
                    fetchChampionshipMatches(tournament.faceitId),
                    fetchChampionshipParticipants(tournament.faceitId)
                ]);
                if (details) setFaceitData(details);
                if (mData?.items) setMatches(mData.items);
                if (sData?.items) setTeams(sData.items);
                if (showLoading) setLoading(false);
            };

            loadData(true);

            // Auto-refresh every 30 seconds
            const interval = setInterval(() => loadData(false), 30000);
            return () => clearInterval(interval);
        }
    }, [tournament?.faceitId, tournament?.faceitSyncEnabled]);

    const mapPool = useMemo(() => {
        // Priority 1: Manual map pool from DB
        if (tournament?.mapPool) {
            return tournament.mapPool.split(',').map(m => {
                let s = m.trim().toLowerCase();
                if (s && !s.startsWith('de_') && !s.startsWith('cs_')) s = `de_${s}`;
                return s;
            }).filter(Boolean);
        }

        // Priority 2: Faceit Sync Data
        if (faceitData && tournament?.faceitSyncEnabled) {
            let maps = [];
            if (Array.isArray(faceitData.game_configuration?.maps)) maps = faceitData.game_configuration.maps.map(m => m.name || m.class_name);
            if (maps.length === 0) {
                const pool = faceitData.game_configuration?.map_pool;
                if (Array.isArray(pool)) maps = pool; else if (typeof pool === 'string') maps = pool.split(',').map(s => s.trim());
            }
            if (maps.length === 0) {
                const settingsPool = faceitData.game_settings?.map_pool;
                if (Array.isArray(settingsPool)) maps = settingsPool; else if (typeof settingsPool === 'string') maps = settingsPool.split(',').map(s => s.trim());
            }
            if (maps.length === 0 && matches && matches.length > 0) {
                matches.forEach(m => {
                    if (!m) return;
                    const picks = m.voting?.map?.pick;
                    if (Array.isArray(picks)) maps.push(...picks);
                });
            }

            return [...new Set(maps)]
                .filter(m => typeof m === 'string' && m.length > 0)
                .map(m => {
                    let cleaned = m.toLowerCase().trim();
                    if (cleaned.startsWith('de_')) {
                        const parts = cleaned.split('_');
                        if (parts.length > 2) cleaned = `${parts[0]}_${parts[1]}`;
                    } else if (cleaned && !cleaned.includes(' ')) {
                        cleaned = `de_${cleaned}`;
                    }
                    return cleaned;
                });
        }

        return [];
    }, [faceitData, tournament?.faceitSyncEnabled, tournament?.mapPool, matches]);

    const totalJoined = useMemo(() => {
        // Helper to get only the number from a string like "39/256 участников"
        const parseCount = (val) => {
            if (!val) return 0;
            const str = val.toString();
            // Try to get first number from "39/256"
            const match = str.match(/(\d+)/);
            return match ? parseInt(match[1]) : 0;
        };

        if (!faceitData) return parseCount(tournament?.joinedCount);

        // Find the maximum value from all possible participant/subscription fields
        const joined = Math.max(
            Number(faceitData?.slots_filled || 0),
            Number(faceitData?.participant_count || 0),
            Number(faceitData?.subscriptions_count || 0),
            Number(faceitData?.total_subscriptions || 0),
            Number(faceitData?.members_count || 0),
            Number(faceitData?.total_members || 0),
            Number(teams?.length || 0)
        );
        return joined;
    }, [faceitData, teams.length, tournament?.joinedCount]);

    const mapStats = useMemo(() => {
        if (!matches || !matches.length) return [];
        const stats = {};
        matches.forEach(m => {
            if (!m) return;
            // Check voting picks
            const picks = m.voting?.map?.pick;
            if (Array.isArray(picks)) {
                picks.forEach(map => {
                    if (!map) return;
                    // Try to find a nice name if 'map' looks like a ID
                    let mapName = map.toString().toLowerCase().trim();
                    if (/^[0-9a-f-]{10,}$/i.test(mapName)) {
                        // It's likely a GUID, look for name in voting entities
                        const entities = m.voting?.map?.entities;
                        const entity = Array.isArray(entities) ? entities.find(e => e.guid === map || e.id === map) : null;
                        if (entity?.name) mapName = entity.name.toLowerCase();
                    }

                    if (!mapName.startsWith('de_') && !mapName.startsWith('cs_')) mapName = `de_${mapName}`;
                    stats[mapName] = (stats[mapName] || 0) + 1;
                });
            } else if (m.voting?.map?.entities) {
                // If single map championship or specific format
                const entities = m.voting.map.entities;
                if (Array.isArray(entities) && entities.length === 1) {
                    let mapName = entities[0].name?.toLowerCase() || entities[0].guid?.toLowerCase();
                    if (mapName) {
                        if (!mapName.startsWith('de_') && !mapName.startsWith('cs_')) mapName = `de_${mapName}`;
                        stats[mapName] = (stats[mapName] || 0) + 1;
                    }
                }
            }
        });
        return Object.entries(stats).sort((a, b) => b[1] - a[1]).slice(0, 5);
    }, [matches]);

    const isFaceitTournament = !!tournament?.faceitId && tournament?.faceitSyncEnabled;

    useEffect(() => {
        if (faceitData) {
            console.log(`Faceit Tournament ID:`, tournament?.faceitId);
            console.log(`Faceit Detected Name:`, faceitData.name);
            console.log(`Faceit Slots/Filled:`, faceitData.slots, '/', faceitData.slots_filled, '(Real total:', totalJoined, ')');
            console.log(`Loaded Teams:`, teams.length, `Matches:`, matches.length);
            if (mapPool.length > 0) console.log(`Faceit Extracted Maps:`, mapPool);
        }
    }, [faceitData, mapPool, teams.length, matches.length, tournament?.faceitId, totalJoined]);

    if (loading && !faceitData) {
        return (
            <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
                <Loader2 size={48} className="animate-spin" color="var(--primary-orange)" />
                <div style={{ color: 'rgba(255,255,255,0.5)', fontWeight: '700' }}>
                    {t.loadingTournamentData}
                </div>
            </div>
        );
    }

    if (!tournament) {
        if (tournaments.length === 0) {
            return (
                <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', background: 'var(--bg-dark)' }}>
                    <Loader2 size={48} className="animate-spin" color="var(--primary-orange)" />
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontWeight: '700' }}>
                        {t.loadingTournament}
                    </div>
                </div>
            );
        }

        return (
            <div style={{ padding: '80px 40px', textAlign: 'center', color: '#fff', background: 'var(--bg-dark)', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Trophy size={64} style={{ marginBottom: '20px', opacity: 0.2, color: 'var(--primary-orange)' }} />
                <h2 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '10px' }}>
                    {t.tournamentNotFound}
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '30px' }}>
                    {t.tournamentLinkOutdated}
                </p>
                <button
                    onClick={() => navigate('/tournaments')}
                    style={{
                        background: 'rgba(255,107,0,0.1)',
                        border: '1px solid var(--primary-orange)',
                        color: 'var(--primary-orange)',
                        padding: '12px 30px',
                        borderRadius: '12px',
                        fontWeight: '800',
                        cursor: 'pointer'
                    }}
                >
                    {t.backToTournaments}
                </button>
            </div>
        );
    }


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
                    .tabs-container::-webkit-scrollbar {
                        display: none;
                    }
                    .tabs-container {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
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
                {t.back}
            </button>

            {/* New Title Section */}
            <div style={{ marginBottom: isFaceitTournament ? '20px' : '40px' }}>
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

            {/* Tabs Navigation */}
            {
                isFaceitTournament && (
                    <div className="tabs-container" style={{ display: 'flex', gap: '30px', marginBottom: '40px', borderBottom: '1px solid rgba(255,255,255,0.05)', overflowX: 'auto', whiteSpace: 'nowrap' }}>
                        {[
                            { id: 'info', label: t.infoTab, icon: <Info size={18} /> },
                            { id: 'bracket', label: t.bracketsTab, icon: <LayoutGrid size={18} /> },
                            { id: 'teams', label: t.teamsTab, icon: <Users size={18} /> }
                        ].map(tab => (
                            <div
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '15px 5px',
                                    borderBottom: activeTab === tab.id ? '2px solid var(--primary-orange)' : '2px solid transparent',
                                    color: activeTab === tab.id ? '#fff' : 'rgba(255,255,255,0.4)',
                                    cursor: 'pointer',
                                    fontWeight: '800',
                                    fontSize: '0.9rem',
                                    textTransform: 'uppercase',
                                    transition: 'all 0.3s'
                                }}
                            >
                                {tab.icon} {tab.label}
                            </div>
                        ))}
                    </div>
                )
            }

            {/* Content Grid */}
            <div className="detail-content-grid" style={{
                display: 'grid',
                gridTemplateColumns: window.innerWidth < 1024 ? '1fr' : '1.8fr 1fr',
                gap: window.innerWidth < 768 ? '30px' : '40px'
            }}>
                {/* Left Column: Info */}
                {/* Left Column: Switchable Content */}
                <div ref={contentRef}>
                    {activeTab === 'info' && (
                        <>
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
                                            {t.tournamentWinners}
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
                                            { rank: 2, name: tournament.winner2, prize: tournament.winner2Prize, medal: '🥈', color: '#c0c0c0', label: t.place2, scale: '1.0', order: window.innerWidth < 768 ? 2 : 1 },
                                            { rank: 1, name: tournament.winner1, prize: tournament.winner1Prize, medal: '🥇', color: '#FFD700', label: t.place1, scale: '1.15', order: window.innerWidth < 768 ? 1 : 2, isMain: true },
                                            { rank: 3, name: tournament.winner3, prize: tournament.winner3Prize, medal: '🥉', color: '#cd7f32', label: t.place3, scale: '0.95', order: window.innerWidth < 768 ? 3 : 3 }
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
                                            }}>
                                                <div style={{ fontSize: '0.7rem', fontWeight: '900', color: w.color, letterSpacing: '3px', marginBottom: '15px', opacity: 0.9 }}>{w.label}</div>
                                                <div style={{ fontSize: w.isMain ? '4.5rem' : '3.5rem', marginBottom: '15px', lineHeight: 1 }}>{w.medal}</div>
                                                <div style={{ fontWeight: '900', fontSize: w.isMain ? '1.6rem' : '1.3rem', color: '#fff', lineHeight: '1.2', marginBottom: w.prize ? '12px' : '0' }}>{w.name}</div>
                                                {w.prize && (
                                                    <div style={{ display: 'inline-block', padding: '6px 16px', background: w.isMain ? 'rgba(255, 180, 0, 0.15)' : 'rgba(255,255,255,0.05)', borderRadius: '12px', fontSize: '1rem', color: w.isMain ? '#FFB400' : 'var(--primary-orange)', fontWeight: '900', border: `1px solid ${w.isMain ? 'rgba(255, 180, 0, 0.2)' : 'rgba(255,255,255,0.05)'}` }}>{w.prize}</div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            <section style={{ marginBottom: '50px' }}>
                                <h2 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <Info size={28} color="var(--primary-orange)" />
                                    {t.description}
                                </h2>

                                <div style={{ fontSize: '1.2rem', lineHeight: '1.8', color: 'rgba(255, 255, 255, 0.8)', whiteSpace: 'pre-line', fontWeight: '500' }}>
                                    {renderClickableText(
                                        language === 'ua' && tournament.fullDescriptionUa
                                            ? tournament.fullDescriptionUa
                                            : (language === 'en' && tournament.fullDescriptionEn)
                                                ? tournament.fullDescriptionEn
                                                : tournament.fullDescription
                                    )}
                                </div>
                            </section>

                            {/* Map Pool Section */}
                            {(mapPool.length > 0 || isFaceitTournament) && (
                                <section style={{ marginBottom: '50px' }}>
                                    <h2 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <MapIcon size={28} color="var(--primary-orange)" />
                                        {t.mapPoolTitle}
                                    </h2>
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                                        gap: '20px',
                                        marginBottom: mapStats.length > 0 ? '40px' : '0'
                                    }}>
                                        {(mapPool.length > 0 ? mapPool : ['de_mirage', 'de_inferno', 'de_nuke', 'de_overpass', 'de_vertigo', 'de_ancient', 'de_anubis']).map((map, idx) => {
                                            const mapClean = map.toLowerCase().startsWith('de_') ? map.toLowerCase() : `de_${map.toLowerCase()}`;
                                            const mapDisplay = map.toLowerCase().replace('de_', '').toUpperCase();

                                            // GhostCap Stable CS2 Map Images (Verified)
                                            const bgImg = `https://raw.githubusercontent.com/ghostcap-gaming/cs2-map-images/main/cs2/${mapClean}.png`;

                                            return (
                                                <div key={idx} style={{
                                                    height: '140px',
                                                    borderRadius: '24px',
                                                    overflow: 'hidden',
                                                    position: 'relative',
                                                    border: '1px solid rgba(255,255,255,0.08)',
                                                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                                    cursor: 'default',
                                                    background: `#111 url("${bgImg}") center/cover no-repeat`,
                                                    backgroundColor: '#111',
                                                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                                                }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                                                        e.currentTarget.style.borderColor = 'rgba(255, 107, 0, 0.4)';
                                                        e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.6), 0 0 20px rgba(255,107,0,0.1)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.transform = 'none';
                                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                                                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
                                                    }}>
                                                    {/* Gradient Overlay for better text readability */}
                                                    <div style={{
                                                        position: 'absolute',
                                                        inset: 0,
                                                        background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)'
                                                    }} />

                                                    <div style={{
                                                        position: 'absolute',
                                                        bottom: '20px',
                                                        left: '20px',
                                                        right: '20px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        zIndex: 2
                                                    }}>
                                                        <span style={{
                                                            fontSize: '1rem',
                                                            fontWeight: '900',
                                                            color: '#fff',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px',
                                                            textShadow: '0 2px 10px rgba(0,0,0,0.8)',
                                                            whiteSpace: 'nowrap',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis'
                                                        }}>{mapDisplay}</span>
                                                        <div style={{
                                                            padding: '4px 8px',
                                                            background: 'rgba(255,107,0,0.2)',
                                                            backdropFilter: 'blur(8px)',
                                                            borderRadius: '8px',
                                                            fontSize: '0.65rem',
                                                            fontWeight: '900',
                                                            color: 'var(--primary-orange)',
                                                            border: '1px solid rgba(255,107,0,0.3)',
                                                            textTransform: 'uppercase',
                                                            boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                                                        }}>{t.live}</div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                </section>
                            )}

                            <section>
                                <h2 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <ShieldCheck size={28} color="var(--primary-orange)" />
                                    {t.rules}
                                </h2>
                                <ul style={{ paddingLeft: '0', listStyle: 'none', color: 'rgba(255, 255, 255, 0.8)', fontSize: '1.1rem', lineHeight: '2.5' }}>
                                    {(language === 'ua' && tournament.rulesUa
                                        ? tournament.rulesUa
                                        : (language === 'en' && tournament.rulesEn)
                                            ? tournament.rulesEn
                                            : tournament.rules)?.split('\n').filter(r => r.trim()).map((rule, idx) => (
                                                <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 20px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', marginBottom: '8px', border: '1px solid rgba(255, 255, 255, 0.03)' }}>
                                                    <div style={{ minWidth: '24px', height: '24px', borderRadius: '8px', background: 'rgba(255, 107, 0, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-orange)', fontSize: '0.85rem', fontWeight: '900', marginTop: '4px' }}>{idx + 1}</div>
                                                    <span style={{ paddingTop: '2px' }}>
                                                        {renderClickableText(rule.replace(/^\d+\.\s*/, ''))}
                                                    </span>
                                                </li>
                                            )) || <li>{t.noRulesProvided}</li>}
                                </ul>
                            </section>
                        </>
                    )}

                    {activeTab === 'bracket' && (
                        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                                <LayoutGrid size={28} color="var(--primary-orange)" />
                                <h2 style={{ fontSize: '2rem', fontWeight: '900', margin: 0 }}>{t.bracketsResults}</h2>
                            </div>

                            {matches.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                                    {(() => {
                                        const maxRound = Math.max(...matches.map(m => m.round || 0));
                                        const grouped = matches.reduce((acc, m) => {
                                            const r = m.round || 0;
                                            if (!acc[r]) acc[r] = [];
                                            acc[r].push(m);
                                            return acc;
                                        }, {});

                                        return Object.entries(grouped)
                                            .sort(([a], [b]) => Number(b) - Number(a))
                                            .map(([roundNum, roundMatches]) => {
                                                const currentRound = Number(roundNum);
                                                let roundName = t.round + ' ' + currentRound;

                                                if (currentRound === maxRound) roundName = t.final;
                                                else if (currentRound === maxRound - 1) roundName = t.semifinal;
                                                else if (currentRound === maxRound - 2) roundName = t.quarterfinal;
                                                else if (currentRound === maxRound - 3) roundName = t.roundOf16;
                                                else if (currentRound === maxRound - 4) roundName = t.roundOf32;
                                                else if (currentRound === maxRound - 5) roundName = t.roundOf64;

                                                return (
                                                    <div key={currentRound} style={{ animation: 'fadeIn 0.4s ease-out' }}>
                                                        <div style={{
                                                            display: 'flex', alignItems: 'center', gap: '15px',
                                                            paddingBottom: '12px', marginBottom: '20px',
                                                            borderBottom: '1px solid rgba(255,255,255,0.08)'
                                                        }}>
                                                            <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900', color: 'var(--primary-orange)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                                {roundName}
                                                            </h3>
                                                            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontWeight: '800', padding: '4px 10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                                                                {roundMatches.length} {language === 'ru' ? (roundMatches.length === 1 ? t.matchCount1 : (roundMatches.length > 1 && roundMatches.length < 5 ? t.matchCount24 : t.matchCountMany)) : (roundMatches.length === 1 ? t.matchCount1 : t.matchCountMany)}
                                                            </span>
                                                        </div>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                            {roundMatches.map((match, idx) => {
                                                                if (!match) return null;
                                                                return (
                                                                    <div key={idx} onClick={() => handleMatchClick(match)} style={{
                                                                        background: 'rgba(255,255,255,0.02)',
                                                                        padding: '20px 24px',
                                                                        borderRadius: '20px',
                                                                        border: '1px solid rgba(255,255,255,0.05)',
                                                                        display: 'flex',
                                                                        flexDirection: 'column',
                                                                        gap: '15px',
                                                                        transition: 'all 0.3s',
                                                                        cursor: 'pointer'
                                                                    }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,107,0,0.3)'; }}
                                                                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; }}>
                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                            <div style={{
                                                                                fontSize: '0.7rem',
                                                                                background: 'rgba(255,255,255,0.05)',
                                                                                padding: '4px 10px',
                                                                                borderRadius: '6px',
                                                                                color: 'rgba(255,255,255,0.5)',
                                                                                fontWeight: '800',
                                                                                textTransform: 'uppercase',
                                                                                letterSpacing: '1px'
                                                                            }}>
                                                                                {match.round_label || match.competition_type || (match.round >= 0 ? `Round ${match.round + 1}` : 'Match')}
                                                                            </div>
                                                                            <div style={{
                                                                                fontSize: '0.7rem',
                                                                                fontWeight: '900',
                                                                                color: match.status === 'FINISHED' ? 'rgba(255,255,255,0.3)' : '#4ade80',
                                                                                textTransform: 'uppercase'
                                                                            }}>
                                                                                {match.status === 'FINISHED' ? t.finished : t.live}
                                                                            </div>
                                                                        </div>

                                                                        <div style={{
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'space-between',
                                                                            flexDirection: window.innerWidth < 480 ? 'column' : 'row',
                                                                            gap: '15px'
                                                                        }}>
                                                                            <div style={{ flex: 1, textAlign: window.innerWidth < 480 ? 'center' : 'right', fontWeight: '850', fontSize: '1rem' }}>
                                                                                {match.teams?.faction1?.name || match.teams?.find?.(t => t.team_id === match.teams_ids?.[0])?.nickname || match.teams?.[0]?.nickname || 'TBD'}
                                                                            </div>
                                                                            <div style={{
                                                                                padding: '8px 20px',
                                                                                background: match.status === 'FINISHED' ? 'rgba(255,255,255,0.05)' : 'rgba(255,107,0,0.15)',
                                                                                borderRadius: '12px',
                                                                                margin: window.innerWidth < 480 ? '0' : '0 25px',
                                                                                fontWeight: '900',
                                                                                fontSize: '1.2rem',
                                                                                color: match.status === 'FINISHED' ? '#fff' : 'var(--primary-orange)',
                                                                                minWidth: '85px',
                                                                                textAlign: 'center',
                                                                                border: `1px solid ${match.status === 'FINISHED' ? 'rgba(255,255,255,0.05)' : 'rgba(255,107,0,0.3)'}`,
                                                                                boxShadow: match.status === 'FINISHED' ? 'none' : '0 4px 15px rgba(255,107,0,0.2)'
                                                                            }}>
                                                                                {match.results?.score?.faction1 ?? match.results?.score?.team1 ?? 0} : {match.results?.score?.faction2 ?? match.results?.score?.team2 ?? 0}
                                                                            </div>
                                                                            <div style={{ flex: 1, textAlign: window.innerWidth < 480 ? 'center' : 'left', fontWeight: '850', fontSize: '1rem' }}>
                                                                                {match.teams?.faction2?.name || match.teams?.find?.(t => t.team_id === match.teams_ids?.[1])?.nickname || match.teams?.[1]?.nickname || 'TBD'}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                );
                                            });
                                    })()}
                                </div>
                            ) : (
                                <div style={{ padding: '60px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px dashed rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }}>
                                    <Activity size={48} style={{ marginBottom: '20px', opacity: 0.2 }} />
                                    <div>{t.matchesNotStarted}</div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'teams' && (
                        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                                <Users size={28} color="var(--primary-orange)" />
                                <h2 style={{ fontSize: '2rem', fontWeight: '900', margin: 0 }}>{t.teamsList}</h2>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                                {teams.length > 0 ? teams.map((sub, idx) => (
                                    <div key={idx} style={{
                                        background: 'rgba(255,255,255,0.03)',
                                        padding: '15px 20px',
                                        borderRadius: '18px',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px'
                                    }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', overflow: 'hidden', flexShrink: 0 }}>
                                            {sub.team?.avatar ? <img src={sub.team.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,107,0,0.1)', color: 'var(--primary-orange)' }}><Users size={20} /></div>}
                                        </div>
                                        <div style={{ fontWeight: '800', fontSize: '1rem', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub.team?.name || sub.nickname}</div>
                                    </div>
                                )) : (
                                    <div style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px dashed rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }}>
                                        {t.teamsListEmpty}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
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
                                    <Trophy size={24} />
                                </div>
                                <div>
                                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', fontWeight: '700' }}>{t.joinedCount}</div>
                                    <div style={{ fontWeight: '900', fontSize: '1.1rem' }}>
                                        <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#fff', marginBottom: '4px' }}>
                                            {totalJoined} / {faceitData?.slots || faceitData?.slots_total || (tournament.joinedCount?.toString().includes('/') ? tournament.joinedCount.toString().split('/')[1].replace(/[^0-9]/g, '') : 256)} {t.participants}
                                        </div>
                                    </div>
                                </div>
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

                        {tournament.sponsorName && tournament.showSponsor !== false && (
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
                            textShadow: '0 2px 5px rgba(0,0,0,0.3)',
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



                    {/* Telegram Notification Section */}
                    {tournament.isActive && (!tournament.targetDate || new Date() < new Date(tournament.targetDate)) && (
                        <div style={{
                            marginTop: '20px',
                            background: 'rgba(255, 255, 255, 0.02)',
                            borderRadius: '20px',
                            padding: '15px',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    {subscriptionDone ? <BellRing size={20} color="#4ade80" className="animate-pulse" /> : <Bell size={20} color="var(--primary-orange)" />}
                                    <span style={{ fontWeight: '800', fontSize: '0.9rem', color: subscriptionDone ? '#4ade80' : '#fff' }}>
                                        {subscriptionDone ? t.subscribeSuccess : t.notifyMe}
                                    </span>
                                </div>
                                {!showTelegramInput && !subscriptionDone && (
                                    <button
                                        onClick={() => setShowTelegramInput(true)}
                                        style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', padding: '5px', cursor: 'pointer' }}
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>

                            {!subscriptionDone && (
                                <>
                                    {showTelegramInput ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {needsBotStart ? (
                                                <div style={{ background: 'rgba(255, 180, 0, 0.1)', border: '1px solid rgba(255, 180, 0, 0.2)', padding: '15px', borderRadius: '12px', textAlign: 'center' }}>
                                                    <div style={{ color: '#FFB400', fontWeight: '800', lineHeight: '1.4', fontSize: '0.85rem', marginBottom: '12px' }}>
                                                        {t.startBotRequired}
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '10px' }}>
                                                        <button
                                                            onClick={() => window.open(`https://t.me/${botUsername}`, '_blank')}
                                                            style={{ flex: 1, background: '#0088cc', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: '900', cursor: 'pointer', fontSize: '0.85rem' }}
                                                        >
                                                            {t.openBotButton}
                                                        </button>
                                                        <button
                                                            onClick={handleTelegramSubscribe}
                                                            disabled={isSubmitting}
                                                            style={{ flex: 1, background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '10px', borderRadius: '8px', fontWeight: '900', cursor: isSubmitting ? 'default' : 'pointer', fontSize: '0.85rem', opacity: isSubmitting ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                        >
                                                            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : t.verifySubscription}
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div style={{ position: 'relative' }}>
                                                        <input
                                                            type="text"
                                                            value={telegramId}
                                                            onChange={(e) => setTelegramId(e.target.value.replace(/\D/g, ''))}
                                                            placeholder={t.telegramIdLabel}
                                                            style={{
                                                                width: '100%',
                                                                background: 'rgba(0,0,0,0.3)',
                                                                border: '1px solid rgba(255,255,255,0.1)',
                                                                padding: '12px 15px',
                                                                borderRadius: '12px',
                                                                color: '#fff',
                                                                fontSize: '0.9rem',
                                                                fontWeight: '700',
                                                                boxSizing: 'border-box'
                                                            }}
                                                        />
                                                        <button
                                                            onClick={() => window.open('https://t.me/userinfobot', '_blank')}
                                                            title={t.telegramIdHelp}
                                                            style={{
                                                                position: 'absolute',
                                                                right: '10px',
                                                                top: '50%',
                                                                transform: 'translateY(-50%)',
                                                                cursor: 'pointer',
                                                                background: 'none',
                                                                border: 'none',
                                                                color: '#0088cc'
                                                            }}
                                                        >
                                                            <HelpCircle size={18} />
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={handleTelegramSubscribe}
                                                        disabled={isSubmitting || !telegramId}
                                                        style={{
                                                            width: '100%',
                                                            background: '#0088cc', // Telegram blue for the button
                                                            color: '#fff',
                                                            border: 'none',
                                                            padding: '10px',
                                                            borderRadius: '10px',
                                                            fontWeight: '900',
                                                            cursor: isSubmitting ? 'default' : 'pointer',
                                                            opacity: isSubmitting || !telegramId ? 0.5 : 1
                                                        }}
                                                    >
                                                        {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : t.notifyMeDesc}
                                                    </button>
                                                    <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', fontWeight: '700', textAlign: 'center' }}>
                                                        {t.telegramIdHelp}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <button
                                            onClick={handleTelegramSubscribe}
                                            style={{
                                                background: 'rgba(0,136,204,0.1)',
                                                border: '1px solid rgba(0,136,204,0.2)',
                                                color: '#0088cc',
                                                padding: '10px',
                                                borderRadius: '12px',
                                                fontWeight: '900',
                                                cursor: 'pointer',
                                                fontSize: '0.85rem'
                                            }}
                                        >
                                            {t.notifyMeDesc}
                                        </button>
                                    )
                                    }
                                </>
                            )}
                        </div>
                    )}

                    <div style={{ textAlign: 'center', marginTop: '25px', color: 'rgba(255,255,255,0.4)', fontSize: '1rem', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', letterSpacing: '1px' }}>
                        <Users size={18} />
                        {isFaceitTournament && faceitData ? (
                            `${totalJoined} / ${faceitData?.slots || faceitData?.slots_total || 256}`
                        ) : (
                            tournament.joinedCount ? tournament.joinedCount.toString().split('/')[0].replace(/[^0-9]/g, '') + ' / ' + (tournament.joinedCount.toString().split('/')[1]?.replace(/[^0-9]/g, '') || '256') : `${teams.length} / 32`
                        )}
                    </div>

                    {/* Map Stats */}
                    {isFaceitTournament && matches.length > 0 && mapStats.length > 0 && (
                        <div style={{ marginTop: '40px', paddingTop: '30px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: '800', marginBottom: '20px', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <MapIcon size={18} color="var(--primary-orange)" /> {language === 'ru' ? 'Популярные карты' : 'Popular Maps'}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {mapStats.map(([mapName, count], idx) => {
                                    const name = mapName.includes('/') ? mapName.split('/').pop() : mapName;
                                    return (
                                        <div key={idx} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '12px 18px',
                                            background: 'rgba(255,255,255,0.02)',
                                            borderRadius: '15px',
                                            border: '1px solid rgba(255,255,255,0.03)'
                                        }}>
                                            <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#fff', textTransform: 'capitalize' }}>{name.replace('de_', '')}</div>
                                            <div style={{ color: 'var(--primary-orange)', fontWeight: '900', fontSize: '0.85rem' }}>{count} {language === 'ru' ? (count === 1 ? 'игра' : 'игр') : 'matches'}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {
                selectedMatch && (
                    <MatchModal
                        match={selectedMatch}
                        details={selectedMatchDetails}
                        stats={selectedMatchStats}
                        onClose={() => setSelectedMatch(null)}
                        language={language}
                        loading={loadingMatchDetails}
                    />
                )
            }
        </div >
    );
};

export default TournamentDetail;
