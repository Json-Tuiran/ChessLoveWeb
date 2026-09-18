---
name: chesslove-web-master
description: Master guidance, rules, domain knowledge, and assets guide for developing the ChessLove Web application. Use whenever working on the ChessLove Web project to implement the board, rules, multiplayer, chat, and couple story.
---

# ChessLove Web Master Skill

Esta habilidad guía el desarrollo completo de la aplicación web **ChessLove**, una plataforma web de ajedrez romántico y educativo diseñada para parejas.

## 1. Visión y Objetivos
- La aplicación web debe funcionar fluidamente en navegadores móviles (iOS Safari, Android Chrome) y de escritorio (PC/Mac) sin necesidad de instalar archivos externos.
- Soporte para Progressive Web App (PWA) instalable como icono en la pantalla de inicio.
- Diseño visual cautivador, lujoso y romántico (*Rose Gold, Velvet Dark, Glassmorphism*).

## 2. Inventario de Assets Listos
Los assets ya se encuentran en `public/assets/`:
- **Piezas 3D (Fondo transparente)**: `public/assets/pieces/`
  - Blancas: `w_king.webp`, `w_queen.webp`, `w_rook.webp`, `w_bishop.webp`, `w_knight.webp`, `w_pawn.webp`
  - Negras: `b_king.webp`, `b_queen.webp`, `b_rook.webp`, `b_bishop.webp`, `b_knight.webp`, `b_pawn.webp`
- **Logo Oficial**: `public/assets/logo.png`

## 3. Especificación Técnica Completa
Consulta el documento maestro en la raíz:
`CHESSLOVE_WEB_SPECIFICATION.md`

Contiene:
1. **Reglas oficiales FIDE**: Enroque corto y largo, captura al paso, coronación con diálogo interactivo, jaque, jaque mate, tablas por 50 movimientos y material insuficiente.
2. **Motor de IA**: Minimax con poda alfa-beta (niveles Principiante, Fácil, Intermedio) y generador de sugerencias tácticas.
3. **Sonido Sintético (Web Audio API)**: Implementado sin archivos de audio externos (toque de madera, captura, jaque armónico en dos tonos, arpegio de victoria, pop de chat).
4. **Tiempo Real (MQTT sobre WebSockets)**:
   - Broker HiveMQ: `wss://broker.hivemq.com:8884/mqtt`
   - Broker EMQX (respaldo): `wss://broker.emqx.io:8084/mqtt`
   - Soporte de presencia en vivo con Last Will and Testament (LWT) para evitar falsos estados online.
5. **Cifrado E2EE**: Web Crypto API con clave derivada del código de pareja.
6. **Chat Flotante Universal**: Burbuja arrastrable, notas de voz (MediaRecorder API) y mensajes enlazados a jugadas.
7. **Herramientas de Profesor**: Flechas vectoriales SVG y casillas resaltadas sincronizadas en tiempo real.
8. **16 Lecciones Interactivas**: 4 niveles pedagógicos con tableros preconfigurados.
9. **Nuestra Historia**: Algoritmo de Química (70%-100%), arquetipos románticos dinámicos, recuerdos y sistema de puntuación Elo ($K=32$).

## 4. Convenciones de Código y UX
- Usa **React + TypeScript** con Vite.
- Mantén componentes desacoplados, limpios y responsivos.
- Para estilos, usa variables CSS coherentes con la paleta romántica (`--rose-gold-primary: #E57388`, `--velvet-dark: #1A161E`, etc.).
