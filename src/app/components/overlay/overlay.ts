import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClockService } from '../../services/clock.service';
import { WeatherService, WeatherData } from '../../services/weather.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-overlay',
  imports: [CommonModule],
  templateUrl: './overlay.html',
  styleUrl: './overlay.css'
})
export class OverlayComponent implements OnInit, OnDestroy {
  currentTime: Date = new Date();
  weatherData: WeatherData | null = null;
  weatherError: string | null = null;

  private clockSubscription?: Subscription;
  private weatherSubscription?: Subscription;
  private weatherErrorSubscription?: Subscription;

  constructor(
    private clockService: ClockService,
    private weatherService: WeatherService
  ) { }

  ngOnInit(): void {
    // Iniciar reloj
    this.clockService.start();
    this.clockSubscription = this.clockService.currentTime$.subscribe(time => {
      this.currentTime = time;
    });

    // Iniciar actualizaciones del clima
    this.weatherService.startWeatherUpdates();
    this.weatherSubscription = this.weatherService.weatherData$.subscribe(data => {
      this.weatherData = data;
    });

    this.weatherErrorSubscription = this.weatherService.error$.subscribe(error => {
      this.weatherError = error;
    });
  }

  ngOnDestroy(): void {
    // Detener servicios
    this.clockService.stop();
    this.weatherService.stopWeatherUpdates();

    // Desuscribirse
    this.clockSubscription?.unsubscribe();
    this.weatherSubscription?.unsubscribe();
    this.weatherErrorSubscription?.unsubscribe();
  }

  /**
   * Formatea la hora actual
   */
  get formattedTime(): string {
    return this.clockService.formatTime(this.currentTime, true);
  }

  /**
   * Obtiene el texto de temperatura
   */
  get temperatureText(): string {
    if (this.weatherData) {
      return `${this.weatherData.temperature}°C`;
    }
    return '--°C';
  }

  /**
   * Obtiene el texto de sensación térmica
   */
  get feelsLikeText(): string {
    if (this.weatherData) {
      return `ST: ${this.weatherData.feelsLike}°C`;
    }
    return 'ST: --°C';
  }
}
