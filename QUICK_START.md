# 🚀 Inicio Rápido - Local TV

## Instalación en 3 pasos

### 1. Instalar dependencias
```bash
npm install
```

### 2. Iniciar la aplicación
```bash
npm start
```

Abre <http://localhost:4200> en Chrome o Edge

> **Nota**: ¡No necesitas configurar ninguna API key! El clima usa Open-Meteo que es completamente gratuito y sin registro.

---

## 🎮 Cómo Usar

1. **Permitir geolocalización** cuando el navegador lo pida
2. **Clic en "Seleccionar Carpeta"**
3. **Elegir carpeta con videos**
4. **¡Listo!** Los videos se reproducirán automáticamente

### Controles
- `Espacio` → Pausar/Reproducir
- `→` → Siguiente video
- `←` → Video anterior
- `F` → Pantalla completa

---

## ✅ Formatos Recomendados
- **MP4** (H.264) → ⭐ Mejor compatibilidad
- **WebM** → Buena opción
- **MKV** → Depende del códec

---

## 🏗️ Build para Producción

### Build Local
```bash
npm run build:prod
```

Servir archivos:
```bash
npm run serve:prod
```

### Deploy a GitHub Pages 🚀

1. Haz push a `main`:
   ```bash
   git push origin main
   ```

2. GitHub Actions despliega automáticamente

3. Tu app estará en: `https://tu-usuario.github.io/local-tv`

> **✅ Sin configuración**: No necesitas API keys ni variables de entorno. Todo funciona de inmediato.

---

## 🐛 Problemas Comunes

### No carga videos
✅ Verifica que los archivos sean `.mp4`, `.mkv` o `.webm`

### No muestra temperatura
✅ Permitiste geolocalización?  
✅ Tienes conexión a internet?

### Error al seleccionar carpeta
✅ Usa Chrome, Edge o Brave (no Firefox)

---

📖 **Más ayuda**: Ver [README.md](./README.md) completo
