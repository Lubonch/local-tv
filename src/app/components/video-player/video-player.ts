import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PlaylistService } from '../../services/playlist.service';
import { VideoFile } from '../../services/file-system.service';
import { StorageService } from '../../services/storage.service';
import { CommonModule } from '@angular/common';
import { OverlayComponent } from '../overlay/overlay';
import { VideoProgressBarComponent } from '../video-progress-bar/video-progress-bar';
import { VideoInfoOverlayComponent } from '../video-info-overlay/video-info-overlay';
import { VolumeControlComponent } from '../volume-control/volume-control';
import { SubtitleControlComponent, SubtitleTrack } from '../subtitle-control/subtitle-control';

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

@Component({
  selector: 'app-video-player',
  imports: [CommonModule, OverlayComponent, VideoProgressBarComponent, VideoInfoOverlayComponent, VolumeControlComponent, SubtitleControlComponent],
  templateUrl: './video-player.html',
  styleUrl: './video-player.css'
})
export class VideoPlayerComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('videoElement', { static: false }) videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('youtubePlayer', { static: false }) youtubePlayer!: ElementRef<HTMLDivElement>;

  currentVideo: VideoFile | null = null;
  currentVideoUrl: string | SafeResourceUrl = '';
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

  subtitles: SubtitleTrack[] = [];
  currentSubtitleIndex: number = -1;
  private readonly SUBTITLE_STORAGE_KEY = 'video-subtitle-preference';

  private ytPlayer: any = null;
  private ytApiReady: boolean = false;
  private ytApiLoading: boolean = false;
  private youtubeEndTimer: any = null;

  constructor(
    private playlistService: PlaylistService,
    private storageService: StorageService,
    private sanitizer: DomSanitizer
  ) {
    this.setupYouTubeAPICallback();
  }

  private setupYouTubeAPICallback(): void {
    // Setup global callback for YouTube API
    window.onYouTubeIframeAPIReady = () => {
      console.log('YouTube IFrame API Ready');
      this.ytApiReady = true;
      this.ytApiLoading = false;
    };
  }

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
    this.clearYouTubeEndTimer();
    if (this.ytPlayer) {
      try {
        this.ytPlayer.destroy();
      } catch (e) {
        // Ignore errors on cleanup
      }
    }
  }

  private loadYouTubeAPI(): void {
    if (this.ytApiReady || this.ytApiLoading) {
      return;
    }

    // Check if API is already loaded
    if (window.YT && window.YT.Player) {
      this.ytApiReady = true;
      return;
    }

    this.ytApiLoading = true;
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
  }

  private initYouTubePlayer(videoId: string, duration?: number): void {
    // Wait for API to be ready
    if (!this.ytApiReady) {
      setTimeout(() => this.initYouTubePlayer(videoId, duration), 100);
      return;
    }

    // Destroy existing player if any
    if (this.ytPlayer) {
      try {
        this.ytPlayer.destroy();
      } catch (e) {
        console.warn('Error destroying previous YouTube player:', e);
      }
      this.ytPlayer = null;
    }

    // Wait for iframe element to be available
    setTimeout(() => {
      const iframeElement = this.youtubePlayer?.nativeElement;
      if (!iframeElement) {
        console.warn('YouTube iframe element not found, using fallback timer');
        this.startYouTubeVideoEndTimer(duration);
        return;
      }

      try {
        this.ytPlayer = new window.YT.Player(iframeElement, {
          videoId: videoId,
          events: {
            'onReady': (event: any) => {
              console.log('YouTube player ready');
              event.target.playVideo();
              
              // Update duration if we have the player
              try {
                const playerDuration = event.target.getDuration();
                if (playerDuration > 0) {
                  this.duration = playerDuration;
                  console.log(`YouTube video duration from player: ${playerDuration}s`);
                }
              } catch (e) {
                console.warn('Could not get duration from player:', e);
              }
            },
            'onStateChange': (event: any) => {
              if (event.data === window.YT.PlayerState.ENDED) {
                console.log('YouTube video ended (detected by API)');
                this.clearYouTubeEndTimer();
                this.onVideoEnded();
              } else if (event.data === window.YT.PlayerState.PLAYING) {
                console.log('YouTube video playing');
                // Start time update for progress bar
                this.startYouTubeTimeUpdate();
              }
            },
            'onError': (event: any) => {
              console.error('YouTube player error:', event.data);
              this.error = 'Error al cargar el video de YouTube. Saltando al siguiente...';
              setTimeout(() => {
                this.onVideoEnded();
              }, 2000);
            }
          }
        });
      } catch (error) {
        console.error('Error initializing YouTube player:', error);
        console.log('Using fallback timer method');
        this.startYouTubeVideoEndTimer(duration);
      }
    }, 100);
  }

  private startYouTubeTimeUpdate(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = setInterval(() => {
      if (this.ytPlayer && this.ytPlayer.getCurrentTime) {
        try {
          this.currentTime = this.ytPlayer.getCurrentTime();
          if (this.duration === 0 && this.ytPlayer.getDuration) {
            this.duration = this.ytPlayer.getDuration();
          }
        } catch (e) {
          // Player might not be ready yet
        }
      }
    }, 100);
  }

  private clearYouTubeEndTimer(): void {
    if (this.youtubeEndTimer) {
      clearTimeout(this.youtubeEndTimer);
      this.youtubeEndTimer = null;
    }
  }

  private startYouTubeVideoEndTimer(duration?: number): void {
    // Limpiar timer anterior si existe
    this.clearYouTubeEndTimer();

    // Use provided duration or default to 5 minutes as fallback
    const durationMs = duration ? duration * 1000 : 5 * 60 * 1000;

    this.youtubeEndTimer = setTimeout(() => {
      console.log('Video de YouTube terminado (timeout fallback), cargando siguiente...');
      this.onVideoEnded();
    }, durationMs);
  }

  loadNextVideo(): void {
    const nextVideo = this.playlistService.getNextVideo();
    if (nextVideo) {
      // Revocar URL anterior solo si es un blob local
      if (this.currentVideoUrl && typeof this.currentVideoUrl === 'string' && this.currentVideoUrl.startsWith('blob:')) {
        URL.revokeObjectURL(this.currentVideoUrl);
      }

      this.currentVideo = nextVideo;

      if (nextVideo.isYouTube && nextVideo.url) {
        // Video de YouTube - Load YouTube API and initialize player
        this.loadYouTubeAPI();
        
        // Set duration from video metadata if available
        if (nextVideo.duration) {
          this.duration = nextVideo.duration;
          console.log(`YouTube video duration from metadata: ${nextVideo.duration}s`);
        }
        
        this.currentVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(nextVideo.url);
        this.isLoading = false;
        this.error = null;

        // Extract videoId from path
        const videoId = nextVideo.path;
        
        // Initialize YouTube Player with API
        this.initYouTubePlayer(videoId, nextVideo.duration);
      } else if (nextVideo.file) {
        // Video local - crear blob URL
        this.currentVideoUrl = URL.createObjectURL(nextVideo.file);
        this.error = null;
        this.isLoading = true;
      }

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
      this.detectTracks();
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
      case 'c':
      case 'C':
        event.preventDefault();
        this.toggleSubtitles();
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
    if (this.currentVideoUrl && typeof this.currentVideoUrl === 'string' && this.currentVideoUrl.startsWith('blob:')) {
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

  private detectSubtitles(): void {
    const video = this.videoElement?.nativeElement;
    if (!video) return;

    this.subtitles = [];
    const textTracks = video.textTracks;

    for (let i = 0; i < textTracks.length; i++) {
      const track = textTracks[i];
      this.subtitles.push({
        index: i,
        label: track.label || track.language || `Subtítulo ${i + 1}`,
        language: track.language,
        kind: (track.kind || 'subtitles') as 'subtitles' | 'captions'
      });
    }

    // Mostrar mensaje sobre limitación de MKV solo si no hay subtítulos y el archivo es MKV
    if (this.subtitles.length === 0 && this.currentVideo?.name.toLowerCase().endsWith('.mkv')) {
      console.warn('⚠️ LIMITACIÓN: Los navegadores no pueden acceder a subtítulos embebidos en archivos MKV.');
      console.warn('📝 SOLUCIÓN: Extrae los subtítulos a archivos .srt con MKVToolNix o FFmpeg.');
      console.warn('   Ejemplo: ffmpeg -i "' + this.currentVideo.name + '" -map 0:s:0 subtitles.srt');
    }

    this.loadSubtitlePreference();
  }

  private detectTracks(): void {
    this.detectSubtitles();
  }

  onSubtitleChange(index: number): void {
    this.currentSubtitleIndex = index;
    const video = this.videoElement?.nativeElement;
    if (!video) return;

    const textTracks = video.textTracks;
    for (let i = 0; i < textTracks.length; i++) {
      textTracks[i].mode = i === index ? 'showing' : 'hidden';
    }

    localStorage.setItem(this.SUBTITLE_STORAGE_KEY, index.toString());
  }

  private toggleSubtitles(): void {
    if (this.subtitles.length === 0) return;

    if (this.currentSubtitleIndex === -1 && this.subtitles.length > 0) {
      this.onSubtitleChange(0);
    } else {
      this.onSubtitleChange(-1);
    }
  }

  private loadSubtitlePreference(): void {
    const saved = localStorage.getItem(this.SUBTITLE_STORAGE_KEY);
    if (saved) {
      const index = parseInt(saved);
      if (index >= -1 && index < this.subtitles.length) {
        this.onSubtitleChange(index);
      }
    }
  }
}

