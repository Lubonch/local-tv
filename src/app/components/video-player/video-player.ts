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
  isLoading: boolean = false;
  error: string | null = null;

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
      this.currentVideo = nextVideo;
      this.error = null;
    } else {
      this.error = 'No hay videos disponibles';
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
    console.error('Error cargando video:', event);
    this.error = 'Error al cargar el video. Saltando al siguiente...';
    
    // Intentar cargar el siguiente video después de un breve delay
    setTimeout(() => {
      this.loadNextVideo();
    }, 2000);
  }

  /**
   * Maneja cuando el video está listo para reproducirse
   */
  onVideoLoaded(): void {
    this.isLoading = false;
    console.log('Video cargado y listo');
    
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
}
