import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Heart, Compass, Shield, Zap } from 'lucide-react';
import { PieceType, BoardState, Move } from '../engine/types';
import { ChessEngine } from '../engine/ChessEngine';
import { ChessBoard } from '../components/board/ChessBoard';
import { soundManager } from '../audio/SoundManager';

interface PieceDetail {
  type: PieceType;
  title: string;
  subtitle: string;
  romanceQuote: string;
  heartsValue: number | '∞';
  movementDescription: string;
  tacticalTip: string;
  icon: string;
}

const PIECE_DETAILS: PieceDetail[] = [
  {
    type: 'PAWN',
    title: 'El Peón',
    subtitle: 'El Corazón Valiente',
    romanceQuote: 'Comienza humilde y con pasos pequeños, pero si persevera con amor, ¡puede convertirse en Reina!',
    heartsValue: 1,
    movementDescription: 'Avanza 1 casilla hacia adelante (o 2 casillas en su primer paso). ¡Captura siempre en diagonal de a 1 casilla!',
    tacticalTip: 'Nunca retrocede. Cada paso que da es un compromiso hacia adelante, igual que el amor verdadero.',
    icon: '♟️',
  },
  {
    type: 'KNIGHT',
    title: 'El Caballo',
    subtitle: 'El Espíritu Libre',
    romanceQuote: 'El único que no conoce barreras: salta por encima de cualquier obstáculo para llegar a ti.',
    heartsValue: 3,
    movementDescription: 'Se mueve en forma de "L": 2 casillas en una dirección y 1 casilla perpendicular. ¡Es el único que salta piezas!',
    tacticalTip: 'En el centro del tablero controla hasta 8 casillas. Cuanto más cerca del corazón del tablero esté, más fuerte es.',
    icon: '♞',
  },
  {
    type: 'BISHOP',
    title: 'El Alfil',
    subtitle: 'El Protector Fiel',
    romanceQuote: 'Fiel a su color desde el primer día: si nació en casillas claras o oscuras, siempre cuidará ese sendero.',
    heartsValue: 3,
    movementDescription: 'Se desliza en diagonal tantas casillas libres como desee, hacia adelante o hacia atrás.',
    tacticalTip: 'En parejas son imparables. Dos alfiles juntos dominan todo el tablero como un amor que se complementa.',
    icon: '♝',
  },
  {
    type: 'ROOK',
    title: 'La Torre',
    subtitle: 'La Fortaleza Eterna',
    romanceQuote: 'Firme, leal y recta como los cimientos de nuestro amor. Nunca titubea en su camino.',
    heartsValue: 5,
    movementDescription: 'Viaja en línea recta (horizontal y vertical) tantas casillas como estén libres.',
    tacticalTip: 'Colócala en columnas abiertas donde no haya peones que bloqueen su camino. Su poder se desata en el final.',
    icon: '♜',
  },
  {
    type: 'QUEEN',
    title: 'La Dama (Reina)',
    subtitle: 'La Soberana del Tablero',
    romanceQuote: 'El poder absoluto y majestuoso: libre de volar en cualquier dirección que dicte su corazón.',
    heartsValue: 9,
    movementDescription: 'Combina el poder de la Torre y del Alfil: viaja en línea recta y en diagonal cualquier distancia.',
    tacticalTip: 'Cuídala con devoción. Aunque es poderosa, si sale demasiado temprano puede ser blanco de ataques rivales.',
    icon: '♛',
  },
  {
    type: 'KING',
    title: 'El Rey',
    subtitle: 'El Alma de la Partida',
    romanceQuote: 'El corazón de todo: toda la corte lo protege con sus vidas, porque si él cae, la historia termina.',
    heartsValue: '∞',
    movementDescription: 'Da 1 paso en cualquier dirección (recta o diagonal). ¡Nunca puede moverse a una casilla amenazada!',
    tacticalTip: 'En la apertura debe refugiarse con el enroque. En el final, sale valiente a luchar hombro a hombro con su reina.',
    icon: '♚',
  },
];

interface PieceBestiaryScreenProps {
  onBack: () => void;
}

