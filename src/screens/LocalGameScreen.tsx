import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, RotateCcw, Volume2, VolumeX, Sparkles, Smartphone } from 'lucide-react';
import { BoardState, Move } from '../engine/types';
import { ChessEngine } from '../engine/ChessEngine';
import { ChessBoard } from '../components/board/ChessBoard';
import { soundManager } from '../audio/SoundManager';
import { CoupleStoryEngine } from '../story/CoupleStoryEngine';
import { EloCalculator } from '../story/EloCalculator';

interface LocalGameScreenProps {
  userName: string;
  partnerName: string;
  onExit: () => void;
}

export const LocalGameScreen: React.FC<LocalGameScreenProps> = ({ userName, partnerName, onExit }) => {
  const [boardState, setBoardState] = useState<BoardState>(ChessEngine.createInitialState());
  const [history, setHistory] = useState<BoardState[]>([]);
  const [autoFlip, setAutoFlip] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(soundManager.enabled);
  const [gameOverModal, setGameOverModal] = useState<{ title: string; subtitle: string } | null>(null);

  const handleMakeMove = (move: Move) => {
    setHistory(prev => [...prev, ChessEngine.cloneState(boardState)]);
    const { newState, result } = ChessEngine.makeMove(boardState, move);
    setBoardState(newState);

    if (result?.status === 'CHECKMATE') {
      soundManager.playVictory();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#E57388', '#D4A373', '#FFD166'],
      });

      const winnerName = result.winner === 'WHITE' ? userName : partnerName;
      const stats = CoupleStoryEngine.getStats();
      const score = result.winner === 'WHITE' ? 1 : 0;
      const elo = EloCalculator.calculate(stats.userElo, stats.partnerElo, score);
      CoupleStoryEngine.recordGame(result.winner === 'WHITE' ? 'USER' : 'PARTNER', newState.fullMoveNumber, elo.newRatingA, elo.newRatingB);

      setGameOverModal({
        title: `¡Jaque Mate! Victoria para ${winnerName} 👑`,
        subtitle: result.reason || 'Partida local completada con honor.',
      });
    } else if (result?.status?.startsWith('DRAW')) {
      const stats = CoupleStoryEngine.getStats();
      const elo = EloCalculator.calculate(stats.userElo, stats.partnerElo, 0.5);
      CoupleStoryEngine.recordGame('DRAW', newState.fullMoveNumber, elo.newRatingA, elo.newRatingB);

      setGameOverModal({
        title: '¡Tablas Armónicas! 🕊️🤍',
        subtitle: result.reason || 'Un pacto de igualdad sobre el tablero.',
      });
    } else if (result?.status === 'CHECK') {
      soundManager.playCheck();
    }
  };

  const handleUndo = () => {
    if (history.length > 0) {
      const last = history[history.length - 1];
      setBoardState(last);
      setHistory(prev => prev.slice(0, -1));
    }
  };

  const handleRestart = () => {
    setBoardState(ChessEngine.createInitialState());
    setHistory([]);
    setGameOverModal(null);
  };

  const isWhiteTurn = boardState.currentTurn === 'WHITE';
  const currentTurnPlayer = isWhiteTurn ? userName : partnerName;
  const isFlipped = autoFlip && !isWhiteTurn;

  return (
    <div style={{ padding: '12px 16px 84px', maxWidth: '580px', margin: '0 auto', width: '100%' }}>
      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
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
          <span>Salir</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Smartphone size={16} color="var(--rose-gold-secondary)" />
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--rose-gold-secondary)' }}>
            Juego Local Cara a Cara
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              soundManager.setEnabled(next);
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: soundEnabled ? 'var(--rose-gold-primary)' : 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
      </div>

      {/* Turn Indicator */}
      <div
        className="glass-card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          marginBottom: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              backgroundColor: isWhiteTurn ? '#EDE0D4' : '#1A161E',
              border: '2px solid var(--rose-gold-secondary)',
            }}
          />
          <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--dark-on-surface)' }}>
            Turno de {currentTurnPlayer} ({isWhiteTurn ? 'Blancas' : 'Negras'})
          </span>
        </div>

        {boardState.isInCheck && (
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              backgroundColor: 'var(--education-danger)',
              color: '#FFF',
              padding: '2px 8px',
              borderRadius: '999px',
              animation: 'heartPulse 1s infinite',
            }}
          >
            ¡JAQUE!
          </span>
        )}
      </div>

      {/* Chessboard */}
      <ChessBoard
        boardState={boardState}
        onMakeMove={handleMakeMove}
        flipped={isFlipped}
        interactive={true}
      />

      {/* Controls Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '16px',
          gap: '8px',
        }}
      >
        <button
          onClick={() => setAutoFlip(!autoFlip)}
          className={autoFlip ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '8px 14px', fontSize: '0.8rem' }}
        >
          <span>{autoFlip ? 'Rotar Tablero: Sí' : 'Rotar Tablero: No'}</span>
        </button>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleUndo}
            disabled={history.length === 0}
            className="btn-secondary"
            style={{
              padding: '8px 14px',
              fontSize: '0.8rem',
              opacity: history.length === 0 ? 0.4 : 1,
              cursor: history.length === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            Deshacer
          </button>
          <button
            onClick={handleRestart}
            className="btn-secondary"
            style={{ padding: '8px 14px', fontSize: '0.8rem' }}
          >
            Reiniciar
          </button>
        </div>
      </div>

      {/* Game Over Modal */}
      {gameOverModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(18, 16, 22, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div className="glass-panel-glow" style={{ maxWidth: '380px', width: '100%', padding: '28px 24px', textAlign: 'center' }}>
            <Sparkles size={36} color="var(--rose-gold-primary)" style={{ margin: '0 auto 12px' }} />
            <h2 style={{ fontSize: '1.4rem', color: 'var(--rose-gold-primary)', marginBottom: '8px' }}>
              {gameOverModal.title}
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
              {gameOverModal.subtitle}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button onClick={handleRestart} className="btn-primary" style={{ width: '100%' }}>
                <RotateCcw size={16} />
                <span>Jugar Otra Partida</span>
              </button>
              <button onClick={onExit} className="btn-secondary" style={{ width: '100%' }}>
                Volver al Menú
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
