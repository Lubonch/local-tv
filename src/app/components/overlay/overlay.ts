import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClockService } from '../../services/clock.service';
import { WeatherService, WeatherData } from '../../services/weather.service';
import { WeatherIconComponent } from '../weather-icon/weather-icon';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-overlay',
  imports: [CommonModule, WeatherIconComponent],
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
    private weatherService: WeatherService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.clockService.start();
    this.clockSubscription = this.clockService.currentTime$.subscribe(time => {
      this.currentTime = time;
      this.cdr.markForCheck();
    });

    this.weatherService.startWeatherUpdates();
    this.weatherSubscription = this.weatherService.weatherData$.subscribe(data => {
      this.weatherData = data;
      this.cdr.markForCheck();
    });

    this.weatherErrorSubscription = this.weatherService.error$.subscribe(error => {
      this.weatherError = error;
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.clockService.stop();
    this.weatherService.stopWeatherUpdates();

    this.clockSubscription?.unsubscribe();
    this.weatherSubscription?.unsubscribe();
    this.weatherErrorSubscription?.unsubscribe();
  }

  get formattedTime(): string {
    return this.clockService.formatTime(this.currentTime, false);
  }

  get temperatureText(): string {
    if (this.weatherData) {
      if (this.weatherData.temperature === 999) {
        return '🔥 999°C';
      }
      return `${this.weatherData.temperature}°C`;
    }
    return '--°C';
  }

  get feelsLikeText(): string {
    if (this.weatherData) {
      if (this.weatherData.feelsLike === 999) {
        return '🔥 ST: 999°C';
      }
      return `ST: ${this.weatherData.feelsLike}°C`;
    }
    return 'ST: --°C';
  }
}
