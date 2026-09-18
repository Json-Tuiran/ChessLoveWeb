import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Mic, Square, ShieldCheck, Pin } from 'lucide-react';
import { AudioMessagePlayer } from './AudioMessagePlayer';
import { ChatContent } from '../../network/types';

export interface DisplayMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: ChatContent;
  timestamp: number;
  isSelf: boolean;
}

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  messages: DisplayMessage[];
  onSendMessage: (content: ChatContent) => void;
  currentMoveNotation?: string | null;
  partnerName: string;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  currentMoveNotation,
  partnerName,
}) => {
  const [inputText, setInputText] = useState('');
  const [linkCurrentMove, setLinkCurrentMove] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendText = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    onSendMessage({
      text: inputText.trim(),
      linkedMove: linkCurrentMove && currentMoveNotation ? currentMoveNotation : undefined,
    });

    setInputText('');
    setLinkCurrentMove(false);
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          onSendMessage({
            audioBase64: base64Audio,
            linkedMove: linkCurrentMove && currentMoveNotation ? currentMoveNotation : undefined,
          });
          setLinkCurrentMove(false);
        };

        // Stop all audio tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = window.setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone access denied or error:', err);
      alert('Por favor autoriza el acceso al micrófono para enviar notas de voz.');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 200,
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '420px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--velvet-card)',
          borderLeft: '1px solid var(--border-gold)',
          borderRadius: '0',
          boxShadow: 'var(--shadow-lg)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            backgroundColor: 'rgba(26, 22, 30, 0.8)',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--rose-gold-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>💖 {partnerName ? `Chat con ${partnerName}` : 'Chat de Pareja'}</span>
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--education-success)' }}>
              <ShieldCheck size={13} />
              <span>Cifrado E2EE con Clave de Amor</span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Message List */}
        <div
          style={{
            flexGrow: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {messages.length === 0 ? (
            <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', padding: '20px' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>💌</div>
              <p style={{ fontWeight: 600, color: 'var(--dark-on-surface)' }}>
                {partnerName ? `Conversación privada con ${partnerName}` : 'Tu nido de amor privado'}
              </p>
              <p style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '4px' }}>
                {partnerName
                  ? '¡Envíale unas palabras cariñosas, una nota de voz o comenta la partida!'
                  : 'Cuando tu pareja se conecte con tu Código de Amor, sus mensajes y notas de voz aparecerán aquí al instante.'}
              </p>
            </div>
          ) : (
            messages.map(msg => (
              <div
                key={msg.id}
                style={{
                  alignSelf: msg.isSelf ? 'flex-end' : 'flex-start',
                  maxWidth: '82%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <div
                  style={{
                    backgroundColor: msg.isSelf ? 'rgba(229, 115, 136, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                    border: msg.isSelf ? '1px solid rgba(229, 115, 136, 0.5)' : '1px solid var(--border-subtle)',
                    padding: '10px 14px',
                    borderRadius: msg.isSelf ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    color: 'var(--dark-on-surface)',
                  }}
                >
                  {/* Linked move tag if present */}
                  {msg.content.linkedMove && (
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                        backgroundColor: 'rgba(212, 163, 115, 0.25)',
                        color: 'var(--rose-gold-secondary)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        marginBottom: '6px',
                        fontWeight: 600,
                      }}
                    >
                      <Pin size={11} />
                      <span>Jugada: {msg.content.linkedMove}</span>
                    </div>
                  )}

                  {/* Text content */}
                  {msg.content.text && <p style={{ fontSize: '0.95rem', wordBreak: 'break-word' }}>{msg.content.text}</p>}

                  {/* Audio voice note player */}
                  {msg.content.audioBase64 && (
                    <div style={{ marginTop: '4px' }}>
                      <AudioMessagePlayer audioBase64={msg.content.audioBase64} />
                    </div>
                  )}
                </div>

                <span
                  style={{
                    fontSize: '10px',
                    color: 'var(--text-muted)',
                    alignSelf: msg.isSelf ? 'flex-end' : 'flex-start',
                    padding: '0 4px',
                  }}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'rgba(26, 22, 30, 0.95)',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {/* Linked Move Option */}
          {currentMoveNotation && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input
                type="checkbox"
                id="link-move-check"
                checked={linkCurrentMove}
                onChange={e => setLinkCurrentMove(e.target.checked)}
                style={{ accentColor: 'var(--rose-gold-primary)', cursor: 'pointer' }}
              />
              <label
                htmlFor="link-move-check"
                style={{ fontSize: '12px', color: 'var(--rose-gold-secondary)', cursor: 'pointer' }}
              >
                Vincular a jugada actual ({currentMoveNotation})
              </label>
            </div>
          )}

          {isRecording ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 14px',
                backgroundColor: 'rgba(229, 56, 59, 0.2)',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--education-danger)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: '#E5383B',
                    animation: 'heartPulse 1s infinite',
                  }}
                />
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#E5383B' }}>
                  Grabando nota de voz: {recordingSeconds}s
                </span>
              </div>
              <button
                onClick={stopVoiceRecording}
                className="btn-primary"
                style={{ padding: '6px 14px', fontSize: '12px', gap: '4px' }}
              >
                <Square size={13} />
                <span>Enviar</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSendText} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="Escribe un mensaje de amor o táctica..."
                style={{
                  flexGrow: 1,
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-full)',
                  padding: '10px 16px',
                  color: 'var(--dark-on-surface)',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />

              {/* Record Mic Button */}
              <button
                type="button"
                onClick={startVoiceRecording}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid var(--border-gold)',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--rose-gold-primary)',
                  flexShrink: 0,
                }}
              >
                <Mic size={18} />
              </button>

              {/* Send Text Button */}
              <button
                type="submit"
                disabled={!inputText.trim()}
                style={{
                  backgroundColor: inputText.trim() ? 'var(--rose-gold-primary)' : 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: inputText.trim() ? 'pointer' : 'default',
                  color: '#FFFFFF',
                  flexShrink: 0,
                  transition: 'background-color 0.2s',
                }}
              >
                <Send size={16} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
