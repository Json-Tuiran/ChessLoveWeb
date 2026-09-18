import mqtt from 'mqtt';

// E2EE Helper using Web Crypto API in Node / Browser
const SALT = new TextEncoder().encode('ChessLoveRomanticE2EESalt2026');

async function deriveKey(code) {
  const enc = new TextEncoder();
  const rawKeyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(code.trim().toUpperCase()),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: SALT,
      iterations: 100000,
      hash: 'SHA-256',
    },
    rawKeyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encryptPayload(data, code) {
  const key = await deriveKey(code);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encodedData = new TextEncoder().encode(JSON.stringify(data));
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encodedData);
  return {
    iv: Buffer.from(iv).toString('base64'),
    cipher: Buffer.from(ciphertext).toString('base64'),
  };
}

async function decryptPayload(ivBase64, cipherBase64, code) {
  const key = await deriveKey(code);
  const iv = Buffer.from(ivBase64, 'base64');
  const ciphertext = Buffer.from(cipherBase64, 'base64');
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
  return JSON.parse(new TextDecoder().decode(decrypted));
}

// Test Configuration
const TEST_CODE = `AMOR-TEST-${Math.floor(1000 + Math.random() * 9000)}`;
const BROKER_URL = 'wss://broker.hivemq.com:8884/mqtt';

const CHAT_TOPIC = `chesslove/couple/${TEST_CODE}/chat`;
const HANDSHAKE_TOPIC = `chesslove/couple/${TEST_CODE}/handshake`;
const PRESENCE_TOPIC = `chesslove/couple/${TEST_CODE}/presence`;
const GAME_TOPIC = `chesslove/game/${TEST_CODE}`;

console.log('====================================================');
console.log('   CHESSLOVE — PRUEBA DE CONEXIÓN BIDIRECCIONAL');
console.log(`   Código de Pareja: ${TEST_CODE}`);
console.log(`   Broker: ${BROKER_URL}`);
console.log('====================================================\n');

