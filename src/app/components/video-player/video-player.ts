import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { PlaylistService } from '../../services/playlist.service';
import { VideoFile } from '../../services/file-system.service';
import { StorageService } from '../../services/storage.service';
import { MkvHandlerService, MKVTrack } from '../../services/mkv-handler.service';
import { CommonModule } from '@angular/common';
import { OverlayComponent } from '../overlay/overlay';
import { VideoProgressBarComponent } from '../video-progress-bar/video-progress-bar';
import { VideoInfoOverlayComponent } from '../video-info-overlay/video-info-overlay';
import { VolumeControlComponent } from '../volume-control/volume-control';
import { SubtitleControlComponent, SubtitleTrack } from '../subtitle-control/subtitle-control';
import { AudioTrackControlComponent, AudioTrack } from '../audio-track-control/audio-track-control';

interface ExtendedHTMLVideoElement extends HTMLVideoElement {
  audioTracks?: AudioTrackList;
}

interface AudioTrackList {
  length: number;
  [index: number]: {
    enabled: boolean;
    label: string;
    language: string;
    kind: string;
  };
}

@Component({
  selector: 'app-video-player',
  imports: [CommonModule, OverlayComponent, VideoProgressBarComponent, VideoInfoOverlayComponent, VolumeControlComponent, SubtitleControlComponent, AudioTrackControlComponent],
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

  subtitles: SubtitleTrack[] = [];
  currentSubtitleIndex: number = -1;
  private readonly SUBTITLE_STORAGE_KEY = 'video-subtitle-preference';

  audioTracks: AudioTrack[] = [];
  currentAudioIndex: number = 0;
  private readonly AUDIO_STORAGE_KEY = 'video-audio-preference';

  private mkvTracks: MKVTrack[] = [];
  private isMkvFile: boolean = false;

  constructor(
    private playlistService: PlaylistService,
    private storageService: StorageService,
    private mkvHandler: MkvHandlerService
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

  private checkForExternalSubtitles(): void {
    // Removido - ya no es necesario
  }

  private detectAudioTracks(): void {
    const video = this.videoElement?.nativeElement;
    if (!video) return;

    this.audioTracks = [];
    const audioTrackList = (video as any).audioTracks;

    if (audioTrackList && audioTrackList.length > 0) {
      for (let i = 0; i < audioTrackList.length; i++) {
        const track = audioTrackList[i];
        this.audioTracks.push({
          index: i,
          label: track.label || track.language || `Audio ${i + 1}`,
          language: track.language,
          kind: track.kind
        });
      }

      this.loadAudioPreference();
    } else if (this.currentVideo?.name.toLowerCase().endsWith('.mkv')) {
      console.warn('⚠️ LIMITACIÓN: Los navegadores no pueden acceder a múltiples pistas de audio en archivos MKV.');
      console.warn('📝 SOLUCIÓN: Remux el MKV seleccionando solo la pista deseada con FFmpeg.');
      console.warn('   Ejemplo: ffmpeg -i "' + this.currentVideo.name + '" -map 0:v -map 0:a:1 -c copy output.mkv');
    }
  }

  private async detectTracks(): Promise<void> {
    // Verificar si es archivo MKV
    this.isMkvFile = this.currentVideo?.name.toLowerCase().endsWith('.mkv') || false;

    if (this.isMkvFile && this.currentVideo) {
      console.log('🎬 Archivo MKV detectado, parseando con ts-ebml...');
      await this.detectMkvTracks();
    } else {
      // Usar detección nativa del navegador para otros formatos
      this.detectSubtitles();
      this.detectAudioTracks();
    }
  }

  private async detectMkvTracks(): Promise<void> {
    if (!this.currentVideo) return;

    try {
      // Parsear el archivo MKV para obtener las pistas
      this.mkvTracks = await this.mkvHandler.parseFile(this.currentVideo.file);

      // Convertir tracks de MKV a formato de la UI
      const audioMkvTracks = this.mkvHandler.getAudioTracks();
      const subtitleMkvTracks = this.mkvHandler.getSubtitleTracks();

      // Mapear pistas de audio
      this.audioTracks = audioMkvTracks.map((track, index) => ({
        index: index,
        label: this.mkvHandler.getTrackLabel(track),
        language: track.language,
        kind: 'main'
      }));

      // Mapear pistas de subtítulos
      this.subtitles = subtitleMkvTracks.map((track, index) => ({
        index: index,
        label: this.mkvHandler.getTrackLabel(track),
        language: track.language,
        kind: 'subtitles' as const
      }));

      console.log('✅ MKV parseado:', {
        audio: this.audioTracks.length,
        subtitles: this.subtitles.length
      });

      // Nota: El navegador solo puede reproducir el audio/video por defecto
      // Las pistas de audio múltiples no se pueden cambiar en tiempo real sin MSE
      if (this.audioTracks.length > 1) {
        console.warn('⚠️ Este MKV tiene múltiples pistas de audio.');
        console.warn('   El navegador solo puede reproducir la pista marcada como default.');
        console.warn('   Para cambiar de audio, necesitas remuxear el archivo con la pista deseada.');
      }

    } catch (error) {
      console.error('❌ Error detectando tracks de MKV:', error);
      // Fallback a detección nativa
      this.detectSubtitles();
      this.detectAudioTracks();
    }
  }

  onAudioTrackChange(index: number): void {
    this.currentAudioIndex = index;
    const video = this.videoElement?.nativeElement;
    if (!video) return;

    const audioTracks = (video as any).audioTracks;
    if (!audioTracks) return;

    for (let i = 0; i < audioTracks.length; i++) {
      audioTracks[i].enabled = i === index;
    }

    localStorage.setItem(this.AUDIO_STORAGE_KEY, index.toString());
  }

  private loadAudioPreference(): void {
    const saved = localStorage.getItem(this.AUDIO_STORAGE_KEY);
    if (saved) {
      const index = parseInt(saved);
      if (index >= 0 && index < this.audioTracks.length) {
        this.onAudioTrackChange(index);
      }
    }
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

