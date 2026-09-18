import React from 'react';
import { PieceColor, PieceType } from '../../engine/types';

interface PromotionModalProps {
  color: PieceColor;
  onSelect: (type: PieceType) => void;
  onCancel: () => void;
}

export const PromotionModal: React.FC<PromotionModalProps> = ({ color, onSelect, onCancel }) => {
  const pieces: { type: PieceType; name: string; file: string }[] = [
    { type: 'QUEEN', name: 'Dama', file: color === 'WHITE' ? 'w_queen.webp' : 'b_queen.webp' },
    { type: 'ROOK', name: 'Torre', file: color === 'WHITE' ? 'w_rook.webp' : 'b_rook.webp' },
    { type: 'BISHOP', name: 'Alfil', file: color === 'WHITE' ? 'w_bishop.webp' : 'b_bishop.webp' },
    { type: 'KNIGHT', name: 'Caballo', file: color === 'WHITE' ? 'w_knight.webp' : 'b_knight.webp' },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(18, 16, 22, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px',
      }}
      onClick={onCancel}
    >
      <div
        className="glass-panel-glow"
        style={{
          maxWidth: '380px',
          width: '100%',
          padding: '28px 24px',
          textAlign: 'center',
          animation: 'fadeScaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ fontSize: '28px', marginBottom: '8px' }}>👑✨</div>
        <h3 style={{ fontSize: '1.4rem', color: 'var(--rose-gold-primary)', marginBottom: '8px' }}>
          ¡Coronación del Peón!
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
          Elige el nuevo destino y poder de tu valiente peón:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {pieces.map(p => (
            <button
              key={p.type}
              onClick={() => onSelect(p.type)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 6px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-gold)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = 'var(--rose-gold-primary)';
                e.currentTarget.style.backgroundColor = 'rgba(229, 115, 136, 0.15)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--border-gold)';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              }}
            >
              <img
                src={`${import.meta.env.BASE_URL}assets/pieces/${p.file}`}
                alt={p.name}
                style={{ width: '56px', height: '56px', objectFit: 'contain', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))' }}
              />
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--dark-on-surface)' }}>{p.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
