import React from 'react';
import { X, Loader2, Map as MapIcon, Server, ShieldCheck, Trophy, Activity } from 'lucide-react';

const MatchModal = ({ match, details, stats, onClose, language, loading }) => {
    if (!match) return null;

    const t = {
        title: language === 'ru' ? 'Комната матча' : 'Match Room',
        statusFinished: language === 'ru' ? 'Завершено' : 'Finished',
        statusLive: language === 'ru' ? 'В эфире' : 'Live',
        statusCancelled: language === 'ru' ? 'Отменен' : 'Cancelled',
        map: language === 'ru' ? 'Карта' : 'Map',
        server: language === 'ru' ? 'Сервер' : 'Server',
        players: language === 'ru' ? 'Игроки' : 'Players',
        loading: language === 'ru' ? 'Загрузка данных...' : 'Loading data...'
    };

    const team1Name = match.teams?.faction1?.name || match.teams?.find?.(t => t.team_id === match.teams_ids?.[0])?.nickname || match.teams?.[0]?.nickname || 'TBD';
    const team2Name = match.teams?.faction2?.name || match.teams?.find?.(t => t.team_id === match.teams_ids?.[1])?.nickname || match.teams?.[1]?.nickname || 'TBD';

    let score1 = match.results?.score?.faction1 ?? match.results?.score?.team1 ?? 0;
    let score2 = match.results?.score?.faction2 ?? match.results?.score?.team2 ?? 0;

    const team1Id = details?.teams?.faction1?.faction_id || details?.teams?.faction1?.roster_id || match.teams?.faction1?.faction_id || match.teams?.faction1?.roster_id || match.teams_ids?.[0];
    const team2Id = details?.teams?.faction2?.faction_id || details?.teams?.faction2?.roster_id || match.teams?.faction2?.faction_id || match.teams?.faction2?.roster_id || match.teams_ids?.[1];

    const mapDetails = [];
    if (stats?.rounds?.length > 0) {
        stats.rounds.forEach(round => {
            let mScore1 = '-';
            let mScore2 = '-';
            const mName = round.round_stats?.Map || 'Unknown';
            if (round.teams && round.teams.length >= 2) {
                const t1 = round.teams.find(t => t.team_id === team1Id) || round.teams[0];
                const t2 = round.teams.find(t => t.team_id === team2Id && t !== t1) || round.teams.find(t => t !== t1) || round.teams[1];

                if (t1?.team_stats?.['Final Score']) mScore1 = t1.team_stats['Final Score'];
                if (t2?.team_stats?.['Final Score']) mScore2 = t2.team_stats['Final Score'];

                if (round.round_stats?.Score && (mScore1 === '-' || (mScore1 <= 1 && mScore2 <= 1))) {
                    const scoreParts = round.round_stats.Score.split('/').map(s => s.trim());
                    if (scoreParts.length === 2 && round.round_stats.Winner === team1Id) {
                        mScore1 = Math.max(Number(scoreParts[0]), Number(scoreParts[1])).toString();
                        mScore2 = Math.min(Number(scoreParts[0]), Number(scoreParts[1])).toString();
                    } else if (scoreParts.length === 2 && round.round_stats.Winner === team2Id) {
                        mScore2 = Math.max(Number(scoreParts[0]), Number(scoreParts[1])).toString();
                        mScore1 = Math.min(Number(scoreParts[0]), Number(scoreParts[1])).toString();
                    } else if (scoreParts.length === 2) {
                        mScore1 = scoreParts[0];
                        mScore2 = scoreParts[1];
                    }
                }
            }
            mapDetails.push({ name: mName, s1: mScore1, s2: mScore2 });
        });
    }

    let status = match.status === 'FINISHED' ? t.statusFinished : match.status === 'CANCELLED' ? t.statusCancelled : t.statusLive;

    // Picked map
    const pickedMap = match.voting?.map?.pick?.[0] || 'Unknown';
    // Picked location
    const pickedServer = match.voting?.location?.pick?.[0] || 'Unknown';

    // Roster rendering helper
    const renderRoster = (factionKey) => {
        let players = [];
        // from details if available (details/matches/match_id has roster full)
        if (details?.teams?.[factionKey]?.roster) {
            players = details.teams[factionKey].roster;
        } else if (match.teams?.[factionKey]?.roster) {
            players = match.teams[factionKey].roster;
        }

        if (!players || players.length === 0) return null;

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '15px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: '5px' }}>{t.players}</div>
                {players.map((p, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '10px' }}>
                        {p.avatar ? (
                            <>
                                <img src={p.avatar} alt={p.nickname} style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }} />
                                <div style={{ display: 'none', width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,107,0,0.2)', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'var(--primary-orange)', fontWeight: 'bold' }}>
                                    {p.nickname?.charAt(0)?.toUpperCase()}
                                </div>
                            </>
                        ) : (
                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,107,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'var(--primary-orange)', fontWeight: 'bold' }}>
                                {p.nickname?.charAt(0)?.toUpperCase()}
                            </div>
                        )}
                        <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#fff' }}>{p.nickname}</span>
                        {p.game_skill_level && (
                            <span style={{ marginLeft: 'auto', background: 'rgba(255,107,0,0.15)', color: 'var(--primary-orange)', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '900' }}>
                                lvl {p.game_skill_level}
                            </span>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'fadeIn 0.2s ease-out'
        }} onClick={onClose}>

            <style>
                {`
                    @keyframes slideUpModal {
                        from { transform: translateY(20px); opacity: 0; }
                        to { transform: translateY(0); opacity: 1; }
                    }
                `}
            </style>

            <div style={{
                background: 'var(--bg-dark)',
                width: '100%',
                maxWidth: '900px',
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.1)',
                overflow: 'hidden',
                animation: 'slideUpModal 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                display: 'flex',
                flexDirection: 'column',
                maxHeight: '90vh'
            }} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={{ padding: '20px 30px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <Activity size={24} color="var(--primary-orange)" />
                        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '900', color: '#fff' }}>{t.title}</h2>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: '5px' }}>
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: '30px', overflowY: 'auto' }}>

                    {/* Scoreboard */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginBottom: '40px', flexDirection: window.innerWidth < 640 ? 'column' : 'row' }}>

                        {/* Team 1 */}
                        <div style={{ flex: 1, textAlign: window.innerWidth < 640 ? 'left' : 'right', display: 'flex', alignItems: 'center', justifyContent: window.innerWidth < 640 ? 'center' : 'flex-end', flexDirection: window.innerWidth < 640 ? 'row-reverse' : 'row', gap: '15px', width: '100%' }}>
                            <span style={{ fontSize: '1.4rem', fontWeight: '900', color: '#fff', textAlign: window.innerWidth < 640 ? 'left' : 'right' }}>{team1Name}</span>
                            {match.teams?.faction1?.avatar ? (
                                <img src={match.teams.faction1.avatar} alt="Logo" style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover' }} onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }} />
                            ) : null}
                            <div style={{ display: match.teams?.faction1?.avatar ? 'none' : 'flex', width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,107,0,0.1)', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-orange)' }}>
                                <ShieldCheck size={24} />
                            </div>
                        </div>

                        {/* Score Center */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', minWidth: '150px' }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: '900', color: match.status === 'FINISHED' ? 'rgba(255,255,255,0.4)' : '#4ade80', textTransform: 'uppercase', background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '10px' }}>
                                {status}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(255,107,0,0.1)', border: '1px solid rgba(255,107,0,0.3)', padding: '10px 25px', borderRadius: '16px' }}>
                                <span style={{ fontSize: '2.5rem', fontWeight: '900', color: Number(score1) > Number(score2) ? 'var(--primary-orange)' : '#fff' }}>{score1}</span>
                                <span style={{ fontSize: '1.5rem', fontWeight: '900', color: 'rgba(255,255,255,0.3)' }}>:</span>
                                <span style={{ fontSize: '2.5rem', fontWeight: '900', color: Number(score2) > Number(score1) ? 'var(--primary-orange)' : '#fff' }}>{score2}</span>
                            </div>
                        </div>

                        {/* Team 2 */}
                        <div style={{ flex: 1, textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: window.innerWidth < 640 ? 'center' : 'flex-start', gap: '15px', width: '100%' }}>
                            {match.teams?.faction2?.avatar ? (
                                <img src={match.teams.faction2.avatar} alt="Logo" style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover' }} onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }} />
                            ) : null}
                            <div style={{ display: match.teams?.faction2?.avatar ? 'none' : 'flex', width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,107,0,0.1)', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-orange)' }}>
                                <ShieldCheck size={24} />
                            </div>
                            <span style={{ fontSize: '1.4rem', fontWeight: '900', color: '#fff', textAlign: 'left' }}>{team2Name}</span>
                        </div>

                    </div>

                    {/* Veto Info */}
                    <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexDirection: window.innerWidth < 640 ? 'column' : 'row' }}>
                        <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase' }}>
                                <MapIcon size={16} /> {t.map}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {(mapDetails.length > 0 ? mapDetails : [{ name: pickedMap, s1: '-', s2: '-' }]).map((m, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '8px' }}>
                                        <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#fff', textTransform: 'capitalize' }}>
                                            {m.name.replace('de_', '')}
                                        </div>
                                        {m.s1 !== '-' && m.s2 !== '-' && (
                                            <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--primary-orange)', display: 'flex', gap: '5px', alignItems: 'center', background: 'rgba(255,107,0,0.1)', padding: '2px 8px', borderRadius: '6px' }}>
                                                <span>{m.s1}</span> <span style={{ color: 'rgba(255,255,255,0.3)' }}>:</span> <span>{m.s2}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase' }}>
                                <Server size={16} /> {t.server}
                            </div>
                            <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#fff' }}>
                                {pickedServer}
                            </div>
                        </div>
                    </div>

                    {/* Check if loading detailed rosters */}
                    {loading ? (
                        <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', color: 'rgba(255,255,255,0.5)' }}>
                            <Loader2 size={32} className="animate-spin" color="var(--primary-orange)" />
                            <div style={{ fontWeight: '800' }}>{t.loading}</div>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr', gap: '30px' }}>
                            <div>{renderRoster('faction1')}</div>
                            <div>{renderRoster('faction2')}</div>
                        </div>
                    )}
                </div>

                {match.faceit_url && (
                    <div style={{ padding: '20px 30px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'flex-end' }}>
                        <a href={match.faceit_url.replace('{lang}', 'en')} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', background: 'var(--primary-orange)', color: '#fff', padding: '12px 24px', borderRadius: '12px', fontWeight: '900', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.3s' }}>
                            Open on FACEIT
                        </a>
                    </div>
                )}
            </div>
        </div >
    );
};

export default MatchModal;
