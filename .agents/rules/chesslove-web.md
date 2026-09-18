# Reglas de Desarrollo — ChessLove Web

1. **Objetivo Central**:
   Construir la aplicación web **ChessLove Web** en React + TypeScript + Vite, orientada a parejas para jugar ajedrez romántico en tiempo real, comunicarse y aprender.

2. **Arquitectura y Especificación**:
   - Todo desarrollo debe basarse estrictamente en la especificación contenida en `CHESSLOVE_WEB_SPECIFICATION.md`.
   - Los assets de las piezas y el logo ya están disponibles en `public/assets/pieces/` y `public/assets/logo.png`.
   - Cero dependencias de servidores propietarios costosos: utiliza MQTT sobre WebSockets (`wss://broker.hivemq.com:8884/mqtt` o `wss://broker.emqx.io:8084/mqtt`) para el multijugador en tiempo real.
   - El audio debe sintetizarse mediante la **Web Audio API** para no requerir archivos externos pesados.

3. **Estética y Experiencia de Usuario (UI/UX)**:
   - Diseño romántico y sofisticado: fondo oscuro aterciopelado (`#1A161E`), toques oro rosa (`#E57388`, `#D4A373`), bordes suaves y micro-animaciones fluidas.
   - Experiencia móvil impecable (100% responsive, adaptable a pantallas de iPhone y Android).
   - Burbuja flotante de chat arrastrable a cualquier posición.
   - Capa interactiva de profesor con flechas SVG y casillas resaltadas.
