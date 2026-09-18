import React, { useState } from 'react';
import { Swords, Smartphone, Bot, GraduationCap, HeartHandshake, PlusCircle, LogIn } from 'lucide-react';
import { CoupleHeaderCard } from '../components/couple/CoupleHeaderCard';
import { ScreenTab } from '../components/common/NavigationBar';

interface HomeScreenProps {
  userName: string;
  partnerName: string;
  coupleCode: string;
  isPartnerOnline: boolean;
  onNavigate: (tab: ScreenTab) => void;
  onCreateOnlineRoom: () => void;
  onJoinOnlineRoom: (code: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  userName,
  partnerName,
  coupleCode,
  isPartnerOnline,
  onNavigate,
  onCreateOnlineRoom,
  onJoinOnlineRoom,
}) => {
  const [roomInput, setRoomInput] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomInput.trim()) {
      onJoinOnlineRoom(roomInput.trim().toUpperCase());
      setShowJoinModal(false);
      setRoomInput('');
    }
  };

  const gameModes = [
    {
      id: 'online',
      title: 'Duelo de Pareja Online',
      subtitle: 'En tiempo real con chat cifrado y notas de voz',
      icon: <Swords size={24} color="var(--rose-gold-primary)" />,
      badge: 'En Vivo',
      action: () => onNavigate('ONLINE'),
    },
    {
      id: 'local',
      title: 'Juego Local (1 Pantalla)',
      subtitle: 'Pasa y juega juntos en este mismo dispositivo',
      icon: <Smartphone size={24} color="var(--rose-gold-secondary)" />,
      action: () => onNavigate('LOCAL'),
    },
    {
      id: 'ai',
      title: 'Desafío contra la IA',
      subtitle: '3 niveles con sugerencias y pistas tácticas',
      icon: <Bot size={24} color="#70D6FF" />,
      action: () => onNavigate('AI'),
    },
    {
      id: 'learn',
      title: 'Academia de Ajedrez',
      subtitle: '16 lecciones interactivas para aprender con amor',
      icon: <GraduationCap size={24} color="#52B788" />,
      badge: '16 Retos',
      action: () => onNavigate('LEARN'),
    },
    {
      id: 'story',
      title: 'Nuestra Historia',
      subtitle: 'Porcentaje de química, arquetipos y bitácora Elo',
      icon: <HeartHandshake size={24} color="var(--rose-gold-light)" />,
      action: () => onNavigate('STORY'),
    },
  ];

  return (
    <div style={{ padding: '16px 16px 84px', maxWidth: '640px', margin: '0 auto', width: '100%' }}>
      {/* App Branding Header */}
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <img
            src={`${import.meta.env.BASE_URL}assets/logo.png`}
            alt="ChessLove Logo"
            style={{ width: '42px', height: '42px', objectFit: 'contain', filter: 'drop-shadow(0 2px 8px var(--rose-gold-glow))' }}
          />
          <h1
            style={{
              fontSize: '2rem',
              background: 'linear-gradient(135deg, var(--rose-gold-primary), var(--rose-gold-secondary))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
            }}
          >
            ChessLove
          </h1>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Ajedrez romántico y educativo para parejas 💖
        </p>
      </div>

      {/* Couple Status Card */}
      <CoupleHeaderCard
        userName={userName}
        partnerName={partnerName}
        coupleCode={coupleCode}
        isPartnerOnline={isPartnerOnline}
        onOpenProfile={() => onNavigate('PROFILE')}
      />

      {/* Quick Room Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
        <button
          onClick={onCreateOnlineRoom}
          className="btn-primary"
          style={{ width: '100%', padding: '12px 14px', fontSize: '0.88rem' }}
        >
          <PlusCircle size={18} />
          <span>Crear Sala</span>
        </button>

        <button
          onClick={() => setShowJoinModal(true)}
          className="btn-secondary"
          style={{ width: '100%', padding: '12px 14px', fontSize: '0.88rem' }}
        >
          <LogIn size={18} />
          <span>Unirse con Código</span>
        </button>
      </div>

      {/* Game Modes Selection */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h2 style={{ fontSize: '1.15rem', color: 'var(--dark-on-surface)', marginBottom: '4px', fontWeight: 600 }}>
          Modos de Juego
        </h2>

        {gameModes.map(mode => (
          <div
            key={mode.id}
            onClick={mode.action}
            className="glass-card"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {mode.icon}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '1rem', color: 'var(--dark-on-surface)', fontWeight: 600 }}>
                    {mode.title}
                  </h3>
                  {mode.badge && (
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '999px',
                        backgroundColor: 'rgba(229, 115, 136, 0.25)',
                        color: 'var(--rose-gold-primary)',
                      }}
                    >
                      {mode.badge}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{mode.subtitle}</p>
              </div>
            </div>
            <span style={{ color: 'var(--rose-gold-secondary)', fontSize: '1.2rem', fontWeight: 700 }}>›</span>
          </div>
        ))}
      </div>

      {/* Join Room Modal */}
      {showJoinModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setShowJoinModal(false)}
        >
          <div
            className="glass-panel-glow"
            style={{ width: '100%', maxWidth: '360px', padding: '24px' }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '1.2rem', color: 'var(--rose-gold-primary)', marginBottom: '8px' }}>
              Unirse a Sala de Amor
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Ingresa el código romántico generado por tu pareja (ej. AMOR-77):
            </p>

            <form onSubmit={handleJoinSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="text"
                autoFocus
                value={roomInput}
                onChange={e => setRoomInput(e.target.value.toUpperCase())}
                placeholder="CÓDIGO DE SALA"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid var(--border-gold)',
                  color: '#FFF',
                  fontSize: '1.1rem',
                  textAlign: 'center',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  outline: 'none',
                }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="btn-secondary"
                  style={{ flex: 1, padding: '10px' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!roomInput.trim()}
                  className="btn-primary"
                  style={{ flex: 1, padding: '10px' }}
                >
                  Entrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
