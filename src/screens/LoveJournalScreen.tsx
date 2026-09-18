import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookHeart, Sparkles, Heart, Calendar, MessageSquareHeart, CheckCircle2, Lock } from 'lucide-react';
import { soundManager } from '../audio/SoundManager';

export interface Milestone {
  id: string;
  title: string;
  romanticDescription: string;
  icon: string;
  unlockedAt: string | null; // ISO string or null
  loveNote: string;
}

const DEFAULT_MILESTONES: Milestone[] = [
  {
    id: 'first_connection',
    title: 'El Primer Nido de Amor',
    romanticDescription: 'Unieron sus corazones en ChessLove con su Código de Pareja privado.',
    icon: '💌',
    unlockedAt: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }),
    loveNote: 'Aquí comenzó nuestro viaje en el ajedrez romántico.',
  },
  {
    id: 'first_voice_note',
    title: 'La Melodía de tu Voz',
    romanticDescription: 'Enviaron su primera nota de voz cifrada comentando el juego con cariño.',
    icon: '🎙️',
    unlockedAt: null,
    loveNote: '',
  },
  {
    id: 'knight_harvest',
    title: 'La Danza del Caballo',
    romanticDescription: 'Recolectaron sus primeros corazones en el Gimnasio del Corazón dominando el salto en L.',
    icon: '♞',
    unlockedAt: null,
    loveNote: '',
  },
  {
    id: 'pawn_coronation',
    title: 'La Coronación de la Reina',
    romanticDescription: 'Llevaron un peón valiente hasta el final del tablero y lo convirtieron en Reina.',
    icon: '👑',
    unlockedAt: null,
    loveNote: '',
  },
  {
    id: 'first_lesson',
    title: 'Alumnos del Amor',
    romanticDescription: 'Completaron su primera lección táctica juntos en la Academia.',
    icon: '🎓',
    unlockedAt: null,
    loveNote: '',
  },
  {
    id: 'first_check',
    title: 'El Latido del Jaque',
    romanticDescription: 'Hicieron temblar al Rey rival con un jaque elegante y apasionado.',
    icon: '⚡',
    unlockedAt: null,
    loveNote: '',
  },
];

interface LoveJournalScreenProps {
  userName: string;
  partnerName: string;
  onBack: () => void;
}

export const LoveJournalScreen: React.FC<LoveJournalScreenProps> = ({
  userName,
  partnerName,
  onBack,
}) => {
  const [milestones, setMilestones] = useState<Milestone[]>(() => {
    const saved = localStorage.getItem('chesslove_journal_milestones');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_MILESTONES;
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  const saveMilestones = (updated: Milestone[]) => {
    setMilestones(updated);
    localStorage.setItem('chesslove_journal_milestones', JSON.stringify(updated));
  };

  const handleStartEdit = (m: Milestone) => {
    setEditingId(m.id);
    setEditingText(m.loveNote);
  };

  const handleSaveNote = (id: string) => {
    const updated = milestones.map(m => (m.id === id ? { ...m, loveNote: editingText.trim() } : m));
    saveMilestones(updated);
    setEditingId(null);
    soundManager.playChatPop();
  };

  const handleUnlockManual = (id: string) => {
    const today = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    const updated = milestones.map(m =>
      m.id === id ? { ...m, unlockedAt: m.unlockedAt ? null : today } : m
    );
    saveMilestones(updated);
    soundManager.playCapture();
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
          <span>Diario de Amor & Hitos</span>
          <BookHeart size={18} color="var(--rose-gold-secondary)" />
        </h2>

        <div style={{ width: '40px' }} />
      </div>

      <div
        className="glass-panel"
        style={{
          padding: '16px',
          marginBottom: '20px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(229, 115, 136, 0.15), rgba(212, 163, 115, 0.1))',
          border: '1px solid var(--border-gold)',
        }}
      >
        <h3 style={{ fontSize: '1.1rem', color: 'var(--rose-gold-primary)', fontWeight: 700, marginBottom: '4px' }}>
          Nuestra Historia en el Tablero 📖💖
        </h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--dark-on-surface)' }}>
          {userName} y {partnerName || 'Mi Pareja'}
        </p>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Cada partida, cada pieza aprendida y cada jugada compartida queda grabada aquí como un recuerdo eterno.
        </p>
      </div>

      {/* Milestones List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {milestones.map(m => {
          const isUnlocked = !!m.unlockedAt;
          return (
            <div
              key={m.id}
              className="glass-panel"
              style={{
                padding: '16px',
                border: isUnlocked ? '1px solid var(--border-gold)' : '1px solid var(--border-subtle)',
                backgroundColor: isUnlocked ? 'rgba(38, 30, 42, 0.7)' : 'rgba(255, 255, 255, 0.03)',
                opacity: isUnlocked ? 1 : 0.7,
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      backgroundColor: isUnlocked ? 'rgba(229, 115, 136, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '22px',
                      flexShrink: 0,
                      border: isUnlocked ? '1px solid var(--rose-gold-primary)' : '1px solid var(--border-subtle)',
                    }}
                  >
                    {m.icon}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.98rem', color: isUnlocked ? 'var(--rose-gold-primary)' : 'var(--text-muted)', fontWeight: 700 }}>
                      {m.title}
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {m.romanticDescription}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleUnlockManual(m.id)}
                  title={isUnlocked ? 'Hito completado con amor' : 'Marcar como desbloqueado'}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: isUnlocked ? 'var(--education-success)' : 'var(--text-muted)',
                    padding: '4px',
                  }}
                >
                  {isUnlocked ? <CheckCircle2 size={20} /> : <Lock size={18} />}
                </button>
              </div>

              {isUnlocked && (
                <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--rose-gold-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={13} />
                      <span>Alcanzado el {m.unlockedAt}</span>
                    </span>

                    {editingId !== m.id && (
                      <button
                        onClick={() => handleStartEdit(m)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--rose-gold-primary)',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                        }}
                      >
                        {m.loveNote ? 'Editar dedicatoria' : '+ Escribir dedicatoria'}
                      </button>
                    )}
                  </div>

                  {editingId === m.id ? (
                    <div style={{ marginTop: '6px' }}>
                      <textarea
                        value={editingText}
                        onChange={e => setEditingText(e.target.value)}
                        placeholder="Escribe unas palabras cariñosas para recordar este momento..."
                        rows={2}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          backgroundColor: 'rgba(0,0,0,0.3)',
                          border: '1px solid var(--border-gold)',
                          borderRadius: 'var(--radius-md)',
                          color: '#FFF',
                          fontSize: '0.85rem',
                          outline: 'none',
                          resize: 'none',
                        }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                        <button
                          onClick={() => setEditingId(null)}
                          className="btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => handleSaveNote(m.id)}
                          className="btn-primary"
                          style={{ padding: '4px 12px', fontSize: '0.75rem' }}
                        >
                          Guardar
                        </button>
                      </div>
                    </div>
                  ) : (
                    m.loveNote && (
                      <p
                        style={{
                          fontSize: '0.82rem',
                          fontStyle: 'italic',
                          color: 'var(--dark-on-surface)',
                          backgroundColor: 'rgba(255,255,255,0.04)',
                          padding: '6px 10px',
                          borderRadius: 'var(--radius-sm)',
                          borderLeft: '2px solid var(--rose-gold-primary)',
                        }}
                      >
                        "{m.loveNote}"
                      </p>
                    )
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
