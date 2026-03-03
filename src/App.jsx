import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import BonusCard from './components/BonusCard';
import StreamInfo from './components/StreamInfo';
import MobileMenu from './components/MobileMenu';
import SlotCard from './components/SlotCard';
import TournamentCard from './components/TournamentCard';
import TournamentDetail from './components/TournamentDetail';
import CommunityBanner from './components/CommunityBanner';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';
import SupportModal from './components/SupportModal';
import ThanksPopup from './components/ThanksPopup';
import { supabase } from './supabaseClient';
import { checkRecentDeposits } from './services/whitebit';
import { checkKickStatus } from './services/kick';
import { Flame, Gamepad2, Video, Sparkles, TrendingUp, Medal, Wallet, ChevronDown, Trophy, ArrowLeft, MessageSquare, CreditCard, X, Loader2 } from 'lucide-react';
import { translations } from './translations';

// Navigation Logic Wrapper
const AppContent = () => {
  const [language, setLanguage] = useState('ru');
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isLive, setIsLive] = useState(false); // Default to false until checked
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [config, setConfig] = useState({});
  const [tournaments, setTournaments] = useState([]);
  const [bonuses, setBonuses] = useState([]);
  const [slots, setSlots] = useState([]);

  const [slotCategory, setSlotCategory] = useState('popular');
  const [tournamentCategory, setTournamentCategory] = useState('active');
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [showThanks, setShowThanks] = useState(false);
  const [activeGame, setActiveGame] = useState(null); // { name, link }

  const location = useLocation();
  const navigate = useNavigate();
  const currentTab = location.pathname.split('/')[1] || 'bonuses';

  // Check auth session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch site config and tournaments
  useEffect(() => {
    const fetchData = async () => {
      // Fetch Config
      const { data: configData } = await supabase.from('site_config').select('*');
      if (configData) {
        const configObj = {};
        configData.forEach(item => {
          configObj[item.id] = item.value;
        });
        setConfig(configObj);
      }

      // Fetch Tournaments (All of them, filtering happens in frontend)
      const { data: tournamentData } = await supabase.from('tournaments')
        .select('*')
        .order('created_at', { ascending: false });

      if (tournamentData) {
        // Map DB snake_case to Frontend camelCase
        const mappedTournaments = tournamentData.map(dbT => ({
          id: dbT.id,
          name: dbT.title,
          image: dbT.image_url,
          prize: dbT.prize_pool,
          format: dbT.format,
          link: dbT.link,
          date: dbT.date,
          targetDate: dbT.target_date,
          isActive: dbT.is_active,
          type: dbT.type,
          joinedCount: dbT.joined_count,
          briefDescription: dbT.brief_description,
          briefDescriptionEn: dbT.brief_description_en,
          fullDescription: dbT.full_description,
          fullDescriptionEn: dbT.full_description_en,
          rules: dbT.rules,
          rulesEn: dbT.rules_en,
          sponsorName: dbT.sponsor_name,
          sponsorIcon: dbT.sponsor_icon,
          sponsorLink: dbT.sponsor_link,
          winner1: dbT.winner_1,
          winner1Prize: dbT.winner_1_prize,
          winner2: dbT.winner_2,
          winner2Prize: dbT.winner_2_prize,
          winner3: dbT.winner_3,
          winner3Prize: dbT.winner_3_prize,
          faceitId: dbT.faceit_id,
          faceitSyncEnabled: dbT.faceit_sync_enabled,
          mapPool: dbT.map_pool
        }));
        setTournaments(mappedTournaments);
      }

      // Fetch Bonuses (All of them)
      const { data: bonusData } = await supabase.from('bonuses')
        .select('*')
        .order('order_index', { ascending: true });

      if (bonusData) {
        const mappedBonuses = bonusData.map(dbB => ({
          id: dbB.id,
          siteName: dbB.site_name,
          offer: dbB.offer,
          promo: dbB.promo,
          link: dbB.link,
          color: dbB.color,
          disableHover: dbB.link === '#',
          isActive: dbB.is_active
        }));
        setBonuses(mappedBonuses);
      }

      // Fetch Slots
      const { data: slotData } = await supabase.from('slots')
        .select('*')
        .order('order_index', { ascending: true });

      if (slotData) {
        const mappedSlots = slotData.map(dbS => ({
          id: dbS.id,
          name: dbS.name,
          image: dbS.image_url,
          link: dbS.link,
          provider: dbS.provider,
          rtp: dbS.rtp,
          hasDemo: dbS.has_demo,
          category: dbS.category,
          descriptionRu: dbS.description_ru,
          descriptionEn: dbS.description_en,
          orderIndex: dbS.order_index,
          isActive: dbS.is_active
        }));
        setSlots(mappedSlots);
      }
    };
    fetchData();
  }, []);

  // Background check for new donations
  useEffect(() => {
    const checkDeposits = async () => {
      try {
        const tickers = ['BTC', 'USDT', 'TRX', 'TON'];
        let found = false;
        for (const ticker of tickers) {
          const hasNew = await checkRecentDeposits(ticker);
          if (hasNew) {
            found = true;
            break;
          }
        }

        if (found) {
          setShowThanks(true);
        }
      } catch (err) {
        // Silent
      }
    };

    const interval = setInterval(checkDeposits, 60000);
    return () => clearInterval(interval);
  }, []);

  // Check Kick Status
  useEffect(() => {
    const updateKickStatus = async () => {
      // 1. Check for manual override in config
      if (config.stream_status_mode === 'manual') {
        setIsLive(config.stream_is_live === 'true');
        return;
      }

      // 2. Otherwise use Automatic (API)
      const url = config.kick_link || 'https://kick.com/bloodyboy58';
      const username = url.split('/').pop() || 'bloodyboy58';

      const status = await checkKickStatus(username);
      setIsLive(status);
    };

    if (Object.keys(config).length > 0) {
      updateKickStatus();
    }

    const interval = setInterval(updateKickStatus, 300000); // Check every 5 minutes
    return () => clearInterval(interval);
  }, [config.kick_link, config.stream_status_mode, config.stream_is_live]);

  // For demonstration purposes
  useEffect(() => {
    const handleThanks = () => setShowThanks(true);
    window.addEventListener('show-thanks', handleThanks);
    return () => window.removeEventListener('show-thanks', handleThanks);
  }, []);

  const t = translations[language];

  useEffect(() => {
    document.title = t.logo;
  }, [t.logo]);

  // Use config values if available
  const tgGroup = config.tg_group || 'https://t.me/bloodyboy58';
  const tgChat = config.tg_chat || 'https://t.me/+7b4HEtKQoqBkMzgy';
  const kickLink = config.kick_link || 'https://kick.com/bloodyboy58';
  const discordLink = config.discord_link || 'https://discord.gg/gTkYrBDf';
  const faceitLink = config.faceit_link || 'https://www.faceit.com/ru/club/44e432a6-3d12-49b8-b591-8b4f820e5d9e/parties';
  const communityTg = config.community_tg || 'https://t.me/tigercasinoofficial';




  const categorySlots = slots.filter(s => {
    if (s.isActive === false) return false;
    if (slotCategory === 'popular') return s.category === 'popular';
    if (slotCategory === 'soon') return s.category === 'soon';
    return true;
  });

  const categoryTournaments = tournaments.filter(t => {
    if (tournamentCategory === 'active') return t.isActive;
    if (tournamentCategory === 'finished') return !t.isActive;
    return true;
  });

  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/login');

  const LanguageSwitcher = () => (
    <div style={{ position: 'relative', zIndex: 1000 }}>
      <button
        onClick={() => setLangDropdownOpen(!langDropdownOpen)}
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '10px',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#fff',
          cursor: 'pointer',
          transition: 'all 0.2s',
          fontSize: '0.9rem',
          fontWeight: '600'
        }}
      >
        <span style={{ fontSize: '1.2rem' }}>{language === 'ru' ? '🇷🇺' : '🇺🇸'}</span>
        <ChevronDown size={16} style={{
          transform: langDropdownOpen ? 'rotate(180deg)' : 'none',
          transition: 'transform 0.3s ease',
          opacity: 0.7
        }} />
      </button>

      {langDropdownOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 10px)',
          right: 0,
          background: '#1A1A1A',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
          padding: '8px',
          minWidth: '150px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <div
            onClick={() => { setLanguage('en'); setLangDropdownOpen(false); }}
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              background: language === 'en' ? 'rgba(255,107,0,0.1)' : 'transparent',
              color: language === 'en' ? 'var(--primary-orange)' : '#ccc',
              transition: 'all 0.2s',
              fontWeight: language === 'en' ? '600' : '400'
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>🇺🇸</span> English
          </div>
          <div
            onClick={() => { setLanguage('ru'); setLangDropdownOpen(false); }}
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              background: language === 'ru' ? 'rgba(255,107,0,0.1)' : 'transparent',
              color: language === 'ru' ? 'var(--primary-orange)' : '#ccc',
              transition: 'all 0.2s',
              fontWeight: language === 'ru' ? '600' : '400'
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>🇷🇺</span> Русский
          </div>
        </div>
      )}
    </div>
  );

  if (isAdminRoute) {
    if (authLoading) {
      return (
        <div style={{ height: '100vh', background: 'var(--bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loader2 className="animate-spin" color="var(--primary-orange)" size={48} />
        </div>
      );
    }

    return (
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/admin" /> : <LoginPage onLogin={setUser} />} />
        <Route path="/admin" element={user ? <AdminDashboard onLogout={() => setUser(null)} language={language} /> : <Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-dark)' }}>
      <div className="desktop-only">
        <Sidebar
          activeTab={currentTab}
          language={language}
          setLanguage={setLanguage}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          isLive={isLive}
          tgChat={tgChat}
          tgGroup={tgGroup}
          onSupportClick={() => setIsSupportModalOpen(true)}
        />
      </div>

      <SupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
        language={language}
      />

      <main style={{
        flex: 1,
        marginLeft: isCollapsed ? 'var(--sidebar-width-collapsed)' : 'var(--sidebar-width-expanded)',
        padding: '30px 40px',
        overflowY: 'auto',
        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
      }} className="main-content">

        <div className="top-bar">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {currentTab === 'slots' ? (
              <div className="slots-switcher">
                <div
                  onClick={() => {
                    setSlotCategory('popular');
                    if (location.pathname !== '/slots') navigate('/slots');
                  }}
                  className={`slots-switcher-item ${slotCategory === 'popular' ? 'active' : ''}`}
                >
                  <Flame size={18} /> {language === 'ru' ? 'Популярные' : 'Popular'}
                </div>
                <div
                  onClick={() => {
                    setSlotCategory('soon');
                    if (location.pathname !== '/slots') navigate('/slots');
                  }}
                  className={`slots-switcher-item ${slotCategory === 'soon' ? 'active' : ''}`}
                >
                  <Sparkles size={18} /> {language === 'ru' ? 'Новые игры' : 'New Games'}
                </div>
              </div>
            ) : currentTab === 'tournaments' ? (
              <div className="slots-switcher">
                <div
                  onClick={() => {
                    setTournamentCategory('active');
                    if (location.pathname !== '/tournaments') navigate('/tournaments');
                  }}
                  className={`slots-switcher-item ${tournamentCategory === 'active' ? 'active' : ''}`}
                >
                  <Trophy size={18} /> {t.activeTournaments}
                </div>
                <div
                  onClick={() => {
                    setTournamentCategory('finished');
                    if (location.pathname !== '/tournaments') navigate('/tournaments');
                  }}
                  className={`slots-switcher-item ${tournamentCategory === 'finished' ? 'active' : ''}`}
                >
                  <TrendingUp size={18} /> {t.finishedTournaments}
                </div>
              </div>
            ) : (
              <div className="slots-switcher">
                <div className="slots-switcher-item active">
                  {currentTab === 'bonuses' ? (
                    <>
                      <Wallet size={18} /> {t.bonusesShort}
                    </>
                  ) : (
                    <>
                      <Video size={18} /> {t.liveStream}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <LanguageSwitcher />
          </div>
        </div>

        <Routes>
          <Route path="/" element={<Navigate to="/bonuses" replace />} />

          <Route path="/bonuses" element={
            <div className="animate-fade-in">
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '20px'
              }}>
                {bonuses.filter(b => b.isActive !== false).map(bonus => (
                  <BonusCard
                    key={bonus.id}
                    siteName={bonus.siteName}
                    offer={bonus.offer}
                    promo={bonus.promo}
                    link={bonus.link}
                    color={bonus.color}
                    language={language}
                    disableHover={bonus.disableHover}
                  />
                ))}
              </div>
            </div>
          } />

          <Route path="/slots" element={
            <div className="animate-fade-in">
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '20px'
              }}>
                {categorySlots.length > 0 ? (
                  categorySlots.map(slot => (
                    <SlotCard
                      key={slot.id}
                      name={slot.name}
                      image={slot.image}
                      hasDemo={slot.hasDemo}
                      link={slot.link}
                      language={language}
                      rtp={slot.rtp}
                      provider={slot.provider}
                      onPlay={(link, name) => setActiveGame({ link, name })}
                    />
                  ))
                ) : (
                  <div style={{
                    gridColumn: '1 / -1',
                    padding: '60px',
                    textAlign: 'center',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '20px',
                    border: '1px dashed rgba(255,255,255,0.1)',
                    color: 'var(--text-dim)'
                  }} className="animate-fade-in">
                    {language === 'ru' ? 'Здесь скоро появятся новинки...' : 'New slots coming soon...'}
                  </div>
                )}
              </div>
            </div>
          } />

          <Route path="/tournaments" element={
            <div className="animate-fade-in" style={{
              display: 'flex',
              flexDirection: window.innerWidth < 1024 ? 'column' : 'row',
              gap: '30px',
              alignItems: 'flex-start'
            }}>
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}>
                {categoryTournaments.length > 0 ? (
                  categoryTournaments.map(tournament => (
                    <TournamentCard
                      key={tournament.id}
                      tournament={tournament}
                      language={language}
                    />
                  ))
                ) : (
                  <div style={{
                    padding: '60px',
                    textAlign: 'center',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: '24px',
                    border: '1px dashed rgba(255, 255, 255, 0.1)',
                    color: 'rgba(255, 255, 255, 0.4)',
                    width: '100%',
                    backdropFilter: 'blur(10px)'
                  }} className="animate-fade-in">
                    <Trophy size={48} style={{ marginBottom: '20px', opacity: 0.2, color: 'var(--primary-orange)' }} />
                    <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>
                      {tournamentCategory === 'active'
                        ? (language === 'ru' ? 'Активных турниров пока нет' : 'No active tournaments yet')
                        : (language === 'ru' ? 'Результаты скоро появятся' : 'Results coming soon')}
                    </div>
                    <div style={{ fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto' }}>
                      {tournamentCategory === 'active'
                        ? (language === 'ru' ? 'Следи за анонсами новых турниров в наших социальных сетях!' : 'Follow our social media to stay updated on new tournament announcements!')
                        : (language === 'ru' ? 'Здесь будут отображаться итоги завершенных турниров' : 'The results of completed tournaments will be displayed here')}
                    </div>
                  </div>
                )}
              </div>
              <CommunityBanner language={language} communityTg={communityTg} discordLink={discordLink} faceitLink={faceitLink} />
            </div>
          } />

          <Route path="/tournaments/:id" element={
            <TournamentDetail tournaments={tournaments} language={language} />
          } />

          <Route path="/streams" element={
            <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
              <StreamInfo language={language} isLive={isLive} kickLink={kickLink} />

              {/* Support Widget (Replacing Chat Rules) */}
              <div style={{
                marginTop: '30px',
                background: 'var(--bg-card)',
                padding: '30px',
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.05)',
                textAlign: 'center',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
              }}>
                <h3 style={{ marginBottom: '10px', color: '#fff', fontSize: '1.4rem', fontWeight: '800' }}>
                  {language === 'ru' ? 'ПОДДЕРЖАТЬ СТРИМЕРА' : 'SUPPORT STREAMER'}
                </h3>
                <p style={{ color: 'var(--text-dim)', marginBottom: '25px', fontSize: '0.95rem' }}>
                  {language === 'ru'
                    ? 'Ваша поддержка помогает улучшать качество контента и проводить больше турниров!'
                    : 'Your support helps improve content quality and host more tournaments!'}
                </p>
                <button
                  onClick={() => setIsSupportModalOpen(true)}
                  style={{
                    background: 'linear-gradient(135deg, #FF6B00 0%, #FF3D00 100%)',
                    color: '#fff',
                    padding: '16px 40px',
                    borderRadius: '16px',
                    border: 'none',
                    fontWeight: '800',
                    fontSize: '1.1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    margin: '0 auto',
                    boxShadow: '0 8px 30px rgba(255, 61, 0, 0.3)',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    outline: 'none'
                  }}
                  className="support-btn-main"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(255, 61, 0, 0.45)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(255, 61, 0, 0.3)';
                  }}
                >
                  {/* Shimmer effect */}
                  <div className="shimmer-effect" />

                  <CreditCard size={22} />
                  {language === 'ru' ? 'СДЕЛАТЬ ДОНАТ' : 'MAKE A DONATION'}
                </button>
              </div>
            </div>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/bonuses" replace />} />
        </Routes>
      </main>

      <div className="mobile-only">
        <MobileMenu
          activeTab={currentTab}
          language={language}
          isLive={isLive}
          tgGroup={tgGroup}
        />
      </div>

      <ThanksPopup
        isVisible={showThanks}
        onClose={() => setShowThanks(false)}
        language={language}
      />

      {/* Game Iframe Modal */}
      {activeGame && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          background: 'rgba(0,0,0,0.95)',
          display: 'flex',
          flexDirection: 'column',
          backdropFilter: 'blur(10px)',
          animation: 'fade-in 0.3s ease'
        }}>
          {/* Top Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '15px 30px',
            background: 'rgba(255,107,0,0.1)',
            borderBottom: '1px solid rgba(255,255,255,0.05)'
          }}>
            <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', fontWeight: '800', textTransform: 'uppercase' }}>
              {activeGame.name}
            </h3>
            <button
              onClick={() => setActiveGame(null)}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: 'none',
                color: '#fff',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--primary-orange)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            >
              <X size={24} />
            </button>
          </div>

          {/* Iframe Wrapper */}
          <div style={{ flex: 1, position: 'relative' }}>
            <iframe
              src={activeGame.link}
              style={{
                width: '100%',
                height: '100%',
                border: 'none'
              }}
              title={activeGame.name}
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
