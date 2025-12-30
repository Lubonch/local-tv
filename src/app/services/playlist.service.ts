import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { VideoFile } from './file-system.service';

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {
  private videos: VideoFile[] = [];
  private currentIndex: number = -1;
  private playedIndices: number[] = [];

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
    // Emitimos asincrónicamente para evitar ExpressionChangedAfterItHasBeenCheckedError
    Promise.resolve().then(() => this.playlistLoadedSubject.next(true));

  }

  private shuffle(): void {
    for (let i = this.videos.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.videos[i], this.videos[j]] = [this.videos[j], this.videos[i]];
    }
  }

  getNextVideo(): VideoFile | null {
    if (this.videos.length === 0) {
      return null;
    }

    if (this.playedIndices.length >= this.videos.length) {
      this.playedIndices = [];
      this.shuffle();
    }

    let nextIndex: number;
    do {
      nextIndex = Math.floor(Math.random() * this.videos.length);
    } while (this.playedIndices.includes(nextIndex) && this.playedIndices.length < this.videos.length);

    this.currentIndex = nextIndex;
    this.playedIndices.push(nextIndex);

    const video = this.videos[this.currentIndex];
    this.currentVideoSubject.next(video);


    return video;
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
