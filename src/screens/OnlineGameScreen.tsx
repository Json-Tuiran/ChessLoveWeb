import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Flag, ArrowLeft, GraduationCap, Sparkles, Volume2, VolumeX, ShieldCheck, HelpCircle, Undo2, Heart } from 'lucide-react';
import { BoardState, Move, PieceColor, Position } from '../engine/types';
import { ChessEngine } from '../engine/ChessEngine';
import { ChessBoard } from '../components/board/ChessBoard';
import { QuickReactionsBar } from '../components/board/QuickReactionsBar';
import { OverlayArrow, OverlayHighlight } from '../components/board/BoardOverlay';
import { MqttService } from '../network/MqttClient';
import { soundManager } from '../audio/SoundManager';
import { EloCalculator } from '../story/EloCalculator';
import { CoupleStoryEngine } from '../story/CoupleStoryEngine';
import { NetworkMessage } from '../network/types';

interface OnlineGameScreenProps {
  roomCode: string;
  isHost: boolean;
  userId: string;
  userName: string;
  partnerName: string;
  mqtt: MqttService;
  onExit: () => void;
}

export const OnlineGameScreen: React.FC<OnlineGameScreenProps> = ({
  roomCode,
  isHost,
  userId,
  userName,
  partnerName,
  mqtt,
  onExit,
}) => {
  const [boardState, setBoardState] = useState<BoardState>(() => {
    try {
      const savedFen = sessionStorage.getItem(`chesslove_board_fen_${roomCode}`);
      if (savedFen) {
        return ChessEngine.fenToBoard(savedFen);
      }
    } catch (e) {
      console.warn('Failed to restore board FEN from session:', e);
    }
    return ChessEngine.createInitialState();
  });
  const [playerColor, setPlayerColor] = useState<PieceColor>(isHost ? 'WHITE' : 'BLACK');
  const [isOpponentConnected, setIsOpponentConnected] = useState(false);
  const [teacherMode, setTeacherMode] = useState(false);
  const [teacherTool, setTeacherTool] = useState<'MOVE' | 'ARROW' | 'HIGHLIGHT'>('MOVE');
  const [teacherArrows, setTeacherArrows] = useState<OverlayArrow[]>([]);
  const [teacherHighlights, setTeacherHighlights] = useState<OverlayHighlight[]>([]);
  const [floatingReaction, setFloatingReaction] = useState<string | null>(null);

  // Sound preference
  const [soundEnabled, setSoundEnabled] = useState(soundManager.enabled);

  // Game over state
  const [gameOverModal, setGameOverModal] = useState<{ title: string; subtitle: string; winner?: string } | null>(null);

  // Beginner Mentoring & Co-Op State
  const [stateHistory, setStateHistory] = useState<BoardState[]>([]);
  const [pendingHintRequest, setPendingHintRequest] = useState<{ requesterName: string } | null>(null);
  const [incomingHintMove, setIncomingHintMove] = useState<Move | null>(null);
  const [hintMessage, setHintMessage] = useState<string | null>(null);
  const [encouragingToast, setEncouragingToast] = useState<string | null>(null);

  // 1. Auto-save board FEN on every move to survive accidental refreshes
  useEffect(() => {
    try {
      const fen = ChessEngine.boardToFen(boardState);
      sessionStorage.setItem(`chesslove_board_fen_${roomCode}`, fen);
    } catch (e) {}
  }, [boardState, roomCode]);

  // 2. Accidental refresh protection (beforeunload prompt)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!gameOverModal) {
        e.preventDefault();
        e.returnValue = 'Tienes una partida de ajedrez en curso con tu pareja 🌹. ¿Seguro que deseas salir o recargar?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [gameOverModal]);

  const roomTopic = `chesslove/room/${roomCode}`;

  // Handle incoming network messages
  const handleNetworkMessage = useCallback(
    async (_topic: string, msg: NetworkMessage) => {
      switch (msg.type) {
        case 'ROOM_ANNOUNCE':
          if (!isHost && msg.hostId !== userId) {
            mqtt.publish(roomTopic, {
              type: 'JOIN_REQUEST',
              roomId: `room_${roomCode}`,
              roomCode,
              guestId: userId,
              guestName: userName,
            });
          }
          break;

        case 'JOIN_REQUEST':
          if (isHost) {
            setIsOpponentConnected(true);
            mqtt.publish(roomTopic, {
              type: 'JOIN_CONFIRM',
              roomCode,
              hostColor: playerColor,
              guestId: msg.guestId,
              boardFen: ChessEngine.boardToFen(boardState),
            });
          }
          break;

        case 'JOIN_CONFIRM':
          if (!isHost) {
            setIsOpponentConnected(true);
            setPlayerColor(msg.hostColor === 'WHITE' ? 'BLACK' : 'WHITE');
            const syncedState = ChessEngine.fenToBoard(msg.boardFen);
            setBoardState(syncedState);
          }
          break;

        case 'MOVE':
          if (msg.senderId !== userId) {
            setStateHistory(prev => [...prev, boardState]);
            const move: Move = {
              fromRow: msg.fromRow,
              fromCol: msg.fromCol,
              toRow: msg.toRow,
              toCol: msg.toCol,
              promotionType: msg.promotionType,
            };
            const { newState, result } = ChessEngine.makeMove(boardState, move);
            setBoardState(newState);
            setIncomingHintMove(null);
            setHintMessage(null);

            if (result?.status === 'CHECKMATE') {
              soundManager.playVictory();
              handleGameEnd(result.winner === playerColor ? 'WIN' : 'LOSE', result.reason || 'Jaque Mate');
            } else if (result?.status?.startsWith('DRAW')) {
              handleGameEnd('DRAW', result.reason || 'Tablas');
            } else if (result?.status === 'CHECK') {
              soundManager.playCheck();
            }
          }
          break;

        case 'HINT_REQUEST':
          if (msg.senderId !== userId) {
            soundManager.playChatPop();
            setPendingHintRequest({ requesterName: msg.senderName });
            setEncouragingToast(`💖 ¡${msg.senderName} te ha pedido un consejo con amor!`);
            setTimeout(() => setEncouragingToast(null), 5000);
          }
          break;

        case 'HINT_RESPONSE':
          if (msg.senderId !== userId) {
            soundManager.playChatPop();
            setIncomingHintMove({
              fromRow: msg.fromRow,
              fromCol: msg.fromCol,
              toRow: msg.toRow,
              toCol: msg.toCol,
            });
            setHintMessage(msg.message || 'Tu amor te sugiere esta jugada con cariño 💖');
          }
          break;

        case 'TAKEBACK_REQUEST':
          if (msg.senderId !== userId) {
            soundManager.playChatPop();
            setStateHistory(prev => {
              if (prev.length > 0) {
                const last = prev[prev.length - 1];
                setBoardState(last);
                return prev.slice(0, -1);
              }
              return prev;
            });
            setEncouragingToast(`🌹 ${partnerName} desizo la última jugada. ¡Aprender es volver a intentar juntos! 💖`);
            setTimeout(() => setEncouragingToast(null), 4500);
          }
          break;

        case 'TEACHER_ARROW':
          if (msg.senderId !== userId) {
            setTeacherArrows(prev => [...prev, { fromRow: msg.fromRow, fromCol: msg.fromCol, toRow: msg.toRow, toCol: msg.toCol }]);
          }
          break;

        case 'HIGHLIGHT':
          if (msg.senderId !== userId) {
            setTeacherHighlights(prev => [...prev, { row: msg.row, col: msg.col, color: msg.color }]);
          }
          break;

        case 'CLEAR_ANNOTATIONS':
          setTeacherArrows([]);
          setTeacherHighlights([]);
          break;

        case 'REACTION':
          setFloatingReaction(msg.emoji);
          soundManager.playChatPop();
          setTimeout(() => setFloatingReaction(null), 2500);
          break;

        case 'GAME_RESTART':
          sessionStorage.removeItem(`chesslove_board_fen_${roomCode}`);
          setBoardState(ChessEngine.createInitialState());
          setStateHistory([]);
          setTeacherArrows([]);
          setTeacherHighlights([]);
          setIncomingHintMove(null);
          setHintMessage(null);
          setGameOverModal(null);
          break;

        case 'RESIGN':
          if (msg.senderId !== userId) {
            handleGameEnd('WIN', `${partnerName} ha inclinado su Rey en señal de rendición.`);
          }
          break;
      }
    },
    [boardState, isHost, playerColor, roomCode, roomTopic, userId, partnerName, mqtt]
  );

  useEffect(() => {
    mqtt.subscribe(roomTopic);
    const unsubscribe = mqtt.addListener(handleNetworkMessage);

    const broadcastPresenceInRoom = () => {
      if (isHost) {
        mqtt.publish(roomTopic, {
          type: 'ROOM_ANNOUNCE',
          roomId: `room_${roomCode}`,
          roomCode,
          hostId: userId,
          hostName: userName,
          hostColor: playerColor,
        });
      } else {
        mqtt.publish(roomTopic, {
          type: 'JOIN_REQUEST',
          roomId: `room_${roomCode}`,
          roomCode,
          guestId: userId,
          guestName: userName,
        });
      }
    };

    broadcastPresenceInRoom();

    const interval = setInterval(() => {
      if (!isOpponentConnected) {
        broadcastPresenceInRoom();
      }
    }, 1500);

    return () => {
      clearInterval(interval);
      unsubscribe();
      mqtt.unsubscribe(roomTopic);
    };
  }, [handleNetworkMessage, isHost, isOpponentConnected, mqtt, playerColor, roomCode, roomTopic, userId, userName]);

  const handleGameEnd = (outcome: 'WIN' | 'LOSE' | 'DRAW', reason: string) => {
    const stats = CoupleStoryEngine.getStats();
    let scoreA = 0.5;
    if (outcome === 'WIN') scoreA = 1.0;
    if (outcome === 'LOSE') scoreA = 0.0;

    const eloUpdate = EloCalculator.calculate(stats.userElo, stats.partnerElo, scoreA);
    const winnerType = outcome === 'WIN' ? 'USER' : outcome === 'LOSE' ? 'PARTNER' : 'DRAW';

    CoupleStoryEngine.recordGame(winnerType, boardState.fullMoveNumber, eloUpdate.newRatingA, eloUpdate.newRatingB);

    if (outcome === 'WIN') {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#E57388', '#D4A373', '#FFD166', '#FFFFFF'],
      });
      setGameOverModal({
        title: '¡Victoria de Amor! 👑💖',
        subtitle: reason,
        winner: userName,
      });
    } else if (outcome === 'LOSE') {
      setGameOverModal({
        title: `Victoria para ${partnerName} 🌹`,
        subtitle: reason,
        winner: partnerName,
      });
    } else {
      setGameOverModal({
        title: '¡Abrazo de Tablas! 🕊️🤍',
        subtitle: reason,
      });
    }
  };

  const handleLocalMove = (move: Move) => {
    setStateHistory(prev => [...prev, boardState]);
    const { newState, result } = ChessEngine.makeMove(boardState, move);
    setBoardState(newState);
    setIncomingHintMove(null);
    setHintMessage(null);

    // Broadcast move to partner
    mqtt.publish(roomTopic, {
      type: 'MOVE',
      senderId: userId,
      fromRow: move.fromRow,
      fromCol: move.fromCol,
      toRow: move.toRow,
      toCol: move.toCol,
      promotionType: move.promotionType,
    });

    if (result?.status === 'CHECKMATE') {
      soundManager.playVictory();
      handleGameEnd(result.winner === playerColor ? 'WIN' : 'LOSE', result.reason || 'Jaque Mate');
    } else if (result?.status?.startsWith('DRAW')) {
      handleGameEnd('DRAW', result.reason || 'Tablas');
    } else if (result?.status === 'CHECK') {
      soundManager.playCheck();
    }
  };

  const handleRequestHint = () => {
    mqtt.publish(roomTopic, {
      type: 'HINT_REQUEST',
      senderId: userId,
      senderName: userName,
    });
    setEncouragingToast(`💌 Le has pedido un consejo a ${partnerName}...`);
    setTimeout(() => setEncouragingToast(null), 4000);
  };

  const handleExecuteTakeback = () => {
    if (stateHistory.length === 0) return;
    const last = stateHistory[stateHistory.length - 1];
    setBoardState(last);
    setStateHistory(prev => prev.slice(0, -1));

    mqtt.publish(roomTopic, {
      type: 'TAKEBACK_REQUEST',
      senderId: userId,
      fen: ChessEngine.boardToFen(last),
    });

    setEncouragingToast('↩️ Has deshecho la última jugada. ¡Aprender es volver a intentar juntos! 💖');
    setTimeout(() => setEncouragingToast(null), 4000);
  };

  const handleSendReaction = (emoji: string) => {
    setFloatingReaction(emoji);
    setTimeout(() => setFloatingReaction(null), 2500);

    mqtt.publish(roomTopic, {
      type: 'REACTION',
      senderId: userId,
      emoji,
    });
  };



  const handleTeacherArrow = (from: Position, to: Position) => {
    setTeacherArrows(prev => [...prev, { fromRow: from.row, fromCol: from.col, toRow: to.row, toCol: to.col }]);
    mqtt.publish(roomTopic, {
      type: 'TEACHER_ARROW',
      senderId: userId,
      fromRow: from.row,
      fromCol: from.col,
      toRow: to.row,
      toCol: to.col,
    });
  };

  const handleTeacherHighlight = (pos: Position) => {
    setTeacherHighlights(prev => [...prev, { row: pos.row, col: pos.col }]);
    mqtt.publish(roomTopic, {
      type: 'HIGHLIGHT',
      senderId: userId,
      row: pos.row,
      col: pos.col,
    });
  };

  const handleClearAnnotations = () => {
    setTeacherArrows([]);
    setTeacherHighlights([]);
    mqtt.publish(roomTopic, {
      type: 'CLEAR_ANNOTATIONS',
      senderId: userId,
    });
  };

  const handleResign = () => {
    if (confirm('¿Deseas rendirte y declarar la victoria de tu pareja? 🌹')) {
      mqtt.publish(roomTopic, {
        type: 'RESIGN',
        senderId: userId,
      });
      handleGameEnd('LOSE', 'Te has rendido por amor.');
    }
  };

  const handleRestartGame = () => {
    sessionStorage.removeItem(`chesslove_board_fen_${roomCode}`);
    mqtt.publish(roomTopic, {
      type: 'GAME_RESTART',
      senderId: userId,
    });
    setBoardState(ChessEngine.createInitialState());
    setGameOverModal(null);
  };

  const handleExitGame = () => {
    sessionStorage.removeItem(`chesslove_board_fen_${roomCode}`);
    onExit();
  };

  const isMyTurn = boardState.currentTurn === playerColor;

  return (
    <div style={{ padding: '12px 16px 84px', maxWidth: '580px', margin: '0 auto', width: '100%' }}>
      {/* Top Header Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <button
          onClick={handleExitGame}
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
          <span>Salir</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: 'var(--rose-gold-secondary)', fontWeight: 600 }}>
            Sala: {roomCode}
          </span>
          <ShieldCheck size={14} color="var(--education-success)" />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              soundManager.setEnabled(next);
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: soundEnabled ? 'var(--rose-gold-primary)' : 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
      </div>

      {/* Opponent Connection Banner */}
      {!isOpponentConnected && (
        <div
          className="glass-panel"
          style={{
            padding: '10px 16px',
            marginBottom: '12px',
            textAlign: 'center',
            backgroundColor: 'rgba(212, 163, 115, 0.15)',
            border: '1px solid var(--border-gold)',
          }}
        >
          <p style={{ fontSize: '0.85rem', color: 'var(--rose-gold-secondary)', fontWeight: 600 }}>
            ⏳ Esperando a {partnerName}... Comparte el código <span style={{ color: '#FFF' }}>{roomCode}</span>
          </p>
        </div>
      )}

      {/* Mentoring & Encouraging Toast Notification */}
      {encouragingToast && (
        <div
          className="glass-panel"
          style={{
            padding: '8px 16px',
            marginBottom: '10px',
            backgroundColor: 'rgba(229, 115, 136, 0.22)',
            border: '1px solid var(--rose-gold-primary)',
            borderRadius: 'var(--radius-full)',
            textAlign: 'center',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(229, 115, 136, 0.3)',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          {encouragingToast}
        </div>
      )}

      {/* Incoming Hint Suggestion Bubble */}
      {hintMessage && (
        <div
          className="glass-panel"
          style={{
            padding: '10px 16px',
            marginBottom: '10px',
            backgroundColor: 'rgba(255, 209, 102, 0.16)',
            border: '1px solid #FFD166',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} color="#FFD166" />
            <span style={{ fontSize: '0.85rem', color: '#FFF', fontWeight: 600 }}>
              {hintMessage}
            </span>
          </div>
          <button
            onClick={() => { setIncomingHintMove(null); setHintMessage(null); }}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '13px' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Turn & Status Bar */}
      <div
        className="glass-card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          marginBottom: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: boardState.currentTurn === 'WHITE' ? '#EDE0D4' : '#1A161E',
              border: '2px solid var(--rose-gold-secondary)',
            }}
          />
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--dark-on-surface)' }}>
            {isMyTurn ? 'Tu turno' : `Turno de ${partnerName}`} ({boardState.currentTurn === 'WHITE' ? 'Blancas' : 'Negras'})
          </span>
        </div>

        {boardState.isInCheck && (
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              backgroundColor: 'var(--education-danger)',
              color: '#FFF',
              padding: '2px 8px',
              borderRadius: '999px',
              animation: 'heartPulse 1s infinite',
            }}
          >
            ¡JAQUE!
          </span>
        )}
      </div>

      {/* Chessboard Component */}
      <div style={{ position: 'relative' }}>
        <ChessBoard
          boardState={boardState}
          onMakeMove={handleLocalMove}
          playerColor={playerColor}
          flipped={playerColor === 'BLACK'}
          interactive={isOpponentConnected && isMyTurn}
          teacherMode={teacherMode}
          teacherTool={teacherTool}
          onTeacherArrow={handleTeacherArrow}
          onTeacherHighlight={handleTeacherHighlight}
          externalArrows={teacherArrows}
          externalHighlights={teacherHighlights}
          hintMove={incomingHintMove}
        />

        {/* Floating Romantic Emoji Reaction Animation */}
        {floatingReaction && (
          <div
            style={{
              position: 'absolute',
              top: '40%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '84px',
              pointerEvents: 'none',
              zIndex: 50,
              animation: 'heartPulse 0.5s ease-out, floatSoft 2s ease-in-out',
              filter: 'drop-shadow(0 0 20px var(--rose-gold-glow))',
            }}
          >
            {floatingReaction}
          </div>
        )}
      </div>

      {/* Quick Reactions Bar */}
      <QuickReactionsBar onSendReaction={handleSendReaction} />

      {/* Co-Op Mentoring Actions (Pedir Consejo & Deshacer Jugada con Amor) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginTop: '12px',
        }}
      >
        <button
          onClick={handleRequestHint}
          disabled={!isOpponentConnected}
          className="btn-secondary"
          style={{
            flex: 1,
            padding: '9px 12px',
            fontSize: '0.82rem',
            gap: '6px',
            borderColor: 'var(--rose-gold-primary)',
            color: 'var(--rose-gold-secondary)',
          }}
          title="Pide una pista amorosa a tu pareja cuando no sepas qué mover"
        >
          <HelpCircle size={15} />
          <span>Pedir Consejo con Amor 💖</span>
        </button>

        {stateHistory.length > 0 && (
          <button
            onClick={handleExecuteTakeback}
            className="btn-secondary"
            style={{
              padding: '9px 12px',
              fontSize: '0.82rem',
              gap: '6px',
              color: 'var(--text-muted)',
            }}
            title="Deshaz la última jugada para aprender de los errores sin frustración"
          >
            <Undo2 size={15} />
            <span>Deshacer con Amor</span>
          </button>
        )}
      </div>

      {/* Teacher Tools & Game Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '14px',
          gap: '8px',
        }}
      >
        <button
          onClick={() => setTeacherMode(!teacherMode)}
          className={teacherMode ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '8px 14px', fontSize: '0.8rem' }}
        >
          <GraduationCap size={16} />
          <span>{teacherMode ? 'Modo Profesor Activo' : 'Herramientas de Profesor'}</span>
        </button>

        <div style={{ display: 'flex', gap: '8px' }}>
          {teacherMode && (
            <>
              <button
                onClick={() => setTeacherTool(teacherTool === 'ARROW' ? 'MOVE' : 'ARROW')}
                className="btn-secondary"
                style={{
                  padding: '8px 10px',
                  fontSize: '0.8rem',
                  borderColor: teacherTool === 'ARROW' ? 'var(--rose-gold-primary)' : undefined,
                }}
              >
                Flecha
              </button>
              <button
                onClick={() => setTeacherTool(teacherTool === 'HIGHLIGHT' ? 'MOVE' : 'HIGHLIGHT')}
                className="btn-secondary"
                style={{
                  padding: '8px 10px',
                  fontSize: '0.8rem',
                  borderColor: teacherTool === 'HIGHLIGHT' ? 'var(--rose-gold-primary)' : undefined,
                }}
              >
                Resaltar
              </button>
              <button
                onClick={handleClearAnnotations}
                className="btn-secondary"
                style={{ padding: '8px 10px', fontSize: '0.8rem' }}
              >
                Borrar
              </button>
            </>
          )}

          <button
            onClick={handleResign}
            className="btn-secondary"
            style={{ padding: '8px 12px', fontSize: '0.8rem', color: '#E5383B' }}
          >
            <Flag size={14} />
          </button>
        </div>
      </div>



      {/* Game Over Romantic Modal */}
      {gameOverModal && (
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
          <div
            className="glass-panel-glow"
            style={{
              maxWidth: '380px',
              width: '100%',
              padding: '28px 24px',
              textAlign: 'center',
            }}
          >
            <Sparkles size={36} color="var(--rose-gold-primary)" style={{ margin: '0 auto 12px' }} />
            <h2 style={{ fontSize: '1.4rem', color: 'var(--rose-gold-primary)', marginBottom: '8px' }}>
              {gameOverModal.title}
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
              {gameOverModal.subtitle}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button onClick={handleRestartGame} className="btn-primary" style={{ width: '100%' }}>
                <RotateCcw size={16} />
                <span>Jugar Otra Partida Juntos</span>
              </button>
              <button onClick={handleExitGame} className="btn-secondary" style={{ width: '100%' }}>
                Volver al Menú Principal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
