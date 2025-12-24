import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FileSystemService } from '../../services/file-system.service';
import { StorageService } from '../../services/storage.service';
import { PlaylistService } from '../../services/playlist.service';
import { YouTubeService } from '../../services/youtube.service';

@Component({
  selector: 'app-folder-selector',
  imports: [CommonModule, FormsModule],
  templateUrl: './folder-selector.html',
  styleUrl: './folder-selector.css'
})
export class FolderSelectorComponent implements OnInit {
  @Output() folderSelected = new EventEmitter<void>();

  isLoading: boolean = false;
  loadingProgress: number = 0;
  loadingMessage: string = 'Cargando...';
  isSupported: boolean = true;
  error: string | null = null;
  videoCount: number = 0;
  youtubePlaylistUrl: string = '';

  constructor(
    private fileSystemService: FileSystemService,
    private storageService: StorageService,
    private playlistService: PlaylistService,
    private youtubeService: YouTubeService
  ) { }

  async ngOnInit(): Promise<void> {
    this.isSupported = this.fileSystemService.isSupported();

    if (!this.isSupported) {
      this.error = 'Tu navegador no soporta la selección de carpetas. Usa Chrome, Edge o un navegador basado en Chromium.';
      return;
    }

    this.isLoading = false;
    this.loadingProgress = 0;
  }

  private async tryLoadSavedFolder(): Promise<void> {
    try {
      this.isLoading = true;
      this.loadingProgress = 10;
      this.loadingMessage = 'Buscando carpeta guardada...';

      const timeoutPromise = new Promise<null>((resolve) => {
        setTimeout(() => {
          resolve(null);
        }, 1000);
      });

      const savedHandle = await Promise.race([
        this.storageService.getDirectoryHandle(),
        timeoutPromise
      ]);

      if (savedHandle) {
        this.loadingProgress = 30;
        this.loadingMessage = 'Escaneando videos...';
        this.fileSystemService.setDirectoryHandle(savedHandle);
        await this.loadVideosFromFolder();
      } else {
        this.isLoading = false;
        this.loadingProgress = 0;
        this.loadingMessage = 'Cargando...';
      }
    } catch (error) {
      console.error('Error cargando carpeta guardada:', error);
      await this.storageService.clearDirectoryHandle();
      this.isLoading = false;
      this.loadingProgress = 0;
      this.loadingMessage = 'Cargando...';
      this.error = null;
    }
  }

  async onSelectFolder(): Promise<void> {
    try {
      this.isLoading = true;
      this.loadingProgress = 0;
      this.loadingMessage = 'Seleccionando carpeta...';
      this.error = null;

      const handle = await this.fileSystemService.selectFolder();

      if (handle) {
        this.loadingProgress = 20;
        this.loadingMessage = 'Guardando permisos...';
        await this.storageService.saveDirectoryHandle(handle);

        this.loadingProgress = 30;
        this.loadingMessage = 'Escaneando videos...';
        await this.loadVideosFromFolder();
      } else {
        this.error = 'No se seleccionó ninguna carpeta';
        this.isLoading = false;
        this.loadingProgress = 0;
      }
    } catch (error: any) {
      console.error('Error seleccionando carpeta:', error);
      this.error = error.message || 'Error al seleccionar la carpeta';
      this.isLoading = false;
      this.loadingProgress = 0;
    }
  }

  private async loadVideosFromFolder(): Promise<void> {
    try {
      const videos = await this.fileSystemService.scanForVideos(
        undefined,
        (current, total) => {
          this.loadingProgress = 30 + Math.floor((current / Math.max(current, 1)) * 60);
          this.loadingMessage = `Encontrados ${current} videos...`;
        }
      );

      this.videoCount = videos.length;
      this.loadingProgress = 95;

      if (videos.length === 0) {
        this.error = 'No se encontraron videos en la carpeta seleccionada';
        this.isLoading = false;
        this.loadingProgress = 0;
        return;
      }

      console.log(`Se encontraron ${videos.length} videos`);
      this.loadingMessage = 'Cargando playlist...';

      this.playlistService.loadPlaylist(videos);
      this.loadingProgress = 100;

      setTimeout(() => {
        this.folderSelected.emit();
      }, 500);
    } catch (error: any) {
      console.error('Error cargando videos:', error);
      this.error = error.message || 'Error al cargar videos';
      this.isLoading = false;
      this.loadingProgress = 0;
    }
  }

  async onChangeFolder(): Promise<void> {
    await this.storageService.clearDirectoryHandle();
    this.playlistService.clear();
    this.videoCount = 0;
    await this.onSelectFolder();
  }

  async onLoadYouTubePlaylist(): Promise<void> {
    try {
      this.isLoading = true;
      this.loadingProgress = 0;
      this.loadingMessage = 'Validando URL...';
      this.error = null;

      if (!this.youtubeService.isYouTubeUrl(this.youtubePlaylistUrl)) {
        throw new Error('URL no válida. Debe ser una URL de YouTube.');
      }

      const playlistId = this.youtubeService.extractPlaylistId(this.youtubePlaylistUrl);
      if (!playlistId) {
        throw new Error('No se pudo extraer el ID de la playlist. Asegúrate de usar una URL de playlist válida.');
      }

      this.loadingProgress = 20;
      this.loadingMessage = 'Obteniendo videos de la playlist...';

      const videos = await this.youtubeService.getPlaylistVideos(playlistId);

      if (videos.length === 0) {
        throw new Error('La playlist está vacía o no se pudo acceder a ella.');
      }

      this.videoCount = videos.length;
      this.loadingProgress = 80;
      this.loadingMessage = 'Cargando playlist...';

      // Convertir videos de YouTube a formato compatible con PlaylistService
      const youtubeVideos = videos.map(video => ({
        file: null as any, // No hay archivo físico
        name: video.title,
        path: video.videoId,
        url: this.youtubeService.getEmbedUrl(video.videoId),
        isYouTube: true
      }));

      this.playlistService.loadPlaylist(youtubeVideos);
      this.loadingProgress = 100;

      setTimeout(() => {
        this.folderSelected.emit();
      }, 500);

    } catch (error: any) {
      console.error('Error cargando playlist de YouTube:', error);
      this.error = error.message || 'Error al cargar la playlist de YouTube';
      this.isLoading = false;
      this.loadingProgress = 0;
    }
  }

  async cancelLoading(): Promise<void> {
    this.isLoading = false;
    this.loadingProgress = 0;
    this.loadingMessage = 'Cargando...';
    await this.storageService.clearDirectoryHandle();
    this.error = null;
  }
}
