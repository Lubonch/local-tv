# ROADMAP V2 - Local TV

## Fase 1: Barra de Progreso con Seek ✅ COMPLETADA

### Tareas:
- [x] **1.1**: Crear componente VideoProgressBar
  - Crear componente standalone con barra visual
  - Mostrar tiempo actual y duración total
  - Diseño minimalista que combine con el tema negro actual
  
- [x] **1.2**: Implementar funcionalidad de seek
  - Click en la barra para saltar a ese punto
  - Drag para moverse por el video
  - Preview del tiempo al hacer hover sobre la barra
  
- [x] **1.3**: Integrar con VideoPlayerComponent
  - Mostrar/ocultar junto con los controles existentes
  - Actualizar en tiempo real mientras el video reproduce
  - Debe ser responsive y funcionar en modo fullscreen
  
- [x] **1.4**: Atajos de teclado adicionales
  - ArrowLeft/ArrowRight: -5s/+5s (con Shift: video anterior/siguiente)
  - J/L: -10s/+10s
  - Teclas 0-9: Saltar a 0%-90% del video

---

## Fase 2: Nombre del Video Actual ✅ COMPLETADA

### Tareas:
- [x] **2.1**: Crear componente VideoInfoOverlay
  - Mostrar nombre del video sin extensión
  - Posicionar en esquina superior (izquierda o centro)
  - Diseño coherente con overlay actual
  
- [x] **2.2**: Implementar lógica de show/hide
  - Aparecer al mover el mouse (igual que controles)
  - Desaparecer después de 3 segundos sin actividad
  - Transiciones suaves (fade in/out)
  
- [x] **2.3**: Integrar con VideoPlayerComponent
  - Sincronizar con showControls
  - Actualizar cuando cambia el video
  - Funcionar en fullscreen

---

## Fase 3: Control de Volumen ✅ COMPLETADA

### Tareas:
- [x] **3.1**: Crear componente VolumeControl
  - Slider vertical u horizontal para ajustar volumen
  - Icono que cambia según nivel (mute, bajo, medio, alto)
  - Click en icono para mute/unmute
  
- [x] **3.2**: Implementar persistencia
  - Guardar volumen en localStorage
  - Cargar volumen guardado al iniciar
  - Mantener estado de mute entre sesiones
  
- [x] **3.3**: Integrar con VideoPlayerComponent
  - Posicionar cerca de otros controles
  - Mostrar/ocultar con controles
  - Aplicar volumen al elemento video
  
- [x] **3.4**: Atajos de teclado
  - ArrowUp/ArrowDown: +5%/-5% volumen
  - M: Toggle mute

---

## Fase 4: Manejo de Subtítulos ✅ COMPLETADA

### Tareas:
- [x] **4.1**: Detectar subtítulos embebidos
  - ✅ Detectar subtítulos embebidos en el archivo de video (pistas de texto)
  - ✅ Listar pistas de subtítulos disponibles
  - ✅ Soporte completo para archivos MKV con múltiples pistas
  
- [x] **4.2**: Crear componente SubtitleControl
  - ✅ Botón CC en controles
  - ✅ Lista desplegable con idiomas disponibles
  - ✅ Opción "Sin subtítulos"
  
- [x] **4.3**: Renderizar subtítulos
  - ✅ Usar elemento <track> nativo de HTML5
  - ✅ Sincronizar con tiempo del video
  
- [x] **4.4**: Persistencia y atajos
  - ✅ Recordar preferencia de subtítulos en localStorage
  - ✅ Atajo C para toggle subtítulos
  - ✅ Permitir cambio durante reproducción

- [x] **4.5**: Control de pistas de audio
  - ✅ Detectar pistas de audio múltiples en el video
  - ✅ Crear selector de idioma de audio (AudioTrackControl)
  - ✅ Mostrar nombre/idioma de cada pista disponible
  - ✅ Permitir cambio durante reproducción
  - ✅ Guardar preferencia de audio en localStorage
  - ✅ Soporte completo para archivos MKV

---

## Fase 5: Confirmación Modo Aleatorio ✅ COMPLETADA

### Tareas:
- [x] **5.1**: Verificar funcionalidad actual
  - ✅ Confirmado: Solo modo aleatorio con Math.random() (sin seed predecible)
  - ✅ Documentado en RANDOM_MODE.md
  - ✅ Algoritmo Fisher-Yates shuffle + selección sin repetición
  
- [x] **5.2**: Agregar indicador visual
  - ✅ Componente RandomModeIndicator en esquina superior derecha
  - ✅ Icono 🔀 con animación y hover effect
  - ✅ Tooltip explicativo "Modo Aleatorio Activo"
  
- [x] **5.3**: Limpiar archivos innecesarios
  - ✅ Eliminados: ROADMAP.md, QUICK_START.md, docs/STREAMING.md
  - ✅ README.md convertido a versión minimalista y humanizada
  - ✅ Documentación consolidada y simplificada


---

## Notas de Implementación

- Mantener consistencia visual con el tema oscuro actual
- Todas las animaciones deben ser suaves (fade in/out)
- Los componentes deben ser standalone y reutilizables
- Usar signals de Angular cuando sea apropiado
- Evitar comentarios innecesarios en el código
- Probar en modo windowed y fullscreen

---

## Estado General

- ✅ Fase 1: COMPLETADA (23/12/2024)
- ✅ Fase 2: COMPLETADA (23/12/2024)
- ✅ Fase 3: COMPLETADA (23/12/2024)
- ✅ Fase 4: COMPLETADA - Subtítulos y audio embebidos funcionales, soporte MKV (23/12/2024)
- ✅ Fase 5: COMPLETADA (23/12/2024)

---

## 🎉 ROADMAP_V2 COMPLETADO

Todas las fases del ROADMAP_V2 han sido implementadas exitosamente.

### Resumen de Funcionalidades Agregadas:

1. **Barra de Progreso con Seek**: Navegación temporal completa con preview
2. **Nombre del Video**: Info overlay que muestra el video actual
3. **Control de Volumen**: Slider con persistencia y atajos
4. **Subtítulos Embebidos**: Soporte para pistas de texto integradas
5. **Indicador de Modo Aleatorio**: Confirmación visual del comportamiento

### Próximas Mejoras Sugeridas:

- Archivos de subtítulos externos (.srt/.vtt)
- Control de pistas de audio múltiples
- Temas de color personalizables
- Estadísticas de reproducción
