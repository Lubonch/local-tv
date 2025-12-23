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
- [x] Botón sutil para "Cambiar carpeta" (solo visible al mover mouse)

---

## Fase 6: Pulido y Optimización ✨

### 6.1 Manejo de Errores
- [x] Carpeta vacía o sin videos
- [x] Videos corruptos o no soportados (contador de errores consecutivos)
- [x] Error de geolocalización (mensaje en overlay)
- [x] Error de API del clima (mensaje en overlay)
- [x] Sin conexión a internet (manejo en WeatherService)

### 6.2 Performance
- [x] Precarga del siguiente video (implementado)
- [x] Liberar memoria de videos anteriores (URL.revokeObjectURL)
- [x] Optimizar búsqueda recursiva de archivos (ya optimizado)

### 6.3 Estilos Finales
- [x] Fuentes legibles para el overlay (Segoe UI)
- [x] Sombras/bordes para mejor visibilidad del texto (múltiples sombras)
- [x] Animaciones sutiles (fadeIn, slideUp)
- [x] Modo pantalla completa automático al iniciar reproducción

---

## Fase 7: Deployment y Documentación 🚀

### 7.1 Build de Producción
- [x] Configurar environment.prod.ts (configurado con placeholder para API key)
- [x] Build optimizado (`ng build --configuration production`)
- [x] Servir archivos estáticos (instrucciones en README)

### 7.2 Documentación
- [x] README.md con instrucciones de uso
- [x] Cómo obtener API key de OpenWeatherMap
- [x] Requisitos del navegador
- [x] Troubleshooting común (extendido con múltiples escenarios)

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

**Estado Actual**: ✅ Fases 1-7 COMPLETADAS

**Proyecto**: Local TV - Listo para GitHub Pages 🚀

**Commits recientes en develop**:
- `498b61d` - Migración a Open-Meteo (sin API key) + GitHub Pages workflow
- `ba04977` - Botón "Cambiar carpeta" al mover mouse (Fase 5.2)
- `464ef52` - Guía de inicio rápido
- `ae52384` - Resumen completo del proyecto
- `76d4b70` - Fases 6 y 7: Optimizaciones y documentación

**Última Actualización**: 23 de Diciembre, 2025

---

## 🎉 Resumen de Implementación

### ✅ Características Implementadas

1. **Gestión de Archivos**
   - Selección de carpetas recursiva
   - Escaneo automático de subcarpetas
   - Soporte para 10 formatos de video
   - Persistencia en IndexedDB

2. **Reproductor de Video**
   - Reproducción aleatoria continua
   - Algoritmo Fisher-Yates shuffle
   - Controles por teclado
   - Pantalla completa automática
   - Precarga del siguiente video
   - Liberación de memoria automática

3. **Overlay TV Profesional**
   - Reloj en tiempo real (actualización cada segundo)
   - Temperatura actual (Celsius)
   - Sensación térmica
   - Actualización cada 30 minutos
   - Animaciones sutiles (fadeIn, slideUp)
   - Diseño con blur y sombras múltiples

4. **Manejo de Errores**
   - Videos corruptos (skip automático)
   - Contador de errores consecutivos
   - Carpetas vacías
   - Geolocalización fallida
   - API clima sin conexión
   - Mensajes claros al usuario

5. **Optimizaciones**
   - Precarga inteligente
   - Gestión de memoria
   - Escaneo eficiente
   - Build de producción optimizado

6. **Documentación**
   - README completo
   - 8 escenarios de troubleshooting
   - Instrucciones paso a paso
   - Guía de formatos soportados

7. **GitHub Pages Ready** 🚀
   - Migración a Open-Meteo (sin API key)
   - GitHub Actions workflow
   - Deploy automático
   - Sin variables de entorno necesarias

### 🔜 Mejoras Futuras (Opcionales)

- Soporte para subtítulos (.srt, .vtt)
- ~~Botón "Cambiar carpeta" visible al mover el mouse~~ ✅ **COMPLETADO**
- Selección de múltiples carpetas
- Playlists personalizadas
- Modo oscuro/claro para el overlay
- Testing automatizado (Unit + E2E)
- PWA (Progressive Web App)
- Deploy a GitHub Pages o Vercel
