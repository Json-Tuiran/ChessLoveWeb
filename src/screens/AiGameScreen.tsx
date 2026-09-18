import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, RotateCcw, Lightbulb, Bot, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { BoardState, Move, PieceColor } from '../engine/types';
import { ChessEngine } from '../engine/ChessEngine';
import { ChessAI, AIDifficulty } from '../engine/ChessAI';
import { ChessBoard } from '../components/board/ChessBoard';
import { soundManager } from '../audio/SoundManager';

interface AiGameScreenProps {
  onExit: () => void;
}

export const AiGameScreen: React.FC<AiGameScreenProps> = ({ onExit }) => {
  const [boardState, setBoardState] = useState<BoardState>(() => {
    try {
      const savedFen = sessionStorage.getItem('chesslove_ai_game_fen');
      if (savedFen) {
        return ChessEngine.fenToBoard(savedFen);
      }
    } catch {}
    return ChessEngine.createInitialState();
  });
  const [difficulty, setDifficulty] = useState<AIDifficulty>('EASY');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [hint, setHint] = useState<{ move: Move; message: string } | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(soundManager.enabled);
  const [gameOverModal, setGameOverModal] = useState<{ title: string; subtitle: string } | null>(null);

  // Auto-save AI match FEN on every move
  useEffect(() => {
    try {
      const fen = ChessEngine.boardToFen(boardState);
      sessionStorage.setItem('chesslove_ai_game_fen', fen);
    } catch {}
  }, [boardState]);

  // Accidental reload protection
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!gameOverModal) {
        e.preventDefault();
        e.returnValue = 'Tienes una partida activa contra la IA. ¿Seguro que deseas salir o recargar?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [gameOverModal]);

  const playerColor: PieceColor = 'WHITE';
  const isPlayerTurn = boardState.currentTurn === playerColor;

  const handlePlayerMove = (move: Move) => {
    if (!isPlayerTurn || isAiThinking) return;

    setHint(null);
    const { newState, result } = ChessEngine.makeMove(boardState, move);
    setBoardState(newState);

    if (result?.status === 'CHECKMATE') {
      soundManager.playVictory();
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#E57388', '#D4A373', '#70D6FF'],
      });
      setGameOverModal({
        title: '¡Victoria Brillante! 👑✨',
        subtitle: 'Has derrotado a la inteligencia artificial con una combinación impecable.',
      });
      return;
    } else if (result?.status?.startsWith('DRAW')) {
      setGameOverModal({
        title: '¡Tablas contra la Máquina! 🕊️',
        subtitle: result.reason || 'Pacto de igualdad táctica.',
      });
      return;
    } else if (result?.status === 'CHECK') {
      soundManager.playCheck();
    }

    // Trigger AI move with natural delay
    setIsAiThinking(true);
    setTimeout(() => {
      const aiMove = ChessAI.getBestMove(newState, difficulty);
      if (aiMove) {
        const { newState: afterAiState, result: aiResult } = ChessEngine.makeMove(newState, aiMove);
        setBoardState(afterAiState);

        const isCapture = !!newState.board[aiMove.toRow][aiMove.toCol] || !!aiMove.isEnPassant;
        if (isCapture) {
          soundManager.playCapture();
        } else {
          soundManager.playMove();
        }

        if (aiResult?.status === 'CHECKMATE') {
          setGameOverModal({
            title: '¡Jaque Mate de la IA! 🤖',
            subtitle: 'La máquina encontró una red de mate. ¡Inténtalo de nuevo!',
          });
        } else if (aiResult?.status?.startsWith('DRAW')) {
          setGameOverModal({
            title: '¡Tablas!',
            subtitle: aiResult.reason || 'Empate técnico.',
          });
        } else if (aiResult?.status === 'CHECK') {
          soundManager.playCheck();
        }
      }
      setIsAiThinking(false);
    }, 450);
  };

  const handleAskHint = () => {
    if (!isPlayerTurn || isAiThinking) return;
    const computedHint = ChessAI.getHint(boardState);
    if (computedHint) {
      setHint(computedHint);
      soundManager.playChatPop();
    }
  };

  const handleRestart = () => {
    sessionStorage.removeItem('chesslove_ai_game_fen');
    setBoardState(ChessEngine.createInitialState());
    setHint(null);
    setIsAiThinking(false);
    setGameOverModal(null);
  };

  const handleExitGame = () => {
    sessionStorage.removeItem('chesslove_ai_game_fen');
    onExit();
  };

  return (
    <div style={{ padding: '12px 16px 84px', maxWidth: '580px', margin: '0 auto', width: '100%' }}>
      {/* Top Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <button
          onClick={handleExitGame}
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
          <Bot size={18} color="#70D6FF" />
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#70D6FF' }}>
            Desafío contra IA
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

      {/* Difficulty Selector */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          marginBottom: '12px',
        }}
      >
        {(['BEGINNER', 'EASY', 'MEDIUM'] as AIDifficulty[]).map(lvl => {
          const isSelected = difficulty === lvl;
          const labels: Record<AIDifficulty, string> = {
            BEGINNER: 'Principiante',
            EASY: 'Fácil',
            MEDIUM: 'Intermedio',
          };

          return (
            <button
              key={lvl}
              onClick={() => {
                setDifficulty(lvl);
                handleRestart();
              }}
              style={{
                padding: '6px 10px',
                borderRadius: 'var(--radius-full)',
                border: isSelected ? '1px solid var(--rose-gold-primary)' : '1px solid var(--border-subtle)',
                backgroundColor: isSelected ? 'rgba(229, 115, 136, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                color: isSelected ? 'var(--rose-gold-primary)' : 'var(--text-muted)',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {labels[lvl]}
            </button>
          );
        })}
      </div>

      {/* Status Bar */}
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
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: isPlayerTurn ? '#EDE0D4' : '#1A161E',
              border: '2px solid var(--rose-gold-secondary)',
            }}
          />
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--dark-on-surface)' }}>
            {isAiThinking ? 'La IA está pensando... 🤖' : isPlayerTurn ? 'Tu turno (Blancas)' : 'Turno de la IA (Negras)'}
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
            }}
          >
            ¡JAQUE!
          </span>
        )}
      </div>

      {/* Chessboard */}
      <ChessBoard
        boardState={boardState}
        onMakeMove={handlePlayerMove}
        playerColor={playerColor}
        flipped={false}
        interactive={isPlayerTurn && !isAiThinking}
        hintMove={hint ? hint.move : null}
      />

      {/* Tactical Hint Banner */}
      {hint && (
        <div
          className="glass-panel"
          style={{
            marginTop: '12px',
            padding: '10px 16px',
            backgroundColor: 'rgba(229, 115, 136, 0.15)',
            border: '1px solid var(--rose-gold-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <Lightbulb size={20} color="var(--rose-gold-primary)" style={{ flexShrink: 0 }} />
          <p style={{ fontSize: '0.85rem', color: 'var(--dark-on-surface)' }}>{hint.message}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', gap: '10px' }}>
        <button
          onClick={handleAskHint}
          disabled={!isPlayerTurn || isAiThinking}
          className="btn-primary"
          style={{
            padding: '10px 18px',
            fontSize: '0.85rem',
            opacity: !isPlayerTurn || isAiThinking ? 0.5 : 1,
          }}
        >
          <Lightbulb size={16} />
          <span>Sugerencia / Pista</span>
        </button>

        <button onClick={handleRestart} className="btn-secondary" style={{ padding: '10px 18px', fontSize: '0.85rem' }}>
          <RotateCcw size={15} />
          <span>Reiniciar</span>
        </button>
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
                <span>Jugar Otra Vez</span>
              </button>
              <button onClick={handleExitGame} className="btn-secondary" style={{ width: '100%' }}>
                Volver al Menú
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
