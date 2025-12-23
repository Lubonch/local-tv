import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { PlaylistService } from '../../services/playlist.service';
import { VideoFile } from '../../services/file-system.service';
import { StorageService } from '../../services/storage.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-video-player',
  imports: [CommonModule],
  templateUrl: './video-player.html',
  styleUrl: './video-player.css'
})
export class VideoPlayerComponent implements OnInit, OnDestroy {
  @ViewChild('videoElement', { static: false }) videoElement!: ElementRef<HTMLVideoElement>;

  currentVideo: VideoFile | null = null;
  nextVideo: VideoFile | null = null;
  isLoading: boolean = false;
  error: string | null = null;
  errorCount: number = 0;
  private maxConsecutiveErrors: number = 3;
  showControls: boolean = false;
  private hideControlsTimeout: any;

  constructor(
    private playlistService: PlaylistService,
    private storageService: StorageService
  ) { }

  ngOnInit(): void {
    // Suscribirse a cambios en el video actual
    this.playlistService.currentVideo$.subscribe(video => {
      this.currentVideo = video;
    });

    // Cargar el primer video
    this.loadNextVideo();
  }

  ngOnDestroy(): void {
    // Limpiar
  }

  /**
   * Carga el siguiente video
   */
  loadNextVideo(): void {
    const nextVideo = this.playlistService.getNextVideo();
    if (nextVideo) {
      // Limpiar URL del video anterior para liberar memoria
      if (this.currentVideo && this.currentVideo.url) {
        URL.revokeObjectURL(this.currentVideo.url);
      }

      this.currentVideo = nextVideo;
      this.error = null;
      this.isLoading = true;

      // Precargar el siguiente video
      this.preloadNextVideo();
    } else {
      if (this.errorCount >= this.maxConsecutiveErrors) {
        this.error = 'Demasiados errores consecutivos. Verifica que los videos sean válidos.';
      } else {
        this.error = 'No hay videos disponibles';
      }
    }
  }

  /**
   * Carga el video anterior
   */
  loadPreviousVideo(): void {
    const previousVideo = this.playlistService.getPreviousVideo();
    if (previousVideo) {
      this.currentVideo = previousVideo;
      this.error = null;
    }
  }

  /**
   * Maneja el evento cuando el video termina
   */
  onVideoEnded(): void {
    console.log('Video terminado, cargando siguiente...');
    this.loadNextVideo();
  }

  /**
   * Maneja errores de carga del video
   */
  onVideoError(event: Event): void {
    console.error('Error cargando video:', this.currentVideo?.name);
    this.errorCount++;

    if (this.errorCount >= this.maxConsecutiveErrors) {
      this.error = `Demasiados errores consecutivos (${this.errorCount}). Verifica que los archivos de video sean válidos.`;
      return;
    }

    this.error = `Error cargando "${this.currentVideo?.name}". Saltando al siguiente...`;

    // Intentar cargar el siguiente video después de un breve delay
    setTimeout(() => {
      this.loadNextVideo();
    }, 1500);
  }

  /**
   * Maneja cuando el video está listo para reproducirse
   */
  onVideoLoaded(): void {
    this.isLoading = false;
    this.errorCount = 0; // Resetear contador de errores en carga exitosa
    console.log('Video cargado y listo:', this.currentVideo?.name);

    // Intentar entrar en pantalla completa
    this.enterFullscreen();

    // Reproducir automáticamente
    const video = this.videoElement?.nativeElement;
    if (video) {
      video.play().catch(error => {
        console.error('Error al reproducir video:', error);
      });
    }
  }

  /**
   * Precarga el siguiente video en la playlist
   */
  private preloadNextVideo(): void {
    // Obtener referencia al siguiente video sin avanzar la playlist
    const playlist = this.playlistService.getPlaylist();
    const currentIndex = this.playlistService.getCurrentIndex();

    if (playlist.length > 1 && currentIndex < playlist.length - 1) {
      this.nextVideo = playlist[currentIndex + 1];
      console.log('Siguiente video precargado:', this.nextVideo.name);
    }
  }

  /**
   * Alterna play/pausa
   */
  togglePlayPause(): void {
    const video = this.videoElement?.nativeElement;
    if (video) {
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    }
  }

  /**
   * Entra en modo pantalla completa
   */
  enterFullscreen(): void {
    const videoContainer = this.videoElement?.nativeElement.parentElement;
    if (videoContainer) {
      if (videoContainer.requestFullscreen) {
        videoContainer.requestFullscreen().catch(err => {
          console.log('No se pudo entrar en pantalla completa:', err);
        });
      }
    }
  }

  /**
   * Maneja eventos del teclado
   */
  onKeyPress(event: KeyboardEvent): void {
    switch(event.key) {
      case ' ':
        event.preventDefault();
        this.togglePlayPause();
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.loadNextVideo();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.loadPreviousVideo();
        break;
      case 'f':
      case 'F':
        event.preventDefault();
        this.enterFullscreen();
        break;
    }
  }

  /**
   * Muestra los controles al mover el mouse
   */
  onMouseMove(): void {
    this.showControls = true;
    
    // Limpiar timeout anterior
    if (this.hideControlsTimeout) {
      clearTimeout(this.hideControlsTimeout);
    }
    
    // Ocultar controles después de 3 segundos sin movimiento
    this.hideControlsTimeout = setTimeout(() => {
      this.showControls = false;
    }, 3000);
  }

  /**
   * Muestra los controles al entrar con el mouse
   */
  onMouseEnter(): void {
    this.showControls = true;
  }

  /**
   * Oculta los controles al salir con el mouse
   */
  onMouseLeave(): void {
    this.showControls = false;
    if (this.hideControlsTimeout) {
      clearTimeout(this.hideControlsTimeout);
    }
  }

  /**
   * Cambia a otra carpeta
   */
  onChangeFolder(): void {
    // Emitir evento para volver al selector de carpetas
    window.location.reload();
  }
}

