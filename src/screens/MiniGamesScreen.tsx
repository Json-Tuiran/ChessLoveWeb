import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, Sparkles, Heart, Award, RotateCcw, Trophy, CheckCircle2 } from 'lucide-react';
import { BoardState, Move, PieceColor, PieceType, Position } from '../engine/types';
import { ChessEngine } from '../engine/ChessEngine';
import { MoveGenerator } from '../engine/MoveGenerator';
import { ChessBoard } from '../components/board/ChessBoard';
import { soundManager } from '../audio/SoundManager';

type MiniGameMode = 'KNIGHT_HARVEST' | 'PAWN_WARS' | 'QUEEN_CHECKMATE';

interface KnightLevel {
  levelNumber: number;
  name: string;
  knightStart: Position;
  targetHearts: Position[];
  description: string;
}

const KNIGHT_LEVELS: KnightLevel[] = [
  {
    levelNumber: 1,
    name: 'Primeros Pasos en L',
    knightStart: { row: 4, col: 4 }, // e4
    targetHearts: [
      { row: 2, col: 5 }, // f6
      { row: 3, col: 2 }, // c5
      { row: 5, col: 6 }, // g3
    ],
    description: 'Salta con el caballo hacia cada casilla que tiene un corazón para recolectarlo.',
  },
  {
    levelNumber: 2,
    name: 'La Danza de los Corazones',
    knightStart: { row: 7, col: 1 }, // b1
    targetHearts: [
      { row: 5, col: 2 }, // c3
      { row: 3, col: 3 }, // d5
      { row: 2, col: 5 }, // f6
      { row: 0, col: 4 }, // e8
    ],
    description: 'Traza saltos consecutivos en "L" para cruzar el tablero de amor.',
  },
  {
    levelNumber: 3,
    name: 'La Gran Travesía',
    knightStart: { row: 7, col: 6 }, // g1
    targetHearts: [
      { row: 5, col: 5 }, // f3
      { row: 4, col: 3 }, // d4
      { row: 2, col: 2 }, // c6
      { row: 1, col: 4 }, // e7
      { row: 0, col: 6 }, // g8
    ],
    description: 'El reto supremo: ¡recolecta los 5 corazones sin perder el ritmo!',
  },
];

interface MiniGamesScreenProps {
  onBack: () => void;
  partnerName: string;
}

