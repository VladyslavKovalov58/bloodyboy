import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Save, LogOut, Link as LinkIcon, Trophy, Settings, Loader2, CheckCircle, Flame, Copy, Bell, Send } from 'lucide-react';
import { sendTournamentToDiscord, sendTournamentResultsToDiscord } from '../services/discord';

const AdminDashboard = ({ onLogout, language = 'ru' }) => {
    const [activeTab, setActiveTab] = useState('general');
    const [config, setConfig] = useState({});
    const [tournaments, setTournaments] = useState([]);
    const [bonuses, setBonuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null);
    const [editingTournament, setEditingTournament] = useState(null);
    const [editingBonus, setEditingBonus] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [isAddingBonus, setIsAddingBonus] = useState(false);
    const [pushingId, setPushingId] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const { data: configData } = await supabase.from('site_config').select('*');
        const { data: tournamentData } = await supabase.from('tournaments').select('*').order('created_at', { ascending: false });
        const { data: bonusData } = await supabase.from('bonuses').select('*').order('order_index', { ascending: true });

        const configObj = {};
        configData?.forEach(item => {
            configObj[item.id] = item.value;
        });

        setConfig(configObj);
        setTournaments(tournamentData || []);
        setBonuses(bonusData || []);
        setLoading(false);
    };

    const handleSaveConfig = async (e) => {
        e.preventDefault();
        setSaving(true);
        setSaveStatus(null);

        const updates = Object.entries(config).map(([id, value]) => ({ id, value }));
        const { error } = await supabase.from('site_config').upsert(updates);

        if (!error) {
            setSaveStatus('success');
            setTimeout(() => setSaveStatus(null), 3000);
        }
        setSaving(false);
    };

    const handleSaveTournament = async (e) => {
        e.preventDefault();
        setSaving(true);

        const tData = editingTournament;
        const { error } = await supabase.from('tournaments').upsert(tData);

        if (!error) {
            setEditingTournament(null);
            setIsAdding(false);
            fetchData();
        } else {
            alert('Error saving tournament: ' + error.message);
        }
        setSaving(false);
    };

    const handleDeleteTournament = async (id) => {
        if (!window.confirm('Are you sure you want to delete this tournament?')) return;

        const { error } = await supabase.from('tournaments').delete().eq('id', id);
        if (!error) {
            fetchData();
        }
    };

    const handleSaveBonus = async (e) => {
        e.preventDefault();
        setSaving(true);

        const { error } = await supabase.from('bonuses').upsert(editingBonus);

        if (!error) {
            setEditingBonus(null);
            setIsAddingBonus(false);
            fetchData();
        } else {
            alert('Error saving bonus: ' + error.message);
        }
        setSaving(false);
    };

    const handleDeleteBonus = async (id) => {
        if (!window.confirm('Are you sure you want to delete this bonus?')) return;

        const { error } = await supabase.from('bonuses').delete().eq('id', id);
        if (!error) {
            fetchData();
        }
    };

    const handlePushToDiscord = async (tournament) => {
        setPushingId(tournament.id);
        const success = await sendTournamentToDiscord(tournament);
        if (success) {
            alert('Уведомление успешно отправлено в Discord!');
        } else {
            alert('Ошибка при отправке уведомления в Discord. Проверьте консоль или .env.');
        }
        setPushingId(null);
    };

    const handlePushResultsToDiscord = async (tournament) => {
        if (!tournament.winner_1) {
            alert('Сначала укажите хотя бы победителя за 1-е место!');
            return;
        }
        setPushingId(`results-${tournament.id}`);
        const success = await sendTournamentResultsToDiscord(tournament);
        if (success) {
            alert('Результаты успешно отправлены в специальный канал Discord!');
        } else {
            alert('Ошибка при отправке результатов в Discord. Проверьте консоль или .env.');
        }
        setPushingId(null);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        onLogout();
    };

    const emptyTournament = {
        title: '',
        date: '',
        target_date: '',
        prize_pool: '',
        format: '',
        type: 'FUN CUP',
        joined_count: '',
        image_url: '',
        link: '',
        brief_description: '',
        full_description: '',
        rules: '',
        sponsor_name: '',
        sponsor_icon: '',
        sponsor_link: '',
        winner_1: '',
        winner_1_prize: '',
        winner_2: '',
        winner_2_prize: '',
        winner_3: '',
        winner_3_prize: '',
        is_active: true
    };

    const emptyBonus = {
        site_name: '',
        offer: '',
        promo: '',
        link: '',
        color: '#FF9500',
        order_index: 0,
        is_active: true
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)' }}>
                <Loader2 size={40} className="animate-spin" color="var(--primary-orange)" />
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', color: '#fff' }}>
            {/* Header */}
            <header style={{
                padding: '20px 40px',
                background: 'var(--bg-sidebar)',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        background: 'var(--primary-orange)',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Settings size={24} color="#fff" />
                    </div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Admin Dashboard</h1>
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                    <button
                        onClick={() => window.open('/', '_blank')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'rgba(255,107,0,0.1)',
                            border: '1px solid rgba(255,107,0,0.2)',
                            padding: '10px 20px',
                            borderRadius: '10px',
                            color: 'var(--primary-orange)',
                            cursor: 'pointer',
                            fontWeight: '600'
                        }}
                    >
                        View Site
                    </button>
                    <button onClick={handleLogout} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        padding: '10px 20px',
                        borderRadius: '10px',
                        color: '#fff',
                        cursor: 'pointer',
                        fontWeight: '600'
                    }}>
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </header>

            <div style={{ display: 'flex', padding: '40px', gap: '40px' }}>
                {/* Sidebar Navigation */}
                <nav style={{ width: '250px', display: 'flex', flexDirection: 'column', gap: '10px', height: 'fit-content', position: 'sticky', top: '120px' }}>
                    <button
                        onClick={() => setActiveTab('general')}
                        style={{
                            padding: '15px 20px',
                            textAlign: 'left',
                            borderRadius: '12px',
                            background: activeTab === 'general' ? 'var(--primary-orange)' : 'rgba(255,255,255,0.03)',
                            border: '1px solid transparent',
                            color: '#fff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            fontWeight: '600',
                            transition: 'all 0.2s'
                        }}
                    >
                        <LinkIcon size={20} /> General Links
                    </button>
                    <button
                        onClick={() => setActiveTab('tournaments')}
                        style={{
                            padding: '15px 20px',
                            textAlign: 'left',
                            borderRadius: '12px',
                            background: activeTab === 'tournaments' ? 'var(--primary-orange)' : 'rgba(255,255,255,0.03)',
                            border: '1px solid transparent',
                            color: '#fff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            fontWeight: '600',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Trophy size={20} /> Tournaments
                    </button>
                    <button
                        onClick={() => setActiveTab('bonuses')}
                        style={{
                            padding: '15px 20px',
                            textAlign: 'left',
                            borderRadius: '12px',
                            background: activeTab === 'bonuses' ? 'var(--primary-orange)' : 'rgba(255,255,255,0.03)',
                            border: '1px solid transparent',
                            color: '#fff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            fontWeight: '600',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Settings size={20} /> Casino Bonuses
                    </button>
                </nav>

                {/* Content Area */}
                <main style={{ flex: 1, background: 'var(--bg-card)', borderRadius: '24px', padding: '40px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    {activeTab === 'general' && (
                        <section className="animate-fade-in">
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '30px', fontWeight: '800' }}>General Site Settings</h2>
                            <form onSubmit={handleSaveConfig} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                                <h3 style={{ color: 'var(--primary-orange)', marginBottom: '15px', fontSize: '1.1rem' }}>Personal Socials (BloodyBoy)</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '30px', background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div>
                                        <label style={labelStyle}>Personal Telegram Chat</label>
                                        <input
                                            type="text"
                                            placeholder="https://t.me/chat..."
                                            value={config.tg_chat || ''}
                                            onChange={(e) => setConfig({ ...config, tg_chat: e.target.value })}
                                            style={inputStyle}
                                        />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Personal Telegram Group</label>
                                        <input
                                            type="text"
                                            placeholder="https://t.me/channel..."
                                            value={config.tg_group || ''}
                                            onChange={(e) => setConfig({ ...config, tg_group: e.target.value })}
                                            style={inputStyle}
                                        />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Kick Stream URL</label>
                                        <input
                                            type="text"
                                            placeholder="https://kick.com/username..."
                                            value={config.kick_link || ''}
                                            onChange={(e) => setConfig({ ...config, kick_link: e.target.value })}
                                            style={inputStyle}
                                        />
                                    </div>
                                </div>

                                <h3 style={{ color: 'var(--primary-orange)', marginBottom: '15px', fontSize: '1.1rem' }}>Community Socials (Tiger)</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div>
                                        <label style={labelStyle}>Community Telegram Group</label>
                                        <input
                                            type="text"
                                            placeholder="https://t.me/..."
                                            value={config.community_tg || ''}
                                            onChange={(e) => setConfig({ ...config, community_tg: e.target.value })}
                                            style={inputStyle}
                                        />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Discord Invite URL</label>
                                        <input
                                            type="text"
                                            placeholder="https://discord.gg/..."
                                            value={config.discord_link || ''}
                                            onChange={(e) => setConfig({ ...config, discord_link: e.target.value })}
                                            style={inputStyle}
                                        />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Faceit Hub URL</label>
                                        <input
                                            type="text"
                                            placeholder="https://www.faceit.com/..."
                                            value={config.faceit_link || ''}
                                            onChange={(e) => setConfig({ ...config, faceit_link: e.target.value })}
                                            style={inputStyle}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    style={submitButtonStyle}
                                >
                                    {saving ? <Loader2 size={20} className="animate-spin" /> : (saveStatus === 'success' ? <CheckCircle size={20} /> : <Save size={20} />)}
                                    {saveStatus === 'success' ? 'Saved Successfully' : 'Save General Settings'}
                                </button>
                            </form>
                        </section>
                    )}

                    {activeTab === 'tournaments' && (
                        <section className="animate-fade-in">
                            {(editingTournament || isAdding) ? (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                                        <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>{isAdding ? 'Add New Tournament' : 'Edit Tournament'}</h2>
                                        <button onClick={() => { setEditingTournament(null); setIsAdding(false); }} style={cancelButtonStyle}>Cancel</button>
                                    </div>

                                    <form onSubmit={handleSaveTournament} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <label style={labelStyle}>Tournament Title</label>
                                            <input required type="text" value={editingTournament?.title || ''} onChange={(e) => setEditingTournament({ ...editingTournament, title: e.target.value })} style={inputStyle} />
                                        </div>

                                        <div>
                                            <label style={labelStyle}>Display Date (e.g. 27.03.2026)</label>
                                            <input required type="text" value={editingTournament?.date || ''} onChange={(e) => setEditingTournament({ ...editingTournament, date: e.target.value })} style={inputStyle} />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Countdown Date (ISO Format: 2026-03-27T18:00:00)</label>
                                            <input type="text" value={editingTournament?.target_date || ''} onChange={(e) => setEditingTournament({ ...editingTournament, target_date: e.target.value })} style={inputStyle} />
                                        </div>

                                        <div>
                                            <label style={labelStyle}>Prize Pool</label>
                                            <input type="text" value={editingTournament?.prize_pool || ''} onChange={(e) => setEditingTournament({ ...editingTournament, prize_pool: e.target.value })} style={inputStyle} />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Format (e.g. Wingmans, 5v5)</label>
                                            <input type="text" value={editingTournament?.format || ''} onChange={(e) => setEditingTournament({ ...editingTournament, format: e.target.value })} style={inputStyle} />
                                        </div>

                                        <div>
                                            <label style={labelStyle}>Type (e.g. FUN CUP, MAJOR)</label>
                                            <input type="text" value={editingTournament?.type || ''} onChange={(e) => setEditingTournament({ ...editingTournament, type: e.target.value })} style={inputStyle} />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Participants (e.g. 12/32)</label>
                                            <input type="text" value={editingTournament?.joined_count || ''} onChange={(e) => setEditingTournament({ ...editingTournament, joined_count: e.target.value })} style={inputStyle} />
                                        </div>

                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <label style={labelStyle}>Image URL</label>
                                            <input type="text" value={editingTournament?.image_url || ''} onChange={(e) => setEditingTournament({ ...editingTournament, image_url: e.target.value })} style={inputStyle} />
                                        </div>

                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <label style={labelStyle}>Registration Link</label>
                                            <input type="text" value={editingTournament?.link || ''} onChange={(e) => setEditingTournament({ ...editingTournament, link: e.target.value })} style={inputStyle} />
                                        </div>

                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <label style={labelStyle}>Brief Description</label>
                                            <textarea value={editingTournament?.brief_description || ''} onChange={(e) => setEditingTournament({ ...editingTournament, brief_description: e.target.value })} style={{ ...inputStyle, height: '80px', resize: 'vertical' }} />
                                        </div>

                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <label style={labelStyle}>Full Description</label>
                                            <textarea value={editingTournament?.full_description || ''} onChange={(e) => setEditingTournament({ ...editingTournament, full_description: e.target.value })} style={{ ...inputStyle, height: '120px', resize: 'vertical' }} />
                                        </div>

                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <label style={labelStyle}>Rules</label>
                                            <textarea value={editingTournament?.rules || ''} onChange={(e) => setEditingTournament({ ...editingTournament, rules: e.target.value })} style={{ ...inputStyle, height: '100px', resize: 'vertical' }} />
                                        </div>

                                        <div>
                                            <label style={labelStyle}>Sponsor Name</label>
                                            <input type="text" value={editingTournament?.sponsor_name || ''} onChange={(e) => setEditingTournament({ ...editingTournament, sponsor_name: e.target.value })} style={inputStyle} />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Sponsor Link</label>
                                            <input type="text" value={editingTournament?.sponsor_link || ''} onChange={(e) => setEditingTournament({ ...editingTournament, sponsor_link: e.target.value })} style={inputStyle} />
                                        </div>
                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <h3 style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px', marginTop: '10px', color: 'var(--primary-orange)', fontSize: '1rem', marginBottom: '15px' }}>Tournament Winners (Top 3)</h3>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                    <div>
                                                        <label style={labelStyle}>🥇 1st Place (Winner)</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Player or Team name"
                                                            value={editingTournament?.winner_1 || ''}
                                                            onChange={(e) => setEditingTournament({ ...editingTournament, winner_1: e.target.value })}
                                                            style={inputStyle}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label style={labelStyle}>💰 1st Place Prize</label>
                                                        <input
                                                            type="text"
                                                            placeholder="$500 / 1000 FS / etc."
                                                            value={editingTournament?.winner_1_prize || ''}
                                                            onChange={(e) => setEditingTournament({ ...editingTournament, winner_1_prize: e.target.value })}
                                                            style={inputStyle}
                                                        />
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                    <div>
                                                        <label style={labelStyle}>🥈 2nd Place</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Player or Team name"
                                                            value={editingTournament?.winner_2 || ''}
                                                            onChange={(e) => setEditingTournament({ ...editingTournament, winner_2: e.target.value })}
                                                            style={inputStyle}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label style={labelStyle}>💰 2nd Place Prize</label>
                                                        <input
                                                            type="text"
                                                            placeholder="$300 / 500 FS / etc."
                                                            value={editingTournament?.winner_2_prize || ''}
                                                            onChange={(e) => setEditingTournament({ ...editingTournament, winner_2_prize: e.target.value })}
                                                            style={inputStyle}
                                                        />
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                    <div>
                                                        <label style={labelStyle}>🥉 3rd Place</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Player or Team name"
                                                            value={editingTournament?.winner_3 || ''}
                                                            onChange={(e) => setEditingTournament({ ...editingTournament, winner_3: e.target.value })}
                                                            style={inputStyle}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label style={labelStyle}>💰 3rd Place Prize</label>
                                                        <input
                                                            type="text"
                                                            placeholder="$100 / 200 FS / etc."
                                                            value={editingTournament?.winner_3_prize || ''}
                                                            onChange={(e) => setEditingTournament({ ...editingTournament, winner_3_prize: e.target.value })}
                                                            style={inputStyle}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <label style={labelStyle}>Sponsor Icon URL</label>
                                            <input type="text" value={editingTournament?.sponsor_icon || ''} onChange={(e) => setEditingTournament({ ...editingTournament, sponsor_icon: e.target.value })} style={inputStyle} />
                                        </div>

                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <label style={labelStyle}>Tournament Status</label>
                                            <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingTournament({ ...editingTournament, is_active: true })}
                                                    style={{
                                                        flex: 1,
                                                        padding: '15px',
                                                        borderRadius: '12px',
                                                        border: '1px solid',
                                                        borderColor: editingTournament?.is_active ? 'var(--primary-orange)' : 'rgba(255,255,255,0.1)',
                                                        background: editingTournament?.is_active ? 'rgba(255,107,0,0.1)' : 'rgba(255,255,255,0.02)',
                                                        color: editingTournament?.is_active ? 'var(--primary-orange)' : 'rgba(255,255,255,0.4)',
                                                        fontWeight: '800',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.3s',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '8px'
                                                    }}
                                                >
                                                    <Flame size={18} />
                                                    {language === 'ru' ? 'Активный' : 'Active'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingTournament({ ...editingTournament, is_active: false })}
                                                    style={{
                                                        flex: 1,
                                                        padding: '15px',
                                                        borderRadius: '12px',
                                                        border: '1px solid',
                                                        borderColor: !editingTournament?.is_active ? '#4ade80' : 'rgba(255,255,255,0.1)',
                                                        background: !editingTournament?.is_active ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.02)',
                                                        color: !editingTournament?.is_active ? '#4ade80' : 'rgba(255,255,255,0.4)',
                                                        fontWeight: '800',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.3s',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '8px'
                                                    }}
                                                >
                                                    <Trophy size={18} />
                                                    {language === 'ru' ? 'Завершенный' : 'Finished'}
                                                </button>
                                            </div>
                                        </div>

                                        <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
                                            <button type="submit" disabled={saving} style={submitButtonStyle}>
                                                {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                                                Save Tournament
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            ) : (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                                        <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Manage Tournaments</h2>
                                        <button
                                            onClick={() => { setIsAdding(true); setEditingTournament(emptyTournament); }}
                                            style={{ background: 'var(--primary-orange)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: '750', cursor: 'pointer', boxShadow: '0 4px 15px rgba(255,107,0,0.3)' }}
                                        >
                                            + Add New Tournament
                                        </button>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        {tournaments.map(t => (
                                            <div key={t.id} style={{
                                                padding: '24px',
                                                background: 'rgba(255,255,255,0.03)',
                                                borderRadius: '20px',
                                                border: '1px solid rgba(255,255,255,0.05)',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                transition: 'transform 0.2s ease'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                                    <div style={{ width: '60px', height: '60px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                                                        {t.image_url && <img src={t.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                                    </div>
                                                    <div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                                                            <div style={{ fontWeight: '800', fontSize: '1.2rem' }}>{t.title}</div>
                                                            <div style={{
                                                                padding: '4px 10px',
                                                                borderRadius: '6px',
                                                                fontSize: '0.7rem',
                                                                fontWeight: '800',
                                                                textTransform: 'uppercase',
                                                                background: t.is_active ? 'rgba(255,107,0,0.1)' : 'rgba(74,222,128,0.1)',
                                                                color: t.is_active ? 'var(--primary-orange)' : '#4ade80',
                                                                border: `1px solid ${t.is_active ? 'rgba(255,107,0,0.2)' : 'rgba(74,222,128,0.2)'}`
                                                            }}>
                                                                {t.is_active ? (language === 'ru' ? 'Активный' : 'Active') : (language === 'ru' ? 'Завершен' : 'Finished')}
                                                            </div>
                                                        </div>
                                                        <div style={{ color: 'var(--text-dim)', fontSize: '0.9rem', display: 'flex', gap: '15px' }}>
                                                            <span>📅 {t.date}</span>
                                                            <span>💰 {t.prize_pool}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    <button
                                                        onClick={() => handlePushToDiscord(t)}
                                                        disabled={pushingId === t.id}
                                                        title="Push Announcement to Discord"
                                                        style={{
                                                            background: 'rgba(255, 107, 0, 0.1)',
                                                            border: '1px solid rgba(255, 107, 0, 0.2)',
                                                            color: 'var(--primary-orange)',
                                                            padding: '10px',
                                                            borderRadius: '10px',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            opacity: pushingId === t.id ? 0.5 : 1
                                                        }}
                                                    >
                                                        {pushingId === t.id ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                                    </button>
                                                    <button
                                                        onClick={() => handlePushResultsToDiscord(t)}
                                                        disabled={pushingId === `results-${t.id}`}
                                                        title="Push Results to Discord"
                                                        style={{
                                                            background: 'rgba(88, 101, 242, 0.1)',
                                                            border: '1px solid rgba(88, 101, 242, 0.2)',
                                                            color: '#5865F2',
                                                            padding: '10px',
                                                            borderRadius: '10px',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            opacity: pushingId === `results-${t.id}` ? 0.5 : 1
                                                        }}
                                                    >
                                                        {pushingId === `results-${t.id}` ? <Loader2 size={18} className="animate-spin" /> : <Bell size={18} />}
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            const { id, created_at, ...copyData } = t;
                                                            setEditingTournament({ ...copyData, title: `${t.title} (Copy)` });
                                                            setIsAdding(true);
                                                        }}
                                                        title="Copy Tournament"
                                                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                    >
                                                        <Copy size={18} />
                                                    </button>
                                                    <button onClick={() => { setEditingTournament(t); setIsAdding(false); }} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}>Edit</button>
                                                    <button onClick={() => handleDeleteTournament(t.id)} style={{ background: 'rgba(255, 68, 68, 0.1)', border: '1px solid rgba(255, 68, 68, 0.2)', color: '#ff4444', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}>Delete</button>
                                                </div>
                                            </div>
                                        ))}
                                        {tournaments.length === 0 && (
                                            <div style={{ textAlign: 'center', padding: '80px 40px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                                <Trophy size={48} style={{ marginBottom: '20px', opacity: 0.1 }} />
                                                <div style={{ color: 'var(--text-dim)', fontSize: '1.1rem' }}>No tournaments found. Create your first one!</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </section>
                    )}

                    {activeTab === 'bonuses' && (
                        <section className="animate-fade-in">
                            {(editingBonus || isAddingBonus) ? (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                                        <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>{isAddingBonus ? 'Add New Bonus' : 'Edit Bonus'}</h2>
                                        <button onClick={() => { setEditingBonus(null); setIsAddingBonus(false); }} style={cancelButtonStyle}>Cancel</button>
                                    </div>

                                    <form onSubmit={handleSaveBonus} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div>
                                            <label style={labelStyle}>Casino Name</label>
                                            <input required type="text" value={editingBonus?.site_name || ''} onChange={(e) => setEditingBonus({ ...editingBonus, site_name: e.target.value })} style={inputStyle} />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Offer (e.g. 100% + 250 FS)</label>
                                            <input required type="text" value={editingBonus?.offer || ''} onChange={(e) => setEditingBonus({ ...editingBonus, offer: e.target.value })} style={inputStyle} />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Promo Code</label>
                                            <input type="text" value={editingBonus?.promo || ''} onChange={(e) => setEditingBonus({ ...editingBonus, promo: e.target.value })} style={inputStyle} />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Referral Link</label>
                                            <input required type="text" value={editingBonus?.link || ''} onChange={(e) => setEditingBonus({ ...editingBonus, link: e.target.value })} style={inputStyle} />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Brand Color (Hex or Gradient)</label>
                                            <input type="text" value={editingBonus?.color || ''} onChange={(e) => setEditingBonus({ ...editingBonus, color: e.target.value })} style={inputStyle} />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Sort Order</label>
                                            <input type="number" value={editingBonus?.order_index || 0} onChange={(e) => setEditingBonus({ ...editingBonus, order_index: parseInt(e.target.value) })} style={inputStyle} />
                                        </div>

                                        <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '12px' }}>
                                            <input
                                                type="checkbox"
                                                id="bonus-active"
                                                checked={editingBonus?.is_active ?? true}
                                                onChange={(e) => setEditingBonus({ ...editingBonus, is_active: e.target.checked })}
                                                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                            />
                                            <label htmlFor="bonus-active" style={{ cursor: 'pointer', fontWeight: '700', fontSize: '1rem' }}>Bonus Active (If unchecked, hidden from site)</label>
                                        </div>

                                        <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
                                            <button type="submit" disabled={saving} style={submitButtonStyle}>
                                                {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                                                Save Bonus
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            ) : (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                                        <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Manage Bonuses</h2>
                                        <button
                                            onClick={() => { setIsAddingBonus(true); setEditingBonus(emptyBonus); }}
                                            style={{ background: 'var(--primary-orange)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: '750', cursor: 'pointer', boxShadow: '0 4px 15px rgba(255,107,0,0.3)' }}
                                        >
                                            + Add New Bonus
                                        </button>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        {bonuses.map(b => (
                                            <div key={b.id} style={{
                                                padding: '24px',
                                                background: 'rgba(255,255,255,0.03)',
                                                borderRadius: '20px',
                                                border: '1px solid rgba(255,255,255,0.05)',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                                    <div style={{ width: '12px', height: '40px', borderRadius: '4px', background: b.color }}></div>
                                                    <div>
                                                        <div style={{ fontWeight: '800', fontSize: '1.2rem', marginBottom: '5px' }}>{b.site_name}</div>
                                                        <div style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>{b.offer} • Promo: {b.promo}</div>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    <button onClick={() => setEditingBonus(b)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer' }}>Edit</button>
                                                    <button onClick={() => handleDeleteBonus(b.id)} style={{ background: 'rgba(255, 68, 68, 0.1)', border: '1px solid rgba(255, 68, 68, 0.2)', color: '#ff4444', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer' }}>Delete</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </section>
                    )}
                </main>
            </div>

            <style>{`
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .animate-fade-in { animation: fadeIn 0.4s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div >
    );
};

const labelStyle = {
    display: 'block',
    color: 'rgba(255,255,255,0.4)',
    fontSize: '0.85rem',
    marginBottom: '10px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '1px'
};

const inputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '14px',
    padding: '16px',
    color: '#fff',
    fontSize: '1rem',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 0.2s',
    fontFamily: 'inherit'
};

const submitButtonStyle = {
    alignSelf: 'flex-start',
    background: 'var(--primary-orange)',
    color: '#fff',
    border: 'none',
    padding: '16px 32px',
    borderRadius: '14px',
    fontSize: '1rem',
    fontWeight: '800',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    boxShadow: '0 10px 25px rgba(255,107,0,0.3)',
    transition: 'all 0.3s'
};

const cancelButtonStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff',
    padding: '10px 20px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '600'
};

export default AdminDashboard;
