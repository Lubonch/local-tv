import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private enabled = !!environment.debugLogs;

  log(...args: any[]): void {
    if (this.enabled) {
      console.log(...args);
    }
  }

  debug(...args: any[]): void {
    if (this.enabled) {
      console.debug(...args);
    }
  }

  warn(...args: any[]): void {
    console.warn(...args);
  }

  error(...args: any[]): void {
    console.error(...args);
  }
}
