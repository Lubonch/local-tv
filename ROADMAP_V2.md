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

## Fase 4: Manejo de Subtítulos

### Tareas:
- [ ] **4.1**: Detectar archivos de subtítulos
  - Buscar archivos .srt o .vtt con mismo nombre que video
  - Parsear formato SRT/VTT
  - Listar subtítulos disponibles
  - Detectar subtítulos embebidos en el archivo de video (pistas de texto)
  
- [ ] **4.2**: Crear componente SubtitleControl
  - Botón CC en controles
  - Lista desplegable con idiomas disponibles
  - Opción "Sin subtítulos"
  
- [ ] **4.3**: Renderizar subtítulos
  - Usar elemento <track> nativo de HTML5
  - O implementar renderizado custom con overlay
  - Sincronizar con tiempo del video
  
- [ ] **4.4**: Persistencia y atajos
  - Recordar preferencia de subtítulos en localStorage
  - Atajo C para toggle subtítulos
  - Permitir cambio durante reproducción

- [ ] **4.5**: Control de pistas de audio
  - Detectar pistas de audio múltiples en el video
  - Crear selector de idioma de audio
  - Mostrar nombre/idioma de cada pista disponible
  - Permitir cambio durante reproducción
  - Guardar preferencia de audio en localStorage

---

## Fase 5: Confirmación Modo Aleatorio

### Tareas:
- [ ] **5.1**: Verificar funcionalidad actual
  - Confirmar que solo funciona modo aleatorio(aleatorio real, no con un seed predecible)
  - Documentar comportamiento esperado
  - Verificar que no haya modo secuencial accidental
  
- [ ] **5.2**: Agregar indicador visual (no opcional)
  - Pequeño icono/texto indicando "Modo Aleatorio"
  - Tooltip explicativo al hacer hover
  - Posicionar sin interferir con otros controles
- [ ] **5.3**: limpiar archivos innecesarios y comentarios
  - Pequeño icono/texto indicando "Modo Aleatorio"
  - Tooltip explicativo al hacer hover
  - Posicionar sin interferir con otros controles

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
- ⏳ Fase 4: Pendiente
- ⏳ Fase 5: Pendiente
