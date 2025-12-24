import { Injectable } from '@angular/core';

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

  private currentFile: File | null = null;
  private tracks: MKVTrack[] = [];

  async parseFile(file: File): Promise<MKVTrack[]> {
    console.log('🎬 Parseando archivo MKV:', file.name);
    this.currentFile = file;
    this.tracks = [];

    try {
      // Leer los primeros 2MB para obtener el header (suficiente para metadata)
      const headerSize = Math.min(2 * 1024 * 1024, file.size);
      const headerChunk = file.slice(0, headerSize);
      const buffer = await headerChunk.arrayBuffer();
      const data = new Uint8Array(buffer);

      console.log('📊 Leyendo header MKV:', data.length, 'bytes');

      // Parsear usando búsqueda manual de elementos EBML
      this.parseEBMLTracks(data);

      console.log('✅ Tracks detectados:', this.tracks);
      return this.tracks;

    } catch (error) {
      console.error('❌ Error parseando MKV:', error);
      return [];
    }
  }

  private parseEBMLTracks(data: Uint8Array): void {
    let offset = 0;
    
    // Buscar el elemento "Tracks" en EBML
    // Tracks = 0x1654AE6B
    const tracksId = [0x16, 0x54, 0xAE, 0x6B];
    
    while (offset < data.length - 100) {
      // Buscar la secuencia del ID de Tracks
      if (data[offset] === tracksId[0] &&
          data[offset + 1] === tracksId[1] &&
          data[offset + 2] === tracksId[2] &&
          data[offset + 3] === tracksId[3]) {
        
        console.log('📍 Encontrado elemento Tracks en offset:', offset);
        
        // Saltar el ID y el tamaño
        offset += 4;
        const [size, sizeLen] = this.readVInt(data, offset);
        offset += sizeLen;
        
        // Parsear las entradas de tracks
        this.parseTrackEntries(data, offset, offset + size);
        break;
      }
      offset++;
    }
  }

  private parseTrackEntries(data: Uint8Array, start: number, end: number): void {
    let offset = start;
    
    // TrackEntry = 0xAE
    while (offset < end - 10) {
      if (data[offset] === 0xAE) {
        offset++;
        const [size, sizeLen] = this.readVInt(data, offset);
        offset += sizeLen;
        
        const trackEnd = offset + size;
        const track = this.parseTrackEntry(data, offset, trackEnd);
        
        if (track) {
          this.tracks.push(track);
        }
        
        offset = trackEnd;
      } else {
        offset++;
      }
    }
  }

  private parseTrackEntry(data: Uint8Array, start: number, end: number): MKVTrack | null {
    const track: Partial<MKVTrack> = {};
    let offset = start;

    while (offset < end - 2) {
      const id = data[offset];
      offset++;

      // TrackNumber = 0xD7
      if (id === 0xD7) {
        const [size, sizeLen] = this.readVInt(data, offset);
        offset += sizeLen;
        track.trackNumber = this.readUInt(data, offset, size);
        offset += size;
      }
      // TrackType = 0x83
      else if (id === 0x83) {
        const [size, sizeLen] = this.readVInt(data, offset);
        offset += sizeLen;
        track.trackType = this.readUInt(data, offset, size);
        offset += size;
      }
      // CodecID = 0x86
      else if (id === 0x86) {
        const [size, sizeLen] = this.readVInt(data, offset);
        offset += sizeLen;
        track.codecId = this.readString(data, offset, size);
        offset += size;
      }
      // Language = 0x22B59C
      else if (id === 0x22 && data[offset] === 0xB5 && data[offset + 1] === 0x9C) {
        offset += 2;
        const [size, sizeLen] = this.readVInt(data, offset);
        offset += sizeLen;
        track.language = this.readString(data, offset, size);
        offset += size;
      }
      // Name = 0x536E
      else if (id === 0x53 && data[offset] === 0x6E) {
        offset++;
        const [size, sizeLen] = this.readVInt(data, offset);
        offset += sizeLen;
        track.name = this.readString(data, offset, size);
        offset += size;
      }
      // FlagDefault = 0x88
      else if (id === 0x88) {
        const [size, sizeLen] = this.readVInt(data, offset);
        offset += sizeLen;
        track.flagDefault = this.readUInt(data, offset, size) === 1;
        offset += size;
      }
      else {
        // Elemento desconocido, intentar saltar
        if (offset < end - 1) {
          const [size, sizeLen] = this.readVInt(data, offset);
          offset += sizeLen + size;
        } else {
          offset++;
        }
      }
    }

    if (track.trackNumber !== undefined && track.trackType !== undefined) {
      return track as MKVTrack;
    }

    return null;
  }

  private readVInt(data: Uint8Array, offset: number): [number, number] {
    const firstByte = data[offset];
    
    // Determinar el número de bytes
    let mask = 0x80;
    let length = 1;
    
    while (length <= 8 && !(firstByte & mask)) {
      mask >>= 1;
      length++;
    }
    
    if (length > 8) {
      return [0, 1];
    }
    
    let value = firstByte & (mask - 1);
    
    for (let i = 1; i < length; i++) {
      value = (value << 8) | data[offset + i];
    }
    
    return [value, length];
  }

  private readUInt(data: Uint8Array, offset: number, length: number): number {
    let value = 0;
    for (let i = 0; i < length; i++) {
      value = (value << 8) | data[offset + i];
    }
    return value;
  }

  private readString(data: Uint8Array, offset: number, length: number): string {
    const bytes = data.slice(offset, offset + length);
    return new TextDecoder('utf-8').decode(bytes);
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
