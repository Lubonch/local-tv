import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { VideoFile, AdsConfig } from './file-system.service';

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {
  private videos: VideoFile[] = [];
  private currentIndex: number = -1;
  private playedIndices: number[] = [];

  // === ADS PROPERTIES ===
  private adsVideos: VideoFile[] = [];
  private adsConfig: AdsConfig = {
    enabled: false,
    frequency: 3,
    minAdsPerBreak: 1,
    maxAdsPerBreak: 5
  };
  private normalVideosPlayed: number = 0;
  private currentAdBlock: VideoFile[] = [];
  private lastAdIndices: number[] = []; // Para evitar repetir ads consecutivos

  private currentVideoSubject = new BehaviorSubject<VideoFile | null>(null);
  public currentVideo$: Observable<VideoFile | null> = this.currentVideoSubject.asObservable();

  private playlistLoadedSubject = new BehaviorSubject<boolean>(false);
  public playlistLoaded$: Observable<boolean> = this.playlistLoadedSubject.asObservable();

  constructor() { }

  loadPlaylist(videos: VideoFile[]): void {
    if (videos.length === 0) {
      console.warn('No hay videos para cargar en la playlist');
      return;
    }

    this.videos = [...videos];
    this.shuffle();
    this.currentIndex = -1;
    this.playedIndices = [];
    this.playlistLoadedSubject.next(true);

    console.log(`Playlist cargada con ${this.videos.length} videos`);
  }

  private shuffle(): void {
    for (let i = this.videos.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.videos[i], this.videos[j]] = [this.videos[j], this.videos[i]];
    }
  }

  getNextVideo(): VideoFile | null {
    // Si hay ads en el bloque actual, devolver siguiente ad
    if (this.currentAdBlock.length > 0) {
      const ad = this.currentAdBlock.shift()!;
      this.currentVideoSubject.next(ad);
      console.log(`Reproduciendo comercial: ${ad.name}`);
      return ad;
    }

    // Verificar si toca corte comercial
    if (this.adsConfig.enabled && 
        this.adsVideos.length > 0 &&
        this.normalVideosPlayed > 0 &&
        this.normalVideosPlayed % this.adsConfig.frequency === 0) {
      this.currentAdBlock = this.generateAdBlock();
      console.log(`Iniciando bloque comercial con ${this.currentAdBlock.length} anuncios`);
      return this.getNextVideo(); // Recursión para devolver primer ad
    }

    // Video normal
    if (this.videos.length === 0) {
      return null;
    }

    if (this.playedIndices.length >= this.videos.length) {
      this.playedIndices = [];
      this.shuffle();
      console.log('Todos los videos reproducidos. Mezclando de nuevo...');
    }

    let nextIndex: number;
    do {
      nextIndex = Math.floor(Math.random() * this.videos.length);
    } while (this.playedIndices.includes(nextIndex) && this.playedIndices.length < this.videos.length);

    this.currentIndex = nextIndex;
    this.playedIndices.push(nextIndex);

    const video = this.videos[this.currentIndex];
    this.currentVideoSubject.next(video);

    // Incrementar contador solo para videos normales
    this.normalVideosPlayed++;

    console.log(`Reproduciendo: ${video.name} (${this.playedIndices.length}/${this.videos.length}) - Videos normales: ${this.normalVideosPlayed}`);

    return video;
  }

  private generateAdBlock(): VideoFile[] {
    if (this.adsVideos.length === 0) {
      return [];
    }

    // Cantidad random entre min y max configurado
    const count = Math.floor(
      Math.random() * (this.adsConfig.maxAdsPerBreak - this.adsConfig.minAdsPerBreak + 1)
    ) + this.adsConfig.minAdsPerBreak;

    // Shuffle ads disponibles
    const availableAds = [...this.adsVideos];
    
    // Evitar repetir los últimos ads usados si es posible
    const filteredAds = this.lastAdIndices.length > 0 && availableAds.length > this.adsConfig.maxAdsPerBreak
      ? availableAds.filter((_, index) => !this.lastAdIndices.includes(index))
      : availableAds;

    // Shuffle
    const shuffled = filteredAds.sort(() => Math.random() - 0.5);
    
    // Tomar N primeros
    const selected = shuffled.slice(0, Math.min(count, shuffled.length));

    // Guardar índices para próximo bloque
    this.lastAdIndices = selected.map(ad => this.adsVideos.indexOf(ad));

    // Marcar como ads
    return selected.map((ad, index) => ({
      ...ad,
      isAd: true,
      adBlockIndex: index
    }));
  }

  getPreviousVideo(): VideoFile | null {
    if (this.videos.length === 0 || this.playedIndices.length <= 1) {
      return null;
    }

    this.playedIndices.pop();

    const previousIndex = this.playedIndices[this.playedIndices.length - 1];
    this.currentIndex = previousIndex;

    const video = this.videos[this.currentIndex];
    this.currentVideoSubject.next(video);

    return video;
  }

  getCurrentVideo(): VideoFile | null {
    if (this.currentIndex >= 0 && this.currentIndex < this.videos.length) {
      return this.videos[this.currentIndex];
    }
    return null;
  }

  getTotalVideos(): number {
    return this.videos.length;
  }

  getPlayedCount(): number {
    return this.playedIndices.length;
  }

  reset(): void {
    this.currentIndex = -1;
    this.playedIndices = [];
    this.shuffle();
  }

  clear(): void {
    this.videos = [];
    this.currentIndex = -1;
    this.playedIndices = [];
    this.currentVideoSubject.next(null);
    this.playlistLoadedSubject.next(false);
    this.clearAds();
  }

  // === ADS METHODS ===

  loadAdsPlaylist(videos: VideoFile[], config: AdsConfig): void {
    this.adsVideos = [...videos];
    this.adsConfig = config;
    this.normalVideosPlayed = 0;
    this.currentAdBlock = [];
    this.lastAdIndices = [];

    console.log(`Ads playlist cargada con ${this.adsVideos.length} comerciales. Config:`, config);
  }

  clearAds(): void {
    this.adsVideos = [];
    this.adsConfig = {
      enabled: false,
      frequency: 3,
      minAdsPerBreak: 1,
      maxAdsPerBreak: 5
    };
    this.normalVideosPlayed = 0;
    this.currentAdBlock = [];
    this.lastAdIndices = [];
  }

  getAdsConfig(): AdsConfig {
    return { ...this.adsConfig };
  }

  hasAds(): boolean {
    return this.adsVideos.length > 0 && this.adsConfig.enabled;
  }

  getAdsCount(): number {
    return this.adsVideos.length;
  }

  hasVideos(): boolean {
    return this.videos.length > 0;
  }

  getPlaylist(): VideoFile[] {
    return this.videos;
  }

  getCurrentIndex(): number {
    return this.currentIndex;
  }
}
