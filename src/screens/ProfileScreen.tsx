import React, { useState } from 'react';
import { ArrowLeft, User, Heart, Volume2, VolumeX, Shield, Check, Copy, Sparkles, LogOut, BookHeart, ChevronRight } from 'lucide-react';
import { soundManager } from '../audio/SoundManager';

interface ProfileScreenProps {
  userName: string;
  partnerName: string;
  coupleCode: string;
  onUpdateProfile: (name: string, partner: string, code: string) => void;
  onLogout: () => void;
  onOpenJournal: () => void;
  onExit: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  userName,
  partnerName,
  coupleCode,
  onUpdateProfile,
  onLogout,
  onOpenJournal,
  onExit,
}) => {
  const [name, setName] = useState(userName);
  const [partner, setPartner] = useState(partnerName);
  const [code, setCode] = useState(coupleCode);
  const [soundEnabled, setSoundEnabled] = useState(soundManager.enabled);
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(name.trim(), partner.trim(), code.trim().toUpperCase() || coupleCode);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundManager.setEnabled(next);
  };

  const handleLogoutClick = () => {
    const confirmed = window.confirm(
      '¿Deseas cerrar sesión y desvincular la cuenta actual?\n\nAl hacerlo podrás ingresar con un nuevo nombre o utilizar otro código de emparejamiento para jugar con otra pareja.'
    );
    if (confirmed) {
      onLogout();
    }
  };

  return (
    <div style={{ padding: '16px 16px 84px', maxWidth: '580px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
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

        <h2 style={{ fontSize: '1.2rem', color: 'var(--rose-gold-primary)', fontWeight: 700 }}>
          Perfil de Pareja
        </h2>

        <div style={{ width: '40px' }} />
      </div>

      {/* Diario de Amor & Hitos Link */}
      <div
        onClick={onOpenJournal}
        className="glass-panel"
        style={{
          padding: '16px',
          marginBottom: '16px',
          cursor: 'pointer',
          border: '1px solid var(--border-gold)',
          background: 'linear-gradient(135deg, rgba(229, 115, 136, 0.16), rgba(38, 30, 42, 0.85))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'transform 0.2s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: 'rgba(229, 115, 136, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <BookHeart size={22} color="var(--rose-gold-primary)" />
          </div>
          <div>
            <h4 style={{ fontSize: '0.98rem', color: '#FFFFFF', fontWeight: 700 }}>
              Diario de Amor & Hitos 📖
            </h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Ver los logros desbloqueados juntos y escribir dedicatorias
            </p>
          </div>
        </div>
        <ChevronRight size={18} color="var(--rose-gold-secondary)" />
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* User Card */}
        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <User size={18} color="var(--rose-gold-primary)" />
            <h3 style={{ fontSize: '1rem', color: 'var(--dark-on-surface)', fontWeight: 600 }}>
              Tus Datos
            </h3>
          </div>

          <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
            Tu Nombre o Apodo Romántico:
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ej. Mi Amor, Mi Cielo, Mi Rey..."
            style={{
              width: '100%',
              padding: '10px 14px',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--dark-on-surface)',
              fontSize: '0.95rem',
              outline: 'none',
            }}
          />
        </div>

        {/* Partner Card */}
        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Heart size={18} color="var(--rose-gold-secondary)" />
            <h3 style={{ fontSize: '1rem', color: 'var(--dark-on-surface)', fontWeight: 600 }}>
              Datos de tu Pareja
            </h3>
          </div>

          <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
            Nombre o Apodo de tu Pareja:
          </label>
          <input
            type="text"
            value={partner}
            onChange={e => setPartner(e.target.value)}
            placeholder="Ej. Mi Vida, Cariño, Mi Reina..."
            style={{
              width: '100%',
              padding: '10px 14px',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--dark-on-surface)',
              fontSize: '0.95rem',
              outline: 'none',
            }}
          />
        </div>

        {/* Shared Romantic Code */}
        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <Shield size={18} color="var(--rose-gold-primary)" />
            <h3 style={{ fontSize: '1rem', color: 'var(--dark-on-surface)', fontWeight: 600 }}>
              Código de Pareja Compartido
            </h3>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Este código vincula sus dispositivos y deriva la clave para cifrar el chat de extremo a extremo.
          </p>

          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              style={{
                flexGrow: 1,
                padding: '10px 14px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid var(--border-gold)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--rose-gold-primary)',
                fontWeight: 700,
                letterSpacing: '0.05em',
                fontSize: '1rem',
                outline: 'none',
              }}
            />
            <button
              type="button"
              onClick={handleCopyCode}
              className="btn-secondary"
              style={{ padding: '0 16px', gap: '6px' }}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span>{copied ? 'Copiado' : 'Copiar'}</span>
            </button>
          </div>
        </div>

        {/* Audio & Preferences */}
        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {soundEnabled ? <Volume2 size={20} color="var(--rose-gold-primary)" /> : <VolumeX size={20} color="var(--text-muted)" />}
              <div>
                <h4 style={{ fontSize: '0.95rem', color: 'var(--dark-on-surface)', fontWeight: 600 }}>
                  Sonidos Sintéticos (Web Audio)
                </h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Toques de madera, capturas y arpegios triunfales
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleSound}
              className={soundEnabled ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '6px 14px', fontSize: '0.8rem' }}
            >
              {soundEnabled ? 'Activado' : 'Silenciado'}
            </button>
          </div>
        </div>

        {/* Save Button */}
        <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px', marginTop: '4px' }}>
          <Sparkles size={18} />
          <span>{savedSuccess ? '¡Cambios Guardados con Amor! 💖' : 'Guardar Cambios'}</span>
        </button>

        {/* Separator */}
        <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '8px 0' }} />

        {/* Logout / Unpair Account Card */}
        <div
          className="glass-panel"
          style={{
            padding: '18px',
            border: '1px solid rgba(229, 56, 59, 0.4)',
            backgroundColor: 'rgba(229, 56, 59, 0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <LogOut size={18} color="var(--education-danger)" />
            <h3 style={{ fontSize: '0.95rem', color: '#FFFFFF', fontWeight: 600 }}>
              Cerrar Sesión o Cambiar Pareja
            </h3>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.5 }}>
            ¿Creaste la cuenta por error o deseas ingresar otro Código de Emparejamiento? Al cerrar sesión volverás a la pantalla de bienvenida para ingresar con otra clave o apodo.
          </p>
          <button
            type="button"
            onClick={handleLogoutClick}
            style={{
              width: '100%',
              padding: '11px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--education-danger)',
              backgroundColor: 'rgba(229, 56, 59, 0.15)',
              color: '#FF6B6B',
              fontWeight: 600,
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <LogOut size={16} />
            <span>Cerrar Sesión / Desvincular Cuenta</span>
          </button>
        </div>
      </form>
    </div>
  );
};
