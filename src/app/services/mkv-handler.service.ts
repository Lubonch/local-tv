import { Injectable } from '@angular/core';
import { Decoder, EBMLElementDetail } from 'ts-ebml';

export interface MKVTrack {
  trackNumber: number;
  trackType: number; // 1=video, 2=audio, 17=subtitle
  codecId: string;
  language?: string;
  name?: string;
  flagDefault?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MkvHandlerService {
  
  private decoder = new Decoder();
  private currentFile: File | null = null;
  private tracks: MKVTrack[] = [];

  async parseFile(file: File): Promise<MKVTrack[]> {
    console.log('🎬 Parseando archivo MKV:', file.name);
    this.currentFile = file;
    this.tracks = [];
    
    try {
      // Leer los primeros 5MB para obtener el header
      const headerSize = Math.min(5 * 1024 * 1024, file.size);
      const headerChunk = file.slice(0, headerSize);
      const buffer = await headerChunk.arrayBuffer();
      
      const elms = this.decoder.decode(buffer);
      
      console.log('📊 Elementos EBML decodificados:', elms.length);
      
      // Parsear tracks del resultado
      this.parseTracks(elms);
      
      console.log('✅ Tracks detectados:', this.tracks);
      return this.tracks;
      
    } catch (error) {
      console.error('❌ Error parseando MKV:', error);
      return [];
    }
  }
  
  private parseTracks(elements: EBMLElementDetail[]): void {
    let inTracks = false;
    let currentTrack: Partial<MKVTrack> = {};
    let trackDepth = 0;
    
    for (const elm of elements) {
      // Detectar inicio de sección Tracks
      if (elm.type === 'm' && elm.name === 'Tracks') {
        inTracks = elm.isEnd === false;
        continue;
      }
      
      if (!inTracks) continue;
      
      // Detectar TrackEntry
      if (elm.type === 'm' && elm.name === 'TrackEntry') {
        if (elm.isEnd === false) {
          // Inicio de nuevo track
          currentTrack = {};
          trackDepth++;
        } else {
          // Fin de track, guardar si es válido
          trackDepth--;
          if (currentTrack.trackNumber !== undefined && currentTrack.trackType !== undefined) {
            this.tracks.push(currentTrack as MKVTrack);
          }
          currentTrack = {};
        }
        continue;
      }
      
      // Solo procesar elementos dentro de TrackEntry
      if (trackDepth === 0) continue;
      
      // Parsear propiedades del track
      switch (elm.name) {
        case 'TrackNumber':
          if (elm.type === 'u' && typeof elm.data === 'number') {
            currentTrack.trackNumber = elm.data;
          }
          break;
        case 'TrackType':
          if (elm.type === 'u' && typeof elm.data === 'number') {
            currentTrack.trackType = elm.data;
          }
          break;
        case 'CodecID':
          if (elm.type === 's' && typeof elm.data === 'string') {
            currentTrack.codecId = elm.data;
          }
          break;
        case 'Language':
          if (elm.type === 's' && typeof elm.data === 'string') {
            currentTrack.language = elm.data;
          }
          break;
        case 'Name':
          if (elm.type === '8' && typeof elm.data === 'string') {
            currentTrack.name = elm.data;
          }
          break;
        case 'FlagDefault':
          if (elm.type === 'u' && typeof elm.data === 'number') {
            currentTrack.flagDefault = elm.data === 1;
          }
          break;
      }
    }
  }
  
  getAudioTracks(): MKVTrack[] {
    return this.tracks.filter(t => t.trackType === 2);
  }
  
  getSubtitleTracks(): MKVTrack[] {
    return this.tracks.filter(t => t.trackType === 17);
  }
  
  getTrackLabel(track: MKVTrack): string {
    if (track.name) return track.name;
    if (track.language) return this.getLanguageName(track.language);
    return `Track ${track.trackNumber}`;
  }
  
  private getLanguageName(code: string): string {
    const languages: { [key: string]: string } = {
      'eng': 'English',
      'spa': 'Español',
      'fre': 'Français',
      'ger': 'Deutsch',
      'ita': 'Italiano',
      'por': 'Português',
      'rus': 'Русский',
      'jpn': '日本語',
      'chi': '中文',
      'kor': '한국어',
      'ara': 'العربية',
      'und': 'Desconocido'
    };
    
    return languages[code] || code.toUpperCase();
  }
}
