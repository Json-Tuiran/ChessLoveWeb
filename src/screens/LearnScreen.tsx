import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, ChevronRight, GraduationCap } from 'lucide-react';
import { LEARN_LEVELS } from '../learn/LearnCatalog';
import { Lesson } from '../learn/types';

interface LearnScreenProps {
  onSelectLesson: (lesson: Lesson) => void;
  onExit: () => void;
}

export const LearnScreen: React.FC<LearnScreenProps> = ({ onSelectLesson, onExit }) => {
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

      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px', textAlign: 'center' }}>
        Aprende desde los pasos elementales hasta tácticas de complicidad romántica para disfrutar el ajedrez juntos.
      </p>

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
