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

  start(): void {
    this.updateTime();

    this.intervalId = setInterval(() => {
      this.updateTime();
    }, 1000);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private updateTime(): void {
    this.currentTimeSubject.next(new Date());
  }

  getCurrentTime(): Date {
    return this.currentTimeSubject.value;
  }

  formatTime(date: Date, includeSeconds: boolean = true): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    if (includeSeconds) {
      const seconds = date.getSeconds().toString().padStart(2, '0');
      return `${hours}:${minutes}:${seconds}`;
    }

    return `${hours}:${minutes}`;
  }

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