async function runTest() {
  const clientA = mqtt.connect(BROKER_URL, { clientId: `test_user_rey_${Date.now()}` });
  const clientB = mqtt.connect(BROKER_URL, { clientId: `test_user_reina_${Date.now() + 1}` });

  const userA = { id: 'usr_rey_001', name: 'Mi Rey' };
  const userB = { id: 'usr_reina_002', name: 'Mi Reina' };

  let checks = {
    connectA: false,
    connectB: false,
    handshakeAToB: false,
    handshakeBToA: false,
    chatMessageDecryptedByB: false,
    voiceNoteDecryptedByA: false,
    gameAnnounced: false,
    gameJoined: false,
    gameConfirmed: false,
    moveE4ReceivedByB: false,
    moveE5ReceivedByA: false,
    presenceReceived: false,
  };

  // 1. Wait for connection
  await Promise.all([
    new Promise(res => clientA.on('connect', () => { checks.connectA = true; res(); })),
    new Promise(res => clientB.on('connect', () => { checks.connectB = true; res(); })),
  ]);
  console.log('✅ 1. Ambos clientes conectados al broker MQTT con éxito.');

  // Subscribe topics
  const topics = [CHAT_TOPIC, HANDSHAKE_TOPIC, PRESENCE_TOPIC, GAME_TOPIC];
  for (const t of topics) {
    clientA.subscribe(t);
    clientB.subscribe(t);
  }
  await new Promise(r => setTimeout(r, 600));

  // 2. Handshake Listeners
  clientB.on('message', (topic, payload) => {
    try {
      const msg = JSON.parse(payload.toString());
      if (topic === HANDSHAKE_TOPIC && msg.type === 'COUPLE_HANDSHAKE' && msg.senderId === userA.id) {
        checks.handshakeAToB = true;
        console.log(`✅ 2a. Usuario B ("${userB.name}") descubrió automáticamente a su pareja: "${msg.senderName}"`);
      }
    } catch {}
  });

  clientA.on('message', (topic, payload) => {
    try {
      const msg = JSON.parse(payload.toString());
      if (topic === HANDSHAKE_TOPIC && msg.type === 'COUPLE_HANDSHAKE' && msg.senderId === userB.id) {
        checks.handshakeBToA = true;
        console.log(`✅ 2b. Usuario A ("${userA.name}") descubrió automáticamente a su pareja: "${msg.senderName}"`);
      }
    } catch {}
  });

  // Publish Handshakes
  clientA.publish(HANDSHAKE_TOPIC, JSON.stringify({
    type: 'COUPLE_HANDSHAKE',
    senderId: userA.id,
    senderName: userA.name,
    timestamp: Date.now(),
  }));

  clientB.publish(HANDSHAKE_TOPIC, JSON.stringify({
    type: 'COUPLE_HANDSHAKE',
    senderId: userB.id,
    senderName: userB.name,
    timestamp: Date.now(),
  }));

  await new Promise(r => setTimeout(r, 600));

  // 3. Encrypted Chat Message (A -> B)
  const chatText = '¡Hola mi Reina hermosa! 💖 ¿Jugamos una partidita?';
  const encryptedChat = await encryptPayload({ text: chatText }, TEST_CODE);

  clientB.on('message', async (topic, payload) => {
    if (topic === CHAT_TOPIC) {
      try {
        const msg = JSON.parse(payload.toString());
        if (msg.senderId === userA.id && msg.type === 'SECURE_CHAT_MESSAGE') {
          const decrypted = await decryptPayload(msg.iv, msg.cipher, TEST_CODE);
          if (decrypted.text === chatText) {
            checks.chatMessageDecryptedByB = true;
            console.log(`✅ 3. Usuario B descifró mensaje de texto E2EE: "${decrypted.text}"`);
          }
        }
      } catch (e) {
        console.error('Error descifrando chat en B:', e);
      }
    }
  });

  clientA.publish(CHAT_TOPIC, JSON.stringify({
    type: 'SECURE_CHAT_MESSAGE',
    msgId: `msg_${Date.now()}_01`,
    senderId: userA.id,
    senderName: userA.name,
    iv: encryptedChat.iv,
    cipher: encryptedChat.cipher,
    timestamp: Date.now(),
  }));

  await new Promise(r => setTimeout(r, 600));

  // 4. Encrypted Voice Note (B -> A)
  const mockAudioBase64 = 'data:audio/webm;base64,GkXfo59ChoEBQveBAULygQRC84EIQoKEd2VibUKHgQRChYECGFOAZwEAAAAAAAAAAA==';
  const encryptedAudio = await encryptPayload({ audioBase64: mockAudioBase64, linkedMove: 'e4' }, TEST_CODE);

  clientA.on('message', async (topic, payload) => {
    if (topic === CHAT_TOPIC) {
      try {
        const msg = JSON.parse(payload.toString());
        if (msg.senderId === userB.id && msg.type === 'SECURE_CHAT_MESSAGE') {
          const decrypted = await decryptPayload(msg.iv, msg.cipher, TEST_CODE);
          if (decrypted.audioBase64 === mockAudioBase64 && decrypted.linkedMove === 'e4') {
            checks.voiceNoteDecryptedByA = true;
            console.log(`✅ 4. Usuario A descifró nota de voz E2EE de "${msg.senderName}" vinculada a jugada "${decrypted.linkedMove}"`);
          }
        }
      } catch (e) {
        console.error('Error descifrando audio en A:', e);
      }
    }
  });

  clientB.publish(CHAT_TOPIC, JSON.stringify({
    type: 'SECURE_CHAT_MESSAGE',
    msgId: `msg_${Date.now()}_02`,
    senderId: userB.id,
    senderName: userB.name,
    iv: encryptedAudio.iv,
    cipher: encryptedAudio.cipher,
    timestamp: Date.now(),
  }));

  await new Promise(r => setTimeout(r, 600));

  // 5. Real-Time Chess Game Synchronization
  // User A creates game room as White
  clientB.on('message', (topic, payload) => {
    if (topic === GAME_TOPIC) {
      try {
        const msg = JSON.parse(payload.toString());
        if (msg.type === 'ROOM_ANNOUNCE' && msg.hostId === userA.id) {
          checks.gameAnnounced = true;
          console.log(`✅ 5a. Usuario B detectó sala de juego de su pareja ("${msg.hostName}", juega con Blancas)`);

          // User B sends JOIN_REQUEST
          clientB.publish(GAME_TOPIC, JSON.stringify({
            type: 'JOIN_REQUEST',
            roomId: msg.roomId,
            roomCode: TEST_CODE,
            guestId: userB.id,
            guestName: userB.name,
          }));
        }

        if (msg.type === 'MOVE' && msg.senderId === userA.id) {
          checks.moveE4ReceivedByB = true;
          console.log(`✅ 5d. Usuario B recibió jugada en tiempo real de su pareja: (${msg.fromRow},${msg.fromCol}) -> (${msg.toRow},${msg.toCol}) [1. e4]`);

          // User B responds with 1... e5
          setTimeout(() => {
            clientB.publish(GAME_TOPIC, JSON.stringify({
              type: 'MOVE',
              senderId: userB.id,
              fromRow: 1,
              fromCol: 4,
              toRow: 3,
              toCol: 4,
            }));
          }, 200);
        }
      } catch {}
    }
  });

  clientA.on('message', (topic, payload) => {
    if (topic === GAME_TOPIC) {
      try {
        const msg = JSON.parse(payload.toString());
        if (msg.type === 'JOIN_REQUEST' && msg.guestId === userB.id) {
          checks.gameJoined = true;
          console.log(`✅ 5b. Usuario A recibió solicitud de unión de "${msg.guestName}". Confirmando partida...`);

          // User A confirms
          clientA.publish(GAME_TOPIC, JSON.stringify({
            type: 'JOIN_CONFIRM',
            roomCode: TEST_CODE,
            hostColor: 'WHITE',
            guestId: userB.id,
            boardFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
          }));
          checks.gameConfirmed = true;

          // User A plays 1. e4
          setTimeout(() => {
            console.log('♟️  Usuario A (Blancas) ejecuta movimiento 1. e4...');
            clientA.publish(GAME_TOPIC, JSON.stringify({
              type: 'MOVE',
              senderId: userA.id,
              fromRow: 6,
              fromCol: 4,
              toRow: 4,
              toCol: 4,
            }));
          }, 300);
        }

        if (msg.type === 'MOVE' && msg.senderId === userB.id) {
          checks.moveE5ReceivedByA = true;
          console.log(`✅ 5e. Usuario A recibió jugada de respuesta de su pareja: (${msg.fromRow},${msg.fromCol}) -> (${msg.toRow},${msg.toCol}) [1... e5]`);
        }
      } catch {}
    }
  });

  clientA.publish(GAME_TOPIC, JSON.stringify({
    type: 'ROOM_ANNOUNCE',
    roomId: `room_${Date.now()}`,
    roomCode: TEST_CODE,
    hostId: userA.id,
    hostName: userA.name,
    hostColor: 'WHITE',
  }));

  await new Promise(r => setTimeout(r, 1500));

  // 6. Presence Ping
  clientA.on('message', (topic, payload) => {
    if (topic === PRESENCE_TOPIC) {
      try {
        const msg = JSON.parse(payload.toString());
        if (msg.senderId === userB.id && msg.status === 'ONLINE') {
          checks.presenceReceived = true;
          console.log(`✅ 6. Usuario A recibió latido de presencia de "${userB.name}": EN LÍNEA 🟢`);
        }
      } catch {}
    }
  });

  clientB.publish(PRESENCE_TOPIC, JSON.stringify({
    type: 'PRESENCE_PING',
    senderId: userB.id,
    senderName: userB.name,
    status: 'ONLINE',
    timestamp: Date.now(),
  }));

  await new Promise(r => setTimeout(r, 600));

  clientA.end();
  clientB.end();

  console.log('\n====================================================');
  console.log('              RESUMEN DE LA PRUEBA');
  console.log('====================================================');
  const allPassed = Object.values(checks).every(Boolean);
  for (const [key, passed] of Object.entries(checks)) {
    console.log(` ${passed ? '✅' : '❌'} ${key}`);
  }
  console.log('====================================================');
  if (allPassed) {
    console.log('🎉 ¡TODAS LAS PRUEBAS DE CONEXIÓN PASARON CON ÉXITO AL 100%!');
  } else {
    console.log('⚠️ Algunas verificaciones no concluyeron.');
  }
  console.log('====================================================\n');
}

runTest().catch(console.error);
