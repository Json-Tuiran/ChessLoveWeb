# 💖 ChessLove Web — Especificación Técnica y Arquitectura de Migración

> **Documento Maestro de Arquitectura, Lógica de Dominio, Protocolos y Assets**  
> Diseñado para replicar y desplegar **ChessLove** como una Aplicación Web Moderna (PWA / SPA) accesible desde cualquier navegador móvil (Android, iOS/iPhone) y de escritorio (Windows, Mac, Linux) sin necesidad de instalar archivos APK externos.

---

## 📑 Tabla de Contenidos

1. [Visión General y Ventajas de la Versión Web](#1-visión-general-y-ventajas-de-la-versión-web)
2. [Catálogo de Assets Visuales y Multimedia](#2-catálogo-de-assets-visuales-y-multimedia)
3. [Stack Tecnológico Recomendado para la Web](#3-stack-tecnológico-recomendado-para-la-web)
4. [Estructura del Proyecto Web](#4-estructura-del-proyecto-web)
5. [Tokens de Diseño y Sistema Visual (Theme)](#5-tokens-de-diseño-y-sistema-visual-theme)
6. [Motor de Ajedrez y Lógica de Juego (FIDE & IA)](#6-motor-de-ajedrez-y-lógica-de-juego-fide--ia)
7. [Motor de Sonido Sintético (Web Audio API)](#7-motor-de-sonido-sintético-web-audio-api)
8. [Protocolo de Red y Tiempo Real (MQTT sobre WebSockets)](#8-protocolo-de-red-y-tiempo-real-mqtt-sobre-websockets)
9. [Cifrado de Extremo a Extremo (E2EE)](#9-cifrado-de-extremo-a-extremo-e2ee)
10. [Módulos y Pantallas Detalladas](#10-módulos-y-pantallas-detalladas)
    - [10.1 Pantalla Principal (Home & Pareja)](#101-pantalla-principal-home--pareja)
    - [10.2 Tablero de Juego (Online, Local e IA)](#102-tablero-de-juego-online-local-e-ia)
    - [10.3 Capa Pedagógica (Herramientas de Profesor)](#103-capa-pedagógica-herramientas-de-profesor)
    - [10.4 Chat Universal y Burbuja Flotante](#104-chat-universal-y-burbuja-flotante)
    - [10.5 Academia de Ajedrez (16 Lecciones Interactivas)](#105-academia-de-ajedrez-16-lecciones-interactivas)
    - [10.6 Nuestra Historia (Química, Recuerdos y Elo)](#106-nuestra-historia-química-recuerdos-y-elo)
    - [10.7 Perfil y Emparejamiento Automático](#107-perfil-y-emparejamiento-automático)
11. [Guía de Puesta en Marcha y Despliegue](#11-guía-de-puesta-en-marcha-y-despliegue)

---

## 1. Visión General y Ventajas de la Versión Web

### ¿Por qué migrar a Web?
1. **Accesibilidad Universal Inmediata**: Tu pareja o tú solo necesitan abrir un enlace (ej. `https://chesslove.vercel.app`) en Chrome, Safari o cualquier navegador.
2. **Cero Fricción de Instalación**: Elimina el bloqueo de "archivos de fuentes desconocidas" o políticas restrictivas de fabricantes de teléfonos.
3. **Multiplataforma Real**: Funciona de forma fluida e idéntica en Android, iOS (iPhone/iPad), ordenadores portátiles y tablets.
4. **Capacidades PWA (Progressive Web App)**: Ambos pueden pulsar *"Añadir a la pantalla de inicio"* y la aplicación se abrirá a pantalla completa como una app nativa, con su icono romántico, sin barras del navegador.

---

## 2. Catálogo de Assets Visuales y Multimedia

Todos los assets generados y optimizados se encuentran listos para ser transferidos a la carpeta `public/` de la nueva aplicación web.

### 2.1 Logo Oficial de ChessLove
- **Ubicación en Android**: `app/src/main/res/drawable/ic_chess_love_logo.png`
- **Artefacto Fuente**: `C:/Users/jsont/.gemini/antigravity-ide/brain/8008bf5c-b1f5-44a9-9e38-f60d6e759c29/chess_love_logo_1789660635358.jpg`
- **Destino Web sugerido**: `public/assets/logo.png` (y generar favicons para PWA en `192x192` y `512x512`).

---

### 2.2 Piezas de Ajedrez 3D Oficiales (Fondo Transparente)
Las 12 piezas tienen formato `.webp` de alta fidelidad, con renderizado 3D clásico, sombreados realistas, delineado de contraste según el color (negro para piezas blancas y blanco suave para piezas negras) y fondo transparente limpio:

| Pieza | Color | Archivo Origen Android | Destino Web Recomendado |
|---|---|---|---|
| **Rey (King)** | Blanco | `app/src/main/res/drawable/piece_w_king.webp` | `public/assets/pieces/w_king.webp` |
| **Dama (Queen)** | Blanco | `app/src/main/res/drawable/piece_w_queen.webp` | `public/assets/pieces/w_queen.webp` |
| **Torre (Rook)** | Blanco | `app/src/main/res/drawable/piece_w_rook.webp` | `public/assets/pieces/w_rook.webp` |
| **Alfil (Bishop)** | Blanco | `app/src/main/res/drawable/piece_w_bishop.webp` | `public/assets/pieces/w_bishop.webp` |
| **Caballo (Knight)** | Blanco | `app/src/main/res/drawable/piece_w_knight.webp` | `public/assets/pieces/w_knight.webp` |
| **Peón (Pawn)** | Blanco | `app/src/main/res/drawable/piece_w_pawn.webp` | `public/assets/pieces/w_pawn.webp` |
| **Rey (King)** | Negro | `app/src/main/res/drawable/piece_b_king.webp` | `public/assets/pieces/b_king.webp` |
| **Dama (Queen)** | Negro | `app/src/main/res/drawable/piece_b_queen.webp` | `public/assets/pieces/b_queen.webp` |
| **Torre (Rook)** | Negro | `app/src/main/res/drawable/piece_b_rook.webp` | `public/assets/pieces/b_rook.webp` |
| **Alfil (Bishop)** | Negro | `app/src/main/res/drawable/piece_b_bishop.webp` | `public/assets/pieces/b_bishop.webp` |
| **Caballo (Knight)** | Negro | `app/src/main/res/drawable/piece_b_knight.webp` | `public/assets/pieces/b_knight.webp` |
| **Peón (Pawn)** | Negro | `app/src/main/res/drawable/piece_b_pawn.webp` | `public/assets/pieces/b_pawn.webp` |

*Muestra general y hoja de contacto guardada en:*  
`C:/Users/jsont/.gemini/antigravity-ide/brain/8008bf5c-b1f5-44a9-9e38-f60d6e759c29/chess_pieces_3d_showcase.png`

---

## 3. Stack Tecnológico Recomendado para la Web

| Capa | Tecnología Seleccionada | Justificación |
|---|---|---|
| **Framework Base** | **React 18 / 19 + TypeScript + Vite** | Rendimiento ultra rápido, tipado seguro idéntico a Kotlin, soporte PWA nativo y carga instantánea. |
| **Estilos & UI** | **Vanilla CSS Modules o Tailwind CSS** | Control absoluto sobre la paleta romántica, variables CSS (`--rose-gold-primary`, etc.), soporte de modo oscuro y microinteracciones fluidas. |
| **Motor de Ajedrez** | **TypeScript Nativo** (o biblioteca liviana `chess.js`) | Reutilizar la lógica de `ChessEngine.kt`, `MoveGenerator.kt` y `ChessAI.kt` (Minimax + AlphaBeta + PST). |
| **Red en Tiempo Real** | **MQTT sobre WebSockets** (`mqtt.js`) | Brokers globales públicos (`wss://broker.hivemq.com:8884/mqtt` o `wss://broker.emqx.io:8084/mqtt`). Cero servidores pagos, latencia <50ms y soporte LWT (Last Will and Testament) para presencia precisa. |
| **Cifrado E2EE** | **Web Crypto API (SubtleCrypto)** | Cifrado AES-GCM/CBC nativo del navegador, sin dependencias pesadas. |
| **Audio** | **Web Audio API** (`AudioContext`) | Reproducción y síntesis matemática en tiempo real sin latencia y sin necesidad de cargar archivos `.mp3`. |
| **Notas de Voz** | **MediaStream Recording API** | Graba audio del micrófono, lo comprime a WebM/Opus y lo transmite en Base64 cifrado. |
| **Persistencia Local** | **LocalStorage / IndexedDB** | Guarda el perfil de pareja, historial de partidas, Elo y progreso de lecciones. |

---

## 4. Estructura del Proyecto Web

```
chesslove-web/
├── public/
│   ├── assets/
│   │   ├── logo.png
│   │   └── pieces/
│   │       ├── w_king.webp
│   │       ├── w_queen.webp
│   │       ├── w_rook.webp
│   │       ├── w_bishop.webp
│   │       ├── w_knight.webp
│   │       ├── w_pawn.webp
│   │       ├── b_king.webp
│   │       ├── b_queen.webp
│   │       ├── b_rook.webp
│   │       ├── b_bishop.webp
│   │       ├── b_knight.webp
│   │       └── b_pawn.webp
│   ├── manifest.json            # Configuración PWA
│   └── favicon.ico
├── src/
│   ├── audio/
│   │   └── SoundManager.ts      # Síntesis matemática Web Audio API
│   ├── components/
│   │   ├── board/
│   │   │   ├── ChessBoard.tsx   # Renderizado 8x8, drag & drop, toques
│   │   │   ├── BoardOverlay.tsx # Flechas SVG y casillas coloreadas
│   │   │   └── PromotionModal.tsx
│   │   ├── chat/
│   │   │   ├── FloatingChatBubble.tsx # Burbuja flotante universal arrastrable
│   │   │   ├── ChatDrawer.tsx   # Panel de chat con notas de voz y emojis
│   │   │   └── AudioMessagePlayer.tsx
│   │   ├── couple/
│   │   │   ├── CoupleHeaderCard.tsx
│   │   │   └── CoupleRequestModal.tsx
│   │   └── common/
│   │       ├── NavigationBar.tsx
│   │       └── Modal.tsx
│   ├── crypto/
│   │   └── CoupleCrypto.ts      # Cifrado E2EE con SubtleCrypto
│   ├── engine/
│   │   ├── ChessEngine.ts       # Reglas FIDE (enroque, paso, promoción)
│   │   ├── MoveGenerator.ts     # Generación de movimientos legales
│   │   ├── ChessAI.ts           # Minimax con poda alfa-beta
│   │   ├── PieceSquareTables.ts # Evaluación posicional
│   │   └── types.ts             # BoardState, Move, Piece, Position
│   ├── learn/
│   │   ├── LearnCatalog.ts      # 16 lecciones en 4 niveles completos
│   │   └── types.ts
│   ├── network/
│   │   ├── MqttClient.ts        # Conexión WebSocket, reconexión, tópicos
│   │   ├── PresenceWatchdog.ts  # Detección de desconexión en vivo
│   │   └── types.ts             # Eventos online y payloads
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   ├── OnlineGameScreen.tsx
│   │   ├── LocalGameScreen.tsx
│   │   ├── LearnScreen.tsx
│   │   ├── LearnLessonScreen.tsx
│   │   ├── OurStoryScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── story/
│   │   ├── CoupleStoryEngine.ts # Algoritmo de química, memorias y crónicas
│   │   └── EloCalculator.ts     # Algoritmo ELO con factor K=32
│   ├── styles/
│   │   ├── theme.css            # Variables de color y tipografía
│   │   └── global.css
│   ├── App.tsx
│   └── main.tsx
├── package.json
└── vite.config.ts
```

---

## 5. Tokens de Diseño y Sistema Visual (Theme)

Para mantener la elegancia y atmósfera romántica de ChessLove, se utilizan los mismos códigos hexadecimales:

```css
:root {
  /* Paleta Principal Elegante / Romántica */
  --rose-gold-primary: #E57388;
  --rose-gold-secondary: #D4A373;
  --velvet-dark: #1A161E;
  --velvet-card: #26202D;
  --velvet-surface: #201B27;

  /* Modos de Fondo */
  --dark-background: #121016;
  --dark-surface: #1C1822;
  --dark-on-surface: #F3EDF7;

  /* Tablero de Ajedrez */
  --board-light-square: #EDE0D4;
  --board-dark-square: #7F5539;
  --board-selected-square: rgba(226, 149, 120, 0.6);
  --board-last-move-square: rgba(183, 183, 164, 0.4);
  --board-legal-dot: rgba(74, 62, 61, 0.5);
  --board-check-alert: rgba(217, 4, 41, 0.6);

  /* Capa Pedagógica (Herramientas de Profesor) */
  --education-arrow: rgba(226, 149, 120, 0.87);
  --education-highlight: rgba(0, 109, 119, 0.53);
  --education-danger: rgba(217, 4, 41, 0.53);
  --education-success: rgba(82, 183, 136, 0.53);

  /* Tipografía */
  --font-family-primary: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-family-display: 'Playfair Display', Georgia, serif;
}
```

---

## 6. Motor de Ajedrez y Lógica de Juego (FIDE & IA)

### 6.1 Reglas Implementadas
- **Enroque**: Tanto corto (O-O) como largo (O-O-O). Valida que ni el rey ni las casillas intermedias estén bajo ataque, y que ni el rey ni la torre se hayan movido antes.
- **Captura al Paso (En Passant)**: Almacena el `enPassantTarget` durante un solo medio-movimiento después del avance de 2 pasos de un peón.
- **Coronación de Peón**: Modal visual para elegir entre Dama, Torre, Alfil o Caballo al alcanzar la fila 8 (o 1 para negras).
- **Reloj de 50 Movimientos**: Tablas automáticas si transcurren 50 jugadas sin captura ni avance de peón.
- **Material Insuficiente**: Detección de Rey vs Rey, Rey + Alfil vs Rey, Rey + Caballo vs Rey, o Alfiles de igual color.
- **Detección de Estados**: Jaque, Jaque Mate y Ahogado (Stalemate).

### 6.2 Motor de Inteligencia Artificial (ChessAI)
- **Algoritmo**: Minimax con Poda Alfa-Beta (`alphaBeta`).
- **Nivel Principiante**: Profundidad 1. 60% de probabilidad de jugar la mejor opción a nivel 1, 40% jugadas casuales de desarrollo/captura.
- **Nivel Fácil**: Profundidad 1 autoritaria con priorización de capturas.
- **Nivel Intermedio**: Profundidad 3 completa con ordenamiento de jugadas MVV-LVA (*Most Valuable Victim - Least Valuable Attacker*) y Tablas de Posición por Pieza (PST).
- **Herramienta de Pistas (*Hint*)**: Sugiere en pantalla la mejor jugada para el jugador evaluando a profundidad 3.

---

## 7. Motor de Sonido Sintético (Web Audio API)

No requiere archivos de audio externos. Todo se sintetiza matemáticamente en tiempo real con latencia inferior a 5ms:

```typescript
// Implementación en Web Audio API (SoundManager.ts)
class SoundManager {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private getContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // 1. Toque suave sobre madera al mover pieza (~80ms)
  playMove() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const t = ctx.currentTime;

    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(70, t + 0.08);

    gain.gain.setValueAtTime(0.75, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.08);
  }

  // 2. Chasquido de captura contundente (~120ms)
  playCapture() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    const oscSnap = ctx.createOscillator();
    const oscWood = ctx.createOscillator();
    const gain = ctx.createGain();
    const t = ctx.currentTime;

    oscSnap.frequency.setValueAtTime(320, t);
    oscWood.frequency.setValueAtTime(140, t);

    gain.gain.setValueAtTime(0.85, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    oscSnap.connect(gain);
    oscWood.connect(gain);
    gain.connect(ctx.destination);

    oscSnap.start(t);
    oscWood.start(t);
    oscSnap.stop(t + 0.12);
    oscWood.stop(t + 0.12);
  }

  // 3. Alerta armónica de Jaque (dos tonos: D5 -> A5, ~260ms)
  playCheck() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    const t = ctx.currentTime;
    [587.33, 880.0].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = t + i * 0.13;
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.6, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.13);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.13);
    });
  }

  // 4. Victoria (Arpegio C5, E5, G5, C6)
  playVictory() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    const t = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = t + idx * 0.14;
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.7, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.2);
    });
  }

  // 5. Pop de burbuja de chat (~80ms tono ascendente)
  playChatPop() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const t = ctx.currentTime;
    osc.frequency.setValueAtTime(450, t);
    osc.frequency.exponentialRampToValueAtTime(900, t + 0.08);
    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.08);
  }
}

export const soundManager = new SoundManager();
```

---

## 8. Protocolo de Red y Tiempo Real (MQTT sobre WebSockets)

### 8.1 Brokers y Conexión
- **Broker Principal**: `wss://broker.hivemq.com:8884/mqtt`
- **Broker de Respaldo**: `wss://broker.emqx.io:8084/mqtt`
- **Tópicos**:
  - `chesslove/room/{roomCode}`: Movimientos de partida, flechas del profesor, chat de la partida y reacciones.
  - `chesslove/inbox/{userId}` o `chesslove/inbox/{userName}`: Solicitudes de pareja y notificaciones personales.
  - `chesslove/presence/{userId}`: Estados de presencia y pings periódicos.

### 8.2 Watchdog de Presencia Inteligente
- Al conectarse, el cliente configura su **Last Will and Testament (LWT)** con status `OFFLINE`. Si el navegador se cierra o pierde internet, el broker emite el aviso al instante.
- Cada 15 segundos el cliente activo envía un `PRESENCE_PING`.
- Si pasan más de 25 segundos sin recibir señales de la pareja, el indicador visual pasa automáticamente a gris (Desconectado), eliminando falsos positivos de estado en línea.

### 8.3 Esquemas de Mensajes JSON (Payloads)

#### 1. Anuncio de Sala (`ROOM_ANNOUNCE`)
```json
{
  "type": "ROOM_ANNOUNCE",
  "roomId": "room_LOVE_24",
  "roomCode": "LOVE-24",
  "hostId": "usr_abc123",
  "hostName": "Jason",
  "hostColor": "WHITE"
}
```

#### 2. Solicitud y Confirmación de Unión (`JOIN_REQUEST` & `JOIN_CONFIRM`)
```json
// Invitado solicita unirse:
{
  "type": "JOIN_REQUEST",
  "roomId": "room_LOVE_24",
  "roomCode": "LOVE-24",
  "guestId": "usr_xyz789",
  "guestName": "Mi Amor"
}

// Anfitrión confirma y sincroniza tablero:
{
  "type": "JOIN_CONFIRM",
  "roomCode": "LOVE-24",
  "hostColor": "WHITE",
  "guestId": "usr_xyz789",
  "boardFen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
}
```

#### 3. Movimiento de Ajedrez (`MOVE`)
```json
{
  "type": "MOVE",
  "senderId": "usr_abc123",
  "fromRow": 6,
  "fromCol": 4,
  "toRow": 4,
  "toCol": 4,
  "promotionType": null
}
```

#### 4. Herramientas de Profesor (`TEACHER_ARROW` y `HIGHLIGHT`)
```json
// Flecha pedagógica:
{
  "type": "TEACHER_ARROW",
  "senderId": "usr_abc123",
  "fromRow": 7,
  "fromCol": 1,
  "toRow": 5,
  "toCol": 2
}

// Resaltado de casilla táctica:
{
  "type": "HIGHLIGHT",
  "senderId": "usr_abc123",
  "row": 4,
  "col": 4,
  "colorHex": 2281747833
}

// Limpiar todas las anotaciones:
{
  "type": "CLEAR_ANNOTATIONS",
  "senderId": "usr_abc123"
}
```

#### 5. Chat Seguro y Cifrado (`SECURE_CHAT_MESSAGE`)
```json
{
  "type": "SECURE_CHAT_MESSAGE",
  "msgId": "msg_01",
  "senderId": "usr_abc123",
  "iv": "base64_iv...",
  "cipher": "base64_encrypted_payload..."
}
```

#### 6. Reacción Romántica Flotante (`REACTION`)
```json
{
  "type": "REACTION",
  "senderId": "usr_abc123",
  "emoji": "💖"
}
```

---

## 9. Cifrado de Extremo a Extremo (E2EE)

La privacidad de las parejas está protegida usando la **Web Crypto API**:
1. **Derivación de Clave**: Se genera una clave simétrica AES a partir del `coupleCode` o `roomCode` usando PBKDF2 (SHA-256) con un salt compartido.
2. **Algoritmo de Cifrado**: AES-GCM (o AES-CBC con padding PKCS7) con vector de inicialización (IV) de 12 o 16 bytes aleatorios por cada mensaje.
3. **Payload Protegido**: El texto, la nota de voz o la jugada vinculada viajan completamente cifrados a través de los brokers públicos, garantizando que nadie en el camino pueda leer las conversaciones.

---

## 10. Módulos y Pantallas Detalladas

### 10.1 Pantalla Principal (Home & Pareja)
- **Tarjeta Superior de Pareja**:
  - Muestra ambos avatares (con borde dorado y halo romántico).
  - Indicador de estado en línea: punto verde pulsante (conectado) o gris (desconectado).
  - Porcentaje de Química Romántica calculado en tiempo real.
- **Acciones de Sala Directas**:
  - Botón "Crear Sala": Genera código romántico aleatorio (ej. `AMOR-77`, `BESO-14`).
  - Botón "Unirse a Sala": Campo para escribir o pegar el código.
- **Selector de Modos**:
  - *Duelo de Pareja (Online)*.
  - *Juego Local (Tablero Físico Compartido)*.
  - *Desafío contra la IA (3 niveles)*.
  - *Academia de Ajedrez (Modo Aprender)*.
  - *Nuestra Historia (Bitácora de Amor)*.

### 10.2 Tablero de Juego (Online, Local e IA)
- **Diseño Receptivo**: Se adapta a pantallas verticales de teléfonos y a monitores horizontales.
- **Piezas 3D**: Renderizadas en alta definición con sombras dinámicas al arrastrar o pulsar.
- **Marcadores Visuales**:
  - Puntos para movimientos legales.
  - Anillo sutil en la última jugada realizada.
  - Alerta en rojo carmesí suave cuando el rey está en jaque.
- **Barra de Reacciones Rápidas**: Envíos en 1 toque de emojis animados (`💖`, `😍`, `🔥`, `👑`, `♟️`, `🌹`).

### 10.3 Capa Pedagógica (Herramientas de Profesor)
- Activada cuando el usuario o su pareja tienen el rol de **Profesor/Mentor**.
- **Herramienta de Flechas**: Al arrastrar el dedo con el botón de flecha activo, dibuja una flecha SVG semi-transparente sobre el tablero que se proyecta simultáneamente en la pantalla de la pareja.
- **Herramienta de Resaltado**: Al tocar una casilla, la tiñe de color (azul táctico, verde éxito o rojo peligro).
- **Botón Borrador**: Limpia las anotaciones didácticas de ambas pantallas.

### 10.4 Chat Universal y Burbuja Flotante
- **Burbuja Flotante Arrastrable**:
  - Flota en cualquier pantalla de la app (Home, Tablero, Perfil, Historia).
  - Se puede mover a cualquier esquina de la pantalla según la comodidad del usuario.
  - Muestra un badge con el conteo de mensajes sin leer.
- **Panel Desplegable (Sheet/Drawer)**:
  - Historial de mensajes con hora y estado de entrega.
  - Grabación de Notas de Voz: botón de micrófono con temporizador y animación de onda.
  - Vincular Jugada: permite referenciar el movimiento actual (ej. *"¡Cuidado con mi alfil!"*).

### 10.5 Academia de Ajedrez (16 Lecciones Interactivas)
El catálogo completo consta de 4 niveles progresivos con tableros interactivos preconfigurados:
- **Nivel 1: Conoce las Piezas (6 lecciones)**:
  - 101: El Peón (captura diagonal y avance).
  - 102: La Torre (filas y columnas abiertas).
  - 103: El Caballo (salto en 'L' y juego central).
  - 104: El Alfil (francotirador de diagonales).
  - 105: La Dama (máxima soberana táctica).
  - 106: El Rey (el corazón del reino y su valor infinito).
- **Nivel 2: Tablero y Coordenadas (3 lecciones)**:
  - 201: Columnas y Filas (letras a-h y números 1-8).
  - 202: Conquista del Centro (las casillas sagradas e4/d4).
  - 203: La Gran Diagonal (a1 a h8).
- **Nivel 3: Reglas Especiales (3 lecciones)**:
  - 301: La Coronación del Peón.
  - 302: El Enroque Corto (refugio real).
  - 303: Jaque y Vías de Escape.
- **Nivel 4: Tácticas de Pareja (4 lecciones)**:
  - 401: El Tenedor de Caballo (ataque doble a Rey y Dama).
  - 402: La Clavada Absoluta (paralizando piezas rivales).
  - 403: Jaque Mate del Pasillo.
  - 404: Coordinación de Amor / Beso de la Muerte (coordinación Dama + Alfil).

### 10.6 Nuestra Historia (Química, Recuerdos y Elo)
- **Cálculo de Química de Pareja**:
  - Fórmula: Base 75% + bonus por partidas (+3% c/u) + bonus por paridad competitiva (+10%) + bonus por empates (+5%).
  - Título dinámico: *Conexión Cósmica 🌟 (≥95%)*, *Almas Gemelas 💖 (≥88%)*, *Sintonía Táctica ⚡ (≥80%)*.
- **Arquetipos Románticos Dinámicos**:
  - *Rivales Enamorados ⚔️❤️* (balance equilibrado de victorias).
  - *Pacto de Armonía 🕊️🤍* (múltiples tablas o empates).
  - *Tutor y Musa Táctica 🎓✨* (uno guía o lidera las victorias).
  - *Almas Estratégicas 💫♟️*.
- **Bitácora de Recuerdos Inolvidables**:
  - El Reino Iniciado (código de amor y fecha).
  - El Primer Choque de Reyes (primera partida).
  - La Batalla Más Épica (partida con mayor cantidad de jugadas).
  - El Abrazo de las Tablas (primer empate).
  - Llama Ardiente (racha récord de victorias).
- **Sistema Elo**:
  - Elo base: 1000 pts para cada uno.
  - Cálculo oficial con factor $K=32$ y fórmula logística esperada:
    $$E_A = \frac{1}{1 + 10^{(R_B - R_A)/400}}$$
    $$\Delta R = K \cdot (S_A - E_A)$$

### 10.7 Perfil y Emparejamiento Automático
- Al unirse por primera vez mediante el código de pareja, se produce una **sincronización cruzada automática**:
  - El dispositivo A toma el nombre y avatar del usuario B.
  - El dispositivo B toma el nombre y avatar del usuario A.
  - Ambos perfiles quedan configurados instantáneamente sin que ninguno tenga que escribir manualmente los datos del otro.

---

## 11. Guía de Puesta en Marcha y Despliegue

### Paso 1: Crear el Proyecto Web
En la terminal de comandos (en la carpeta donde quieras crear el nuevo proyecto):
```bash
# Crear proyecto con Vite y React + TypeScript
npm create vite@latest chesslove-web -- --template react-ts

cd chesslove-web

# Instalar dependencias necesarias
npm install mqtt lucide-react canvas-confetti
npm install -D @types/canvas-confetti vite-plugin-pwa
```

### Paso 2: Copiar los Assets Creados
Copia la carpeta de piezas y el logo directamente desde este repositorio Android al nuevo proyecto:
- De: `ChessLove/app/src/main/res/drawable/piece_*.webp`  
  A: `chesslove-web/public/assets/pieces/`
- De: `ChessLove/app/src/main/res/drawable/ic_chess_love_logo.png`  
  A: `chesslove-web/public/assets/logo.png`

### Paso 3: Probar Localmente
```bash
npm run dev
```
Abre la URL local en tu navegador (ej. `http://localhost:5173`). Puedes abrir dos pestañas (una en incógnito) para simular una partida entre ambos.

### Paso 4: Despliegue Gratuito en la Nube (1 Clic)
Para que tu pareja pueda jugar desde su teléfono en cualquier parte del mundo:
1. Sube el proyecto a **GitHub**.
2. Entra en [Vercel.com](https://vercel.com) o [Netlify.com](https://netlify.com).
3. Conecta el repositorio de GitHub y pulsa **Deploy**.
4. ¡Listo! Obtendrás un enlace HTTPS gratuito e instantáneo (ej. `https://chesslove.vercel.app`) para compartir con ella.