export const MiniGamesScreen: React.FC<MiniGamesScreenProps> = ({ onBack, partnerName }) => {
  const [selectedGame, setSelectedGame] = useState<MiniGameMode>('KNIGHT_HARVEST');

  // --- Game 1: Knight Harvest State ---
  const [currentKnightLevelIndex, setCurrentKnightLevelIndex] = useState(0);
  const currentKnightLevel = KNIGHT_LEVELS[currentKnightLevelIndex];

  const [remainingHearts, setRemainingHearts] = useState<Position[]>(currentKnightLevel.targetHearts);
  const [moveCount, setMoveCount] = useState(0);
  const [isLevelComplete, setIsLevelComplete] = useState(false);

  const [knightBoard, setKnightBoard] = useState<BoardState>(() => {
    return initKnightBoard(currentKnightLevel.knightStart);
  });

  function initKnightBoard(start: Position): BoardState {
    const b = Array(8).fill(null).map(() => Array(8).fill(null));
    b[start.row][start.col] = { type: 'KNIGHT', color: 'WHITE' };
    return {
      board: b,
      currentTurn: 'WHITE',
      castlingRights: { whiteKingSide: false, whiteQueenSide: false, blackKingSide: false, blackQueenSide: false },
      enPassantTarget: null,
      halfMoveClock: 0,
      fullMoveNumber: 1,
      lastMove: null,
      isInCheck: false,
    };
  }

  const handleKnightMove = (move: Move) => {
    const { newState } = ChessEngine.makeMove(knightBoard, move);
    newState.currentTurn = 'WHITE'; // Always white's turn in solo harvest
    setKnightBoard(newState);
    setMoveCount(prev => prev + 1);

    // Check if landed on a heart
    const hitIndex = remainingHearts.findIndex(h => h.row === move.toRow && h.col === move.toCol);
    if (hitIndex !== -1) {
      soundManager.playCapture();
      confetti({
        particleCount: 25,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#E57388', '#FFD166', '#FFFFFF'],
      });

      const updated = remainingHearts.filter((_, idx) => idx !== hitIndex);
      setRemainingHearts(updated);

      if (updated.length === 0) {
        setIsLevelComplete(true);
        soundManager.playVictory();
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#E57388', '#D4A373', '#FFD166'],
        });
      }
    }
  };

  const handleNextKnightLevel = () => {
    if (currentKnightLevelIndex < KNIGHT_LEVELS.length - 1) {
      const nextIdx = currentKnightLevelIndex + 1;
      setCurrentKnightLevelIndex(nextIdx);
      const nextLvl = KNIGHT_LEVELS[nextIdx];
      setRemainingHearts(nextLvl.targetHearts);
      setKnightBoard(initKnightBoard(nextLvl.knightStart));
      setMoveCount(0);
      setIsLevelComplete(false);
    } else {
      // Finished all
      setIsLevelComplete(false);
      setCurrentKnightLevelIndex(0);
      setRemainingHearts(KNIGHT_LEVELS[0].targetHearts);
      setKnightBoard(initKnightBoard(KNIGHT_LEVELS[0].knightStart));
      setMoveCount(0);
    }
  };

  const handleRestartKnightLevel = () => {
    const lvl = KNIGHT_LEVELS[currentKnightLevelIndex];
    setRemainingHearts(lvl.targetHearts);
    setKnightBoard(initKnightBoard(lvl.knightStart));
    setMoveCount(0);
    setIsLevelComplete(false);
    soundManager.playChatPop();
  };

  // Convert remaining hearts to overlay highlights
  const heartHighlights = remainingHearts.map(h => ({
    row: h.row,
    col: h.col,
    color: 'rgba(229, 115, 136, 0.45)',
  }));

  // --- Game 2: Pawn Wars State ---
  const [pawnBoard, setPawnBoard] = useState<BoardState>(initPawnBoard);
  const [pawnWinner, setPawnWinner] = useState<string | null>(null);

  function initPawnBoard(): BoardState {
    const b = Array(8).fill(null).map(() => Array(8).fill(null));
    for (let c = 0; c < 8; c++) {
      b[1][c] = { type: 'PAWN', color: 'BLACK' };
      b[6][c] = { type: 'PAWN', color: 'WHITE' };
    }
    return {
      board: b,
      currentTurn: 'WHITE',
      castlingRights: { whiteKingSide: false, whiteQueenSide: false, blackKingSide: false, blackQueenSide: false },
      enPassantTarget: null,
      halfMoveClock: 0,
      fullMoveNumber: 1,
      lastMove: null,
      isInCheck: false,
    };
  }

  const handlePawnMove = (move: Move) => {
    const { newState } = ChessEngine.makeMove(pawnBoard, move);
    setPawnBoard(newState);

    // Check if white pawn reached row 0 (Queen promotion)
    if (move.toRow === 0) {
      setPawnWinner('WHITE');
      soundManager.playVictory();
      confetti({ particleCount: 70, spread: 70 });
      return;
    }

    // AI response for black pawns
    setTimeout(() => {
      const legalMoves = MoveGenerator.generateLegalMoves(newState).filter(m => {
        const p = newState.board[m.fromRow][m.fromCol];
        return p?.color === 'BLACK';
      });

      if (legalMoves.length === 0) {
        setPawnWinner('WHITE');
        soundManager.playVictory();
        return;
      }

      // Prioritize captures or furthest advancement
      const captureMove = legalMoves.find(m => !!newState.board[m.toRow][m.toCol]);
      const chosenMove = captureMove || legalMoves[Math.floor(Math.random() * legalMoves.length)];

      const aiResult = ChessEngine.makeMove(newState, chosenMove);
      setPawnBoard(aiResult.newState);

      if (chosenMove.toRow === 7) {
        setPawnWinner('BLACK');
      }
    }, 400);
  };

  const handleRestartPawnWars = () => {
    setPawnBoard(initPawnBoard());
    setPawnWinner(null);
    soundManager.playChatPop();
  };

  return (
    <div style={{ padding: '16px 16px 90px', maxWidth: '680px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <button
          onClick={onBack}
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

        <h2 style={{ fontSize: '1.2rem', color: 'var(--rose-gold-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>Gimnasio del Corazón</span>
          <Trophy size={16} color="var(--rose-gold-secondary)" />
        </h2>

        <div style={{ width: '40px' }} />
      </div>

      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '16px' }}>
        Mini-juegos diseñados para aprender sin el estrés de un tablero completo de 32 piezas.
      </p>

      {/* Game Mode Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          onClick={() => setSelectedGame('KNIGHT_HARVEST')}
          className={selectedGame === 'KNIGHT_HARVEST' ? 'btn-primary' : 'btn-secondary'}
          style={{ flex: 1, padding: '10px 8px', fontSize: '0.82rem', gap: '6px' }}
        >
          <span>♞ Cosecha de Corazones</span>
        </button>
        <button
          onClick={() => setSelectedGame('PAWN_WARS')}
          className={selectedGame === 'PAWN_WARS' ? 'btn-primary' : 'btn-secondary'}
          style={{ flex: 1, padding: '10px 8px', fontSize: '0.82rem', gap: '6px' }}
        >
          <span>♟️ Guerra de Peones</span>
        </button>
      </div>

      {/* Mode 1: Knight Harvest */}
      {selectedGame === 'KNIGHT_HARVEST' && (
        <div>
          <div className="glass-panel" style={{ padding: '16px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <h3 style={{ fontSize: '1.05rem', color: 'var(--rose-gold-primary)', fontWeight: 700 }}>
                Nivel {currentKnightLevel.levelNumber}: {currentKnightLevel.name}
              </h3>
              <span style={{ fontSize: '0.82rem', color: 'var(--rose-gold-secondary)', fontWeight: 600 }}>
                Saltos: {moveCount} | Corazones restantes: {remainingHearts.length} 💖
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {currentKnightLevel.description}
            </p>
          </div>

          <div style={{ maxWidth: '440px', margin: '0 auto', position: 'relative' }}>
            <ChessBoard
              boardState={knightBoard}
              onMakeMove={handleKnightMove}
              interactive={!isLevelComplete}
              playerColor="WHITE"
              externalHighlights={heartHighlights}
            />

            {/* Level Complete Overlay */}
            {isLevelComplete && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(18, 16, 22, 0.9)',
                  backdropFilter: 'blur(6px)',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '20px',
                  zIndex: 40,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '48px', marginBottom: '8px' }}>🎉💖</div>
                <h3 style={{ fontSize: '1.3rem', color: 'var(--rose-gold-primary)', fontWeight: 700, marginBottom: '6px' }}>
                  ¡Nivel Completado con Amor!
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--dark-on-surface)', marginBottom: '16px' }}>
                  ¡Has dominado el salto del caballo en tan solo {moveCount} movimientos!
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={handleRestartKnightLevel} className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
                    <RotateCcw size={14} />
                    <span>Repetir</span>
                  </button>
                  <button onClick={handleNextKnightLevel} className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
                    <Sparkles size={14} />
                    <span>Siguiente Nivel</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mode 2: Pawn Wars */}
      {selectedGame === 'PAWN_WARS' && (
        <div>
          <div className="glass-panel" style={{ padding: '16px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <h3 style={{ fontSize: '1.05rem', color: 'var(--rose-gold-primary)', fontWeight: 700 }}>
                Guerra de Peones: Camino a la Corona
              </h3>
              <button onClick={handleRestartPawnWars} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                Reiniciar
              </button>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Solo juegan los 8 peones. Recuerda: ¡avanzan hacia adelante y capturan en diagonal! Gana quien logre coronar a Dama al llegar al fondo.
            </p>
          </div>

          <div style={{ maxWidth: '440px', margin: '0 auto', position: 'relative' }}>
            <ChessBoard
              boardState={pawnBoard}
              onMakeMove={handlePawnMove}
              interactive={!pawnWinner && pawnBoard.currentTurn === 'WHITE'}
              playerColor="WHITE"
            />

            {pawnWinner && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(18, 16, 22, 0.9)',
                  backdropFilter: 'blur(6px)',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '20px',
                  zIndex: 40,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '48px', marginBottom: '8px' }}>
                  {pawnWinner === 'WHITE' ? '👑💖' : '🖤🌹'}
                </div>
                <h3 style={{ fontSize: '1.3rem', color: 'var(--rose-gold-primary)', fontWeight: 700, marginBottom: '6px' }}>
                  {pawnWinner === 'WHITE' ? '¡Has Coronado tu Primera Reina!' : '¡Buen intento!'}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--dark-on-surface)', marginBottom: '16px' }}>
                  {pawnWinner === 'WHITE'
                    ? 'Llegaste a la última fila: tu peón se convirtió en la Reina más hermosa.'
                    : 'Las negras avanzaron primero, pero cada intento te hace más sabia.'}
                </p>
                <button onClick={handleRestartPawnWars} className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
                  <RotateCcw size={15} />
                  <span>Jugar otra revancha</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
