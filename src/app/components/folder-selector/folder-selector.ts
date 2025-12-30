import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileSystemService, VideoFile } from '../../services/file-system.service';
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

  // Mantener la última lista de videos escaneados para poder finalizar después
  lastScannedVideos: VideoFile[] = [];

  // Estado de las carpetas
  folderStates: { selected: boolean; videoCount: number }[] = [
    { selected: false, videoCount: 0 },
    { selected: false, videoCount: 0 }
  ];

  constructor(
    private fileSystemService: FileSystemService,
    private storageService: StorageService,
    private playlistService: PlaylistService,
    private cdr: ChangeDetectorRef
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

  private async tryLoadSavedFolders(): Promise<void> {
    // No cargar carpetas guardadas - siempre empezar desde cero
    this.isLoading = false;
    this.loadingProgress = 0;
    this.loadingMessage = 'Cargando...';
  }

  async onSelectFolder(folderIndex?: number): Promise<void> {
    const targetFolderIndex = folderIndex !== undefined ? folderIndex : 0;

    try {
      this.isLoading = true;
      this.loadingProgress = 0;
      this.loadingMessage = `Seleccionando carpeta ${targetFolderIndex + 1}...`;
      this.error = null;

      const handle = await this.fileSystemService.selectFolder(targetFolderIndex);

      if (handle) {
        this.loadingProgress = 20;
        this.loadingMessage = `Guardando permisos de carpeta ${targetFolderIndex + 1}...`;
        await this.storageService.saveDirectoryHandle(handle, targetFolderIndex);

        this.folderStates[targetFolderIndex].selected = true;

        // Forzar actualización de la vista inmediatamente
        this.cdr.detectChanges();

        // Escanear videos después de seleccionar cualquier carpeta
        this.loadingProgress = 30;
        this.loadingMessage = 'Escaneando videos...';
        // Escanear todas las carpetas seleccionadas hasta ahora
        const selectedFolders = this.folderStates
          .map((state, index) => state.selected ? index : -1)
          .filter(index => index !== -1);
          const videos = await this.loadVideosFromFolders(selectedFolders);

        // Terminó el escaneo: ya no estamos cargando
        this.isLoading = false;

        // Si solo se seleccionó la primera carpeta, mostramos la opción para agregar la segunda
        if (this.folderStates[0].selected && !this.folderStates[1].selected) {
          // No finalizar aún; el usuario decidirá si agrega la segunda o continúa
          this.cdr.detectChanges();
          return;
        }

        // Si ambas carpetas están seleccionadas (o se seleccionó la segunda), finalizamos cargando la playlist
        if (videos.length > 0) {
          await this.finalizeSelection(videos);
        }
      } else {
        this.error = `No se seleccionó la carpeta ${targetFolderIndex + 1}`;
        this.isLoading = false;
        this.loadingProgress = 0;
      }
    } catch (error: any) {
      console.error('Error selecting folder:', error);
      this.error = error.message || 'Error al seleccionar carpeta';
      this.isLoading = false;
      this.loadingProgress = 0;
    }
  }

  private async loadVideosFromFolders(folderIndices: number[]): Promise<VideoFile[]> {
    try {
      const videos = await this.fileSystemService.scanForVideos(
        folderIndices, // Escanear solo las carpetas especificadas
        (current, total) => {
          this.loadingProgress = 30 + Math.floor((current / Math.max(current, 1)) * 60);
          this.loadingMessage = `Encontrados ${current} videos...`;
        }
      );

      if (videos.length === 0) {
        this.error = 'No se encontraron videos en las carpetas seleccionadas. ' +
                    'Nota: Los symlinks que apuntan fuera de las carpetas seleccionadas no son accesibles por seguridad.';
        this.isLoading = false;
        this.loadingProgress = 0;
        return [];
      }

      // Actualizar conteos por carpeta solo para las carpetas escaneadas
      folderIndices.forEach(index => {
        this.folderStates[index].videoCount = videos.filter(v => v.folderIndex === index).length;
      });

      // Actualizar el conteo total de videos
      this.videoCount = this.folderStates.reduce((total, state) => total + state.videoCount, 0);

      // Guardar último escaneo para poder finalizar si el usuario elige continuar
      this.lastScannedVideos = videos;

      // Forzar actualización de la vista después de actualizar videoCount
      this.cdr.detectChanges();
      this.loadingProgress = 95;

      // Return videos and let caller decide whether to finalize (load playlist) or offer second folder
      return videos;
    } catch (error: any) {
      console.error('Error cargando videos:', error);
      this.error = error.message || 'Error al cargar videos. ' +
                  'Si usas symlinks, verifica que apunten dentro de las carpetas seleccionadas.';
      this.isLoading = false;
      this.loadingProgress = 0;
      return [];
    }
  }

  async onChangeFolder(): Promise<void> {
    await this.storageService.clearAllDirectoryHandles();
    this.fileSystemService.clearAllDirectoryHandles();
    this.playlistService.clear();
    this.videoCount = 0;
    this.folderStates = [
      { selected: false, videoCount: 0 },
      { selected: false, videoCount: 0 }
    ];
    this.cdr.detectChanges();
    await this.onSelectFolder(0);
  }

  async cancelLoading(): Promise<void> {
    this.isLoading = false;
    this.loadingProgress = 0;
    this.loadingMessage = 'Cargando...';
    await this.storageService.clearAllDirectoryHandles();
    this.fileSystemService.clearAllDirectoryHandles();
    this.error = null;
    this.cdr.detectChanges();
  }

  async onSelectSecondFolder(): Promise<void> {
    await this.onSelectFolder(1);
  }

  private async finalizeSelection(videos: VideoFile[]): Promise<void> {
    try {
      this.loadingMessage = 'Cargando playlist...';
      this.loadingProgress = 60;
      this.cdr.detectChanges();

      this.playlistService.loadPlaylist(videos);
      this.loadingProgress = 100;
      this.cdr.detectChanges();

      // Asegurar que ya no estamos en estado de carga
      this.isLoading = false;

      setTimeout(() => {
        this.folderSelected.emit();
      }, 300);
    } catch (error:any) {
      console.error('Error finalizando selección:', error);
      this.error = error.message || 'Error al cargar la playlist';
      this.isLoading = false;
      this.loadingProgress = 0;
      this.cdr.detectChanges();
    }
  }

  async onSkipSecondFolder(): Promise<void> {
    // El usuario decidió continuar con la(s) carpeta(s) actuales
    if (this.lastScannedVideos && this.lastScannedVideos.length > 0) {
      await this.finalizeSelection(this.lastScannedVideos);
    } else {
      // No hay videos escaneados por alguna razón; forzamos un nuevo escaneo
      const selectedFolders = this.folderStates
        .map((state, index) => state.selected ? index : -1)
        .filter(index => index !== -1);
      const videos = await this.loadVideosFromFolders(selectedFolders);
      await this.finalizeSelection(videos);
    }
  }

  getTotalVideoCount(): number {
    return this.folderStates.reduce((total, state) => total + state.videoCount, 0);
  }
}
