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

  constructor(private http: HttpClient) {}

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

    // Intenta con cada instancia hasta que una funcione
    for (let i = 0; i < this.INVIDIOUS_INSTANCES.length; i++) {
      const instance = this.INVIDIOUS_INSTANCES[this.currentInstanceIndex];

      try {
        console.log(`Intentando obtener playlist desde: ${instance}`);

        const response = await firstValueFrom(
          this.http.get<YouTubePlaylistResponse>(
            `${instance}/api/v1/playlists/${playlistId}`,
            {
              headers: { 'Accept': 'application/json' },
              // Timeout de 10 segundos
              observe: 'body'
            }
          )
        );

        console.log(`Playlist obtenida: ${response.title} (${response.videos.length} videos)`);
        return response.videos;

      } catch (error) {
        console.warn(`Falló instancia ${instance}:`, error);
        lastError = error as Error;

        // Siguiente instancia
        this.currentInstanceIndex = (this.currentInstanceIndex + 1) % this.INVIDIOUS_INSTANCES.length;
      }
    }

    throw new Error(`No se pudo obtener la playlist desde ninguna instancia de Invidious: ${lastError?.message}`);
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
