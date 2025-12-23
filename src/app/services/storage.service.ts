import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly STORAGE_KEYS = {
    DIRECTORY_HANDLE: 'local_tv_directory_handle',
    LAST_VIDEO_INDEX: 'local_tv_last_video_index',
    VOLUME: 'local_tv_volume'
  };

  constructor() { }

  /**
   * Guarda el handle del directorio en IndexedDB
   * (localStorage no puede almacenar objetos complejos como FileSystemDirectoryHandle)
   */
  async saveDirectoryHandle(handle: FileSystemDirectoryHandle): Promise<void> {
    try {
      // Usar IndexedDB para guardar el handle
      const db = await this.openDatabase();
      const transaction = db.transaction(['handles'], 'readwrite');
      const store = transaction.objectStore('handles');

      await store.put(handle, this.STORAGE_KEYS.DIRECTORY_HANDLE);

      db.close();
    } catch (error) {
      console.error('Error guardando handle de directorio:', error);
    }
  }

  /**
   * Recupera el handle del directorio desde IndexedDB
   */
  async getDirectoryHandle(): Promise<FileSystemDirectoryHandle | null> {
    try {
      const db = await this.openDatabase();
      const transaction = db.transaction(['handles'], 'readonly');
      const store = transaction.objectStore('handles');

      const request = store.get(this.STORAGE_KEYS.DIRECTORY_HANDLE);

      const handle = await new Promise<FileSystemDirectoryHandle | null>((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      db.close();

      if (handle) {
        // Verificar si aún tenemos permisos
        const permission = await this.verifyPermission(handle);
        if (permission) {
          return handle;
        }
      }

      return null;
    } catch (error) {
      console.error('Error recuperando handle de directorio:', error);
      return null;
    }
  }

  /**
   * Verifica si tenemos permisos de lectura en el directorio
   */
  private async verifyPermission(handle: FileSystemDirectoryHandle): Promise<boolean> {
    try {
      const options = { mode: 'read' } as any;

      // Solo verificar permisos actuales (no solicitar)
      // requestPermission requiere interacción del usuario
      const permission = await (handle as any).queryPermission(options);
      return permission === 'granted';
    } catch (error) {
      // Silenciar errores - es normal que falle sin interacción del usuario
      return false;
    }
  }

  /**
   * Elimina el handle del directorio guardado
   */
  async clearDirectoryHandle(): Promise<void> {
    try {
      const db = await this.openDatabase();
      const transaction = db.transaction(['handles'], 'readwrite');
      const store = transaction.objectStore('handles');

      await store.delete(this.STORAGE_KEYS.DIRECTORY_HANDLE);

      db.close();
    } catch (error) {
      console.error('Error eliminando handle de directorio:', error);
    }
  }

  /**
   * Guarda el índice del último video reproducido
   */
  saveLastVideoIndex(index: number): void {
    localStorage.setItem(this.STORAGE_KEYS.LAST_VIDEO_INDEX, index.toString());
  }

  /**
   * Recupera el índice del último video reproducido
   */
  getLastVideoIndex(): number | null {
    const index = localStorage.getItem(this.STORAGE_KEYS.LAST_VIDEO_INDEX);
    return index ? parseInt(index, 10) : null;
  }

  /**
   * Guarda el nivel de volumen
   */
  saveVolume(volume: number): void {
    localStorage.setItem(this.STORAGE_KEYS.VOLUME, volume.toString());
  }

  /**
   * Recupera el nivel de volumen
   */
  getVolume(): number {
    const volume = localStorage.getItem(this.STORAGE_KEYS.VOLUME);
    return volume ? parseFloat(volume) : 1.0;
  }

  /**
   * Abre o crea la base de datos IndexedDB
   */
  private openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('LocalTVDB', 1);

      request.onerror = () => {
        reject(request.error);
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Crear object store para handles si no existe
        if (!db.objectStoreNames.contains('handles')) {
          db.createObjectStore('handles');
        }
      };
    });
  }

  /**
   * Limpia todos los datos almacenados
   */
  async clearAll(): Promise<void> {
    await this.clearDirectoryHandle();
    localStorage.removeItem(this.STORAGE_KEYS.LAST_VIDEO_INDEX);
    localStorage.removeItem(this.STORAGE_KEYS.VOLUME);
  }
}
