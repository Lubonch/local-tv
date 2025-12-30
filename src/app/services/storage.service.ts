import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly STORAGE_KEYS = {
    DIRECTORY_HANDLES: 'local_tv_directory_handles',
    LAST_VIDEO_INDEX: 'local_tv_last_video_index',
    VOLUME: 'local_tv_volume'
  };

  constructor() { }

  async saveDirectoryHandle(handle: FileSystemDirectoryHandle, folderIndex: number = 0): Promise<void> {
    try {
      // Obtener handles existentes ANTES de abrir la transacción
      const existingHandles = await this.getAllDirectoryHandlesFromStorage();

      const db = await this.openDatabase();
      const transaction = db.transaction(['handles'], 'readwrite');
      const store = transaction.objectStore('handles');

      // Actualizar el handle específico
      existingHandles[folderIndex] = handle;

      // Guardar todos los handles
      await store.put(existingHandles, this.STORAGE_KEYS.DIRECTORY_HANDLES);

      db.close();
    } catch (error) {
      console.error('Error guardando handle de directorio:', error);
    }
  }

  async getDirectoryHandle(folderIndex: number = 0): Promise<FileSystemDirectoryHandle | null> {
    try {
      const handles = await this.getAllDirectoryHandlesFromStorage();

      if (handles[folderIndex]) {
        const permission = await this.verifyPermission(handles[folderIndex]);
        if (permission) {
          return handles[folderIndex];
        }
      }

      return null;
    } catch (error) {
      console.error('Error recuperando handle de directorio:', error);
      return null;
    }
  }

  async getAllDirectoryHandles(): Promise<(FileSystemDirectoryHandle | null)[]> {
    try {
      return await this.getAllDirectoryHandlesFromStorage();
    } catch (error) {
      console.error('Error recuperando handles de directorio:', error);
      return [null, null];
    }
  }

  private async getAllDirectoryHandlesFromStorage(): Promise<(FileSystemDirectoryHandle | null)[]> {
    const db = await this.openDatabase();
    const transaction = db.transaction(['handles'], 'readonly');
    const store = transaction.objectStore('handles');

    const request = store.get(this.STORAGE_KEYS.DIRECTORY_HANDLES);

    const handles = await new Promise<(FileSystemDirectoryHandle | null)[]>((resolve, reject) => {
      request.onsuccess = () => {
        const result = request.result;
        if (result && Array.isArray(result)) {
          resolve(result);
        } else {
          resolve([null, null]);
        }
      };
      request.onerror = () => reject(request.error);
    });

    db.close();
    return handles;
  }

  private async verifyPermission(handle: FileSystemDirectoryHandle): Promise<boolean> {
    try {
      const options = { mode: 'read' } as any;

      const permission = await (handle as any).queryPermission(options);
      return permission === 'granted';
    } catch (error) {
      return false;
    }
  }

  async clearDirectoryHandle(folderIndex: number = 0): Promise<void> {
    try {
      const db = await this.openDatabase();
      const transaction = db.transaction(['handles'], 'readwrite');
      const store = transaction.objectStore('handles');

      // Obtener handles existentes
      const existingHandles = await this.getAllDirectoryHandlesFromStorage();

      // Limpiar el handle específico
      existingHandles[folderIndex] = null;

      // Guardar todos los handles
      await store.put(existingHandles, this.STORAGE_KEYS.DIRECTORY_HANDLES);

      db.close();
    } catch (error) {
      console.error('Error eliminando handle de directorio:', error);
    }
  }

  async clearAllDirectoryHandles(): Promise<void> {
    try {
      const db = await this.openDatabase();
      const transaction = db.transaction(['handles'], 'readwrite');
      const store = transaction.objectStore('handles');

      await store.delete(this.STORAGE_KEYS.DIRECTORY_HANDLES);

      db.close();
    } catch (error) {
      console.error('Error eliminando handles de directorio:', error);
    }
  }

  saveLastVideoIndex(index: number): void {
    localStorage.setItem(this.STORAGE_KEYS.LAST_VIDEO_INDEX, index.toString());
  }

  getLastVideoIndex(): number | null {
    const index = localStorage.getItem(this.STORAGE_KEYS.LAST_VIDEO_INDEX);
    return index ? parseInt(index, 10) : null;
  }

  saveVolume(volume: number): void {
    localStorage.setItem(this.STORAGE_KEYS.VOLUME, volume.toString());
  }

  getVolume(): number {
    const volume = localStorage.getItem(this.STORAGE_KEYS.VOLUME);
    return volume ? parseFloat(volume) : 1.0;
  }

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

        if (!db.objectStoreNames.contains('handles')) {
          db.createObjectStore('handles');
        }
      };
    });
  }

  async clearAll(): Promise<void> {
    await this.clearAllDirectoryHandles();
    localStorage.removeItem(this.STORAGE_KEYS.LAST_VIDEO_INDEX);
    localStorage.removeItem(this.STORAGE_KEYS.VOLUME);
  }
}
