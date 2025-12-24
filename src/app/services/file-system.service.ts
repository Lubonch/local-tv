import { Injectable } from '@angular/core';

export interface VideoFile {
  file: File;
  name: string;
  path: string;
  url?: string;
  isAd?: boolean;
  adBlockIndex?: number;
}

export interface AdsConfig {
  enabled: boolean;
  frequency: number;
  minAdsPerBreak: number;
  maxAdsPerBreak: number;
}

@Injectable({
  providedIn: 'root'
})
export class FileSystemService {
  private directoryHandle: FileSystemDirectoryHandle | null = null;
  private readonly VIDEO_EXTENSIONS = [
    '.mp4', '.mkv', '.webm', '.avi', '.mov',
    '.m4v', '.wmv', '.flv', '.ogv', '.3gp'
  ];

  constructor() { }

  async selectFolder(): Promise<FileSystemDirectoryHandle | null> {
    try {
      if (!('showDirectoryPicker' in window)) {
        throw new Error('File System Access API no está soportada en este navegador');
      }

      this.directoryHandle = await (window as any).showDirectoryPicker({
        mode: 'read'
      });

      return this.directoryHandle;
    } catch (error) {
      console.error('Error seleccionando carpeta:', error);
      return null;
    }
  }

  async scanForVideos(
    dirHandle?: FileSystemDirectoryHandle,
    progressCallback?: (current: number, total: number) => void
  ): Promise<VideoFile[]> {
    const handle = dirHandle || this.directoryHandle;

    if (!handle) {
      throw new Error('No hay carpeta seleccionada');
    }

    const videos: VideoFile[] = [];
    await this.scanDirectory(handle, videos, '', progressCallback);
    return videos;
  }

  private async scanDirectory(
    dirHandle: FileSystemDirectoryHandle,
    videos: VideoFile[],
    currentPath: string,
    progressCallback?: (current: number, total: number) => void
  ): Promise<void> {
    try {
      for await (const entry of dirHandle.values()) {
        const path = currentPath ? `${currentPath}/${entry.name}` : entry.name;

        if (entry.kind === 'file') {
          if (this.isVideoFile(entry.name)) {
            const fileHandle = entry as FileSystemFileHandle;
            const file = await fileHandle.getFile();

            videos.push({
              file: file,
              name: entry.name,
              path: path
            });

            if (progressCallback) {
              progressCallback(videos.length, videos.length);
            }
          }
        } else if (entry.kind === 'directory') {
          const subDirHandle = entry as FileSystemDirectoryHandle;
          await this.scanDirectory(subDirHandle, videos, path, progressCallback);
        }
      }
    } catch (error) {
      console.error('Error escaneando directorio:', error);
    }
  }

  private isVideoFile(filename: string): boolean {
    const lowerFilename = filename.toLowerCase();
    return this.VIDEO_EXTENSIONS.some(ext => lowerFilename.endsWith(ext));
  }

  getDirectoryHandle(): FileSystemDirectoryHandle | null {
    return this.directoryHandle;
  }

  setDirectoryHandle(handle: FileSystemDirectoryHandle): void {
    this.directoryHandle = handle;
  }

  isSupported(): boolean {
    return 'showDirectoryPicker' in window;
  }

  revokeVideoUrls(videos: VideoFile[]): void {
    videos.forEach(video => {
      if (video.url) {
        URL.revokeObjectURL(video.url);
      }
    });
  }
}
