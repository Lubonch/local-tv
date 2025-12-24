import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { PlaylistService } from '../../services/playlist.service';
import { VideoFile } from '../../services/file-system.service';
import { StorageService } from '../../services/storage.service';
import { CommonModule } from '@angular/common';
import { OverlayComponent } from '../overlay/overlay';
import { VideoProgressBarComponent } from '../video-progress-bar/video-progress-bar';
import { VideoInfoOverlayComponent } from '../video-info-overlay/video-info-overlay';
import { VolumeControlComponent } from '../volume-control/volume-control';

@Component({
  selector: 'app-video-player',
  imports: [CommonModule, OverlayComponent, VideoProgressBarComponent, VideoInfoOverlayComponent, VolumeControlComponent],
  templateUrl: './video-player.html',
  styleUrl: './video-player.css'
})
export class VideoPlayerComponent implements OnInit, OnDestroy, AfterViewInit {
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

  currentTime: number = 0;
  duration: number = 0;
  private updateInterval: any;

  volume: number = 100;
  isMuted: boolean = false;
  private readonly VOLUME_STORAGE_KEY = 'video-volume';
  private readonly MUTE_STORAGE_KEY = 'video-muted';

  constructor(
    private playlistService: PlaylistService,
    private storageService: StorageService
  ) { }

  ngOnInit(): void {
    this.playlistService.currentVideo$.subscribe(video => {
      this.currentVideo = video;
    });

    this.loadVolume();
    this.loadNextVideo();
  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    if (this.hideControlsTimeout) {
      clearTimeout(this.hideControlsTimeout);
    }
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

    const video = this.videoElement?.nativeElement;
    if (video) {
      this.duration = video.duration;
      this.applyVolume();
      this.startTimeUpdate();

      video.play().catch(error => {
        console.error('Error al reproducir video:', error);
      });
    }
  }

  private startTimeUpdate(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = setInterval(() => {
      const video = this.videoElement?.nativeElement;
      if (video && !isNaN(video.currentTime)) {
        this.currentTime = video.currentTime;
        this.duration = video.duration || 0;
      }
    }, 100);
  }

  onSeek(time: number): void {
    const video = this.videoElement?.nativeElement;
    if (video && isFinite(time)) {
      video.currentTime = time;
      this.currentTime = time;
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
    const video = this.videoElement?.nativeElement;
    if (!video) return;

    switch(event.key) {
      case ' ':
        event.preventDefault();
        this.togglePlayPause();
        break;
      case 'ArrowRight':
        if (event.shiftKey) {
          event.preventDefault();
          this.loadNextVideo();
        } else {
          event.preventDefault();
          this.seek(5);
        }
        break;
      case 'ArrowLeft':
        if (event.shiftKey) {
          event.preventDefault();
          this.loadPreviousVideo();
        } else {
          event.preventDefault();
          this.seek(-5);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.adjustVolume(5);
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.adjustVolume(-5);
        break;
      case 'm':
      case 'M':
        event.preventDefault();
        this.onMuteToggle();
        break;
      case 'j':
      case 'J':
        event.preventDefault();
        this.seek(-10);
        break;
      case 'l':
      case 'L':
        event.preventDefault();
        this.seek(10);
        break;
      case '0':
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        event.preventDefault();
        const percentage = parseInt(event.key) * 10;
        this.seekToPercentage(percentage);
        break;
      case 'f':
      case 'F':
        event.preventDefault();
        this.enterFullscreen();
        break;
    }
  }

  private seek(seconds: number): void {
    const video = this.videoElement?.nativeElement;
    if (video && this.duration > 0) {
      const newTime = Math.max(0, Math.min(video.currentTime + seconds, this.duration));
      video.currentTime = newTime;
    }
  }

  private seekToPercentage(percentage: number): void {
    const video = this.videoElement?.nativeElement;
    if (video && this.duration > 0) {
      const newTime = (this.duration * percentage) / 100;
      video.currentTime = newTime;
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

  onVolumeChange(newVolume: number): void {
    this.volume = newVolume;
    this.isMuted = newVolume === 0;
    this.applyVolume();
    this.saveVolume();
  }

  onMuteToggle(): void {
    this.isMuted = !this.isMuted;
    this.applyVolume();
    localStorage.setItem(this.MUTE_STORAGE_KEY, JSON.stringify(this.isMuted));
  }

  private loadVolume(): void {
    const savedVolume = localStorage.getItem(this.VOLUME_STORAGE_KEY);
    const savedMute = localStorage.getItem(this.MUTE_STORAGE_KEY);

    if (savedVolume) {
      this.volume = parseInt(savedVolume);
    }

    if (savedMute) {
      this.isMuted = JSON.parse(savedMute);
    }
  }

  private saveVolume(): void {
    localStorage.setItem(this.VOLUME_STORAGE_KEY, this.volume.toString());
  }

  private applyVolume(): void {
    const video = this.videoElement?.nativeElement;
    if (video) {
      video.volume = this.isMuted ? 0 : this.volume / 100;
    }
  }

  private adjustVolume(delta: number): void {
    const newVolume = Math.max(0, Math.min(100, this.volume + delta));
    this.onVolumeChange(newVolume);
  }
}

