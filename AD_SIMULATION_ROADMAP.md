# Feature: Simulación de Comerciales/Anuncios

## Objetivo
Implementar la capacidad de intercalar videos "comerciales" entre el contenido normal de la playlist, simulando la experiencia de TV tradicional con cortes comerciales.

## Concepto

### Comportamiento
```
Video normal 1 
→ Video normal 2 
→ Video normal 3 
→ [BLOQUE COMERCIAL: 1-5 videos aleatorios de carpeta de ads]
  → Comercial A
  → Comercial B
  → Comercial C
→ Video normal 4
→ Video normal 5
→ Video normal 6
→ [BLOQUE COMERCIAL: 1-5 videos aleatorios]
  → Comercial D
→ Video normal 7
...
```

### Características Clave
- ✅ **Carpeta de comerciales opcional**: Si no se selecciona, funciona normal
- ✅ **Intercalado automático**: Cada N videos normales → bloque de 1-5 comerciales random
- ✅ **Sin indicadores visuales**: Los comerciales se reproducen como videos normales
- ✅ **No afecta progreso**: Los comerciales no cuentan en el contador de videos reproducidos de la playlist principal
- ✅ **Configuración persistente**: Se guarda en localStorage

## Fases de Implementación

### Fase 1: Estructura de Datos y Configuración
**Objetivo:** Definir interfaces y configuración básica

#### Tareas:
- [ ] **1.1**: Extender `VideoFile` interface
  - Agregar campo `isAd?: boolean` para identificar comerciales
  - Agregar campo `adBlockIndex?: number` para tracking interno

- [ ] **1.2**: Crear interface `AdsConfig`
  ```typescript
  interface AdsConfig {
    enabled: boolean;              // Si está activada la función
    frequency: number;             // Cada cuántos videos (default: 3)
    minAdsPerBreak: number;        // Mínimo comerciales (1)
    maxAdsPerBreak: number;        // Máximo comerciales (5)
  }
  ```

- [ ] **1.3**: Actualizar `StorageService`
  - Agregar métodos `saveAdsFolder()` / `getAdsFolder()`
  - Agregar métodos `saveAdsConfig()` / `getAdsConfig()`
  - Key: `'ads-folder-handle'`, `'ads-config'`

**Archivos:**
- `src/app/services/file-system.service.ts`
- `src/app/services/storage.service.ts`

---

### Fase 2: UI - Selector de Carpeta de Comerciales
**Objetivo:** Permitir al usuario seleccionar carpeta de ads y configurar parámetros

#### Tareas:
- [ ] **2.1**: Modificar `folder-selector.html`
  - Agregar sección "Carpeta de Comerciales (Opcional)"
  - Checkbox: "Activar intercalado de comerciales"
  - Input numérico: "Cada cuántos videos" (default: 3)
  - Botón: "Seleccionar Carpeta de Comerciales"
  - Mostrar carpeta seleccionada y cantidad de ads encontrados

- [ ] **2.2**: Actualizar `folder-selector.ts`
  - Agregar propiedad `adsFolder: FileSystemDirectoryHandle | null`
  - Agregar propiedad `adsConfig: AdsConfig`
  - Método `onSelectAdsFolder()` - similar a `onSelectFolder()`
  - Método `scanAdsFolder()` - escanear videos de ads
  - Validación: mostrar error si ads folder está vacía

- [ ] **2.3**: Estilos `folder-selector.css`
  - Sección separada visualmente para ads
  - Botón de "Seleccionar Ads" con estilo diferente (ej: color naranja)
  - Indicador de cantidad de ads encontrados

**Archivos:**
- `src/app/components/folder-selector/folder-selector.html`
- `src/app/components/folder-selector/folder-selector.ts`
- `src/app/components/folder-selector/folder-selector.css`

---

### Fase 3: Lógica de Intercalado de Comerciales
**Objetivo:** Implementar la lógica central de mezclar videos normales con comerciales

