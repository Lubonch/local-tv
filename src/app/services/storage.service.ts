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

  async saveDirectoryHandle(handle: FileSystemDirectoryHandle): Promise<void> {
    try {
      const db = await this.openDatabase();
      const transaction = db.transaction(['handles'], 'readwrite');
      const store = transaction.objectStore('handles');

      await store.put(handle, this.STORAGE_KEYS.DIRECTORY_HANDLE);

      db.close();
    } catch (error) {
      console.error('Error guardando handle de directorio:', error);
    }
  }

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

  private async verifyPermission(handle: FileSystemDirectoryHandle): Promise<boolean> {
    try {
      const options = { mode: 'read' } as any;

      const permission = await (handle as any).queryPermission(options);
      return permission === 'granted';
    } catch (error) {
      return false;
    }
  }

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
    await this.clearDirectoryHandle();
    localStorage.removeItem(this.STORAGE_KEYS.LAST_VIDEO_INDEX);
    localStorage.removeItem(this.STORAGE_KEYS.VOLUME);
  }
}
