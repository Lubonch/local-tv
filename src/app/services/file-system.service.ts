import { Injectable } from '@angular/core';

export interface VideoFile {
  file: File;
  name: string;
  path: string;
  url?: string;
  folderIndex?: number; // Para identificar de qué carpeta viene
}

@Injectable({
  providedIn: 'root'
})
export class FileSystemService {
  private directoryHandles: (FileSystemDirectoryHandle | null)[] = [null, null];
  private readonly VIDEO_EXTENSIONS = [
    '.mp4', '.mkv', '.webm', '.avi', '.mov',
    '.m4v', '.wmv', '.flv', '.ogv', '.3gp'
  ];

  constructor() { }

  async selectFolder(folderIndex: number = 0): Promise<FileSystemDirectoryHandle | null> {
    try {
      if (!('showDirectoryPicker' in window)) {
        throw new Error('File System Access API no está soportada en este navegador');
      }

      this.directoryHandles[folderIndex] = await (window as any).showDirectoryPicker({
        mode: 'read'
      });

      return this.directoryHandles[folderIndex];
    } catch (error) {
      console.error('Error seleccionando carpeta:', error);
      return null;
    }
  }

  async scanForVideos(
    folderIndices: number[] = [0, 1],
    progressCallback?: (current: number, total: number) => void
  ): Promise<VideoFile[]> {
    const videos: VideoFile[] = [];

    for (const folderIndex of folderIndices) {
      const handle = this.directoryHandles[folderIndex];
      if (handle) {
        try {
          await this.scanDirectory(handle, videos, '', progressCallback, folderIndex);
        } catch (error) {
          console.warn(`Error escaneando carpeta ${folderIndex + 1}:`, error);
          // Continuar con la siguiente carpeta
        }
      }
    }

    if (videos.length === 0) {
      throw new Error('No hay carpetas seleccionadas o no se encontraron videos');
    }

    return videos;
  }

  private async scanDirectory(
    dirHandle: FileSystemDirectoryHandle,
    videos: VideoFile[],
    currentPath: string,
    progressCallback?: (current: number, total: number) => void,
    folderIndex: number = 0
  ): Promise<void> {
    try {
      for await (const entry of dirHandle.values()) {
        const path = currentPath ? `${currentPath}/${entry.name}` : entry.name;

        if (entry.kind === 'file') {
          if (this.isVideoFile(entry.name)) {
            try {
              const fileHandle = entry as FileSystemFileHandle;
              const file = await fileHandle.getFile();

              videos.push({
                file: file,
                name: entry.name,
                path: path,
                folderIndex: folderIndex
              });

              if (progressCallback) {
                progressCallback(videos.length, videos.length);
              }
            } catch (fileError: any) {
              console.warn(`No se pudo acceder al archivo "${path}":`, fileError.message);
              // Continuar con el siguiente archivo - no bloquear todo el escaneo
            }
          }
        } else if (entry.kind === 'directory') {
          try {
            const subDirHandle = entry as FileSystemDirectoryHandle;
            await this.scanDirectory(subDirHandle, videos, path, progressCallback, folderIndex);
          } catch (dirError: any) {
            console.warn(`No se pudo acceder al directorio "${path}":`, dirError.message);
            // Continuar con el siguiente directorio
          }
        }
      }
    } catch (error: any) {
      console.error('Error escaneando directorio:', error);
      // No relanzar el error para no detener todo el proceso
    }
  }

  private isVideoFile(filename: string): boolean {
    const lowerFilename = filename.toLowerCase();
    return this.VIDEO_EXTENSIONS.some(ext => lowerFilename.endsWith(ext));
  }

  getDirectoryHandle(folderIndex: number = 0): FileSystemDirectoryHandle | null {
    return this.directoryHandles[folderIndex] || null;
  }

  setDirectoryHandle(handle: FileSystemDirectoryHandle, folderIndex: number = 0): void {
    this.directoryHandles[folderIndex] = handle;
  }

  getAllDirectoryHandles(): (FileSystemDirectoryHandle | null)[] {
    return [...this.directoryHandles];
  }

  hasAnyDirectory(): boolean {
    return this.directoryHandles.some(handle => handle !== null);
  }

  clearDirectoryHandle(folderIndex: number = 0): void {
    this.directoryHandles[folderIndex] = null;
  }

  clearAllDirectoryHandles(): void {
    this.directoryHandles = [null, null];
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
