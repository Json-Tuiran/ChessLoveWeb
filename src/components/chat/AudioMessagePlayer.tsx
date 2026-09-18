import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause } from 'lucide-react';

interface AudioMessagePlayerProps {
  audioBase64: string;
}

export const AudioMessagePlayer: React.FC<AudioMessagePlayerProps> = ({ audioBase64 }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(audioBase64);
    audioRef.current = audio;

    audio.onended = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    audio.ontimeupdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [audioBase64]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(err => console.error('Audio play error:', err));
      setIsPlaying(true);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '6px 10px',
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
        borderRadius: 'var(--radius-md)',
        minWidth: '160px',
      }}
    >
      <button
        onClick={togglePlay}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          backgroundColor: 'var(--rose-gold-primary)',
          border: 'none',
          color: '#FFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        {isPlaying ? <Pause size={16} /> : <Play size={16} style={{ marginLeft: '2px' }} />}
      </button>

      {/* Animated Waveform Visualizer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flexGrow: 1, height: '24px' }}>
        {[40, 70, 100, 60, 85, 45, 95, 65, 30].map((height, i) => (
          <div
            key={i}
            style={{
              width: '3px',
              height: isPlaying ? `${Math.max(20, Math.sin(Date.now() / 200 + i) * 100)}%` : `${height}%`,
              backgroundColor: isPlaying ? 'var(--rose-gold-light)' : 'rgba(255, 255, 255, 0.4)',
              borderRadius: '2px',
              transition: 'height 0.15s ease',
            }}
          />
        ))}
      </div>

      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
        {Math.round(progress)}%
      </span>
    </div>
  );
};
