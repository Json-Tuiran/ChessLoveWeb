import React from 'react';
import { Home, Swords, GraduationCap, HeartHandshake, User } from 'lucide-react';

export type ScreenTab = 'HOME' | 'ONLINE' | 'LOCAL' | 'AI' | 'LEARN' | 'STORY' | 'PROFILE' | 'MINI_GAMES' | 'BESTIARY' | 'JOURNAL';

interface NavigationBarProps {
  currentTab: ScreenTab;
  onSelectTab: (tab: ScreenTab) => void;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({ currentTab, onSelectTab }) => {
  const navItems: { tab: ScreenTab; label: string; icon: React.ReactNode }[] = [
    { tab: 'HOME', label: 'Inicio', icon: <Home size={20} /> },
    { tab: 'ONLINE', label: 'Duelo', icon: <Swords size={20} /> },
    { tab: 'LEARN', label: 'Academia', icon: <GraduationCap size={20} /> },
    { tab: 'STORY', label: 'Historia', icon: <HeartHandshake size={20} /> },
    { tab: 'PROFILE', label: 'Perfil', icon: <User size={20} /> },
  ];

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '64px',
        backgroundColor: 'rgba(26, 22, 30, 0.92)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 90,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {navItems.map(item => {
        const isActive =
          currentTab === item.tab ||
          (item.tab === 'ONLINE' && (currentTab === 'LOCAL' || currentTab === 'AI'));

        return (
          <button
            key={item.tab}
            onClick={() => onSelectTab(item.tab)}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              color: isActive ? 'var(--rose-gold-primary)' : 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px 12px',
              transition: 'all 0.2s ease',
              position: 'relative',
            }}
          >
            {/* Active Indicator bar */}
            {isActive && (
              <span
                style={{
                  position: 'absolute',
                  top: '-1px',
                  width: '28px',
                  height: '3px',
                  backgroundColor: 'var(--rose-gold-primary)',
                  borderRadius: '2px',
                  boxShadow: '0 0 8px var(--rose-gold-primary)',
                }}
              />
            )}
            <div style={{ transform: isActive ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.2s' }}>
              {item.icon}
            </div>
            <span style={{ fontSize: '11px', fontWeight: isActive ? 700 : 500 }}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
