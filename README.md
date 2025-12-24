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

---

## Reproducir Playlists de YouTube

Además de carpetas locales, puedes reproducir playlists públicas de YouTube:

1. Copia la URL de cualquier playlist pública de YouTube
2. Pégala en el campo de entrada al iniciar la app
3. Click en "Cargar Playlist"

**Características:**
- Usa Invidious API (sin necesidad de API key)
- Detecta automáticamente el fin de cada video
- Muestra la duración real de los videos
- Guarda la última playlist cargada para continuar donde quedaste

**Nota:** Si una instancia de Invidious falla, la app intentará automáticamente con otras instancias públicas. Si todas fallan, puedes intentar de nuevo más tarde o usar una carpeta local.

**Ejemplo de playlist para testing:**
```
https://www.youtube.com/playlist?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf
```

---

## Formatos Soportados (Archivos Locales)

### Subtítulos

Los subtítulos se detectan automáticamente desde:

- Pistas de subtítulos embebidas en el video (MP4, WebM)
- Archivos .srt con el mismo nombre que el video en la misma carpeta

**Nota sobre archivos MKV**: Los navegadores web no pueden acceder a subtítulos embebidos en archivos MKV. Para usarlos:

- Extrae los subtítulos a .srt: `ffmpeg -i video.mkv -map 0:s:0 subtitles.srt`
- O convierte a MP4: `ffmpeg -i video.mkv -c copy video.mp4`

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
