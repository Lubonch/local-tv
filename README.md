# 📺 Local TV

Tu canal personal de videos con overlay de hora y temperatura, similar a los canales de televisión.

## 🎯 Descripción

**Local TV** es una aplicación web desarrollada en Angular que te permite seleccionar una carpeta (con subcarpetas) que contenga videos y los reproduce de forma aleatoria y continua, mostrando un overlay profesional con la hora actual y la temperatura de tu ubicación.

### Características Principales

- ✨ Reproducción aleatoria continua de videos
- 📁 Selección de carpetas con subcarpetas recursivamente
- ⏰ Reloj en tiempo real (esquina inferior izquierda)
- 🌡️ Temperatura y sensación térmica en Celsius (esquina inferior derecha)
- 💾 Recuerda tu carpeta seleccionada (IndexedDB + localStorage)
- 🎮 Controles por teclado
- 🖥️ Diseño pantalla completa minimalista
- 🎨 Overlay tipo TV profesional

## 🚀 Tecnologías

- **Angular 20** - Framework principal
- **File System Access API** - Selección de carpetas
- **Geolocation API** - Ubicación del usuario
- **OpenWeatherMap API** - Datos meteorológicos
- **IndexedDB** - Almacenamiento persistente

## 📋 Requisitos

- **Node.js** (v18 o superior)
- **npm** (v9 o superior)
- **Navegador compatible**:
  - ✅ Chrome/Chromium (recomendado)
  - ✅ Edge
  - ✅ Brave
  - ⚠️ Firefox (funcionalidad limitada con File System API)
- **Clave API de OpenWeatherMap** (gratuita)

## 🔧 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/Lubonch/local-tv.git
cd local-tv
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar API Key de OpenWeatherMap

1. Obtén una API key gratuita en: https://openweathermap.org/api
2. Abre `src/environments/environment.development.ts`
3. Reemplaza `YOUR_API_KEY_HERE` con tu API key:

```typescript
export const environment = {
  production: false,
  openWeatherMapApiKey: 'TU_API_KEY_AQUI',
  weatherUpdateInterval: 1800000,
  weatherApiUrl: 'https://api.openweathermap.org/data/2.5/weather'
};
```

4. Haz lo mismo en `src/environments/environment.ts` para producción

### 4. Ejecutar en desarrollo

```bash
npm start
```

La aplicación estará disponible en: `http://localhost:4200`

## 🎮 Uso

### Primera vez

1. **Abrir la aplicación** en tu navegador
2. **Permitir geolocalización** (para mostrar temperatura)
3. **Clic en "Seleccionar Carpeta"**
4. **Seleccionar** una carpeta que contenga videos
5. **¡Disfruta!** La reproducción comenzará automáticamente

### Controles de teclado

- `Espacio` - Pausar/Reproducir
- `Flecha Derecha →` - Siguiente video aleatorio
- `Flecha Izquierda ←` - Video anterior
- `F` - Pantalla completa
- `Esc` - Salir de pantalla completa

### Formatos de video soportados

La app soporta todos los formatos que tu navegador pueda reproducir:

- ✅ **MP4** (H.264, H.265)
- ✅ **WebM** (VP8, VP9)
- ✅ **MKV** (si el códec es soportado)
- ⚠️ **AVI** (limitado)
- ⚠️ **MOV** (limitado)

## 📁 Estructura del Proyecto

```
local-tv/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── folder-selector/    # Selección de carpeta
│   │   │   ├── video-player/       # Reproductor de video
│   │   │   └── overlay/            # Overlay de hora y temperatura
│   │   ├── services/
│   │   │   ├── file-system.service.ts    # Manejo de archivos
│   │   │   ├── storage.service.ts        # Persistencia
│   │   │   ├── playlist.service.ts       # Lógica aleatoria
│   │   │   ├── weather.service.ts        # API del clima
│   │   │   └── clock.service.ts          # Reloj
│   │   └── environments/
│   │       ├── environment.ts            # Producción
│   │       └── environment.development.ts # Desarrollo
│   └── ...
├── ROADMAP.md                # Plan de desarrollo
└── README.md                 # Este archivo
```

## 🏗️ Build para Producción

```bash
npm run build
```

Los archivos optimizados estarán en `dist/local-tv/browser/`

Para servir la aplicación:

```bash
npx http-server dist/local-tv/browser -p 8080
```

## 🐛 Solución de Problemas

### La aplicación no carga videos

- **Verifica** que la carpeta seleccionada contenga videos
- **Comprueba** los formatos de video (preferiblemente MP4)
- **Mira** la consola del navegador para errores

### No se muestra la temperatura

- **Verifica** que hayas configurado la API key
- **Comprueba** que permitiste la geolocalización
- **Asegúrate** de tener conexión a internet
- **Revisa** la consola para errores de API

### El navegador no permite seleccionar carpetas

- **Usa Chrome, Edge o Brave** (recomendado)
- **Actualiza** tu navegador a la última versión
- Firefox tiene soporte limitado para File System Access API

### Los videos no se reproducen

- **Verifica** el formato del video
- **Asegúrate** de que el navegador soporta el códec
- **Intenta** con archivos MP4 (H.264)

## 📝 Roadmap

Ver [ROADMAP.md](./ROADMAP.md) para el plan completo de desarrollo y progreso.

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'feat: nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 👤 Autor

**Lubonch**

---

⭐ Si te gusta este proyecto, ¡dale una estrella en GitHub!

**¡Disfruta de tu canal personal de videos!** 📺✨
