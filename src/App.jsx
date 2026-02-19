import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import BonusCard from './components/BonusCard';
import StreamInfo from './components/StreamInfo';
import MobileMenu from './components/MobileMenu';
import SlotCard from './components/SlotCard';
import { translations } from './translations';

// Navigation Logic Wrapper
const AppContent = () => {
  const [language, setLanguage] = useState('ru');
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isLive, setIsLive] = useState(true);

  const location = useLocation();
  const currentTab = location.pathname.split('/')[1] || 'bonuses';
  const t = translations[language];

  useEffect(() => {
    document.title = translations[language].logo;
  }, [language]);

  const bonuses = [
    {
      id: 1,
      siteName: 'MAD',
      offer: t.mad.offer,
      promo: t.mad.promo,
      link: t.mad.link,
      color: '#E30052'
    },
    {
      id: 2,
      siteName: 'CACTUS',
      offer: t.cactus.offer,
      promo: t.cactus.promo,
      link: t.cactus.link,
      color: '#00D100'
    },
    {
      id: 3,
      siteName: 'VODKA',
      offer: t.vodka.offer,
      promo: t.vodka.promo,
      link: t.vodka.link,
      color: '#00ccff'
    },
    {
      id: 4,
      siteName: 'Spark',
      offer: t.spark.offer,
      promo: t.spark.promo,
      link: t.spark.link,
      color: 'linear-gradient(135deg, #FF007F 0%, #00BFFF 100%)'
    },
    {
      id: 5,
      siteName: t.soon.name,
      offer: t.soon.offer,
      promo: t.soon.promo,
      link: '#',
      color: '#333333',
      disableHover: true
    },
    {
      id: 6,
      siteName: t.soon.name,
      offer: t.soon.offer,
      promo: t.soon.promo,
      link: '#',
      color: '#333333',
      disableHover: true
    },
    {
      id: 7,
      siteName: t.soon.name,
      offer: t.soon.offer,
      promo: t.soon.promo,
      link: '#',
      color: '#333333',
      disableHover: true
    },
    {
      id: 8,
      siteName: t.soon.name,
      offer: t.soon.offer,
      promo: t.soon.promo,
      link: '#',
      color: '#333333',
      disableHover: true
    }
  ];

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
      link: 'https://demogamesfree.pragmaticplay.net/gs2c/html5Game.do?extGame=1&symbol=vs20doghouse&gname=The%20Dog%20House&jurisdictionID=UK&mgckey=stylename@generic~SESSION@7b45bc12-5630-4abb-9108-bb2cce9a413e',
      provider: 'Pragmatic Play',
      rtp: '96.08%'
    },
    {
      id: 4,
      name: 'Gates of Olympus 1000',
      image: 'https://i.ibb.co/Z18Xgvwn/image.png',
      hasDemo: true,
      link: 'https://demogamesfree.pragmaticplay.net/hub-demo/html5Game.do?extGame=1&symbol=vs20olympgold&gname=Gates%20of%20Olympus%20Super%20Scatter&jurisdictionID=99&lobbyUrl=https%3A%2F%2Fclienthub.pragmaticplay.com%2Fslots%2Fgame-library%2F&mgckey=stylename@generic~SESSION@c555e684-5745-46ad-a25e-daa6c866a1a7',
      provider: 'Pragmatic Play',
      rtp: '96.50%'
    },
    {
      id: 5,
      name: 'Starlight Princess 1000',
      image: 'https://i.ibb.co/BShbZJ1/image.png',
      hasDemo: true,
      link: 'https://demogamesfree.pragmaticplay.net/gs2c/html5Game.do?extGame=1&symbol=vs20starlightx&gname=Starlight%20Princess%201000&jurisdictionID=99&mgckey=stylename@generic~SESSION@11a88e4c-c8fe-4816-bfc4-129d9f91e125',
      provider: 'Pragmatic Play',
      rtp: '96.50%'
    },
    {
      id: 6,
      name: 'Sugar Rush',
      image: 'https://i.ibb.co/x9rJJBN/image.png',
      hasDemo: true,
      link: 'https://demogamesfree.pragmaticplay.net/hub-demo/html5Game.do?extGame=1&symbol=vs20sugarrush&gname=Sugar%20Rush&jurisdictionID=99&lobbyUrl=https%3A%2F%2Fclienthub.pragmaticplay.com%2Fslots%2Fgame-library%2F&mgckey=stylename@generic~SESSION@62e1621c-adcc-4ca1-919d-f81d25ca4062',
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
    }
  ];

  const LanguageSwitcher = () => (
    <div style={{
      background: 'rgba(255,255,255,0.05)',
      borderRadius: '8px',
      padding: '4px',
      display: 'flex',
      gap: '5px'
    }}>
      <button
        onClick={() => setLanguage('ru')}
        style={{
          background: language === 'ru' ? 'var(--accent-purple)' : 'transparent',
          color: language === 'ru' ? '#fff' : 'var(--text-dim)',
          border: 'none',
          padding: '6px 12px',
          borderRadius: '6px',
          fontSize: '0.8rem',
          fontWeight: language === 'ru' ? 'bold' : 'normal',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: 1,
          cursor: 'pointer'
        }}
      >
        RU
      </button>
      <button
        onClick={() => setLanguage('en')}
        style={{
          background: language === 'en' ? 'var(--accent-purple)' : 'transparent',
          color: language === 'en' ? '#fff' : 'var(--text-dim)',
          border: 'none',
          padding: '6px 12px',
          borderRadius: '6px',
          fontSize: '0.8rem',
          fontWeight: language === 'en' ? 'bold' : 'normal',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: 1,
          cursor: 'pointer'
        }}
      >
        EN
      </button>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-dark)' }}>
      {/* Sidebar - Desktop Only */}
      <div className="desktop-only">
        <Sidebar
          activeTab={currentTab}
          language={language}
          setLanguage={setLanguage}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          isLive={isLive}
        />
      </div>

      {/* Main Content Area - Dynamic Margin */}
      <main style={{
        flex: 1,
        marginLeft: isCollapsed ? '80px' : '260px',
        padding: '30px 40px',
        overflowY: 'auto',
        transition: 'margin-left 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
      }}>

        {/* Top Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
          paddingBottom: '20px',
          borderBottom: '1px solid rgba(255,255,255,0.05)'
        }}>
          <h2 className="page-title">
            {currentTab === 'bonuses' && t.bonusesTitle}
            {currentTab === 'streams' && t.streamTitle}
            {currentTab === 'slots' && `🎰 ${t.bestSlots}`}
          </h2>

          <div className="mobile-only">
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
                {bonuses.map(bonus => (
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
                {slots.map(slot => (
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
                ))}
              </div>
            </div>
          } />

          <Route path="/streams" element={
            <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
              <StreamInfo language={language} isLive={isLive} />
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

      {/* Mobile Menu - Mobile Only */}
      <div className="mobile-only">
        <MobileMenu
          activeTab={currentTab}
          language={language}
          isLive={isLive}
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
