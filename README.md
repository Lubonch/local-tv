# Local TV

Tu canal personal de videos con overlay de hora y clima, como los canales de TV.

Última actualización: Diciembre 2025

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

### Problemas Conocidos con H.265/HEVC

Los archivos MP4 codificados en H.265 pueden tener problemas de reproducción:

**Síntoma**: Se escucha audio pero no se ve imagen
**Causa**: H.265 no está soportado nativamente en la mayoría de navegadores

**Soluciones**:

1. **En Edge Linux con extensión h265ify**:
   - Verifica que h265ify esté habilitado para `localhost` y `file://`
   - Si no funciona, desactiva la extensión y convierte los videos

2. **Convertir a H.264** (recomendado):
   ```bash
   ffmpeg -i video_h265.mp4 -c:v libx264 -c:a copy video_h264.mp4
   ```

3. **Convertir a WebM VP9**:
   ```bash
   ffmpeg -i video.mp4 -c:v libvpx-vp9 -c:a libopus video.webm
   ```

**Nota**: La app detectará automáticamente videos H.265 problemáticos y mostrará un mensaje de error específico.

---

## Deploy en GitHub Pages

### Opción 1: GitHub Actions (automático)
Ya está configurado. Solo haz push a `main`:

```bash
git push origin main
```

GitHub Actions se encarga del resto.

### Opción 2: Deploy manual
Para deploy manual, ejecuta:

```bash
npm run deploy
git add docs/
git commit -m "Deploy to GitHub Pages"
git push origin main
```

### Configuración de GitHub Pages
1. Ve a Settings > Pages en tu repositorio
2. Selecciona "Deploy from a branch"
3. Branch: `main`, Folder: `/docs`
4. Save

Tu app estará en: `https://tu-usuario.github.io/local-tv`

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
