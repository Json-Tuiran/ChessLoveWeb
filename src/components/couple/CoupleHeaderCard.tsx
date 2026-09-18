import React from 'react';
import { Heart, Copy, Check, UserCheck } from 'lucide-react';
import { CoupleStoryEngine } from '../../story/CoupleStoryEngine';

interface CoupleHeaderCardProps {
  userName: string;
  partnerName: string;
  coupleCode: string;
  isPartnerOnline: boolean;
  onOpenProfile?: () => void;
}

export const CoupleHeaderCard: React.FC<CoupleHeaderCardProps> = ({
  userName,
  partnerName,
  coupleCode,
  isPartnerOnline,
  onOpenProfile,
}) => {
  const [copied, setCopied] = React.useState(false);

  const stats = CoupleStoryEngine.getStats();
  const chemistry = CoupleStoryEngine.calculateChemistry(stats);

  const copyCode = () => {
    navigator.clipboard.writeText(coupleCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="glass-panel-glow"
      style={{
        width: '100%',
        maxWidth: '560px',
        margin: '0 auto 16px',
        padding: '16px 20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background ambient glow */}
      <div
        style={{
          position: 'absolute',
          top: '-30px',
          right: '-30px',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(229, 115, 136, 0.25), transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        {/* User Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              border: '2px solid var(--rose-gold-primary)',
              boxShadow: '0 0 12px var(--rose-gold-glow)',
              backgroundColor: 'var(--velvet-elevated)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
            }}
          >
            👑
          </div>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--dark-on-surface)' }}>{userName}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--rose-gold-secondary)' }}>Elo {stats.userElo}</div>
          </div>
        </div>

        {/* Center: Pulsing Heart & Chemistry */}
        <div
          onClick={onOpenProfile}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
            padding: '4px 10px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(229, 115, 136, 0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Heart size={16} fill="var(--rose-gold-primary)" color="var(--rose-gold-primary)" className="pulse-heart" />
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--rose-gold-primary)' }}>
              {chemistry.percentage}%
            </span>
          </div>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>
            {chemistry.label}
          </span>
        </div>

        {/* Partner Avatar & Online Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexDirection: 'row-reverse' }}>
          <div style={{ position: 'relative' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                border: '2px solid var(--rose-gold-secondary)',
                boxShadow: '0 0 12px rgba(212, 163, 115, 0.3)',
                backgroundColor: 'var(--velvet-elevated)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
              }}
            >
              🌹
            </div>

            {/* Live Presence Dot Indicator */}
            <span
              style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: isPartnerOnline ? '#52B788' : '#6C757D',
                border: '2px solid var(--velvet-card)',
                boxShadow: isPartnerOnline ? '0 0 8px #52B788' : 'none',
              }}
            />
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: partnerName ? 'var(--dark-on-surface)' : 'var(--rose-gold-secondary)' }}>
              {partnerName ? partnerName : 'Esperando Pareja'}
            </div>
            <div style={{ fontSize: '0.75rem', color: isPartnerOnline ? '#52B788' : 'var(--text-muted)' }}>
              {isPartnerOnline ? 'En línea 💚' : (partnerName ? 'Desconectado' : 'Invita con tu código')}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom info: Room / Couple Code Bar */}
      <div
        style={{
          marginTop: '12px',
          paddingTop: '10px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
          <UserCheck size={13} color="var(--rose-gold-secondary)" />
          <span>Código de Amor:</span>
          <span style={{ fontWeight: 700, color: 'var(--rose-gold-primary)', letterSpacing: '0.05em' }}>
            {coupleCode}
          </span>
        </div>

        <button
          onClick={copyCode}
          style={{
            background: 'none',
            border: 'none',
            color: copied ? 'var(--education-success)' : 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11px',
            fontWeight: 600,
          }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
        </button>
      </div>
    </div>
  );
};
