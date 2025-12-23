import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileSystemService } from '../../services/file-system.service';
import { StorageService } from '../../services/storage.service';
import { PlaylistService } from '../../services/playlist.service';

@Component({
  selector: 'app-folder-selector',
  imports: [CommonModule],
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

  constructor(
    private fileSystemService: FileSystemService,
    private storageService: StorageService,
    private playlistService: PlaylistService
  ) { }

  async ngOnInit(): Promise<void> {
    // Verificar si el navegador soporta File System Access API
    this.isSupported = this.fileSystemService.isSupported();

    if (!this.isSupported) {
      this.error = 'Tu navegador no soporta la selección de carpetas. Usa Chrome, Edge o un navegador basado en Chromium.';
      return;
    }

    // FORZAR SELECCIÓN MANUAL - No intentar cargar carpeta guardada
    // Esto evita problemas de permisos y timeout
    this.isLoading = false;
    this.loadingProgress = 0;
  }

  /**
   * Intenta cargar la carpeta guardada anteriormente
   */
  private async tryLoadSavedFolder(): Promise<void> {
    try {
      this.isLoading = true;
      this.loadingProgress = 10;
      this.loadingMessage = 'Buscando carpeta guardada...';

      // Timeout muy corto: si toma más de 1 segundo, mostrar selector
      const timeoutPromise = new Promise<null>((resolve) => {
        setTimeout(() => {
          resolve(null);
        }, 1000); // 1 segundo
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
        // No hay carpeta guardada o timeout - mostrar selector
        this.isLoading = false;
        this.loadingProgress = 0;
        this.loadingMessage = 'Cargando...';
      }
    } catch (error) {
      console.error('Error cargando carpeta guardada:', error);
      // Si hay error, limpiar el storage y mostrar el selector
      await this.storageService.clearDirectoryHandle();
      this.isLoading = false;
      this.loadingProgress = 0;
      this.loadingMessage = 'Cargando...';
      this.error = null;
    }
  }

  /**
   * Maneja el clic en el botón de seleccionar carpeta
   */
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
        // Guardar el handle para uso futuro
        await this.storageService.saveDirectoryHandle(handle);

        this.loadingProgress = 30;
        this.loadingMessage = 'Escaneando videos...';
        // Cargar videos
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

  /**
   * Carga los videos de la carpeta seleccionada
   */
  private async loadVideosFromFolder(): Promise<void> {
    try {
      const videos = await this.fileSystemService.scanForVideos(
        undefined,
        (current, total) => {
          // Actualizar progreso: 30% a 90% durante el escaneo
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

      // Cargar videos en la playlist
      this.playlistService.loadPlaylist(videos);
      this.loadingProgress = 100;

      // Pequeño delay para mostrar 100% completado
      setTimeout(() => {
        // Emitir evento de carpeta seleccionada
        this.folderSelected.emit();
      }, 500);
    } catch (error: any) {
      console.error('Error cargando videos:', error);
      this.error = error.message || 'Error al cargar videos';
      this.isLoading = false;
      this.loadingProgress = 0;
    }
  }

  /**
   * Cambia la carpeta actual
   */
  async onChangeFolder(): Promise<void> {
    await this.storageService.clearDirectoryHandle();
    this.playlistService.clear();
    this.videoCount = 0;
    await this.onSelectFolder();
  }

  /**
   * Cancela la carga actual y limpia el storage
   */
  async cancelLoading(): Promise<void> {
    this.isLoading = false;
    this.loadingProgress = 0;
    this.loadingMessage = 'Cargando...';
    await this.storageService.clearDirectoryHandle();
    this.error = null;
  }
}
