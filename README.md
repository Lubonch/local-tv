# Local TV 📺

Tu canal personal de videos con overlay de hora y clima, como los canales de TV.

---

## ¿Qué es esto?

Una app web que reproduce tus videos de forma aleatoria y continua, mostrando la hora y temperatura en pantalla. Perfecto para tener de fondo mientras trabajas o descansas.

## Características

- 🎲 **Reproducción aleatoria** - Nunca sabes qué sigue
- 🕐 **Reloj en tiempo real** - Siempre sabes la hora
- 🌡️ **Temperatura actual** - Basada en tu ubicación
- 💾 **Recuerda tu carpeta** - No tienes que seleccionarla cada vez
- ⌨️ **Atajos de teclado** - Control total sin mouse
- 🎬 **Barra de progreso** - Navega por el video actual
- 🔊 **Control de volumen** - Ajusta el sonido a tu gusto
- 📝 **Subtítulos** - Soporte para pistas embebidas
- 🎨 **Minimalista** - Interfaz limpia y oscura

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

## Deploy en GitHub Pages

Ya está configurado. Solo haz push a `main`:

```bash
git push origin main
```

GitHub Actions se encarga del resto. Tu app estará en: `https://tu-usuario.github.io/local-tv`

---

## Navegadores Compatibles

✅ Chrome (recomendado)  
✅ Edge  
✅ Brave  
⚠️ Firefox (limitado)

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