#### Tareas:
- [ ] **3.1**: Extender `PlaylistService`
  - Agregar propiedad `adsVideos: VideoFile[]` - lista de comerciales
  - Agregar propiedad `adsConfig: AdsConfig`
  - Método `loadAdsPlaylist(videos: VideoFile[], config: AdsConfig)` - cargar ads
  - Propiedad `normalVideosPlayed: number` - contador de videos normales
  - Propiedad `currentAdBlock: VideoFile[]` - bloque actual de comerciales

- [ ] **3.2**: Modificar `getNextVideo()` en `PlaylistService`
  - Lógica:
    1. Si hay bloque de ads en curso → devolver siguiente ad del bloque
    2. Si no hay bloque pero toca corte comercial → generar nuevo bloque (1-5 random)
    3. Si no toca comercial → devolver video normal
  - Incrementar `normalVideosPlayed` solo cuando es video normal
  - Resetear contador cuando `normalVideosPlayed % adsConfig.frequency === 0`

- [ ] **3.3**: Implementar `generateAdBlock()` privado
  - Seleccionar cantidad random entre 1-5
  - Shuffle de ads disponibles
  - Tomar N primeros ads
  - Marcar con `isAd: true`
  - No repetir ads del bloque anterior si es posible

- [ ] **3.4**: Método `clearAds()`
  - Limpiar `adsVideos`, `currentAdBlock`
  - Resetear contadores

**Archivos:**
- `src/app/services/playlist.service.ts`

**Ejemplo de lógica:**
```typescript
getNextVideo(): VideoFile | null {
  // Si hay ads en el bloque actual, devolver siguiente
  if (this.currentAdBlock.length > 0) {
    const ad = this.currentAdBlock.shift()!;
    this.currentVideoSubject.next(ad);
    return ad;
  }

  // Verificar si toca corte comercial
  if (this.adsConfig.enabled && 
      this.adsVideos.length > 0 &&
      this.normalVideosPlayed > 0 &&
      this.normalVideosPlayed % this.adsConfig.frequency === 0) {
    this.currentAdBlock = this.generateAdBlock();
    return this.getNextVideo(); // Recursión para devolver primer ad
  }

  // Video normal
  const normalVideo = this.getNextNormalVideo();
  if (normalVideo && !normalVideo.isAd) {
    this.normalVideosPlayed++;
  }
  return normalVideo;
}

private generateAdBlock(): VideoFile[] {
  const count = Math.floor(Math.random() * 5) + 1; // 1-5
  const shuffled = [...this.adsVideos].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length))
    .map(ad => ({ ...ad, isAd: true }));
}
```

---

### Fase 4: Integración con VideoPlayer
**Objetivo:** Asegurar que video-player maneja comerciales correctamente

#### Tareas:
- [ ] **4.1**: Verificar `video-player.ts`
  - No requiere cambios especiales (comerciales son videos normales)
  - Asegurar que `onVideoEnded()` llama `getNextVideo()` correctamente
  - NO mostrar indicadores especiales para ads

- [ ] **4.2**: Testing de flujo completo
  - Cargar carpeta normal + carpeta ads
  - Verificar intercalado cada N videos
  - Verificar cantidad random de ads (1-5)
  - Verificar que no se repiten ads en mismo bloque
  - Verificar persistencia al recargar app

**Archivos:**
- `src/app/components/video-player/video-player.ts`

---

### Fase 5: Persistencia y Restauración
**Objetivo:** Guardar configuración y carpetas para próxima sesión

#### Tareas:
- [ ] **5.1**: Guardar al seleccionar carpeta de ads
  - `StorageService.saveAdsFolder(handle)`
  - `StorageService.saveAdsConfig(config)`

- [ ] **5.2**: Restaurar al iniciar app
  - En `folder-selector.ts` al `ngOnInit()`
  - Intentar cargar carpeta de ads guardada
  - Cargar configuración guardada
  - Mostrar en UI si hay ads cargados

- [ ] **5.3**: Botón "Limpiar Ads"
  - Permitir desactivar ads sin recargar app
  - Limpiar localStorage de ads

**Archivos:**
- `src/app/services/storage.service.ts`
- `src/app/components/folder-selector/folder-selector.ts`

---

### Fase 6: Testing y Refinamiento
**Objetivo:** Probar casos edge y refinar comportamiento

