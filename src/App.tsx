import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { HomeScreen } from './screens/HomeScreen';
import { OnlineGameScreen } from './screens/OnlineGameScreen';
import { LocalGameScreen } from './screens/LocalGameScreen';
import { AiGameScreen } from './screens/AiGameScreen';
import { LearnScreen } from './screens/LearnScreen';
import { LearnLessonScreen } from './screens/LearnLessonScreen';
import { OurStoryScreen } from './screens/OurStoryScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { NavigationBar, ScreenTab } from './components/common/NavigationBar';
import { FloatingChatBubble } from './components/chat/FloatingChatBubble';
import { ChatDrawer, DisplayMessage } from './components/chat/ChatDrawer';
import { OnboardingModal } from './components/couple/OnboardingModal';
import { MqttService } from './network/MqttClient';
import { PresenceWatchdog } from './network/PresenceWatchdog';
import { CoupleCrypto } from './crypto/CoupleCrypto';
import { soundManager } from './audio/SoundManager';
import { Lesson } from './learn/types';
import { LEARN_LEVELS } from './learn/LearnCatalog';
import { ChatContent, NetworkMessage } from './network/types';

export const App: React.FC = () => {
  // 1. Persistent User & Partner State (Clean initialization, zero hardcoded names)
  const [userName, setUserName] = useState<string>(() => localStorage.getItem('chesslove_user_name') || '');
  const [partnerName, setPartnerName] = useState<string>(() => localStorage.getItem('chesslove_partner_name') || '');
  const [coupleCode, setCoupleCode] = useState<string>(() => localStorage.getItem('chesslove_couple_code') || '');

  const [userId] = useState<string>(() => {
    let id = localStorage.getItem('chesslove_user_id');
    if (!id) {
      id = `usr_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('chesslove_user_id', id);
    }
    return id;
  });

  // 2. Navigation State with Auto-Resume for active online rooms
  const savedOnlineSession = (() => {
    try {
      const raw = sessionStorage.getItem('chesslove_active_online_session');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const [currentTab, setCurrentTab] = useState<ScreenTab>(() => {
    if (savedOnlineSession?.roomCode) {
      return 'ONLINE';
    }
    return 'HOME';
  });
  const [onlineRoomCode, setOnlineRoomCode] = useState<string>(() => {
    if (savedOnlineSession?.roomCode) {
      return savedOnlineSession.roomCode;
    }
    return coupleCode || 'AMOR-24';
  });
  const [isHost, setIsHost] = useState<boolean>(() => {
    if (savedOnlineSession) {
      return !!savedOnlineSession.isHost;
    }
    return true;
  });
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  // 3. Network & Presence State
  const [isPartnerOnline, setIsPartnerOnline] = useState<boolean>(false);

  // 4. Universal Chat State (Available on ALL screens)
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const mqtt = useMemo(() => new MqttService(userId), [userId]);
  const watchdog = useMemo(() => new PresenceWatchdog(mqtt, userId), [mqtt, userId]);

  const globalChatTopic = coupleCode ? `chesslove/chat/${coupleCode}` : '';
  const handshakeTopic = coupleCode ? `chesslove/couple/${coupleCode}/handshake` : '';

  const handleIncomingMessage = useCallback(
    async (_topic: string, msg: NetworkMessage) => {
      // Automatic Cross-discovery handshake
      if (msg.type === 'COUPLE_HANDSHAKE') {
        if (msg.senderId !== userId && msg.senderName) {
          setPartnerName(prev => {
            if (prev !== msg.senderName) {
              localStorage.setItem('chesslove_partner_name', msg.senderName);
              return msg.senderName;
            }
            return prev;
          });
        }
      }

      // Secure Chat messages
      if (msg.type === 'SECURE_CHAT_MESSAGE') {
        try {
          const decrypted = await CoupleCrypto.decrypt<ChatContent>(msg.iv, msg.cipher, coupleCode);
          const isSelf = msg.senderId === userId;
          const newMsg: DisplayMessage = {
            id: msg.msgId,
            senderId: msg.senderId,
            senderName: msg.senderName,
            content: decrypted,
            timestamp: msg.timestamp,
            isSelf,
          };

          setMessages(prev => [...prev, newMsg]);

          if (!isSelf) {
            soundManager.playChatPop();
            if (!isChatOpen) {
              setUnreadCount(prev => prev + 1);
            }
          }
        } catch (err) {
          console.error('Error decrypting incoming chat:', err);
        }
      }
    },
    [coupleCode, isChatOpen, userId]
  );

  useEffect(() => {
    if (!coupleCode) return;

    mqtt.connect().then(() => {
      watchdog.setCouple(coupleCode, userName, (discoveredName) => {
        setPartnerName(prev => {
          if (!prev || prev !== discoveredName) {
            localStorage.setItem('chesslove_partner_name', discoveredName);
            return discoveredName;
          }
          return prev;
        });
      });
      watchdog.start();
      if (globalChatTopic) mqtt.subscribe(globalChatTopic);
      if (handshakeTopic) {
        mqtt.subscribe(handshakeTopic);
        // Announce own presence and name to partner
        mqtt.publish(handshakeTopic, {
          type: 'COUPLE_HANDSHAKE',
          senderId: userId,
          senderName: userName,
          timestamp: Date.now(),
        });
      }
    });

    const unsubscribeWatchdog = watchdog.onStatusChange(online => {
      setIsPartnerOnline(online);
    });

    const unsubscribeMqtt = mqtt.addListener(handleIncomingMessage);

    return () => {
      unsubscribeWatchdog();
      unsubscribeMqtt();
      watchdog.stop();
      if (globalChatTopic) mqtt.unsubscribe(globalChatTopic);
      if (handshakeTopic) mqtt.unsubscribe(handshakeTopic);
      mqtt.disconnect();
    };
  }, [mqtt, watchdog, coupleCode, globalChatTopic, handshakeTopic, handleIncomingMessage, userId, userName]);

  const handleOnboardingComplete = (name: string, code: string) => {
    setUserName(name);
    setCoupleCode(code);
    setOnlineRoomCode(code);
    localStorage.setItem('chesslove_user_name', name);
    localStorage.setItem('chesslove_couple_code', code);
  };

  const handleSendMessage = async (content: ChatContent) => {
    if (!coupleCode) return;

    try {
      const encrypted = await CoupleCrypto.encrypt(content, coupleCode);
      const msgId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const timestamp = Date.now();

      mqtt.publish(globalChatTopic, {
        type: 'SECURE_CHAT_MESSAGE',
        msgId,
        senderId: userId,
        senderName: userName,
        iv: encrypted.iv,
        cipher: encrypted.cipher,
        timestamp,
      });

      setMessages(prev => [
        ...prev,
        {
          id: msgId,
          senderId: userId,
          senderName: userName,
          content,
          timestamp,
          isSelf: true,
        },
      ]);
    } catch (err) {
      console.error('Failed to send encrypted chat message:', err);
    }
  };

  const handleUpdateProfile = (name: string, partner: string, code: string) => {
    setUserName(name);
    setPartnerName(partner);
    setCoupleCode(code);
    setOnlineRoomCode(code);
    localStorage.setItem('chesslove_user_name', name);
    localStorage.setItem('chesslove_partner_name', partner);
    localStorage.setItem('chesslove_couple_code', code);
    watchdog.setPartner(code);
  };

  const handleCreateOnlineRoom = () => {
    // Room code defaults to couple code if available or generates a romantic room
    const codeToUse = coupleCode || `AMOR-${Math.floor(10 + Math.random() * 90)}`;
    setOnlineRoomCode(codeToUse);
    setIsHost(true);
    setCurrentTab('ONLINE');
    sessionStorage.setItem('chesslove_active_online_session', JSON.stringify({ roomCode: codeToUse, isHost: true }));
  };

  const handleJoinOnlineRoom = (code: string) => {
    setOnlineRoomCode(code);
    setIsHost(false);
    setCurrentTab('ONLINE');
    sessionStorage.setItem('chesslove_active_online_session', JSON.stringify({ roomCode: code, isHost: false }));
  };

  const handleExitOnlineGame = () => {
    sessionStorage.removeItem('chesslove_active_online_session');
    setCurrentTab('HOME');
  };

  // Find next lesson helper
  const allLessons = LEARN_LEVELS.flatMap(l => l.lessons);
  const handleNextLesson = () => {
    if (!selectedLesson) return;
    const currentIndex = allLessons.findIndex(l => l.id === selectedLesson.id);
    if (currentIndex >= 0 && currentIndex < allLessons.length - 1) {
      setSelectedLesson(allLessons[currentIndex + 1]);
    } else {
      setSelectedLesson(null);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Onboarding Dialog when user is new and has no profile setup */}
      {!userName && (
        <OnboardingModal onComplete={handleOnboardingComplete} />
      )}

      {/* Screen Routing */}
      {currentTab === 'HOME' && (
        <HomeScreen
          userName={userName || 'Tú'}
          partnerName={partnerName}
          coupleCode={coupleCode}
          isPartnerOnline={isPartnerOnline}
          onNavigate={setCurrentTab}
          onCreateOnlineRoom={handleCreateOnlineRoom}
          onJoinOnlineRoom={handleJoinOnlineRoom}
        />
      )}

      {currentTab === 'ONLINE' && (
        <OnlineGameScreen
          roomCode={onlineRoomCode}
          isHost={isHost}
          userId={userId}
          userName={userName || 'Tú'}
          partnerName={partnerName || 'Tu Pareja'}
          mqtt={mqtt}
          onExit={handleExitOnlineGame}
        />
      )}

      {currentTab === 'LOCAL' && (
        <LocalGameScreen
          userName={userName || 'Jugador 1'}
          partnerName={partnerName || 'Jugador 2'}
          onExit={() => setCurrentTab('HOME')}
        />
      )}

      {currentTab === 'AI' && (
        <AiGameScreen onExit={() => setCurrentTab('HOME')} />
      )}

      {currentTab === 'LEARN' && (
        selectedLesson ? (
          <LearnLessonScreen
            lesson={selectedLesson}
            onExit={() => setSelectedLesson(null)}
            onNextLesson={handleNextLesson}
          />
        ) : (
          <LearnScreen
            onSelectLesson={setSelectedLesson}
            onExit={() => setCurrentTab('HOME')}
          />
        )
      )}

      {currentTab === 'STORY' && (
        <OurStoryScreen
          userName={userName || 'Tú'}
          partnerName={partnerName || 'Tu Pareja'}
          onExit={() => setCurrentTab('HOME')}
        />
      )}

      {currentTab === 'PROFILE' && (
        <ProfileScreen
          userName={userName}
          partnerName={partnerName}
          coupleCode={coupleCode}
          onUpdateProfile={handleUpdateProfile}
          onExit={() => setCurrentTab('HOME')}
        />
      )}

      {/* Persistent Bottom Navigation Bar */}
      <NavigationBar
        currentTab={currentTab}
        onSelectTab={tab => {
          if (tab === 'LEARN') setSelectedLesson(null);
          setCurrentTab(tab);
        }}
      />

      {/* UNIVERSAL FLOATING CHAT BUBBLE (Appears on EVERY screen and draggable at will) */}
      <FloatingChatBubble
        unreadCount={unreadCount}
        isOpen={isChatOpen}
        onToggle={() => {
          setIsChatOpen(!isChatOpen);
          if (!isChatOpen) setUnreadCount(0);
        }}
      />

      {/* UNIVERSAL CHAT DRAWER */}
      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        messages={messages}
        onSendMessage={handleSendMessage}
        partnerName={partnerName}
      />
    </div>
  );
};
