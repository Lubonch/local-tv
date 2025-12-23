# 🎬 Roadmap - Video Player con Overlay tipo TV

## Objetivo
Crear una aplicación Angular que reproduzca videos aleatorios de una carpeta seleccionada, mostrando un overlay con hora y temperatura similar a los canales de televisión.

---

## Fase 1: Configuración Inicial del Proyecto ✅

### 1.1 Setup de Angular
- [x] Verificar instalación de Node.js y Angular CLI
- [x] Crear proyecto Angular con configuración tradicional (módulos)
- [x] Configurar estructura de carpetas
- [x] Limpiar archivos no necesarios del template por defecto

### 1.2 Dependencias
- [x] Instalar dependencias necesarias (si aplica)
- [x] Configurar archivo de entorno para API key de OpenWeatherMap

---

## Fase 2: Core - Selección y Gestión de Archivos ✅

### 2.1 Servicio de Archivos
- [x] Crear servicio `FileSystemService`
- [x] Implementar File System Access API para selección de carpeta
- [x] Crear función para escanear carpeta y subcarpetas recursivamente
- [x] Filtrar archivos por extensión de video (mp4, mkv, webm, avi, mov, etc.)
- [x] Almacenar lista de videos en memoria

### 2.2 LocalStorage/Cache
- [x] Crear servicio `StorageService`
- [x] Guardar handle de la carpeta en localStorage (si es posible)
- [x] Implementar lógica para recordar carpeta seleccionada
- [x] Crear función para verificar permisos al recargar

---

## Fase 3: Reproductor de Video ✅

### 3.1 Componente Principal
- [x] Crear componente `VideoPlayerComponent`
- [x] Implementar elemento `<video>` HTML5
- [x] Configurar reproductor en pantalla completa
- [x] Estilos minimalistas (sin controles visibles por defecto)

### 3.2 Lógica de Reproducción Aleatoria
- [x] Crear servicio `PlaylistService`
- [x] Implementar función de shuffle/aleatorización
- [x] Detectar fin de video (evento `ended`)
- [x] Cargar siguiente video aleatorio automáticamente
- [x] Manejar errores de carga de video
- [ ] Soporte para subtítulos (archivos .srt, .vtt si existen)

---

## Fase 4: Overlay - Hora y Temperatura ✅

### 4.1 Componente de Overlay
- [x] Crear componente `OverlayComponent`
- [x] Posicionar overlay sobre el video (position: absolute/fixed)
- [x] Diseño transparente/semitransparente tipo TV

### 4.2 Reloj en Tiempo Real
- [x] Implementar servicio `ClockService`
- [x] Actualizar hora cada segundo (setInterval)
- [x] Formatear hora en formato HH:MM:SS o HH:MM
- [x] Posicionar en esquina inferior izquierda

### 4.3 Temperatura
- [x] Crear servicio `WeatherService`
- [x] Integrar OpenWeatherMap API
- [x] Obtener geolocalización del usuario (Geolocation API)
- [x] Consultar temperatura actual y sensación térmica
- [x] Actualizar temperatura cada 15-30 minutos
- [x] Mostrar en Celsius (°C)
- [x] Posicionar en esquina inferior derecha
- [x] Manejar errores (sin ubicación, sin conexión, etc.)

---

## Fase 5: Flujo de Usuario y UX ✅

### 5.1 Pantalla de Inicio
- [x] Crear componente `FolderSelectorComponent`
- [x] Mostrar botón "Seleccionar Carpeta" al iniciar
- [x] Verificar si hay carpeta en localStorage
- [x] Si existe, solicitar permisos y cargar directamente
- [x] Feedback visual durante carga de videos

### 5.2 Navegación y Controles
- [x] Detectar teclas para controles básicos (opcional):
  - Espacio: Pausar/Reproducir
  - Flecha derecha: Siguiente video
  - Flecha izquierda: Video anterior
  - F: Pantalla completa
  - Escape: Salir de pantalla completa
- [ ] Botón sutil para "Cambiar carpeta" (solo visible al mover mouse)

---

## Fase 6: Pulido y Optimización ✨

### 6.1 Manejo de Errores
- [ ] Carpeta vacía o sin videos
- [ ] Videos corruptos o no soportados
- [ ] Error de geolocalización
- [ ] Error de API del clima
- [ ] Sin conexión a internet

### 6.2 Performance
- [ ] Precarga del siguiente video (opcional)
- [ ] Liberar memoria de videos anteriores
- [ ] Optimizar búsqueda recursiva de archivos

### 6.3 Estilos Finales
- [ ] Fuentes legibles para el overlay
- [ ] Sombras/bordes para mejor visibilidad del texto
- [ ] Animaciones sutiles (fade in/out)
- [ ] Modo pantalla completa automático al iniciar reproducción

---

## Fase 7: Deployment y Documentación 🚀

### 7.1 Build de Producción
- [ ] Configurar environment.prod.ts
- [ ] Build optimizado (`ng build --configuration production`)
- [ ] Servir archivos estáticos

### 7.2 Documentación
- [ ] README.md con instrucciones de uso
- [ ] Cómo obtener API key de OpenWeatherMap
- [ ] Requisitos del navegador
- [ ] Troubleshooting común

---

## Testing (Fase Futura - No Implementar Ahora) ⏳

- [ ] Unit tests para servicios
- [ ] E2E tests para flujo completo
- [ ] Tests de compatibilidad cross-browser

---

## Notas Técnicas 📝

### APIs a Utilizar
- **File System Access API**: Para selección de carpetas
- **Geolocation API**: Para ubicación del usuario
- **OpenWeatherMap API**: Para datos del clima
- **HTML5 Video API**: Para reproducción

### Compatibilidad
- ✅ Chrome/Chromium (Edge, Brave, etc.)
- ✅ Firefox (con polyfill si es necesario para File System API)

### Formatos de Video Soportados
- MP4 (H.264, H.265)
- WebM (VP8, VP9)
- MKV (si el navegador soporta el codec)
- AVI (limitado)
- MOV (limitado)

---

## Orden de Implementación Sugerido

1. **Setup** → Crear proyecto Angular
2. **File System** → Selección y escaneo de carpetas
3. **Video Player** → Reproducción básica
4. **Playlist** → Lógica aleatoria
5. **Overlay - Hora** → Reloj en tiempo real
6. **Overlay - Temperatura** → Integración clima
7. **LocalStorage** → Recordar carpeta
8. **UX** → Pulido y controles
9. **Build** → Producción

---

**Estado Actual**: 📍 Fase 6 - Implementación Core Completada ✅

**Próximos Pasos**: Testing manual y optimizaciones

**Última Actualización**: 23 de Diciembre, 2025
