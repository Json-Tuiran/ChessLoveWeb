import React, { useState, useEffect } from 'react';
import { ArrowLeft, Heart, Sparkles, Trophy, Award } from 'lucide-react';
import { CoupleStoryEngine, CoupleStats } from '../story/CoupleStoryEngine';

interface OurStoryScreenProps {
  userName: string;
  partnerName: string;
  onExit: () => void;
}

export const OurStoryScreen: React.FC<OurStoryScreenProps> = ({ userName, partnerName, onExit }) => {
  const [stats, setStats] = useState<CoupleStats>(CoupleStoryEngine.getStats());

  useEffect(() => {
    setStats(CoupleStoryEngine.getStats());
  }, []);

  const chemistry = CoupleStoryEngine.calculateChemistry(stats);
  const archetype = CoupleStoryEngine.getArchetype(stats);

  return (
    <div style={{ padding: '16px 16px 84px', maxWidth: '640px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <button
          onClick={onExit}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            fontSize: '0.85rem',
          }}
        >
          <ArrowLeft size={18} />
          <span>Volver</span>
        </button>

        <h2 style={{ fontSize: '1.2rem', color: 'var(--rose-gold-primary)', fontWeight: 700 }}>
          Nuestra Historia de Amor
        </h2>

        <div style={{ width: '40px' }} />
      </div>

      {/* Chemistry Hero Card */}
      <div
        className="glass-panel-glow"
        style={{
          padding: '24px 20px',
          textAlign: 'center',
          marginBottom: '20px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <Heart size={24} fill="var(--rose-gold-primary)" color="var(--rose-gold-primary)" className="pulse-heart" />
          <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--rose-gold-primary)', letterSpacing: '-0.02em' }}>
            {chemistry.percentage}%
          </span>
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 14px',
            borderRadius: '999px',
            backgroundColor: 'rgba(229, 115, 136, 0.25)',
            color: 'var(--rose-gold-light)',
            fontSize: '13px',
            fontWeight: 700,
            marginBottom: '10px',
          }}
        >
          <span>{chemistry.badgeIcon}</span>
          <span>{chemistry.label}</span>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto' }}>
          Unidos desde el {stats.startDate}. Su química se profundiza en cada jaque y cada combinación compartida.
        </p>
      </div>

      {/* Dynamic Couple Archetype */}
      <div className="glass-card" style={{ padding: '18px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <span style={{ fontSize: '24px' }}>{archetype.icon}</span>
          <div>
            <span style={{ fontSize: '10px', color: 'var(--rose-gold-secondary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
              Arquetipo de Pareja
            </span>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--dark-on-surface)', fontWeight: 700 }}>
              {archetype.title}
            </h3>
          </div>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
          {archetype.subtitle}
        </p>
      </div>

      {/* Stats Grid */}
      <h3 style={{ fontSize: '1rem', color: 'var(--dark-on-surface)', marginBottom: '10px', fontWeight: 600 }}>
        Crónicas del Tablero
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '24px' }}>
        <div className="glass-card" style={{ padding: '14px', textAlign: 'center' }}>
          <Trophy size={20} color="var(--rose-gold-secondary)" style={{ margin: '0 auto 6px' }} />
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#FFF' }}>{stats.gamesPlayed}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Partidas Jugadas</div>
        </div>

        <div className="glass-card" style={{ padding: '14px', textAlign: 'center' }}>
          <Award size={20} color="#52B788" style={{ margin: '0 auto 6px' }} />
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#FFF' }}>{stats.draws}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Empates Armónicos</div>
        </div>

        <div className="glass-card" style={{ padding: '14px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--rose-gold-primary)' }}>{stats.userWins}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Victorias de {userName} (Elo {stats.userElo})</div>
        </div>

        <div className="glass-card" style={{ padding: '14px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--rose-gold-secondary)' }}>{stats.partnerWins}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Victorias de {partnerName} (Elo {stats.partnerElo})</div>
        </div>
      </div>

      {/* Memories Log */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <Sparkles size={18} color="var(--rose-gold-primary)" />
        <h3 style={{ fontSize: '1rem', color: 'var(--dark-on-surface)', fontWeight: 600 }}>
          Bitácora de Recuerdos Inolvidables
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {stats.memories.map(mem => (
          <div
            key={mem.id}
            className="glass-card"
            style={{
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              borderLeft: '3px solid var(--rose-gold-primary)',
            }}
          >
            <span style={{ fontSize: '24px', flexShrink: 0 }}>{mem.icon}</span>
            <div style={{ flexGrow: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                <h4 style={{ fontSize: '0.92rem', color: 'var(--dark-on-surface)', fontWeight: 600 }}>
                  {mem.title}
                </h4>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{mem.date}</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                {mem.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
