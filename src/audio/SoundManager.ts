// Web Audio API Sound Synthesizer for ChessLove
// Pure mathematical synthesis without external audio files

class SoundManager {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  constructor() {
    // Restore sound preference if available
    const saved = localStorage.getItem('chesslove_sound_enabled');
    if (saved !== null) {
      this.enabled = saved === 'true';
    }
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
    localStorage.setItem('chesslove_sound_enabled', String(val));
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // 1. Toque suave sobre madera al mover pieza (~80ms)
  public playMove() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, t);
      osc.frequency.exponentialRampToValueAtTime(70, t + 0.08);

      gain.gain.setValueAtTime(0.7, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.08);
    } catch {
      // Audio context might be restricted before user gesture
    }
  }

  // 2. Chasquido de captura contundente (~120ms)
  public playCapture() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const oscSnap = ctx.createOscillator();
      const oscWood = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = ctx.currentTime;

      oscSnap.type = 'triangle';
      oscSnap.frequency.setValueAtTime(320, t);
      oscSnap.frequency.exponentialRampToValueAtTime(100, t + 0.08);

      oscWood.type = 'sine';
      oscWood.frequency.setValueAtTime(140, t);
      oscWood.frequency.exponentialRampToValueAtTime(50, t + 0.12);

      gain.gain.setValueAtTime(0.85, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      oscSnap.connect(gain);
      oscWood.connect(gain);
      gain.connect(ctx.destination);

      oscSnap.start(t);
      oscWood.start(t);
      oscSnap.stop(t + 0.12);
      oscWood.stop(t + 0.12);
    } catch {}
  }

  // 3. Alerta armónica de Jaque (dos tonos: D5 -> A5, ~260ms)
  public playCheck() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const t = ctx.currentTime;
      [587.33, 880.0].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = t + i * 0.13;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.55, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.13);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 0.13);
      });
    } catch {}
  }

  // 4. Victoria (Arpegio triunfal C5, E5, G5, C6)
  public playVictory() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const t = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = t + idx * 0.14;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.65, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 0.25);
      });
    } catch {}
  }

  // 5. Pop de burbuja de chat (~80ms tono ascendente)
  public playChatPop() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, t);
      osc.frequency.exponentialRampToValueAtTime(900, t + 0.08);

      gain.gain.setValueAtTime(0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.08);
    } catch {}
  }
}

export const soundManager = new SoundManager();
