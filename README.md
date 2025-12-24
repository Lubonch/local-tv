# Local TV

Tu canal personal de videos con overlay de hora y clima, como los canales de TV.

---

## ¿Qué es esto?

Una app web que reproduce tus videos de forma aleatoria y continua, mostrando la hora y temperatura en pantalla. Perfecto para tener de fondo mientras trabajas o descansas.

## Características

- Reproducción aleatoria - Nunca sabes qué sigue
- Reloj en tiempo real - Siempre sabes la hora
- Temperatura actual - Basada en tu ubicación
- Recuerda tu carpeta - No tienes que seleccionarla cada vez
- Atajos de teclado - Control total sin mouse
- Barra de progreso - Navega por el video actual
- Control de volumen - Ajusta el sonido a tu gusto
- Subtítulos - Soporte para pistas embebidas
- Diseño minimalista - Interfaz limpia y oscura

---

## Inicio Rápido

### 1. Instalar
```bash
git clone https://github.com/Lubonch/local-tv.git
cd local-tv
npm install
```

### 2. Ejecutar
```bash
npm start
```

### 3. Usar
1. Abre http://localhost:4200 en Chrome o Edge
2. Permite la geolocalización
3. Selecciona tu carpeta de videos
4. ¡Disfruta!

---

## Controles

| Tecla | Acción |
|-------|--------|
| `Espacio` | Pausar/Reproducir |
| `→` | +5 segundos |
| `←` | -5 segundos |
| `Shift + →` | Siguiente video |
| `Shift + ←` | Video anterior |
| `J` | -10 segundos |
| `L` | +10 segundos |
| `0-9` | Saltar al 0%-90% |
| `↑` | Subir volumen |
| `↓` | Bajar volumen |
| `M` | Silenciar/Activar audio |
| `C` | Activar/Desactivar subtítulos |
| `F` | Pantalla completa |
| `Esc` | Salir de pantalla completa |

---

## Formatos Soportados

MP4, MKV, WebM, AVI, MOV, M4V... básicamente cualquier formato que tu navegador pueda reproducir.

**Recomendado**: MP4 con H.264 para mejor compatibilidad.

### Subtítulos

Los subtítulos se detectan automáticamente desde:

- Pistas de subtítulos embebidas en el video (MP4, WebM)
- Archivos .srt con el mismo nombre que el video en la misma carpeta

**Nota sobre archivos MKV**: Los navegadores web no pueden acceder a subtítulos embebidos en archivos MKV. Para usarlos:

- Extrae los subtítulos a .srt: `ffmpeg -i video.mkv -map 0:s:0 subtitles.srt`
- O convierte a MP4: `ffmpeg -i video.mkv -c copy video.mp4`

---

## Simulación de Comerciales

Puedes agregar comerciales que se reproduzcan automáticamente entre tus videos normales, simulando la experiencia de TV tradicional.

### Cómo Activar

1. En la pantalla de selección de carpeta, activa "Intercalado de comerciales"
2. Configura cada cuántos videos quieres que aparezcan comerciales (default: 3)
3. Selecciona una carpeta que contenga solo tus videos de comerciales/anuncios
4. ¡Listo! Los comerciales se reproducirán automáticamente

### Características

- Se reproducen de 1 a 5 comerciales aleatorios en cada bloque
- Los comerciales no afectan el contador de videos reproducidos
- La configuración se guarda automáticamente para la próxima sesión
- Sin indicadores visuales - los comerciales se ven como videos normales
- Puedes desactivar los comerciales en cualquier momento sin recargar

### Ejemplo

Si configuras frecuencia "3":
```
Video normal 1 → Video normal 2 → Video normal 3 
→ [2 comerciales aleatorios] 
→ Video normal 4 → Video normal 5 → Video normal 6 
→ [4 comerciales aleatorios]
→ ...
```

---

## Deploy en GitHub Pages

Ya está configurado. Solo haz push a `main`:

```bash
git push origin main
```

GitHub Actions se encarga del resto. Tu app estará en: `https://tu-usuario.github.io/local-tv`

---

## Navegadores Compatibles

Chrome (recomendado)  
Edge  
Brave  
Firefox (soporte limitado)

---

## Preguntas Frecuentes

**¿Necesito API keys?**  
No. Todo funciona sin configuración.

**¿Funciona sin internet?**  
Sí, excepto por la temperatura (usa Open-Meteo API gratuita).

**¿Guarda mi carpeta?**  
Sí, usando IndexedDB. No en modo incógnito.

**¿Por qué no aparece la temperatura?**  
Verifica que permitiste la geolocalización.

**¿Cuántos videos puede manejar?**  
Miles. Escanea recursivamente todas las subcarpetas.

---

## Tecnología

Angular 20 + File System Access API + Geolocation API + Open-Meteo API

---

## Licencia

MIT - Haz lo que quieras con esto.

---

## Autor

[Lubonch](https://github.com/Lubonch)
