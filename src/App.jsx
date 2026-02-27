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
import { supabase } from './supabaseClient';
import { Flame, Gamepad2, Video, Sparkles, TrendingUp, Medal, Wallet, ChevronDown, Trophy, ArrowLeft, MessageSquare } from 'lucide-react';
import { translations } from './translations';

// Navigation Logic Wrapper
const AppContent = () => {
  const [language, setLanguage] = useState('ru');
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isLive, setIsLive] = useState(true);
  const [user, setUser] = useState(null);
  const [config, setConfig] = useState({});
  const [tournaments, setTournaments] = useState([]);
  const [bonuses, setBonuses] = useState([]);

  const [slotCategory, setSlotCategory] = useState('popular');
  const [tournamentCategory, setTournamentCategory] = useState('active');
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const currentTab = location.pathname.split('/')[1] || 'bonuses';

  // Check auth session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
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
          fullDescription: dbT.full_description,
          rules: dbT.rules,
          sponsorName: dbT.sponsor_name,
          sponsorIcon: dbT.sponsor_icon,
          sponsorLink: dbT.sponsor_link,
          winner1: dbT.winner_1,
          winner1Prize: dbT.winner_1_prize,
          winner2: dbT.winner_2,
          winner2Prize: dbT.winner_2_prize,
          winner3: dbT.winner_3,
          winner3Prize: dbT.winner_3_prize
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
    };
    fetchData();
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




  const slots = [
    {
      id: 1,
      name: 'Wild Bounty Showdown',
      image: 'https://i.ibb.co/4nBDdn4k/image.png',
      hasDemo: true,
      link: 'https://m.eajzzxhro.com/135/index.html?ot=ca7094186b309ee149c55c8822e7ecf2&l=en&btt=2&or=21novodx%3Dzveuuscmj%3Dxjh&__hv=2fMEQCICuqoNGFMML4fGBdQE%2BkWN6hW4%2FfORGq%2Fnk1ZEMnawwmAiAxGYxJjOCWQZyBSVILpJeMljpfcPHLJNuUZN5itlB12A%3D%3D&__sv=010401YytG6oT6vOl81kKt_NDwR6QjynyruQC7y9kpWiV7QEg',
      provider: 'PG SOFT',
      rtp: '96.65%'
    },
    {
      id: 2,
      name: 'Le Bandit',
      image: 'https://i.ibb.co/1t06vgx1/image-1.jpg',
      hasDemo: true,
      link: 'https://static-live.hacksawgaming.com/1309/1.22.0/index.html?language=en&channel=desktop&gameid=1309&mode=2&token=123131&lobbyurl=https%3A%2F%2Fwww.hacksawgaming.com&currency=EUR&partner=demo&env=https://rgs-demo.hacksawgaming.com/api&realmoneyenv=https://rgs-demo.hacksawgaming.com/api',
      provider: 'Hacksaw',
      rtp: '96.34%'
    },
    {
      id: 3,
      name: 'The Dog House',
      image: 'https://i.ibb.co/Ngx6qDC6/image-2.jpg',
      hasDemo: true,
      link: 'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?gameSymbol=vs20doghouse&lang=ru&cur=USD&playMode=demo',
      provider: 'Pragmatic Play',
      rtp: '96.08%'
    },
    {
      id: 4,
      name: 'Gates of Olympus 1000',
      image: 'https://i.ibb.co/Z18Xgvwn/image.png',
      hasDemo: true,
      link: 'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?gameSymbol=vs20olympx&lang=ru&cur=USD&playMode=demo',
      provider: 'Pragmatic Play',
      rtp: '96.50%'
    },
    {
      id: 5,
      name: 'Starlight Princess 1000',
      image: 'https://i.ibb.co/BShbZJ1/image.png',
      hasDemo: true,
      link: 'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?gameSymbol=vs20starlightx&lang=ru&cur=USD&playMode=demo',
      provider: 'Pragmatic Play',
      rtp: '96.50%'
    },
    {
      id: 6,
      name: 'Sugar Rush',
      image: 'https://i.ibb.co/x9rJJBN/image.png',
      hasDemo: true,
      link: 'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?gameSymbol=vs20sugarrush&lang=ru&cur=USD&playMode=demo',
      provider: 'Pragmatic Play',
      rtp: '96.50%'
    },
    {
      id: 7,
      name: 'Le Fisherman',
      image: 'https://i.ibb.co/sdkhpkr2/image-1.png',
      hasDemo: true,
      link: 'https://static-live.hacksawgaming.com/2057/1.19.1/index.html?language=en&channel=desktop&gameid=2057&mode=2&token=123&partner=demo&env=https://rgs-demo.hacksawgaming.com/api&realmoneyenv=https://rgs-demo.hacksawgaming.com/api&alwaysredirect=true',
      provider: 'Hacksaw',
      rtp: '96.33%'
    },
    {
      id: 8,
      name: 'Lucky Penny 2',
      image: 'https://i.ibb.co/YFPX8TLM/image-2.png',
      hasDemo: true,
      link: 'https://3oaks.com/api/v1/games/lucky_penny_2/play?lang=en',
      provider: '3Oaks',
      rtp: '96.45%'
    },
    {
      id: 9,
      name: 'Wild Bandito',
      image: 'https://i.ibb.co/1tJXtDsP/image-3.jpg',
      hasDemo: true,
      link: 'https://m.eajzzxhro.com/104/index.html?ot=ca7094186b309ee149c55c8822e7ecf2&l=en&btt=2&ao=06gvo%3Doimdff3kr%3Dius&or=19lmtmbv%3Dxtcssqakh%3Dvhf&__hv=2fMEUCIQDPTuHaeIhp%2BPPYu0pYjv1XRGDd2sfi7BUF4wEtlhPemAIgEJ%2BI5%2BfuP8tTXqhceqcJETEimZ6GtC%2FL97ihSN3JgPE%3D&__sv=010401YytG6oT6vOl81kKt_NDwR6QjynyruQC7y9kpWiV7QEg',
      provider: 'PG Soft',
      rtp: '96.73%'
    },
    {
      id: 10,
      name: 'SixSixSix',
      image: 'https://i.ibb.co/Mx7G2ZdM/image-3.png',
      hasDemo: true,
      link: 'https://static-live.hacksawgaming.com/1534/1.37.1/index.html?language=en&channel=desktop&gameid=1534&mode=2&token=123&partner=demo&env=https://rgs-demo.hacksawgaming.com/api&realmoneyenv=https://rgs-demo.hacksawgaming.com/api&alwaysredirect=true',
      provider: 'Hacksaw',
      rtp: '96.15%'
    },
    {
      id: 11,
      name: 'RIP City',
      image: 'https://i.ibb.co/ymZjnnMw/image-4.png',
      hasDemo: true,
      link: 'https://static-live.hacksawgaming.com/1233/1.33.2/index.html?language=en&channel=desktop&gameid=1233&mode=2&token=123&partner=demo&env=https://rgs-demo.hacksawgaming.com/api&realmoneyenv=https://rgs-demo.hacksawgaming.com/api&alwaysredirect=true',
      provider: 'Hacksaw',
      rtp: '96.22%'
    },
    {
      id: 12,
      name: 'Zeus vs Hades Gods of War 250',
      image: 'https://i.ibb.co/SXw9kShM/image-4.jpg',
      hasDemo: true,
      link: 'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?gameSymbol=vs15zeushadseq&lang=ru&cur=USD&playMode=demo',
      provider: 'Pragmatic Play',
      rtp: '96.56%'
    },
    {
      id: 13,
      name: 'Le Rapper',
      image: 'https://i.ibb.co/nqXPJWkX/image-5.jpg',
      hasDemo: true,
      link: 'https://static-live.hacksawgaming.com/2155/1.0.2/index.html?language=en&channel=desktop&gameid=2155&mode=2&token=123&partner=demo&env=https://rgs-demo.hacksawgaming.com/api&realmoneyenv=https://rgs-demo.hacksawgaming.com/api&alwaysredirect=true',
      provider: 'Hacksaw',
      rtp: '96.34%',
      isComingSoon: true
    }
  ];


  const categorySlots = slots.filter(s => {
    if (slotCategory === 'popular') return !s.isComingSoon;
    if (slotCategory === 'soon') return s.isComingSoon;
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
        />
      </div>

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
              <div style={{ marginTop: '30px', background: 'var(--bg-card)', padding: '30px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ marginBottom: '15px', color: '#fff' }}>{t.chatRules}</h3>
                <ul style={{ color: 'var(--text-dim)', paddingLeft: '20px', lineHeight: '1.8' }}>
                  <li>1. No spam / Без спама</li>
                  <li>2. Respect others / Уважайте других</li>
                  <li>3. Have fun / Веселитесь!</li>
                </ul>
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
