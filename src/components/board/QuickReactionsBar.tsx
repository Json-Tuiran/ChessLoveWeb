import React from 'react';
import { soundManager } from '../../audio/SoundManager';

interface QuickReactionsBarProps {
  onSendReaction: (emoji: string) => void;
}

export const QuickReactionsBar: React.FC<QuickReactionsBarProps> = ({ onSendReaction }) => {
  const emojis = ['💖', '😍', '🔥', '👑', '♟️', '🌹'];

  const handleClick = (emoji: string) => {
    soundManager.playChatPop();
    onSendReaction(emoji);
  };

  return (
    <div
      className="glass-panel"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: '8px 16px',
        borderRadius: 'var(--radius-full)',
        maxWidth: 'fit-content',
        margin: '12px auto 0',
      }}
    >
      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Reaccionar:
      </span>
      {emojis.map((emoji, index) => (
        <button
          key={`react-${index}`}
          onClick={() => handleClick(emoji)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '22px',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '50%',
            transition: 'transform 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'scale(1.3) translateY(-3px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1) translateY(0)';
          }}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};