export const PieceBestiaryScreen: React.FC<PieceBestiaryScreenProps> = ({ onBack }) => {
  const [selectedType, setSelectedType] = useState<PieceType>('KNIGHT');

  const currentPiece = PIECE_DETAILS.find(p => p.type === selectedType) || PIECE_DETAILS[0];

  // Playground board: single piece in the center
  const [playgroundBoard, setPlaygroundBoard] = useState<BoardState>(() => {
    return createSoloBoard(selectedType);
  });

  function createSoloBoard(type: PieceType): BoardState {
    const b = Array(8).fill(null).map(() => Array(8).fill(null));
    // Place in center e4 (row 4, col 4)
    b[4][4] = { type, color: 'WHITE' };
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

  const handleSelectPiece = (type: PieceType) => {
    setSelectedType(type);
    setPlaygroundBoard(createSoloBoard(type));
    soundManager.playMove();
  };

  const handlePlaygroundMove = (move: Move) => {
    const { newState } = ChessEngine.makeMove(playgroundBoard, move);
    // Force turn back to white so user can keep moving infinitely
    newState.currentTurn = 'WHITE';
    setPlaygroundBoard(newState);
  };

  const handleResetPiece = () => {
    setPlaygroundBoard(createSoloBoard(selectedType));
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
          <span>Volver a Academia</span>
        </button>

        <h2 style={{ fontSize: '1.2rem', color: 'var(--rose-gold-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>El Alma de las Piezas</span>
          <Sparkles size={16} color="var(--rose-gold-secondary)" />
        </h2>

        <div style={{ width: '40px' }} />
      </div>

      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '16px' }}>
        Conoce la personalidad, historia y magia de cada pieza. ¡Tócala en el tablero para ver sus senderos luminosos!
      </p>

      {/* Piece Selector Chips */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '8px',
          marginBottom: '16px',
        }}
      >
        {PIECE_DETAILS.map(p => {
          const isSelected = p.type === selectedType;
          return (
            <button
              key={p.type}
              onClick={() => handleSelectPiece(p.type)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-full)',
                border: isSelected ? '1px solid var(--rose-gold-primary)' : '1px solid var(--border-subtle)',
                backgroundColor: isSelected ? 'rgba(229, 115, 136, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                color: isSelected ? '#FFFFFF' : 'var(--text-muted)',
                fontWeight: isSelected ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
              }}
            >
              <span>{p.icon}</span>
              <span>{p.title}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Piece Romantic Card */}
      <div
        className="glass-panel"
        style={{
          padding: '20px',
          marginBottom: '16px',
          border: '1px solid var(--border-gold)',
          background: 'linear-gradient(135deg, rgba(38, 30, 42, 0.8), rgba(26, 22, 30, 0.95))',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--rose-gold-primary)', fontWeight: 700 }}>
              {currentPiece.title} — {currentPiece.subtitle}
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Valor en el corazón: {typeof currentPiece.heartsValue === 'number' ? Array(currentPiece.heartsValue).fill('💖').join('') : '💖 Infinito'} ({currentPiece.heartsValue} pts)
            </span>
          </div>
          <img
            src={`${import.meta.env.BASE_URL}assets/pieces/w_${currentPiece.type.toLowerCase()}.webp`}
            alt={currentPiece.title}
            style={{ width: '48px', height: '48px', objectFit: 'contain', filter: 'drop-shadow(0 4px 10px rgba(229, 115, 136, 0.5))' }}
          />
        </div>

        {/* Romantic Quote */}
        <blockquote
          style={{
            fontStyle: 'italic',
            fontSize: '0.9rem',
            color: 'var(--rose-gold-secondary)',
            margin: '12px 0',
            paddingLeft: '12px',
            borderLeft: '3px solid var(--rose-gold-primary)',
          }}
        >
          "{currentPiece.romanceQuote}"
        </blockquote>

        {/* Movement description */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '10px', fontSize: '0.85rem' }}>
          <Compass size={16} color="var(--rose-gold-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong style={{ color: '#FFFFFF' }}>Cómo se mueve: </strong>
            <span style={{ color: 'var(--dark-on-surface)' }}>{currentPiece.movementDescription}</span>
          </div>
        </div>

        {/* Tactical advice */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '8px', fontSize: '0.85rem' }}>
          <Shield size={16} color="#FFD166" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong style={{ color: '#FFFFFF' }}>Consejo de oro: </strong>
            <span style={{ color: 'var(--dark-on-surface)' }}>{currentPiece.tacticalTip}</span>
          </div>
        </div>
      </div>

      {/* Interactive Playground Mini-Board */}
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dark-on-surface)' }}>
            🎮 Tablero de Práctica Libre (¡Toca y desliza la pieza!)
          </span>
          <button
            onClick={handleResetPiece}
            className="btn-secondary"
            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
          >
            Reubicar al centro
          </button>
        </div>

        <div style={{ maxWidth: '420px', margin: '0 auto' }}>
          <ChessBoard
            boardState={playgroundBoard}
            onMakeMove={handlePlaygroundMove}
            interactive={true}
            playerColor="WHITE"
          />
        </div>
      </div>
    </div>
  );
};
