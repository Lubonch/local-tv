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

### 3. Ejecutar en desarrollo

```bash
npm start
```

La aplicación estará disponible en: `http://localhost:4200`

> **✨ Sin configuración necesaria**: El clima usa **Open-Meteo API** que es completamente gratuito, sin límites y sin necesidad de API key. Perfecto para GitHub Pages.

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

### Build Local

```bash
npm run build:prod
```

Los archivos optimizados estarán en `dist/local-tv/browser/`

Para servir la aplicación localmente:

```bash
npm run serve:prod
```

### Deploy a GitHub Pages 🚀

La aplicación está configurada para desplegar automáticamente a GitHub Pages:

1. **Haz push a la rama `main`**:
   ```bash
   git push origin main
   ```

2. **GitHub Actions se encargará del build y deploy automáticamente**

3. **Activa GitHub Pages en tu repositorio**:
   - Ve a Settings > Pages
   - Source: GitHub Actions
   - La app estará disponible en: `https://tu-usuario.github.io/local-tv`

> **✅ Perfecto para GitHub Pages**: No necesita variables de entorno ni API keys. Todo funciona out-of-the-box.

## 🐛 Solución de Problemas

### La aplicación no carga videos

- **Verifica** que la carpeta seleccionada contenga videos
- **Comprueba** los formatos de video (preferiblemente MP4)
- **Mira** la consola del navegador para errores
- **Extensiones válidas**: .mp4, .mkv, .webm, .avi, .mov, .m4v, .wmv, .flv, .ogv, .3gp
- **Nota**: La aplicación escanea subcarpetas recursivamente

### No se muestra la temperatura

- **Comprueba** que permitiste la geolocalización cuando el navegador lo solicite
- **Asegúrate** de tener conexión a internet
- **Revisa** la consola para errores de red
- **API gratuita**: Usa Open-Meteo, sin necesidad de registro ni API key
- **Nota**: La temperatura se actualiza cada 30 minutos
- **Ubicación**: Si no se puede obtener tu ciudad, se mostrará "Tu ubicación"

### El navegador no permite seleccionar carpetas

- **Usa Chrome, Edge o Brave** (recomendado)
- **Actualiza** tu navegador a la última versión
- Firefox tiene soporte limitado para File System Access API
- **HTTPS requerido** en producción (localhost funciona con HTTP)

### Los videos no se reproducen

- **Verifica** el formato del video
- **Asegúrate** de que el navegador soporta el códec
- **Intenta** con archivos MP4 (H.264)
- **Videos corruptos**: La app los saltará automáticamente después de 3 errores consecutivos
- **Códecs**: H.264/H.265 para MP4, VP8/VP9 para WebM funcionan mejor

### Error "Demasiados errores consecutivos"

- **Causa**: 3 o más videos consecutivos fallaron al cargar
- **Solución**: Verifica que tus archivos de video no estén corruptos
- **Recomendación**: Convierte videos problemáticos a MP4 con H.264

### La carpeta seleccionada no se recuerda

- **IndexedDB**: Verifica que tu navegador permita IndexedDB
- **Modo incógnito**: No se guardan las preferencias en modo privado
- **Permisos**: La app necesita re-verificar permisos al recargar

### Geolocalización bloqueada

- **Chrome**: Configuración > Privacidad > Configuración de sitios > Ubicación
- **Edge**: Configuración > Cookies y permisos del sitio > Ubicación
- **Alternativa**: La app funciona sin temperatura, solo muestra hora

### Performance lento con muchos videos

- **Optimización**: La app escanea recursivamente al inicio
- **Recomendación**: Para carpetas con +1000 videos, el escaneo puede tardar
- **Memoria**: Los videos se liberan de memoria después de reproducirse
- **Precarga**: El siguiente video se precarga automáticamente

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