#### Tareas:
- [ ] **6.1**: Testing de casos edge
  - ¿Qué pasa si carpeta ads tiene 1 solo video? → Repetirlo en bloques
  - ¿Qué pasa si carpeta ads tiene menos de 5 videos? → Usar todos disponibles
  - ¿Qué pasa si se agota la playlist normal antes de ads? → Continuar normal
  - ¿Qué pasa si frequency es 1? → Ads después de cada video

- [ ] **6.2**: Optimizaciones
  - Pre-shuffle de ads al cargar para mejor distribución
  - Evitar mismo ad consecutivo entre bloques
  - Logging para debug (cantidad de ads en bloque, frecuencia actual)

- [ ] **6.3**: UX improvements
  - Deshabilitar input de frecuencia si ads no está activado
  - Validación: frecuencia mínima 1, máxima 10
  - Tooltip explicativo: "Los comerciales se reproducen automáticamente cada N videos"

**Archivos:**
- Todos los modificados en fases anteriores

---

### Fase 7: Documentación
**Objetivo:** Documentar la nueva funcionalidad

#### Tareas:
- [ ] **7.1**: Actualizar README.md
  - Sección "Simulación de Comerciales"
  - Explicar cómo activar y configurar
  - Ejemplos de uso

- [ ] **7.2**: Comentarios en código
  - Documentar lógica de intercalado
  - Explicar `generateAdBlock()` y sus parámetros

**Archivos:**
- `README.md`

---

## Estructura de Archivos

```
src/app/
├── services/
│   ├── file-system.service.ts     [MODIFICAR] - Interface VideoFile
│   ├── storage.service.ts         [MODIFICAR] - Métodos de ads
│   └── playlist.service.ts        [MODIFICAR] - Lógica intercalado
├── components/
│   ├── folder-selector/
│   │   ├── folder-selector.html   [MODIFICAR] - UI de ads
│   │   ├── folder-selector.ts     [MODIFICAR] - Lógica de ads
│   │   └── folder-selector.css    [MODIFICAR] - Estilos
│   └── video-player/
│       └── video-player.ts        [VERIFICAR] - Sin cambios necesarios
└── README.md                      [MODIFICAR] - Documentación
```

## Testing Manual

### Caso 1: Configuración Básica
1. Seleccionar carpeta con 10 videos normales
2. Activar "Intercalado de comerciales"
3. Seleccionar carpeta con 5 comerciales
4. Configurar frecuencia: 3
5. Iniciar reproducción
6. **Esperado**: 
   - Video 1, 2, 3 → Bloque de 1-5 ads → Video 4, 5, 6 → Bloque de ads → ...

### Caso 2: Pocos Comerciales
1. Carpeta con 2 comerciales solamente
2. Frecuencia: 2
3. **Esperado**: Bloques con 1-2 ads (máximo disponible)

### Caso 3: Persistencia
1. Configurar ads con frecuencia 5
2. Recargar página
3. **Esperado**: Configuración se mantiene, carpeta de ads cargada

### Caso 4: Desactivar Ads
1. Desmarcar "Activar intercalado"
2. **Esperado**: Solo reproducir videos normales, sin ads

## Notas Técnicas

- **Frecuencia Default**: 3 videos (cada 3 videos normales → bloque de ads)
- **Cantidad de Ads por Bloque**: Random entre 1-5
- **Shuffle de Ads**: Sí, para evitar repeticiones predecibles
- **Persistencia**: localStorage, igual que carpeta de videos
- **No afecta progreso**: Contador de videos solo cuenta normales
- **Sin indicadores visuales**: Usuario experimenta ads como videos más

## Prioridad de Implementación
1. **ALTA**: Fase 1, 2, 3 - Core functionality
2. **MEDIA**: Fase 4, 5 - Integración y persistencia
3. **BAJA**: Fase 6, 7 - Testing y documentación

## Commits Sugeridos
- `feat: agregar interface y config para simulación de ads`
- `feat: UI selector de carpeta de comerciales`
- `feat: lógica de intercalado de comerciales en playlist`
- `feat: integración de ads con video player`
- `feat: persistencia de configuración de ads`
- `test: casos edge de simulación de comerciales`
- `docs: documentar funcionalidad de comerciales`
