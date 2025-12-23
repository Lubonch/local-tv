import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClockService {
  private currentTimeSubject = new BehaviorSubject<Date>(new Date());
  public currentTime$: Observable<Date> = this.currentTimeSubject.asObservable();

  private intervalId: any;

  constructor() { }

  /**
   * Inicia el reloj
   */
  start(): void {
    // Actualizar inmediatamente
    this.updateTime();

    // Actualizar cada segundo
    this.intervalId = setInterval(() => {
      this.updateTime();
    }, 1000);
  }

  /**
   * Detiene el reloj
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Actualiza la hora actual
   */
  private updateTime(): void {
    this.currentTimeSubject.next(new Date());
  }

  /**
   * Obtiene la hora actual
   */
  getCurrentTime(): Date {
    return this.currentTimeSubject.value;
  }

  /**
   * Formatea la hora como string (HH:MM:SS)
   */
  formatTime(date: Date, includeSeconds: boolean = true): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    if (includeSeconds) {
      const seconds = date.getSeconds().toString().padStart(2, '0');
      return `${hours}:${minutes}:${seconds}`;
    }

    return `${hours}:${minutes}`;
  }

  /**
   * Formatea la fecha completa
   */
  formatDate(date: Date): string {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${dayName}, ${day} de ${month} de ${year}`;
  }
}
