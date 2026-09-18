import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, Lightbulb, RotateCcw, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import { Lesson } from '../learn/types';
import { BoardState, Move } from '../engine/types';
import { ChessEngine } from '../engine/ChessEngine';
import { ChessBoard } from '../components/board/ChessBoard';
import { soundManager } from '../audio/SoundManager';

interface LearnLessonScreenProps {
  lesson: Lesson;
  onExit: () => void;
  onNextLesson?: () => void;
}

export const LearnLessonScreen: React.FC<LearnLessonScreenProps> = ({
  lesson,
  onExit,
  onNextLesson,
}) => {
  const [boardState, setBoardState] = useState<BoardState>(ChessEngine.fenToBoard(lesson.initialFen));
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleMakeMove = (move: Move) => {
    if (isCompleted) return;

    // Check if move matches target
    const isTarget =
      move.fromRow === lesson.targetMove.fromRow &&
      move.fromCol === lesson.targetMove.fromCol &&
      move.toRow === lesson.targetMove.toRow &&
      move.toCol === lesson.targetMove.toCol &&
      (!lesson.targetMove.promotionType || move.promotionType === lesson.targetMove.promotionType);

    const { newState } = ChessEngine.makeMove(boardState, move);
    setBoardState(newState);

    if (isTarget) {
      soundManager.playVictory();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#E57388', '#52B788', '#D4A373'],
      });

      // Save to completed lessons
      const saved = localStorage.getItem('chesslove_completed_lessons');
      let completed: number[] = [];
      if (saved) {
        try {
          completed = JSON.parse(saved);
        } catch {}
      }
      if (!completed.includes(lesson.id)) {
        completed.push(lesson.id);
        localStorage.setItem('chesslove_completed_lessons', JSON.stringify(completed));
      }

      setIsCompleted(true);
      setFeedback(lesson.explanationOnSuccess);
    } else {
      setFeedback('Esa no es la jugada esperada para este reto. ¡Inténtalo de nuevo!');
      setTimeout(() => {
        setBoardState(ChessEngine.fenToBoard(lesson.initialFen));
        setFeedback(null);
      }, 1400);
    }
  };

  const handleReset = () => {
    setBoardState(ChessEngine.fenToBoard(lesson.initialFen));
    setFeedback(null);
    setIsCompleted(false);
    setShowHint(false);
  };

  return (
    <div style={{ padding: '12px 16px 84px', maxWidth: '580px', margin: '0 auto', width: '100%' }}>
      {/* Top Header */}
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
          <span>Lecciones</span>
        </button>

        <span style={{ fontSize: '11px', color: 'var(--rose-gold-secondary)', fontWeight: 600 }}>
          {lesson.levelTitle}
        </span>

        <button
          onClick={() => setShowHint(!showHint)}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-full)',
            padding: '4px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: 'var(--rose-gold-primary)',
            fontSize: '11px',
            cursor: 'pointer',
          }}
        >
          <Lightbulb size={14} />
          <span>Pista</span>
        </button>
      </div>

      {/* Lesson Title & Story Intro */}
      <div className="glass-panel" style={{ padding: '14px 18px', marginBottom: '14px' }}>
        <h2 style={{ fontSize: '1.2rem', color: 'var(--rose-gold-primary)', marginBottom: '4px' }}>
          {lesson.title}
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--dark-on-surface)', lineHeight: 1.45 }}>
          {lesson.storyIntro}
        </p>
      </div>

      {/* Hint Alert */}
      {showHint && (
        <div
          className="glass-panel"
          style={{
            padding: '10px 14px',
            marginBottom: '12px',
            backgroundColor: 'rgba(229, 115, 136, 0.15)',
            border: '1px solid var(--rose-gold-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Lightbulb size={16} color="var(--rose-gold-primary)" />
          <span style={{ fontSize: '0.82rem', color: 'var(--dark-on-surface)' }}>{lesson.hint}</span>
        </div>
      )}

      {/* Interactive Chessboard */}
      <ChessBoard
        boardState={boardState}
        onMakeMove={handleMakeMove}
        interactive={!isCompleted}
      />

      {/* Feedback Banner */}
      {feedback && (
        <div
          className="glass-panel"
          style={{
            marginTop: '12px',
            padding: '10px 16px',
            textAlign: 'center',
            backgroundColor: isCompleted ? 'rgba(82, 183, 136, 0.2)' : 'rgba(229, 56, 59, 0.2)',
            border: isCompleted ? '1px solid var(--education-success)' : '1px solid var(--education-danger)',
          }}
        >
          <p style={{ fontSize: '0.88rem', fontWeight: 600, color: isCompleted ? '#52B788' : '#E5383B' }}>
            {feedback}
          </p>
        </div>
      )}

      {/* Bottom Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '16px' }}>
        <button onClick={handleReset} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
          <RotateCcw size={14} />
          <span>Reiniciar Tablero</span>
        </button>
      </div>

      {/* Completed Success Modal */}
      {isCompleted && (
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
            <CheckCircle2 size={42} color="var(--education-success)" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1.4rem', color: 'var(--rose-gold-primary)', marginBottom: '8px' }}>
              ¡Reto Superado! 🎉💖
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--dark-on-surface)', marginBottom: '24px' }}>
              {lesson.explanationOnSuccess}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {onNextLesson && (
                <button onClick={onNextLesson} className="btn-primary" style={{ width: '100%' }}>
                  <span>Siguiente Lección</span>
                  <ChevronRight size={16} />
                </button>
              )}
              <button onClick={onExit} className="btn-secondary" style={{ width: '100%' }}>
                Volver a la Academia
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
