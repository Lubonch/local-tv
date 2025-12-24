import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface YouTubeVideo {
  videoId: string;
  title: string;
  author: string;
  lengthSeconds: number;
}

export interface YouTubePlaylistResponse {
  title: string;
  videos: YouTubeVideo[];
}

@Injectable({
  providedIn: 'root'
})
export class YouTubeService {
  // Instancias públicas de Invidious (sin API key)
  private readonly INVIDIOUS_INSTANCES = [
    'https://invidious.snopyta.org',
    'https://invidious.kavin.rocks',
    'https://vid.puffyan.us',
    'https://invidious.io.lol',
    'https://inv.riverside.rocks'
  ];

  private currentInstanceIndex = 0;
  private readonly LAST_INSTANCE_KEY = 'youtube-last-working-instance';

  constructor(private http: HttpClient) {
    this.loadLastWorkingInstance();
  }

  private loadLastWorkingInstance(): void {
    const saved = localStorage.getItem(this.LAST_INSTANCE_KEY);
    if (saved) {
      const index = this.INVIDIOUS_INSTANCES.indexOf(saved);
      if (index !== -1) {
        this.currentInstanceIndex = index;
        console.log(`Using last working instance: ${saved}`);
      }
    }
  }

  private saveLastWorkingInstance(instance: string): void {
    localStorage.setItem(this.LAST_INSTANCE_KEY, instance);
  }

  /**
   * Extrae el ID de playlist de una URL de YouTube
   */
  extractPlaylistId(url: string): string | null {
    try {
      const urlObj = new URL(url);
      return urlObj.searchParams.get('list');
    } catch {
      return null;
    }
  }

  /**
   * Obtiene los videos de una playlist usando Invidious API
   */
  async getPlaylistVideos(playlistId: string): Promise<YouTubeVideo[]> {
    let lastError: Error | null = null;
    let attemptCount = 0;
    const maxRetries = 2; // Retry each instance up to 2 times

    // Intenta con cada instancia hasta que una funcione
    for (let i = 0; i < this.INVIDIOUS_INSTANCES.length; i++) {
      const instance = this.INVIDIOUS_INSTANCES[this.currentInstanceIndex];
      
      for (let retry = 0; retry <= maxRetries; retry++) {
        attemptCount++;
        
        try {
          console.log(`Attempt ${attemptCount}: Trying to get playlist from: ${instance}${retry > 0 ? ` (retry ${retry})` : ''}`);

          const response = await firstValueFrom(
            this.http.get<YouTubePlaylistResponse>(
              `${instance}/api/v1/playlists/${playlistId}`,
              {
                headers: { 'Accept': 'application/json' },
                observe: 'body'
              }
            )
          );

          console.log(`✓ Playlist obtained: ${response.title} (${response.videos.length} videos)`);
          this.saveLastWorkingInstance(instance);
          return response.videos;

        } catch (error) {
          console.warn(`✗ Failed instance ${instance}${retry > 0 ? ` (retry ${retry})` : ''}:`, error);
          lastError = error as Error;
          
          // Wait before retry with exponential backoff
          if (retry < maxRetries) {
            const waitTime = Math.pow(2, retry) * 500; // 500ms, 1000ms, 2000ms...
            await new Promise(resolve => setTimeout(resolve, waitTime));
          }
        }
      }

      // Move to next instance after all retries exhausted
      this.currentInstanceIndex = (this.currentInstanceIndex + 1) % this.INVIDIOUS_INSTANCES.length;
    }

    throw new Error(`No se pudo conectar a Invidious. Intenta de nuevo o usa una carpeta local. Último error: ${lastError?.message}`);
  }

  /**
   * Genera URL de embed para un video
   */
  getEmbedUrl(videoId: string): string {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
  }

  /**
   * Valida si una URL es de YouTube
   */
  isYouTubeUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be');
    } catch {
      return false;
    }
  }
}
