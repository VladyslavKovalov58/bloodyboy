import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import BonusCard from './components/BonusCard';
import StreamInfo from './components/StreamInfo';
import MobileMenu from './components/MobileMenu'; // Import MobileMenu
import { translations } from './translations';

function App() {
  const [activeTab, setActiveTab] = useState('bonuses');
  const [language, setLanguage] = useState('ru'); // Default to RU
  const [isCollapsed, setIsCollapsed] = useState(true); // Sidebar state - Default Collapsed

  const t = translations[language];

  useEffect(() => {
    document.title = translations[language].logo;
  }, [language]);

  // Specific bonuses requested by user
  const bonuses = [
    {
      id: 1,
      siteName: 'MAD',
      offer: t.mad.offer,
      promo: t.mad.promo,
      link: 'https://send.me2mad.com/affiliate/m_ps5to0n3?path=%2Fregistration',
      color: '#E30052' // Pink-Red
    },
    {
      id: 2,
      siteName: 'CACTUS',
      offer: t.cactus.offer,
      promo: t.cactus.promo,
      link: 'https://elcongresoelias.xyz/affiliate/c_49k6bonh',
      color: '#00D100' // Green
    },
    {
      id: 3,
      siteName: 'VODKA',
      offer: t.vodka.offer,
      promo: t.vodka.promo,
      link: 'https://vesemir.vodka/?id=16106',
      color: '#00ccff' // Blue
    },
    // Placeholders for "Soon"
    {
      id: 4,
      siteName: t.soon.name,
      offer: t.soon.offer,
      promo: t.soon.promo,
      link: '#',
      color: '#333333', // Neutral/Dark
      disableHover: true
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
          padding: '6px 10px',
          borderRadius: '6px',
          fontSize: '0.8rem',
          fontWeight: language === 'ru' ? 'bold' : 'normal',
          transition: 'all 0.2s'
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
          padding: '6px 10px',
          borderRadius: '6px',
          fontSize: '0.8rem',
          fontWeight: language === 'en' ? 'bold' : 'normal',
          transition: 'all 0.2s'
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
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          language={language}
          setLanguage={setLanguage}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
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
            {activeTab === 'bonuses' ? t.bonusesTitle : t.streamTitle}
          </h2>

          {/* Language Switcher - Mobile Only */}
          <div className="mobile-only">
            <LanguageSwitcher />
          </div>
        </div>

        {activeTab === 'bonuses' && (
          <div className="animate-fade-in">
            {/* 3 Columns Grid */}
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
                  language={language} // Pass language to card
                  image={bonus.image} // Pass image prop
                  disableHover={bonus.disableHover}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'streams' && (
          <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <StreamInfo language={language} />

            {/* Rules */}
            <div style={{ marginTop: '30px', background: 'var(--bg-card)', padding: '30px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ marginBottom: '15px', color: '#fff' }}>{t.chatRules}</h3>
              <ul style={{ color: 'var(--text-dim)', paddingLeft: '20px', lineHeight: '1.8' }}>
                <li>1. No spam / Без спама</li>
                <li>2. Respect others / Уважайте других</li>
                <li>3. Have fun / Веселитесь!</li>
              </ul>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Menu - Mobile Only */}
      <div className="mobile-only">
        <MobileMenu
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          language={language}
        />
      </div>
    </div>
  );
}

export default App;
