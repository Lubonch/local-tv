import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FileSystemService, AdsConfig } from '../../services/file-system.service';
import { StorageService } from '../../services/storage.service';
import { PlaylistService } from '../../services/playlist.service';

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

  // === ADS PROPERTIES ===
  adsEnabled: boolean = false;
  adsFolder: FileSystemDirectoryHandle | null = null;
  adsVideoCount: number = 0;
  adsFrequency: number = 3;

  constructor(
    private fileSystemService: FileSystemService,
    private storageService: StorageService,
    private playlistService: PlaylistService
  ) { }

  async ngOnInit(): Promise<void> {
    this.isSupported = this.fileSystemService.isSupported();

    if (!this.isSupported) {
      this.error = 'Tu navegador no soporta la selección de carpetas. Usa Chrome, Edge o un navegador basado en Chromium.';
      return;
    }

    // Cargar configuración de ads guardada
    const savedConfig = this.storageService.getAdsConfig();
    if (savedConfig) {
      this.adsEnabled = savedConfig.enabled;
      this.adsFrequency = savedConfig.frequency;
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

      // Cargar ads si están habilitados
      if (this.adsEnabled && this.adsVideoCount > 0) {
        await this.loadAdsPlaylist();
      }

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

  // === ADS METHODS ===

  async onSelectAdsFolder(): Promise<void> {
    try {
      this.error = null;

      const handle = await this.fileSystemService.selectFolder();

      if (handle) {
        this.adsFolder = handle;
        await this.storageService.saveAdsFolder(handle);

        // Escanear videos de ads
        const adsVideos = await this.fileSystemService.scanForVideos(handle);

        if (adsVideos.length === 0) {
          this.error = 'La carpeta de comerciales no contiene videos';
          this.adsFolder = null;
          this.adsVideoCount = 0;
          return;
        }

        this.adsVideoCount = adsVideos.length;
        console.log(`Carpeta de ads cargada con ${adsVideos.length} comerciales`);
      }
    } catch (error: any) {
      console.error('Error seleccionando carpeta de ads:', error);
      this.error = error.message || 'Error al seleccionar carpeta de comerciales';
      this.adsFolder = null;
      this.adsVideoCount = 0;
    }
  }

  async loadAdsPlaylist(): Promise<void> {
    if (!this.adsFolder || this.adsVideoCount === 0) {
      return;
    }

    try {
      const adsVideos = await this.fileSystemService.scanForVideos(this.adsFolder);

      const adsConfig: AdsConfig = {
        enabled: this.adsEnabled,
        frequency: this.adsFrequency,
        minAdsPerBreak: 1,
        maxAdsPerBreak: 5
      };

      this.playlistService.loadAdsPlaylist(adsVideos, adsConfig);
      this.storageService.saveAdsConfig(adsConfig);

      console.log(`Ads playlist configurada: ${adsVideos.length} comerciales, frecuencia cada ${this.adsFrequency} videos`);
    } catch (error) {
      console.error('Error cargando ads playlist:', error);
    }
  }

  onAdsEnabledChange(): void {
    if (!this.adsEnabled) {
      // Si se deshabilita, limpiar ads del playlist service
      this.playlistService.clearAds();
      this.storageService.clearAdsConfig();
    } else if (this.adsFolder && this.adsVideoCount > 0) {
      // Si se habilita y ya hay carpeta, cargar ads
      this.loadAdsPlaylist();
    }
  }

  onAdsFrequencyChange(): void {
    if (this.adsEnabled && this.adsFolder && this.adsVideoCount > 0) {
      // Actualizar configuración
      this.loadAdsPlaylist();
    }
  }

  clearAdsFolder(): void {
    this.adsFolder = null;
    this.adsVideoCount = 0;
    this.adsEnabled = false;
    this.playlistService.clearAds();
    this.storageService.clearAdsFolder();
    this.storageService.clearAdsConfig();
  }

  async onChangeFolder(): Promise<void> {
    await this.storageService.clearDirectoryHandle();
    this.playlistService.clear();
    this.videoCount = 0;
    this.clearAdsFolder();
    await this.onSelectFolder();
  }

  async cancelLoading(): Promise<void> {
    this.isLoading = false;
    this.loadingProgress = 0;
    this.loadingMessage = 'Cargando...';
    await this.storageService.clearDirectoryHandle();
    this.error = null;
  }
}
