# YouTube Playlist Support - Tareas Pendientes

## Contexto
La rama `feature/youtube-playlist` contiene implementación básica para reproducir playlists de YouTube como alternativa a carpetas locales(tiene que dar a elegir una u otra opcion, no reemplazarla en el codigo). Actualmente usa:
- **Invidious API** para obtener lista de videos (sin API key necesaria)
- **YouTube iframe embeds** para reproducción
- **Timer de 5 minutos** como simulación de fin de video (temporal)

## Archivos Modificados
- `src/app/services/youtube.service.ts` - Nuevo servicio para YouTube
- `src/app/components/folder-selector/` - Input para URL de playlist
- `src/app/components/video-player/` - Soporte iframe YouTube
- `src/app/services/file-system.service.ts` - Interface VideoFile con flag `isYouTube`

## Tareas Críticas Pendientes

### 1. Implementar YouTube IFrame Player API
**Problema actual:** Timer de 5 minutos hardcodeado no detecta cuando termina realmente el video.

**Solución:**
- Cargar YouTube IFrame Player API: https://developers.google.com/youtube/iframe_api_reference
- Reemplazar iframe simple con YT.Player instance
- Escuchar evento `onStateChange` para detectar `YT.PlayerState.ENDED`
- Llamar a `onVideoEnded()` cuando el video realmente termine

**Archivo:** `src/app/components/video-player/video-player.ts`
```typescript
// Agregar script dinámicamente
loadYouTubeAPI() {
  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  document.body.appendChild(tag);
}

// Inicializar player
initYouTubePlayer(videoId: string) {
  this.ytPlayer = new YT.Player('youtube-player-id', {
    videoId: videoId,
    events: {
      'onStateChange': (event) => {
        if (event.data === YT.PlayerState.ENDED) {
          this.onVideoEnded();
        }
      }
    }
  });
}
```

### 2. Obtener Duración Real de Videos
**Problema:** No sabemos la duración real de cada video para UI (barra de progreso, tiempo restante).

**Solución:**
- Usar datos de Invidious: `YouTubeVideo.lengthSeconds` ya viene en la respuesta
- Pasar duración a `VideoFile.duration` (agregar campo nuevo)
- Mostrar en barra de progreso y info overlay
- Usar YouTube Player API `getDuration()` como fallback

**Archivos:**
- `src/app/services/file-system.service.ts` - Agregar `duration?: number` a VideoFile
- `src/app/components/folder-selector/folder-selector.ts` - Mapear `lengthSeconds` al crear playlist
- `src/app/components/video-player/video-player.ts` - Usar duración en UI

### 3. Mejorar Manejo de Errores de Invidious
**Problema:** Si todas las instancias fallan, la app muestra error genérico.

**Solución:**
- Agregar retry logic con exponential backoff
- Permitir al usuario ingresar URL de instancia custom de Invidious
- Mostrar mensaje más claro: "No se pudo conectar a Invidious. Intenta de nuevo o usa una carpeta local"
- Guardar última instancia que funcionó en localStorage

**Archivo:** `src/app/services/youtube.service.ts`

### 4. Testing con Playlists Reales
**Tareas:**
- Probar con playlist pública de YouTube (100+ videos)
- Verificar que shuffle funciona correctamente
- Confirmar que overlay de reloj/clima se ve bien sobre iframe
- Probar en diferentes resoluciones (4K, 1080p, 720p)
- Validar comportamiento con videos restringidos/privados/eliminados

### 5. Persistencia de Playlist de YouTube
**Feature:** Guardar última playlist cargada en localStorage
- Detectar si hay playlist guardada al iniciar app
- Mostrar opción "Continuar con playlist anterior" vs "Nueva playlist"
- Guardar índice de reproducción para continuar donde quedó

**Archivo:** `src/app/services/storage.service.ts`

### 6. Documentación
**README.md** - Agregar sección:
```markdown
## Reproducir Playlists de YouTube

Además de carpetas locales, puedes reproducir playlists públicas de YouTube:

1. Copia la URL de cualquier playlist pública
2. Pégala en el campo de entrada al iniciar la app
3. Click en "Cargar Playlist"

**Nota:** Usa Invidious API (sin necesidad de API key). Si una instancia falla, prueba de nuevo.
```

### 7. Optimizaciones Opcionales
- [ ] Precargar siguiente video de YouTube (difícil con iframes)
- [ ] Permitir alternar entre modo carpeta y modo YouTube sin recargar
- [ ] Agregar botón "Abrir en YouTube" para video actual
- [ ] Mostrar thumbnail de próximo video
- [ ] Soporte para videos individuales (no solo playlists)

## Testing
```bash
# Ejemplo de playlist para testing
https://www.youtube.com/playlist?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf

# Build y run
npm run build
npm start
```

## Notas Técnicas
- Los controles de volumen/subtítulos no funcionan con YouTube (usa controles nativos de iframe)
- El overlay de reloj/clima se mantiene funcional sobre el iframe
- La duración simulada (5 min) hace que videos largos se corten prematuramente
- CORS puede ser issue con algunas instancias de Invidious (usar las públicas confiables)

## Prioridad de Implementación
1. **CRÍTICO:** YouTube IFrame Player API para fin de video (sin esto, no es usable)
2. **ALTO:** Duración real de videos
3. **MEDIO:** Manejo de errores de Invidious
4. **BAJO:** Persistencia, documentación, optimizaciones
