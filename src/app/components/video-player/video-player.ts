import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { PlaylistService } from '../../services/playlist.service';
import { VideoFile } from '../../services/file-system.service';
import { StorageService } from '../../services/storage.service';
import { CommonModule } from '@angular/common';
import { OverlayComponent } from '../overlay/overlay';

@Component({
  selector: 'app-video-player',
  imports: [CommonModule, OverlayComponent],
  templateUrl: './video-player.html',
  styleUrl: './video-player.css'
})
export class VideoPlayerComponent implements OnInit, OnDestroy {
  @ViewChild('videoElement', { static: false }) videoElement!: ElementRef<HTMLVideoElement>;

  currentVideo: VideoFile | null = null;
  currentVideoUrl: string = '';
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
    this.playlistService.currentVideo$.subscribe(video => {
      this.currentVideo = video;
    });

    this.loadNextVideo();
  }

  ngOnDestroy(): void {
  }

  loadNextVideo(): void {
    const nextVideo = this.playlistService.getNextVideo();
    if (nextVideo) {
      if (this.currentVideoUrl) {
        URL.revokeObjectURL(this.currentVideoUrl);
      }

      this.currentVideo = nextVideo;
      this.currentVideoUrl = URL.createObjectURL(nextVideo.file);
      this.error = null;
      this.isLoading = true;

      this.preloadNextVideo();
    } else {
      if (this.errorCount >= this.maxConsecutiveErrors) {
        this.error = 'Demasiados errores consecutivos. Verifica que los videos sean válidos.';
      } else {
        this.error = 'No hay videos disponibles';
      }
    }
  }

  loadPreviousVideo(): void {
    const previousVideo = this.playlistService.getPreviousVideo();
    if (previousVideo) {
      this.currentVideo = previousVideo;
      this.error = null;
    }
  }

  onVideoEnded(): void {
    console.log('Video terminado, cargando siguiente...');
    this.loadNextVideo();
  }

  onVideoError(event: Event): void {
    console.error('Error cargando video:', this.currentVideo?.name);
    this.errorCount++;

    if (this.errorCount >= this.maxConsecutiveErrors) {
      this.error = `Demasiados errores consecutivos (${this.errorCount}). Verifica que los archivos de video sean válidos.`;
      return;
    }

    this.error = `Error cargando "${this.currentVideo?.name}". Saltando al siguiente...`;

    setTimeout(() => {
      this.loadNextVideo();
    }, 1500);
  }

  onVideoLoaded(): void {
    this.isLoading = false;
    this.errorCount = 0;
    console.log('Video cargado y listo:', this.currentVideo?.name);

    const video = this.videoElement?.nativeElement;
    if (video) {
      video.play().catch(error => {
        console.error('Error al reproducir video:', error);
      });
    }
  }

  private preloadNextVideo(): void {
    const playlist = this.playlistService.getPlaylist();
    const currentIndex = this.playlistService.getCurrentIndex();

    if (playlist.length > 1 && currentIndex < playlist.length - 1) {
      this.nextVideo = playlist[currentIndex + 1];
      console.log('Siguiente video precargado:', this.nextVideo.name);
    }
  }

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

  onMouseMove(): void {
    this.showControls = true;

    if (this.hideControlsTimeout) {
      clearTimeout(this.hideControlsTimeout);
    }

    this.hideControlsTimeout = setTimeout(() => {
      this.showControls = false;
    }, 3000);
  }

  onMouseEnter(): void {
    this.showControls = true;
  }

  onMouseLeave(): void {
    this.showControls = false;
    if (this.hideControlsTimeout) {
      clearTimeout(this.hideControlsTimeout);
    }
  }

  onChangeFolder(): void {
    if (this.currentVideoUrl) {
      URL.revokeObjectURL(this.currentVideoUrl);
    }
    window.location.reload();
  }
}

