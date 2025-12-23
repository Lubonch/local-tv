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

    // Intentar cargar carpeta guardada
    await this.tryLoadSavedFolder();
  }

  /**
   * Intenta cargar la carpeta guardada anteriormente
   */
  private async tryLoadSavedFolder(): Promise<void> {
    try {
      this.isLoading = true;
      const savedHandle = await this.storageService.getDirectoryHandle();

      if (savedHandle) {
        console.log('Carpeta guardada encontrada, cargando videos...');
        this.fileSystemService.setDirectoryHandle(savedHandle);
        await this.loadVideosFromFolder();
      }
    } catch (error) {
      console.log('No se pudo cargar la carpeta guardada:', error);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Maneja el clic en el botón de seleccionar carpeta
   */
  async onSelectFolder(): Promise<void> {
    try {
      this.isLoading = true;
      this.error = null;

      const handle = await this.fileSystemService.selectFolder();

      if (handle) {
        // Guardar el handle para uso futuro
        await this.storageService.saveDirectoryHandle(handle);
        
        // Cargar videos
        await this.loadVideosFromFolder();
      } else {
        this.error = 'No se seleccionó ninguna carpeta';
      }
    } catch (error: any) {
      console.error('Error seleccionando carpeta:', error);
      this.error = error.message || 'Error al seleccionar la carpeta';
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Carga los videos de la carpeta seleccionada
   */
  private async loadVideosFromFolder(): Promise<void> {
    try {
      const videos = await this.fileSystemService.scanForVideos();
      this.videoCount = videos.length;

      if (videos.length === 0) {
        this.error = 'No se encontraron videos en la carpeta seleccionada';
        return;
      }

      console.log(`Se encontraron ${videos.length} videos`);

      // Cargar videos en la playlist
      this.playlistService.loadPlaylist(videos);

      // Emitir evento de carpeta seleccionada
      this.folderSelected.emit();
    } catch (error: any) {
      console.error('Error cargando videos:', error);
      this.error = error.message || 'Error al cargar videos';
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
}
