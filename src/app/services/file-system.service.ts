import { Injectable } from '@angular/core';

export interface VideoFile {
  file: File;
  name: string;
  path: string;
  url: string;
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

  /**
   * Solicita al usuario seleccionar una carpeta y devuelve el handle
   */
  async selectFolder(): Promise<FileSystemDirectoryHandle | null> {
    try {
      // Verificar si el navegador soporta File System Access API
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

  /**
   * Escanea recursivamente la carpeta y subcarpetas buscando archivos de video
   */
  async scanForVideos(dirHandle?: FileSystemDirectoryHandle): Promise<VideoFile[]> {
    const handle = dirHandle || this.directoryHandle;
    
    if (!handle) {
      throw new Error('No hay carpeta seleccionada');
    }

    const videos: VideoFile[] = [];
    await this.scanDirectory(handle, videos, '');
    return videos;
  }

  /**
   * Función recursiva para escanear directorios
   */
  private async scanDirectory(
    dirHandle: FileSystemDirectoryHandle, 
    videos: VideoFile[], 
    currentPath: string
  ): Promise<void> {
    try {
      for await (const entry of dirHandle.values()) {
        const path = currentPath ? `${currentPath}/${entry.name}` : entry.name;

        if (entry.kind === 'file') {
          // Verificar si es un archivo de video
          if (this.isVideoFile(entry.name)) {
            const fileHandle = entry as FileSystemFileHandle;
            const file = await fileHandle.getFile();
            
            videos.push({
              file: file,
              name: entry.name,
              path: path,
              url: URL.createObjectURL(file)
            });
          }
        } else if (entry.kind === 'directory') {
          // Escanear recursivamente subdirectorios
          const subDirHandle = entry as FileSystemDirectoryHandle;
          await this.scanDirectory(subDirHandle, videos, path);
        }
      }
    } catch (error) {
      console.error('Error escaneando directorio:', error);
    }
  }

  /**
   * Verifica si un archivo es un video basándose en su extensión
   */
  private isVideoFile(filename: string): boolean {
    const lowerFilename = filename.toLowerCase();
    return this.VIDEO_EXTENSIONS.some(ext => lowerFilename.endsWith(ext));
  }

  /**
   * Obtiene el handle del directorio actual
   */
  getDirectoryHandle(): FileSystemDirectoryHandle | null {
    return this.directoryHandle;
  }

  /**
   * Establece el handle del directorio
   */
  setDirectoryHandle(handle: FileSystemDirectoryHandle): void {
    this.directoryHandle = handle;
  }

  /**
   * Verifica si el navegador soporta File System Access API
   */
  isSupported(): boolean {
    return 'showDirectoryPicker' in window;
  }

  /**
   * Libera las URLs de los videos para liberar memoria
   */
  revokeVideoUrls(videos: VideoFile[]): void {
    videos.forEach(video => {
      if (video.url) {
        URL.revokeObjectURL(video.url);
      }
    });
  }
}
