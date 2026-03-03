import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { sendTournamentToDiscord, sendTournamentResultsToDiscord } from '../services/discord';
import { sendTelegramTournamentReminder } from '../services/telegram';
import { fetchChampionshipDetails, extractChampionshipId, fetchChampionshipResults } from '../services/faceit';
import { Save, LogOut, Link as LinkIcon, Trophy, Settings, Loader2, CheckCircle, Flame, Copy, Bell, Send, Gamepad2, Trash2, Eye, EyeOff, RefreshCw, BellRing, ShieldCheck } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { translations } from '../translations';
const CS2_MAPS = ['de_mirage', 'de_nuke', 'de_inferno', 'de_dust2', 'de_ancient', 'de_anubis', 'de_vertigo', 'de_overpass', 'de_train', 'cs_office', 'cs_italy'];

const AdminDashboard = ({ onLogout, language = 'ru' }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'general';

    const t = translations[language];
    const ad = t.admin;

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const isMobile = windowWidth < 768;

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const setActiveTab = (tab) => {
        setSearchParams({ tab });
    };

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
    const [donationHistory, setDonationHistory] = useState([]);
    const [loadingDonations, setLoadingDonations] = useState(false);
    const [donationFilter, setDonationFilter] = useState('all'); // 'all' or 'today'
    const [slots, setSlots] = useState([]);
    const [editingSlot, setEditingSlot] = useState(null);
    const [isAddingSlot, setIsAddingSlot] = useState(false);
    const [restoringSlots, setRestoringSlots] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const { data: configData } = await supabase.from('site_config').select('*');
        const { data: tournamentData } = await supabase.from('tournaments').select('*').order('created_at', { ascending: false });
        const { data: bonusData } = await supabase.from('bonuses').select('*').order('order_index', { ascending: true });
        const { data: slotData } = await supabase.from('slots').select('*').order('order_index', { ascending: true });

        const configObj = {};
        configData?.forEach(item => {
            configObj[item.id] = item.value;
        });

        setConfig(configObj);
        setTournaments(tournamentData || []);
        setBonuses(bonusData || []);
        setSlots(slotData || []);
        setLoading(false);
    };

    const fetchDonations = async () => {
        setLoadingDonations(true);
        try {
            const { getDepositAddress, signedRequest } = await import('../services/whitebit');
            const tickers = ['BTC', 'USDT', 'TRX', 'TON'];
            const allRecords = [];

            for (const ticker of tickers) {
                const response = await signedRequest('main-account/history', {
                    ticker,
                    limit: 10,
                    offset: 0,
                    transactionMethod: 1
                });

                if (response?.records) {
                    // Method 1 is deposit, 2 is withdrawal according to WhiteBIT API
                    const depositsOnly = response.records.filter(r => r.method === 1);
                    allRecords.push(...depositsOnly);
                }
            }

            // Sort by createdAt descending
            const sorted = allRecords.sort((a, b) => b.createdAt - a.createdAt);
            setDonationHistory(sorted);
        } catch (err) {
            console.error('Failed to fetch donations:', err);
        } finally {
            setLoadingDonations(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'donations') {
            fetchDonations();
        }
    }, [activeTab]);

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
            let msg = 'Error saving tournament: ' + error.message;
            if (error.message.includes('brief_description_ua')) {
                msg += '\n\nIMPORTANT: You need to add Ukrainian columns to your database. Run this in Supabase SQL Editor:\nALTER TABLE tournaments ADD COLUMN brief_description_ua TEXT, ADD COLUMN full_description_ua TEXT, ADD COLUMN rules_ua TEXT;';
            }
            alert(msg);
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

    const handleSaveSlot = async (e) => {
        e.preventDefault();
        setSaving(true);

        const { error } = await supabase.from('slots').upsert(editingSlot);

        if (!error) {
            setEditingSlot(null);
            setIsAddingSlot(false);
            fetchData();
        } else {
            alert('Error saving slot: ' + error.message);
        }
        setSaving(false);
    };

    const handleDeleteSlot = async (id) => {
        if (!window.confirm('Are you sure you want to delete this slot?')) return;

        const { error } = await supabase.from('slots').delete().eq('id', id);
        if (!error) {
            fetchData();
        }
    };

    const handleRestoreSlots = async () => {
        if (!window.confirm('Restore initial slots from hardcoded list? This will add 20 slots if they are missing.')) return;
        setRestoringSlots(true);

        const initialSlots = [
            { name: 'Wild Bounty Showdown', image_url: 'https://i.ibb.co/4nBDdn4k/image.png', has_demo: true, link: 'https://m.eajzzxhro.com/135/index.html?ot=ca7094186b309ee149c55c8822e7ecf2&l=en&btt=2&or=21novodx%3Dzveuuscmj%3Dxjh&__hv=2fMEQCICuqoNGFMML4fGBdQE%2BkWN6hW4%2FfORGq%2Fnk1ZEMnawwmAiAxGYxJjOCWQZyBSVILpJeMljpfcPHLJNuUZN5itlB12A%3D%3D&__sv=010401YytG6oT6vOl81kKt_NDwR6QjynyruQC7y9kpWiV7QEg', provider: 'PG SOFT', rtp: '96.65%', category: 'popular', order_index: 1 },
            { name: 'Le Bandit', image_url: 'https://i.ibb.co/BW872rX/image-16.webp', has_demo: true, link: 'https://static-live.hacksawgaming.com/1309/1.22.0/index.html?language=en&channel=desktop&gameid=1309&mode=2&token=123131&lobbyurl=https%3A%2F%2Fwww.hacksawgaming.com&currency=EUR&partner=demo&env=https://rgs-demo.hacksawgaming.com/api&realmoneyenv=https://rgs-demo.hacksawgaming.com/api', provider: 'Hacksaw', rtp: '96.34%', category: 'popular', order_index: 2 },
            { name: 'The Dog House', image_url: 'https://i.ibb.co/Sws7s64r/image-15.webp', has_demo: true, link: 'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?gameSymbol=vs20doghouse&lang=ru&cur=USD&playMode=demo', provider: 'Pragmatic Play', rtp: '96.08%', category: 'popular', order_index: 3 },
            { name: 'Gates of Olympus 1000', image_url: 'https://i.ibb.co/Z18Xgvwn/image.png', has_demo: true, link: 'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?gameSymbol=vs20olympx&lang=ru&cur=USD&playMode=demo', provider: 'Pragmatic Play', rtp: '96.50%', category: 'popular', order_index: 4 },
            { name: 'Starlight Princess 1000', image_url: 'https://i.ibb.co/m5qvPjB3/image-14.webp', has_demo: true, link: 'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?gameSymbol=vs20starlightx&lang=ru&cur=USD&playMode=demo', provider: 'Pragmatic Play', rtp: '96.50%', category: 'popular', order_index: 5 },
            { name: 'Sugar Rush', image_url: 'https://i.ibb.co/Y7fGVsHz/image-13.webp', has_demo: true, link: 'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?gameSymbol=vs20sugarrush&lang=ru&cur=USD&playMode=demo', provider: 'Pragmatic Play', rtp: '96.50%', category: 'popular', order_index: 6 },
            { name: 'Le Fisherman', image_url: 'https://i.ibb.co/qYYBwJgZ/image-12.webp', has_demo: true, link: 'https://static-live.hacksawgaming.com/2057/1.19.1/index.html?language=en&channel=desktop&gameid=2057&mode=2&token=123&partner=demo&env=https://rgs-demo.hacksawgaming.com/api&realmoneyenv=https://rgs-demo.hacksawgaming.com/api&alwaysredirect=true', provider: 'Hacksaw', rtp: '96.33%', category: 'popular', order_index: 7 },
            { name: 'Lucky Penny 2', image_url: 'https://i.ibb.co/7tvPSyGk/image-11.webp', has_demo: true, link: 'https://3oaks.com/api/v1/games/lucky_penny_2/play?lang=en', provider: '3Oaks', rtp: '96.45%', category: 'popular', order_index: 8 },
            { name: 'Wild Bandito', image_url: 'https://i.ibb.co/V0Wtmffn/image-10.webp', has_demo: true, link: 'https://m.eajzzxhro.com/104/index.html?ot=ca7094186b309ee149c55c8822e7ecf2&l=en&btt=2&ao=06gvo%3Doimdff3kr%3Dius&or=19lmtmbv%3Dxtcssqakh%3Dvhf&__hv=2fMEUCIQDPTuHaeIhp%2BPPYu0pYjv1XRGDd2sfi7BUF4wEtlhPemAIgEJ%2BI5%2BfuP8tTXqhceqcJETEimZ6GtC%2FL97ihSN3JgPE%3D&__sv=010401YytG6oT6vOl81kKt_NDwR6QjynyruQC7y9kpWiV7QEg', provider: 'PG Soft', rtp: '96.73%', category: 'popular', order_index: 9 },
            { name: 'SixSixSix', image_url: 'https://i.ibb.co/j9ZSyrHd/image-9.webp', has_demo: true, link: 'https://static-live.hacksawgaming.com/1534/1.37.1/index.html?language=en&channel=desktop&gameid=1534&mode=2&token=123&partner=demo&env=https://rgs-demo.hacksawgaming.com/api&realmoneyenv=https://rgs-demo.hacksawgaming.com/api&alwaysredirect=true', provider: 'Hacksaw', rtp: '96.15%', category: 'popular', order_index: 10 },
            { name: 'RIP City', image_url: 'https://i.ibb.co/VppHTd61/image-8.webp', has_demo: true, link: 'https://static-live.hacksawgaming.com/1233/1.33.2/index.html?language=en&channel=desktop&gameid=1233&mode=2&token=123&partner=demo&env=https://rgs-demo.hacksawgaming.com/api&realmoneyenv=https://rgs-demo.hacksawgaming.com/api&alwaysredirect=true', provider: 'Hacksaw', rtp: '96.22%', category: 'popular', order_index: 11 },
            { name: 'Zeus vs Hades Gods of War 250', image_url: 'https://i.ibb.co/fdfMCcsn/image-7.webp', has_demo: true, link: 'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?gameSymbol=vs15zeushadseq&lang=ru&cur=USD&playMode=demo', provider: 'Pragmatic Play', rtp: '96.56%', category: 'popular', order_index: 12 },
            { name: 'Le Rapper', image_url: 'https://i.ibb.co/xtNsdZKc/image-6.webp', has_demo: true, link: 'https://static-live.hacksawgaming.com/2155/1.0.2/index.html?language=en&channel=desktop&gameid=2155&mode=2&token=123&partner=demo&env=https://rgs-demo.hacksawgaming.com/api&realmoneyenv=https://rgs-demo.hacksawgaming.com/api&alwaysredirect=true', provider: 'Hacksaw', rtp: '96.34%', category: 'soon', order_index: 13 },
            { name: 'Le Bunny', image_url: 'https://i.ibb.co/sLyZst7/image-5.webp', has_demo: true, link: 'https://static-live.hacksawgaming.com/2195/1.6.0/index.html?language=en&channel=desktop&gameid=2195&mode=2&token=123&partner=demo&env=https://rgs-demo.hacksawgaming.com/api&realmoneyenv=https://rgs-demo.hacksawgaming.com/api&alwaysredirect=true', provider: 'Hacksaw', rtp: '96.14%', category: 'soon', order_index: 15 },
            { name: 'Big Bass Raceday Repeat', image_url: 'https://i.ibb.co/NgvhrWDJ/image-3.webp', has_demo: true, link: 'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?gameSymbol=vs10bbrcdr&lang=ru&cur=USD&playMode=demo', provider: 'Pragmatic Play', rtp: '96.51%', category: 'soon', order_index: 14 },
            { name: 'Sugar Rush Super Scatter', image_url: 'https://i.ibb.co/Wp0Hv0Kw/image-4.webp', has_demo: true, link: 'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?gameSymbol=vs20sugrushss&lang=ru&cur=USD&playMode=demo', provider: 'Pragmatic Play', rtp: '96.58%', category: 'popular', order_index: 16 },
            { name: 'Duck Hunters', image_url: 'https://i.ibb.co/Vc8xNRfm/image-2.webp', has_demo: true, link: 'https://nolimitcity.com/demo?game=DuckHunters', provider: 'Nolimit City', rtp: '96.05%', category: 'popular', order_index: 17 },
            { name: 'Money Train 3', image_url: 'https://i.ibb.co/RTFbT6hN/image-1.webp', has_demo: true, link: 'https://d2drhksbtcqozo.cloudfront.net/casino/games/moneytrain3/index.html?gameid=moneytrain3&jurisdiction=MT&channel=web&moneymode=fun&partnerid=1&fullscreen=false', provider: 'Relax Gaming', rtp: '96.05%', category: 'popular', order_index: 18 },
            { name: 'Mental 2', image_url: 'https://i.ibb.co/BHPCyZ3s/image.webp', has_demo: true, link: 'https://nolimitcity.com/demo?game=Mental2', provider: 'Nolimit City', rtp: '96.05%', category: 'popular', order_index: 19 },
            { name: 'Big Bamboo 2', image_url: 'https://i.ibb.co/203w8Df2/le-bandit.webp', has_demo: false, link: 'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?gameSymbol=vs10bbrcdr&lang=ru&cur=USD&playMode=demo', provider: 'Push Gaming', rtp: '96.36%', category: 'soon', order_index: 20 }
        ];

        const { error } = await supabase.from('slots').upsert(initialSlots, { onConflict: 'name' });
        if (error) {
            alert('Error restoring slots: ' + error.message);
        } else {
            alert('Slots restored successfully!');
            fetchData();
        }
        setRestoringSlots(false);
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

    const handleMassNotifySubscribers = async (tournament) => {
        const customMsg = window.prompt(`📣 Вы хотите сделать ручную рассылку всем подписчикам турнира "${tournament.title}"?\n\nОставьте поле ПУСТЫМ, чтобы отправить стандартное напоминание:\n"🏆 ${tournament.title}\n⏳ Напоминание: Турнир скоро начнется!\nПодготовься, зайди в Discord и на Faceit."\n\nИЛИ введите СВОЙ текст для ручного уведомления (например, об изменении времени, правил или других новостях):`);

        if (customMsg === null) return; // User cancelled

        setPushingId(`notify-${tournament.id}`);
        const result = await sendTelegramTournamentReminder(tournament.id, tournament.title, customMsg.trim() || null);

        if (result.success) {
            alert(`Успешно отправлено сообщений в Telegram: ${result.count} из ${result.total}`);
        } else {
            alert('Ошибка при массовой рассылке в Telegram: ' + result.error);
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

    const [syncing, setSyncing] = useState(false);

    const handleFaceitSync = async () => {
        let faceitFetchTarget = editingTournament?.faceit_id;

        if (!faceitFetchTarget && editingTournament?.link) {
            faceitFetchTarget = extractChampionshipId(editingTournament.link);
        }

        if (!faceitFetchTarget) {
            alert('Пожалуйста, введите Faceit ID или ссылку на чемпионат.');
            return;
        }

        setSyncing(true);
        console.log(`Starting Faceit sync for target:`, faceitFetchTarget);
        const data = await fetchChampionshipDetails(faceitFetchTarget);
        console.log(`Faceit sync returned data:`, data);
        setSyncing(false);

        if (data) {
            const updates = { ...editingTournament };
            // Mapping Faceit data to our schema
            // updates.title = data.name; // We keep our manual title

            const max = data.slots || data.max_slots || data.slots_total || data.total_slots || data.max_participants || data.number_of_players || 32;
            const current = Math.max(
                data.slots_filled || 0,
                data.slots_total_filled || 0,
                data.subscriptions_count || 0,
                data.current_subscription_count || 0,
                data.members_count || 0,
                data.joined || 0,
                data.number_of_players_joined || 0,
                data.number_of_players_participants || 0
            );

            // Normalize for 2v2/solo if needed (same logic as faceit.js)
            let teamSize = data.game_settings?.team_size || data.game_configuration?.team_size || data.team_size;
            const name = (data.name || '').toLowerCase();
            if (!teamSize) {
                if (name.includes('wingman') || name.includes('2v2') || name.includes('2x2')) teamSize = 2;
                else if (name.includes('1v1') || name.includes('solo')) teamSize = 1;
                else teamSize = 5;
            }

            const normalizedJoined = (teamSize >= 2 && max > 32) ? Math.ceil(current / teamSize) : current;
            const normalizedMax = (teamSize >= 2 && max > 32) ? Math.floor(max / teamSize) : max;

            updates.joined_count = `${normalizedJoined}/${normalizedMax}`;

            // 2. Update Dates
            if (data.starts_at) {
                const startDate = new Date(data.starts_at * 1000);
                updates.target_date = startDate.toISOString().split('.')[0];
                updates.date = startDate.toLocaleDateString('ru-RU');
            }

            // 3. Update Status
            if (data.status === 'FINISHED' || data.status === 'COMPLETED') {
                updates.is_active = false;
            } else {
                updates.is_active = true;
            }

            // 4. Update ID (This is CRITICAL for bracket/teams sync on frontend)
            const actualId = data.championship_id || data.tournament_id || (typeof faceitFetchTarget === 'object' ? faceitFetchTarget.id : faceitFetchTarget);
            updates.faceit_id = actualId;
            updates.faceit_sync_enabled = true; // Auto-enable if it wasn't

            // 5. Update Results for finished tournaments
            if (!updates.is_active) {
                const results = await fetchChampionshipResults(actualId);
                if (results?.items?.length > 0) {
                    const winners = results.items.sort((a, b) => a.position - b.position);
                    if (winners[0]) updates.winner_1 = winners[0].team?.name || winners[0].label;
                    if (winners[1]) updates.winner_2 = winners[1].team?.name || winners[1].label;
                    if (winners[2]) updates.winner_3 = winners[2].team?.name || winners[2].label;
                }
            }

            setEditingTournament(updates);
            alert('Данные Faceit загружены! Не забудьте нажать "Save Tournament" внизу.');
        } else {
            alert('Не удалось получить данные с Faceit. Проверьте ID или ссылку.');
        }
    };

    const emptyTournament = {
        title: '',
        date: '',
        target_date: '',
        prize_pool: '',
        format: '',
        type: 'TOURNAMENT',
        joined_count: '',
        image_url: '',
        link: '',
        brief_description: '',
        brief_description_en: '',
        brief_description_ua: '',
        full_description: '',
        full_description_en: '',
        full_description_ua: '',
        rules: '',
        rules_en: '',
        rules_ua: '',
        sponsor_name: '',
        sponsor_icon: '',
        sponsor_link: '',
        winner_1: '',
        winner_1_prize: '',
        winner_2: '',
        winner_2_prize: '',
        winner_3: '',
        winner_3_prize: '',
        is_active: true,
        show_sponsor: true,
        faceit_id: '',
        faceit_sync_enabled: false
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

    const emptySlot = {
        name: '',
        image_url: '',
        link: '',
        provider: '',
        rtp: '',
        has_demo: true,
        is_active: true,
        category: 'popular',
        description_ru: '',
        description_en: '',
        order_index: 0
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
                padding: isMobile ? '15px 20px' : '20px 40px',
                background: 'var(--bg-sidebar)',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '15px' }}>
                    <div style={{
                        width: isMobile ? '32px' : '40px',
                        height: isMobile ? '32px' : '40px',
                        background: 'var(--primary-orange)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Settings size={isMobile ? 18 : 24} color="#fff" />
                    </div>
                    <h1 style={{ fontSize: isMobile ? '1.1rem' : '1.5rem', fontWeight: '800' }}>{ad.dashboard}</h1>
                </div>

                <div style={{ display: 'flex', gap: isMobile ? '8px' : '15px' }}>
                    <button
                        onClick={() => window.open('/', '_blank')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'rgba(255,107,0,0.1)',
                            border: '1px solid rgba(255,107,0,0.2)',
                            padding: isMobile ? '8px 12px' : '10px 20px',
                            borderRadius: '10px',
                            color: 'var(--primary-orange)',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: isMobile ? '0.8rem' : '1rem'
                        }}
                    >
                        {isMobile ? 'Site' : ad.viewSite}
                    </button>
                    <button onClick={handleLogout} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        padding: isMobile ? '8px 12px' : '10px 20px',
                        borderRadius: '10px',
                        color: '#fff',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: isMobile ? '0.8rem' : '1rem'
                    }}>
                        <LogOut size={isMobile ? 16 : 18} /> {isMobile ? '' : ad.logout}
                    </button>
                </div>
            </header>

            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', padding: isMobile ? '20px' : '40px', gap: isMobile ? '20px' : '40px' }}>
                {/* Sidebar Navigation */}
                <nav style={{
                    width: isMobile ? '100%' : '250px',
                    display: 'flex',
                    flexDirection: isMobile ? 'row' : 'column',
                    gap: isMobile ? '10px' : '10px',
                    height: 'fit-content',
                    position: isMobile ? 'sticky' : 'sticky',
                    top: isMobile ? '70px' : '120px',
                    zIndex: 90,
                    background: isMobile ? 'var(--bg-dark)' : 'transparent',
                    overflowX: isMobile ? 'auto' : 'visible',
                    padding: isMobile ? '5px 0' : '0',
                    scrollbarWidth: 'none'
                }}>
                    <button
                        onClick={() => setActiveTab('general')}
                        style={{
                            padding: isMobile ? '10px 15px' : '15px 20px',
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
                            transition: 'all 0.2s',
                            whiteSpace: 'nowrap',
                            fontSize: isMobile ? '0.85rem' : '1rem'
                        }}
                    >
                        <LinkIcon size={isMobile ? 18 : 20} /> {ad.general}
                    </button>
                    <button
                        onClick={() => setActiveTab('tournaments')}
                        style={{
                            padding: isMobile ? '10px 15px' : '15px 20px',
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
                            transition: 'all 0.2s',
                            whiteSpace: 'nowrap',
                            fontSize: isMobile ? '0.85rem' : '1rem'
                        }}
                    >
                        <Trophy size={isMobile ? 18 : 20} /> {ad.tournaments}
                    </button>
                    <button
                        onClick={() => setActiveTab('slots')}
                        style={{
                            padding: isMobile ? '10px 15px' : '15px 20px',
                            textAlign: 'left',
                            borderRadius: '12px',
                            background: activeTab === 'slots' ? 'var(--primary-orange)' : 'rgba(255,255,255,0.03)',
                            border: '1px solid transparent',
                            color: '#fff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            fontWeight: '600',
                            transition: 'all 0.2s',
                            whiteSpace: 'nowrap',
                            fontSize: isMobile ? '0.85rem' : '1rem'
                        }}
                    >
                        <Gamepad2 size={isMobile ? 18 : 20} /> {isMobile ? 'Slots' : ad.slots}
                    </button>
                    <button
                        onClick={() => setActiveTab('bonuses')}
                        style={{
                            padding: isMobile ? '10px 15px' : '15px 20px',
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
                            transition: 'all 0.2s',
                            whiteSpace: 'nowrap',
                            fontSize: isMobile ? '0.85rem' : '1rem'
                        }}
                    >
                        <Settings size={isMobile ? 18 : 20} /> {isMobile ? 'Bonuses' : ad.bonuses}
                    </button>
                    <button
                        onClick={() => setActiveTab('donations')}
                        style={{
                            padding: isMobile ? '10px 15px' : '15px 20px',
                            textAlign: 'left',
                            borderRadius: '12px',
                            background: activeTab === 'donations' ? 'var(--primary-orange)' : 'rgba(255,255,255,0.03)',
                            border: '1px solid transparent',
                            color: '#fff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            fontWeight: '600',
                            transition: 'all 0.2s',
                            whiteSpace: 'nowrap',
                            fontSize: isMobile ? '0.85rem' : '1rem'
                        }}
                    >
                        <Bell size={isMobile ? 18 : 20} /> {isMobile ? 'Donates' : ad.donations}
                    </button>
                </nav>

                {/* Content Area */}
                <main style={{ flex: 1, background: 'var(--bg-card)', borderRadius: isMobile ? '16px' : '24px', padding: isMobile ? '20px' : '40px', border: '1px solid rgba(255,255,255,0.05)', overflowX: 'hidden' }}>
                    {activeTab === 'general' && (
                        <section className="animate-fade-in">
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '30px', fontWeight: '800' }}>General Site Settings</h2>
                            <form onSubmit={handleSaveConfig} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                                <h3 style={{ color: 'var(--primary-orange)', marginBottom: '15px', fontSize: '1.1rem' }}>Personal Socials (BloodyBoy)</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${isMobile ? '250px' : '280px'}, 1fr))`, gap: '20px', marginBottom: '30px', background: 'rgba(255,255,255,0.02)', padding: isMobile ? '15px' : '20px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
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
                                    <div>
                                        <label style={labelStyle}>Twitch Stream URL</label>
                                        <input
                                            type="text"
                                            placeholder="https://twitch.tv/username..."
                                            value={config.twitch_link || ''}
                                            onChange={(e) => setConfig({ ...config, twitch_link: e.target.value })}
                                            style={inputStyle}
                                        />
                                    </div>
                                    <div style={{ gridColumn: '1 / -1', marginTop: '10px', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                        <label style={labelStyle}>Stream Status Control (Kick Auto-Check)</label>
                                        <div style={{ display: 'flex', gap: '15px', alignItems: isMobile ? 'flex-start' : 'center', flexDirection: isMobile ? 'column' : 'row', flexWrap: 'wrap' }}>
                                            <select
                                                value={config.stream_status_mode || 'auto'}
                                                onChange={(e) => setConfig({ ...config, stream_status_mode: e.target.value })}
                                                style={{ ...inputStyle, width: isMobile ? '100%' : '200px', margin: 0 }}
                                            >
                                                <option value="auto">Automatic (Kick API)</option>
                                                <option value="manual">Manual Override</option>
                                            </select>

                                            {config.stream_status_mode === 'manual' && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'space-between' : 'flex-start' }}>
                                                    <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>Manual Status:</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setConfig({ ...config, stream_is_live: config.stream_is_live === 'true' ? 'false' : 'true' })}
                                                        style={{
                                                            padding: '8px 16px',
                                                            borderRadius: '8px',
                                                            background: config.stream_is_live === 'true' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 68, 68, 0.2)',
                                                            color: config.stream_is_live === 'true' ? '#4CAF50' : '#FF4444',
                                                            border: `1px solid ${config.stream_is_live === 'true' ? '#4CAF50' : '#FF4444'}`,
                                                            cursor: 'pointer',
                                                            fontWeight: '800',
                                                            fontSize: '0.8rem'
                                                        }}
                                                    >
                                                        {config.stream_is_live === 'true' ? 'ONLINE' : 'OFFLINE'}
                                                    </button>
                                                </div>
                                            )}

                                            <span style={{ fontSize: '0.8rem', opacity: 0.5, maxWidth: '400px' }}>
                                                Use Manual if API check is blocked.
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <h3 style={{ color: 'var(--primary-orange)', marginBottom: '15px', fontSize: '1.1rem' }}>Community Socials (Tiger)</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${isMobile ? '250px' : '280px'}, 1fr))`, gap: '20px', background: 'rgba(255,255,255,0.02)', padding: isMobile ? '15px' : '20px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
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
                                    style={{ ...submitButtonStyle, width: isMobile ? '100%' : 'auto', justifyContent: 'center' }}
                                >
                                    {saving ? <Loader2 size={20} className="animate-spin" /> : (saveStatus === 'success' ? <CheckCircle size={20} /> : <Save size={20} />)}
                                    {saveStatus === 'success' ? 'Saved Successfully' : 'Save General Settings'}
                                </button>
                            </form>
                        </section>
                    )}

                    {activeTab === 'donations' && (
                        <section className="animate-fade-in">
                            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', marginBottom: '30px', gap: isMobile ? '20px' : '0' }}>
                                <div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? '12px' : '20px', flexDirection: isMobile ? 'column' : 'row' }}>
                                    <h2 style={{ fontSize: isMobile ? '1.2rem' : '1.5rem', fontWeight: '800', margin: 0 }}>Recent Donations</h2>
                                    <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', width: isMobile ? '100%' : 'auto' }}>
                                        <button
                                            onClick={() => setDonationFilter('all')}
                                            style={{
                                                flex: isMobile ? 1 : 'none',
                                                padding: '6px 15px',
                                                borderRadius: '8px',
                                                border: 'none',
                                                fontSize: '0.8rem',
                                                fontWeight: '700',
                                                cursor: 'pointer',
                                                background: donationFilter === 'all' ? 'var(--primary-orange)' : 'transparent',
                                                color: '#fff'
                                            }}
                                        >
                                            All Time
                                        </button>
                                        <button
                                            onClick={() => setDonationFilter('today')}
                                            style={{
                                                flex: isMobile ? 1 : 'none',
                                                padding: '6px 15px',
                                                borderRadius: '8px',
                                                border: 'none',
                                                fontSize: '0.8rem',
                                                fontWeight: '700',
                                                cursor: 'pointer',
                                                background: donationFilter === 'today' ? 'var(--primary-orange)' : 'transparent',
                                                color: '#fff'
                                            }}
                                        >
                                            Today
                                        </button>
                                    </div>
                                </div>
                                <button
                                    onClick={fetchDonations}
                                    disabled={loadingDonations}
                                    style={{ ...submitButtonStyle, width: isMobile ? '100%' : 'auto', margin: 0, padding: isMobile ? '12px 20px' : '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                >
                                    {loadingDonations ? <Loader2 size={18} className="animate-spin" /> : <Settings size={18} />}
                                    Refresh History
                                </button>
                            </div>

                            {loadingDonations && donationHistory.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px' }}>
                                    <Loader2 size={32} className="animate-spin" color="var(--primary-orange)" style={{ margin: '0 auto' }} />
                                </div>
                            ) : (
                                <div style={{ overflowX: 'auto', background: 'rgba(0,0,0,0.2)', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                                <th style={{ padding: '15px 20px', color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>Date</th>
                                                <th style={{ padding: '15px 20px', color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>Asset</th>
                                                <th style={{ padding: '15px 20px', color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>Amount</th>
                                                <th style={{ padding: '15px 20px', color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>Status</th>
                                                <th style={{ padding: '15px 20px', color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>Address</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {donationHistory.filter(tx => {
                                                if (donationFilter === 'all') return true;
                                                const txDate = new Date(tx.createdAt * 1000).toDateString();
                                                const today = new Date().toDateString();
                                                return txDate === today;
                                            }).length === 0 ? (
                                                <tr>
                                                    <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>No donations found for this period.</td>
                                                </tr>
                                            ) : (
                                                donationHistory
                                                    .filter(tx => {
                                                        if (donationFilter === 'all') return true;
                                                        const txDate = new Date(tx.createdAt * 1000).toDateString();
                                                        const today = new Date().toDateString();
                                                        return txDate === today;
                                                    })
                                                    .map((tx, idx) => (
                                                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseLeave={(e) => e.currentTarget.style.background = 'none'}>
                                                            <td style={{ padding: '15px 20px' }}>{new Date(tx.createdAt * 1000).toLocaleString()}</td>
                                                            <td style={{ padding: '15px 20px', fontWeight: '800', color: 'var(--primary-orange)' }}>{tx.ticker}</td>
                                                            <td style={{ padding: '15px 20px', fontWeight: '700' }}>{tx.amount}</td>
                                                            <td style={{ padding: '15px 20px' }}>
                                                                <span style={{
                                                                    padding: '4px 10px',
                                                                    borderRadius: '6px',
                                                                    fontSize: '0.75rem',
                                                                    fontWeight: '800',
                                                                    background: (tx.status === 3 || tx.status === 7) ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 152, 0, 0.1)',
                                                                    color: (tx.status === 3 || tx.status === 7) ? '#4CAF50' : '#FF9800',
                                                                    border: (tx.status === 3 || tx.status === 7) ? '1px solid rgba(76, 175, 80, 0.2)' : '1px solid rgba(255, 152, 0, 0.2)'
                                                                }}>
                                                                    {(tx.status === 3 || tx.status === 7) ? 'SUCCESS' : `PENDING (${tx.status})`}
                                                                </span>
                                                            </td>
                                                            <td style={{ padding: '15px 20px', fontFamily: 'monospace', fontSize: '0.8rem', opacity: 0.6 }}>
                                                                {tx.address ? `${tx.address.substring(0, 8)}...${tx.address.substring(tx.address.length - 8)}` : 'N/A'}
                                                            </td>
                                                        </tr>
                                                    ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
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

                                    <form onSubmit={handleSaveTournament} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px' }}>
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

                                        <div style={{ gridColumn: '1 / -1', background: 'rgba(255, 107, 0, 0.05)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(255, 107, 0, 0.1)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <input
                                                        type="checkbox"
                                                        id="faceit_sync"
                                                        checked={editingTournament?.faceit_sync_enabled || false}
                                                        onChange={(e) => setEditingTournament({ ...editingTournament, faceit_sync_enabled: e.target.checked })}
                                                        style={{ width: '20px', height: '20px', accentColor: 'var(--primary-orange)', cursor: 'pointer' }}
                                                    />
                                                    <label htmlFor="faceit_sync" style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer', color: '#fff' }}>Синхронизировать с Faceit</label>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={handleFaceitSync}
                                                    disabled={syncing}
                                                    style={{
                                                        background: 'var(--primary-orange)',
                                                        color: '#fff',
                                                        border: 'none',
                                                        padding: '8px 16px',
                                                        borderRadius: '8px',
                                                        fontSize: '0.85rem',
                                                        fontWeight: '700',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px'
                                                    }}
                                                >
                                                    {syncing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                                                    Обновить сейчас
                                                </button>
                                            </div>
                                            <div style={{ opacity: editingTournament?.faceit_sync_enabled ? 1 : 0.5, transition: 'opacity 0.3s' }}>
                                                <label style={{ ...labelStyle, fontSize: '0.75rem' }}>Faceit Championship ID (можно оставить пустым, если есть ссылка)</label>
                                                <input
                                                    type="text"
                                                    placeholder="ID: 70adb9b2-018d-428b-be81-104d48b898ba"
                                                    value={editingTournament?.faceit_id || ''}
                                                    onChange={(e) => setEditingTournament({ ...editingTournament, faceit_id: e.target.value })}
                                                    style={{ ...inputStyle, padding: '12px', fontSize: '0.9rem' }}
                                                />
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', gridColumn: '1 / -1' }}>
                                            <div>
                                                <label style={labelStyle}>Brief Description (RU)</label>
                                                <textarea value={editingTournament?.brief_description || ''} onChange={(e) => setEditingTournament({ ...editingTournament, brief_description: e.target.value })} style={{ ...inputStyle, height: '80px', resize: 'vertical' }} />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>Brief Description (EN)</label>
                                                <textarea value={editingTournament?.brief_description_en || ''} onChange={(e) => setEditingTournament({ ...editingTournament, brief_description_en: e.target.value })} style={{ ...inputStyle, height: '80px', resize: 'vertical' }} />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>Brief Description (UA)</label>
                                                <textarea value={editingTournament?.brief_description_ua || ''} onChange={(e) => setEditingTournament({ ...editingTournament, brief_description_ua: e.target.value })} style={{ ...inputStyle, height: '80px', resize: 'vertical' }} />
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', gridColumn: '1 / -1' }}>
                                            <div>
                                                <label style={labelStyle}>Full Description (RU)</label>
                                                <textarea value={editingTournament?.full_description || ''} onChange={(e) => setEditingTournament({ ...editingTournament, full_description: e.target.value })} style={{ ...inputStyle, height: '120px', resize: 'vertical' }} />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>Full Description (EN)</label>
                                                <textarea value={editingTournament?.full_description_en || ''} onChange={(e) => setEditingTournament({ ...editingTournament, full_description_en: e.target.value })} style={{ ...inputStyle, height: '120px', resize: 'vertical' }} />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>Full Description (UA)</label>
                                                <textarea value={editingTournament?.full_description_ua || ''} onChange={(e) => setEditingTournament({ ...editingTournament, full_description_ua: e.target.value })} style={{ ...inputStyle, height: '120px', resize: 'vertical' }} />
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', gridColumn: '1 / -1' }}>
                                            <div>
                                                <label style={labelStyle}>Rules (RU)</label>
                                                <textarea value={editingTournament?.rules || ''} onChange={(e) => setEditingTournament({ ...editingTournament, rules: e.target.value })} style={{ ...inputStyle, height: '100px', resize: 'vertical' }} />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>Rules (EN)</label>
                                                <textarea value={editingTournament?.rules_en || ''} onChange={(e) => setEditingTournament({ ...editingTournament, rules_en: e.target.value })} style={{ ...inputStyle, height: '100px', resize: 'vertical' }} />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>Rules (UA)</label>
                                                <textarea value={editingTournament?.rules_ua || ''} onChange={(e) => setEditingTournament({ ...editingTournament, rules_ua: e.target.value })} style={{ ...inputStyle, height: '100px', resize: 'vertical' }} />
                                            </div>
                                        </div>

                                        <div>
                                            <label style={labelStyle}>Sponsor Name</label>
                                            <input type="text" value={editingTournament?.sponsor_name || ''} onChange={(e) => setEditingTournament({ ...editingTournament, sponsor_name: e.target.value })} style={inputStyle} />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Sponsor Link</label>
                                            <input type="text" value={editingTournament?.sponsor_link || ''} onChange={(e) => setEditingTournament({ ...editingTournament, sponsor_link: e.target.value })} style={inputStyle} />
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <input
                                                type="checkbox"
                                                id="show_sponsor"
                                                checked={editingTournament?.show_sponsor ?? true}
                                                onChange={(e) => setEditingTournament({ ...editingTournament, show_sponsor: e.target.checked })}
                                                style={{ width: '20px', height: '20px', accentColor: 'var(--primary-orange)', cursor: 'pointer' }}
                                            />
                                            <label htmlFor="show_sponsor" style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer', color: '#fff' }}>{ad.showSponsor}</label>
                                        </div>
                                        <div style={{ gridColumn: '1 / -1', background: 'rgba(255,255,255,0.02)', padding: '25px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', marginTop: '10px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <Trophy size={18} color="var(--primary-orange)" />
                                                    <label style={{ ...labelStyle, marginBottom: 0, color: '#fff' }}>Graphical Map Selection</label>
                                                </div>
                                                <div style={{ fontSize: '0.75rem', opacity: 0.5, fontWeight: '700', color: '#fff' }}>Click to toggle maps</div>
                                            </div>

                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                                                gap: '12px',
                                                marginBottom: '20px',
                                                maxHeight: '300px',
                                                overflowY: 'auto',
                                                padding: '5px'
                                            }}>
                                                {CS2_MAPS.map(map => {
                                                    const mapClean = map.toLowerCase();
                                                    const isSelected = editingTournament?.map_pool?.toLowerCase().split(',').map(m => m.trim()).includes(mapClean);
                                                    const bgImg = `https://raw.githubusercontent.com/ghostcap-gaming/cs2-map-images/main/cs2/${mapClean}.png`;

                                                    return (
                                                        <div
                                                            key={map}
                                                            onClick={() => {
                                                                const current = editingTournament?.map_pool ? editingTournament.map_pool.split(',').map(m => m.trim().toLowerCase()).filter(Boolean) : [];
                                                                const next = current.includes(mapClean) ? current.filter(m => m !== mapClean) : [...current, mapClean];
                                                                setEditingTournament({ ...editingTournament, map_pool: next.join(', ') });
                                                            }}
                                                            style={{
                                                                height: '70px',
                                                                borderRadius: '14px',
                                                                overflow: 'hidden',
                                                                position: 'relative',
                                                                cursor: 'pointer',
                                                                border: isSelected ? '2px solid var(--primary-orange)' : '1px solid rgba(255,255,255,0.06)',
                                                                background: `rgba(0,0,0,0.8) url("${bgImg}") center/cover no-repeat`,
                                                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                                transform: isSelected ? 'scale(1.02)' : 'none',
                                                                boxShadow: isSelected ? '0 10px 20px rgba(255,107,0,0.15)' : 'none'
                                                            }}
                                                        >
                                                            <div style={{
                                                                position: 'absolute',
                                                                inset: 0,
                                                                background: isSelected ? 'rgba(255,107,0,0.1)' : 'rgba(0,0,0,0.4)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                backdropFilter: isSelected ? 'none' : 'blur(1px)',
                                                            }}>
                                                                <span style={{
                                                                    fontSize: '0.7rem',
                                                                    fontWeight: '900',
                                                                    color: '#fff',
                                                                    textTransform: 'uppercase',
                                                                    letterSpacing: '1px',
                                                                    textShadow: '0 2px 4px rgba(0,0,0,0.8)'
                                                                }}>
                                                                    {map.replace('de_', '').replace('cs_', '').toUpperCase()}
                                                                </span>
                                                                {isSelected && (
                                                                    <div style={{ position: 'absolute', top: '6px', right: '6px', background: 'var(--primary-orange)', borderRadius: '6px', padding: '2px', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
                                                                        <CheckCircle size={12} color="#fff" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            <label style={{ ...labelStyle, fontSize: '0.7rem', marginTop: '10px' }}>Manual Map Pool String (for custom maps)</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Mirage, Nuke, Dust2"
                                                value={editingTournament?.map_pool || ''}
                                                onChange={(e) => setEditingTournament({ ...editingTournament, map_pool: e.target.value })}
                                                style={{ ...inputStyle, padding: '12px', fontSize: '0.85rem' }}
                                            />
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
                                    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', marginBottom: '30px', gap: isMobile ? '15px' : '0' }}>
                                        <h2 style={{ fontSize: isMobile ? '1.2rem' : '1.5rem', fontWeight: '800' }}>Manage Tournaments</h2>
                                        <button
                                            onClick={() => { setIsAdding(true); setEditingTournament(emptyTournament); }}
                                            style={{ background: 'var(--primary-orange)', color: '#fff', border: 'none', padding: isMobile ? '12px 24px' : '12px 24px', borderRadius: '12px', fontWeight: '750', cursor: 'pointer', boxShadow: '0 4px 15px rgba(255,107,0,0.3)', width: isMobile ? '100%' : 'auto', fontSize: isMobile ? '0.85rem' : '1rem' }}
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
                                                display: 'flex',
                                                flexDirection: isMobile ? 'column' : 'row',
                                                justifyContent: 'space-between',
                                                alignItems: isMobile ? 'stretch' : 'center',
                                                gap: isMobile ? '20px' : '0',
                                                transition: 'transform 0.2s ease'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '12px' : '20px' }}>
                                                    <div style={{ width: isMobile ? '44px' : '60px', height: isMobile ? '44px' : '60px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', overflow: 'hidden', flexShrink: 0 }}>
                                                        {t.image_url && <img src={t.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                                    </div>
                                                    <div>
                                                        <div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', gap: '10px', marginBottom: '5px', flexDirection: isMobile ? 'column' : 'row' }}>
                                                            <div style={{ fontWeight: '800', fontSize: isMobile ? '1rem' : '1.2rem' }}>{t.title}</div>
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
                                                        <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem', display: 'flex', gap: '12px', flexWrap: 'nowrap' }}>
                                                            <span>📅 {t.date}</span>
                                                            <span>💰 {t.prize_pool}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                    <button
                                                        onClick={() => handlePushToDiscord(t)}
                                                        disabled={pushingId === t.id}
                                                        title="Push Announcement to Discord"
                                                        style={{
                                                            background: 'rgba(255, 107, 0, 0.1)',
                                                            border: '1px solid rgba(255, 107, 0, 0.2)',
                                                            color: 'var(--primary-orange)',
                                                            padding: isMobile ? '8px' : '10px',
                                                            borderRadius: '10px',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            opacity: pushingId === t.id ? 0.5 : 1,
                                                            flex: isMobile ? 1 : 'none'
                                                        }}
                                                    >
                                                        {pushingId === t.id ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                                    </button>
                                                    <button
                                                        onClick={() => handlePushResultsToDiscord(t)}
                                                        disabled={pushingId === `results-${t.id}`}
                                                        title="Push Results to Discord"
                                                        style={{
                                                            background: 'rgba(74, 222, 128, 0.1)',
                                                            border: '1px solid rgba(74, 222, 128, 0.2)',
                                                            color: '#4ade80',
                                                            padding: isMobile ? '8px' : '10px',
                                                            borderRadius: '10px',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            opacity: pushingId === `results-${t.id}` ? 0.5 : 1,
                                                            flex: isMobile ? 1 : 'none'
                                                        }}
                                                    >
                                                        {pushingId === `results-${t.id}` ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleMassNotifySubscribers(t)}
                                                        disabled={pushingId === `notify-${t.id}`}
                                                        title="Notify Subscribers via Telegram"
                                                        style={{
                                                            background: 'rgba(255, 180, 0, 0.1)',
                                                            border: '1px solid rgba(255, 180, 0, 0.2)',
                                                            color: '#FFB400',
                                                            padding: isMobile ? '8px' : '10px',
                                                            borderRadius: '10px',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            opacity: pushingId === `notify-${t.id}` ? 0.5 : 1,
                                                            flex: isMobile ? 1 : 'none'
                                                        }}
                                                    >
                                                        {pushingId === `notify-${t.id}` ? <Loader2 size={16} className="animate-spin" /> : <BellRing size={16} />}
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            const { id, created_at, ...copyData } = t;
                                                            setEditingTournament({ ...copyData, title: `${t.title} (Copy)` });
                                                            setIsAdding(true);
                                                        }}
                                                        title="Copy Tournament"
                                                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: isMobile ? '8px' : '10px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: isMobile ? 1 : 'none' }}
                                                    >
                                                        <Copy size={16} />
                                                    </button>
                                                    <button onClick={() => { setEditingTournament(t); setIsAdding(false); }} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: isMobile ? '8px 12px' : '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', flex: isMobile ? 2 : 'none' }}>Edit</button>
                                                    <button onClick={() => handleDeleteTournament(t.id)} style={{ background: 'rgba(255, 68, 68, 0.1)', border: '1px solid rgba(255, 68, 68, 0.2)', color: '#ff4444', padding: isMobile ? '8px 12px' : '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', flex: isMobile ? 2 : 'none' }}>Delete</button>
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

                    {activeTab === 'slots' && (
                        <section className="animate-fade-in">
                            {(editingSlot || isAddingSlot) ? (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                                        <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>{isAddingSlot ? 'Add New Slot' : 'Edit Slot'}</h2>
                                        <button onClick={() => { setEditingSlot(null); setIsAddingSlot(false); }} style={cancelButtonStyle}>Cancel</button>
                                    </div>

                                    <form onSubmit={handleSaveSlot} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px' }}>
                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <label style={labelStyle}>Slot Name</label>
                                            <input required type="text" value={editingSlot?.name || ''} onChange={(e) => setEditingSlot({ ...editingSlot, name: e.target.value })} style={inputStyle} />
                                        </div>

                                        <div>
                                            <label style={labelStyle}>Provider</label>
                                            <input type="text" value={editingSlot?.provider || ''} onChange={(e) => setEditingSlot({ ...editingSlot, provider: e.target.value })} style={inputStyle} />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>RTP (e.g. 96.5%)</label>
                                            <input type="text" value={editingSlot?.rtp || ''} onChange={(e) => setEditingSlot({ ...editingSlot, rtp: e.target.value })} style={inputStyle} />
                                        </div>

                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <label style={labelStyle}>Image URL</label>
                                            <input type="text" value={editingSlot?.image_url || ''} onChange={(e) => setEditingSlot({ ...editingSlot, image_url: e.target.value })} style={inputStyle} />
                                        </div>

                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <label style={labelStyle}>Play/Demo Link</label>
                                            <input type="text" value={editingSlot?.link || ''} onChange={(e) => setEditingSlot({ ...editingSlot, link: e.target.value })} style={inputStyle} />
                                        </div>

                                        <div>
                                            <label style={labelStyle}>Category</label>
                                            <select
                                                value={editingSlot?.category || 'popular'}
                                                onChange={(e) => setEditingSlot({ ...editingSlot, category: e.target.value })}
                                                style={inputStyle}
                                            >
                                                <option value="popular">Popular Slots</option>
                                                <option value="soon">New Slots (Coming Soon)</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label style={labelStyle}>Order Index (Sorting)</label>
                                            <input type="number" value={editingSlot?.order_index ?? 0} onChange={(e) => setEditingSlot({ ...editingSlot, order_index: parseInt(e.target.value) || 0 })} style={inputStyle} />
                                        </div>

                                        <div style={{ display: 'flex', gap: '20px', gridColumn: '1 / -1' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <input
                                                    type="checkbox"
                                                    id="has_demo"
                                                    checked={editingSlot?.has_demo ?? true}
                                                    onChange={(e) => setEditingSlot({ ...editingSlot, has_demo: e.target.checked })}
                                                    style={{ width: '20px', height: '20px', accentColor: 'var(--primary-orange)' }}
                                                />
                                                <label htmlFor="has_demo" style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}>Has Demo Version</label>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <input
                                                    type="checkbox"
                                                    id="is_active_slot"
                                                    checked={editingSlot?.is_active ?? true}
                                                    onChange={(e) => setEditingSlot({ ...editingSlot, is_active: e.target.checked })}
                                                    style={{ width: '20px', height: '20px', accentColor: 'var(--primary-orange)' }}
                                                />
                                                <label htmlFor="is_active_slot" style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}>Visible on Site (Active)</label>
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', gridColumn: '1 / -1' }}>
                                            <div>
                                                <label style={labelStyle}>Description (RU)</label>
                                                <textarea value={editingSlot?.description_ru || ''} onChange={(e) => setEditingSlot({ ...editingSlot, description_ru: e.target.value })} style={{ ...inputStyle, height: '100px', resize: 'vertical' }} />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>Description (EN)</label>
                                                <textarea value={editingSlot?.description_en || ''} onChange={(e) => setEditingSlot({ ...editingSlot, description_en: e.target.value })} style={{ ...inputStyle, height: '100px', resize: 'vertical' }} />
                                            </div>
                                        </div>

                                        <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
                                            <button type="submit" disabled={saving} style={submitButtonStyle}>
                                                {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                                                Save Slot
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            ) : (
                                <div>
                                    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', marginBottom: '30px', gap: isMobile ? '15px' : '0' }}>
                                        <h2 style={{ fontSize: isMobile ? '1.2rem' : '1.5rem', fontWeight: '800' }}>Manage Game Slots</h2>
                                        <div style={{ display: 'flex', gap: '10px', flexDirection: isMobile ? 'column' : 'row' }}>
                                            <button
                                                onClick={handleRestoreSlots}
                                                disabled={restoringSlots}
                                                style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 24px', borderRadius: '12px', fontWeight: '750', cursor: 'pointer', fontSize: isMobile ? '0.85rem' : '1rem' }}
                                            >
                                                {restoringSlots ? <Loader2 size={18} className="animate-spin" /> : 'Restore Initial Slots'}
                                            </button>
                                            <button
                                                onClick={() => { setIsAddingSlot(true); setEditingSlot(emptySlot); }}
                                                style={{ background: 'var(--primary-orange)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: '750', cursor: 'pointer', boxShadow: '0 4px 15px rgba(255,107,0,0.3)', fontSize: isMobile ? '0.85rem' : '1rem' }}
                                            >
                                                + Add New Slot
                                            </button>
                                        </div>
                                    </div>
                                    {slots.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '80px 40px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                            <Gamepad2 size={48} style={{ marginBottom: '20px', opacity: 0.1 }} />
                                            <div style={{ color: 'var(--text-dim)', fontSize: '1.1rem', marginBottom: '20px' }}>No slots found in database.</div>
                                            <button onClick={handleRestoreSlots} style={{ background: 'var(--primary-orange)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' }}>Import From Initial List</button>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                                            {slots.map(slot => (
                                                <div key={slot.id} style={{
                                                    padding: '20px',
                                                    background: 'rgba(255,255,255,0.03)',
                                                    borderRadius: '20px',
                                                    border: '1px solid rgba(255,255,255,0.05)',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '15px'
                                                }}>
                                                    <div style={{ display: 'flex', gap: '15px', opacity: slot.is_active === false ? 0.5 : 1 }}>
                                                        <img src={slot.image_url} alt="" style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover', filter: slot.is_active === false ? 'grayscale(100%)' : 'none' }} />
                                                        <div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <div style={{ fontWeight: '800', fontSize: '1.1rem' }}>{slot.name}</div>
                                                                {slot.is_active === false ? <EyeOff size={14} color="#ff4444" /> : <Eye size={14} color="#4ade80" />}
                                                            </div>
                                                            <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>#{slot.order_index} • {slot.provider} • RTP: {slot.rtp}</div>
                                                            <div style={{
                                                                marginTop: '5px',
                                                                display: 'flex',
                                                                gap: '8px'
                                                            }}>
                                                                <span style={{
                                                                    fontSize: '0.7rem',
                                                                    fontWeight: '800',
                                                                    textTransform: 'uppercase',
                                                                    color: slot.category === 'popular' ? 'var(--primary-orange)' : '#4ade80'
                                                                }}>
                                                                    {slot.category === 'popular' ? 'Popular' : 'New/Soon'}
                                                                </span>
                                                                {slot.is_active === false && (
                                                                    <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#ff4444', textTransform: 'uppercase' }}>• Hidden</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '10px' }}>
                                                        <button onClick={() => { setEditingSlot(slot); setIsAddingSlot(false); }} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}>Edit</button>
                                                        <button onClick={() => handleDeleteSlot(slot.id)} style={{ padding: '10px', background: 'rgba(255, 68, 68, 0.1)', border: '1px solid rgba(255, 68, 68, 0.2)', color: '#ff4444', borderRadius: '10px', cursor: 'pointer' }}>
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
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

                                    <form onSubmit={handleSaveBonus} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px' }}>
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
                                    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', marginBottom: '30px', gap: isMobile ? '15px' : '0' }}>
                                        <h2 style={{ fontSize: isMobile ? '1.2rem' : '1.5rem', fontWeight: '800' }}>Manage Bonuses</h2>
                                        <button
                                            onClick={() => { setIsAddingBonus(true); setEditingBonus(emptyBonus); }}
                                            style={{ background: 'var(--primary-orange)', color: '#fff', border: 'none', padding: isMobile ? '12px 24px' : '12px 24px', borderRadius: '12px', fontWeight: '750', cursor: 'pointer', boxShadow: '0 4px 15px rgba(255,107,0,0.3)', width: isMobile ? '100%' : 'auto', fontSize: isMobile ? '0.85rem' : '1rem' }}
                                        >
                                            + Add New Bonus
                                        </button>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        {bonuses.map(b => (
                                            <div key={b.id} style={{
                                                padding: isMobile ? '15px' : '24px',
                                                background: 'rgba(255,255,255,0.03)',
                                                borderRadius: '20px',
                                                border: '1px solid rgba(255,255,255,0.05)',
                                                display: 'flex',
                                                flexDirection: isMobile ? 'column' : 'row',
                                                justifyContent: 'space-between',
                                                alignItems: isMobile ? 'flex-start' : 'center',
                                                gap: isMobile ? '15px' : '0'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                                    <div style={{ width: '12px', height: '40px', borderRadius: '4px', background: b.color }}></div>
                                                    <div>
                                                        <div style={{ fontWeight: '800', fontSize: isMobile ? '1.1rem' : '1.2rem', marginBottom: '5px' }}>{b.site_name}</div>
                                                        <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>{b.offer} • {b.promo}</div>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '10px', width: isMobile ? '100%' : 'auto' }}>
                                                    <button onClick={() => setEditingBonus(b)} style={{ flex: isMobile ? 1 : 'none', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontSize: isMobile ? '0.85rem' : '1rem' }}>Edit</button>
                                                    <button onClick={() => handleDeleteBonus(b.id)} style={{ flex: isMobile ? 1 : 'none', background: 'rgba(255, 68, 68, 0.1)', border: '1px solid rgba(255, 68, 68, 0.2)', color: '#ff4444', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontSize: isMobile ? '0.85rem' : '1rem' }}>Delete</button>
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
        </div>
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
