import React, { useState } from 'react';
import { Sparkles, Heart, KeyRound, PlusCircle } from 'lucide-react';

interface OnboardingModalProps {
  onComplete: (userName: string, coupleCode: string, partnerName?: string) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [pairingMode, setPairingMode] = useState<'CREATE' | 'JOIN'>('CREATE');
  const [enteredCode, setEnteredCode] = useState('');

  const generateRandomCode = () => {
    const words = ['AMOR', 'BESO', 'CORAZON', 'CIELO', 'REINA', 'REY', 'VIDA', 'SOL'];
    const word = words[Math.floor(Math.random() * words.length)];
    const num = Math.floor(10 + Math.random() * 90);
    return `${word}-${num}`;
  };

  const [createdCode] = useState(generateRandomCode);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const finalCode = pairingMode === 'CREATE' ? createdCode : enteredCode.trim().toUpperCase();
    if (!finalCode) return;

    onComplete(trimmedName, finalCode);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(18, 16, 22, 0.94)',
        backdropFilter: 'blur(12px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        className="glass-panel-glow"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '28px 24px',
          textAlign: 'center',
          animation: 'fadeScaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* App Logo & Welcome */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <img
            src={`${import.meta.env.BASE_URL}assets/logo.png`}
            alt="ChessLove Logo"
            style={{ width: '48px', height: '48px', objectFit: 'contain', filter: 'drop-shadow(0 2px 8px var(--rose-gold-glow))' }}
          />
          <h2
            style={{
              fontSize: '1.8rem',
              background: 'linear-gradient(135deg, var(--rose-gold-primary), var(--rose-gold-secondary))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            ChessLove
          </h2>
        </div>

        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
          Configura tu perfil para comenzar su historia en el ajedrez romántico.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px', textAlign: 'left' }}>
          {/* User Nickname Input */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--dark-on-surface)', marginBottom: '6px' }}>
              ¿Tu apodo cariñoso o cómo te dice tu pareja?
            </label>
            <input
              type="text"
              autoFocus
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ej. Mi Amor, Mi Cielo, Cariño, Mi Vida..."
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid var(--border-gold)',
                borderRadius: 'var(--radius-md)',
                color: '#FFFFFF',
                fontSize: '1rem',
                outline: 'none',
              }}
            />
            {/* Romantic Nickname Quick Suggestions */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
              {['Mi Amor', 'Mi Cielo', 'Cariño', 'Mi Vida', 'Mi Reina', 'Mi Rey'].map(apodo => (
                <button
                  key={apodo}
                  type="button"
                  onClick={() => setName(apodo)}
                  style={{
                    background: name === apodo ? 'var(--rose-gold-primary)' : 'rgba(255, 255, 255, 0.06)',
                    color: name === apodo ? '#1A161E' : 'var(--rose-gold-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '999px',
                    padding: '3px 10px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    transition: 'all 0.15s ease',
                  }}
                >
                  {apodo}
                </button>
              ))}
            </div>
          </div>

          {/* Pairing Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--dark-on-surface)', marginBottom: '8px' }}>
              Vinculación de Pareja:
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
              <button
                type="button"
                onClick={() => setPairingMode('CREATE')}
                style={{
                  padding: '10px 8px',
                  borderRadius: 'var(--radius-md)',
                  border: pairingMode === 'CREATE' ? '1.5px solid var(--rose-gold-primary)' : '1px solid var(--border-subtle)',
                  backgroundColor: pairingMode === 'CREATE' ? 'rgba(229, 115, 136, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                  color: pairingMode === 'CREATE' ? '#FFF' : 'var(--text-muted)',
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                }}
              >
                <PlusCircle size={14} />
                <span>Crear mi Código</span>
              </button>

              <button
                type="button"
                onClick={() => setPairingMode('JOIN')}
                style={{
                  padding: '10px 8px',
                  borderRadius: 'var(--radius-md)',
                  border: pairingMode === 'JOIN' ? '1.5px solid var(--rose-gold-secondary)' : '1px solid var(--border-subtle)',
                  backgroundColor: pairingMode === 'JOIN' ? 'rgba(212, 163, 115, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                  color: pairingMode === 'JOIN' ? '#FFF' : 'var(--text-muted)',
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                }}
              >
                <KeyRound size={14} />
                <span>Tengo el Código</span>
              </button>
            </div>

            {pairingMode === 'CREATE' ? (
              <div
                style={{
                  padding: '12px 16px',
                  backgroundColor: 'rgba(229, 115, 136, 0.12)',
                  border: '1px dashed var(--rose-gold-primary)',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center',
                }}
              >
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Tu Código de Amor asignado:</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--rose-gold-primary)', letterSpacing: '0.08em', marginTop: '2px' }}>
                  {createdCode}
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Compártelo con tu pareja para que lo ingrese al abrir la app.
                </p>
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  required={pairingMode === 'JOIN'}
                  value={enteredCode}
                  onChange={e => setEnteredCode(e.target.value.toUpperCase())}
                  placeholder="PEGA O ESCRIBE EL CÓDIGO (EJ. AMOR-77)"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid var(--border-gold)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--rose-gold-secondary)',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    fontSize: '1rem',
                    textAlign: 'center',
                    outline: 'none',
                  }}
                />
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', textAlign: 'center' }}>
                  Ingresa el código que tu pareja te envió.
                </p>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!name.trim() || (pairingMode === 'JOIN' && !enteredCode.trim())}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '1rem',
              marginTop: '6px',
              opacity: !name.trim() || (pairingMode === 'JOIN' && !enteredCode.trim()) ? 0.5 : 1,
            }}
          >
            <Sparkles size={18} />
            <span>Comenzar Nuestra Historia 💖</span>
          </button>
        </form>
      </div>
    </div>
  );
};
