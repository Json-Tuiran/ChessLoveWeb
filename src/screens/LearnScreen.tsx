import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, ChevronRight, GraduationCap, Sparkles, Trophy, Compass } from 'lucide-react';
import { LEARN_LEVELS } from '../learn/LearnCatalog';
import { Lesson } from '../learn/types';

interface LearnScreenProps {
  onSelectLesson: (lesson: Lesson) => void;
  onOpenBestiary: () => void;
  onOpenMiniGames: () => void;
  onExit: () => void;
}

export const LearnScreen: React.FC<LearnScreenProps> = ({
  onSelectLesson,
  onOpenBestiary,
  onOpenMiniGames,
  onExit,
}) => {
  const [completedIds, setCompletedIds] = useState<number[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('chesslove_completed_lessons');
    if (saved) {
      try {
        setCompletedIds(JSON.parse(saved));
      } catch {}
    }
  }, []);

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

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <GraduationCap size={20} color="var(--rose-gold-primary)" />
          <h2 style={{ fontSize: '1.15rem', color: 'var(--rose-gold-primary)', fontWeight: 700 }}>
            Academia de Ajedrez
          </h2>
        </div>

        <span style={{ fontSize: '11px', color: 'var(--education-success)', fontWeight: 600 }}>
          {completedIds.length} / 16 Retos
        </span>
      </div>

      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px', textAlign: 'center' }}>
        Aprende desde los pasos elementales hasta tácticas de complicidad romántica para disfrutar el ajedrez juntos.
      </p>

      {/* Featured Beginner Learning Cards (Bestiary & Mini-Games) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '22px' }}>
        {/* El Alma de las Piezas */}
        <div
          onClick={onOpenBestiary}
          className="glass-panel"
          style={{
            padding: '14px',
            cursor: 'pointer',
            border: '1px solid var(--border-gold)',
            background: 'linear-gradient(135deg, rgba(229, 115, 136, 0.15), rgba(38, 30, 42, 0.8))',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'transform 0.2s ease',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <Compass size={18} color="var(--rose-gold-primary)" />
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFF' }}>
                El Alma de las Piezas
              </span>
            </div>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Movimiento geométrico, valores en corazones y práctica libre en 3D.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '10px', fontSize: '0.75rem', color: 'var(--rose-gold-primary)', fontWeight: 600 }}>
            <span>Explorar piezas</span>
            <ChevronRight size={14} />
          </div>
        </div>

        {/* Gimnasio del Corazón (Mini-Juegos) */}
        <div
          onClick={onOpenMiniGames}
          className="glass-panel"
          style={{
            padding: '14px',
            cursor: 'pointer',
            border: '1px solid var(--border-gold)',
            background: 'linear-gradient(135deg, rgba(255, 209, 102, 0.12), rgba(38, 30, 42, 0.8))',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'transform 0.2s ease',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <Trophy size={18} color="#FFD166" />
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFF' }}>
                Gimnasio del Corazón
              </span>
            </div>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Mini-juegos: Cosecha de Corazones (Caballo) y Guerra de Peones.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '10px', fontSize: '0.75rem', color: '#FFD166', fontWeight: 600 }}>
            <span>Entrenar ahora</span>
            <ChevronRight size={14} />
          </div>
        </div>
      </div>

      {/* Levels and Lessons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {LEARN_LEVELS.map(level => {
          const completedInLevel = level.lessons.filter(l => completedIds.includes(l.id)).length;

          return (
            <div key={level.level} className="glass-panel" style={{ padding: '16px' }}>
              {/* Level Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '6px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '20px' }}>{level.icon}</span>
                  <h3 style={{ fontSize: '1rem', color: 'var(--dark-on-surface)', fontWeight: 700 }}>
                    {level.title}
                  </h3>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--rose-gold-secondary)', fontWeight: 600 }}>
                  {completedInLevel} / {level.lessons.length}
                </span>
              </div>

              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                {level.description}
              </p>

              {/* Lesson Items Grid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {level.lessons.map(lesson => {
                  const isDone = completedIds.includes(lesson.id);

                  return (
                    <div
                      key={lesson.id}
                      onClick={() => onSelectLesson(lesson)}
                      className="glass-card"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        cursor: 'pointer',
                        borderLeft: isDone ? '3px solid var(--education-success)' : '1px solid var(--border-subtle)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {isDone ? (
                          <CheckCircle2 size={18} color="var(--education-success)" />
                        ) : (
                          <div
                            style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              border: '1.5px solid var(--border-gold)',
                            }}
                          />
                        )}
                        <div>
                          <h4 style={{ fontSize: '0.9rem', color: 'var(--dark-on-surface)', fontWeight: 600 }}>
                            {lesson.title}
                          </h4>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{lesson.subtitle}</p>
                        </div>
                      </div>

                      <ChevronRight size={16} color="var(--rose-gold-secondary)" />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
