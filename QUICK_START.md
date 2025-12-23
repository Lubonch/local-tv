# 🚀 Inicio Rápido - Local TV

## Instalación en 3 pasos

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar API Key del Clima
Edita `src/environments/environment.development.ts`:
```typescript
openWeatherMapApiKey: 'TU_API_KEY_AQUI'
```

**¿Dónde obtengo la API Key?**
1. Ve a <https://openweathermap.org/api>
2. Crea una cuenta gratuita
3. Copia tu API key
4. Pégala en el archivo

### 3. Iniciar la aplicación
```bash
npm start
```

Abre <http://localhost:4200> en Chrome o Edge

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

```bash
npm run build:prod
```

Servir archivos:
```bash
npm run serve:prod
```

---

## 🐛 Problemas Comunes

### No carga videos
✅ Verifica que los archivos sean `.mp4`, `.mkv` o `.webm`

### No muestra temperatura
✅ Configuraste la API key?  
✅ Permitiste geolocalización?

### Error al seleccionar carpeta
✅ Usa Chrome, Edge o Brave (no Firefox)

---

📖 **Más ayuda**: Ver [README.md](./README.md) completo
