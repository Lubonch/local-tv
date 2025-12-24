import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

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
   * Obtiene los videos de una playlist usando Invidious API a través del proxy
   */
  async getPlaylistVideos(playlistId: string): Promise<YouTubeVideo[]> {
    try {
      console.log(`Getting playlist from proxy: ${playlistId}`);

      // En desarrollo, usa el proxy. En producción, usa directamente la instancia
      const apiUrl = environment.production
        ? `https://inv.nadeko.net/api/v1/playlists/${playlistId}`
        : `/api/invidious/playlists/${playlistId}`;

      const response = await firstValueFrom(
        this.http.get<YouTubePlaylistResponse>(apiUrl, {
          headers: { 'Accept': 'application/json' }
        })
      );

      console.log(`✓ Playlist obtained: ${response.title} (${response.videos.length} videos)`);
      return response.videos;

    } catch (error) {
      console.error('Error getting playlist:', error);
      throw new Error('No se pudo obtener la playlist de YouTube. Verifica que la URL sea válida y que la playlist sea pública.');
    }
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
