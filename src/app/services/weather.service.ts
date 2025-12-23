import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { environment } from '../../environments/environment';

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  description: string;
  location: string;
  icon: string;
}

interface OpenWeatherResponse {
  main: {
    temp: number;
    feels_like: number;
  };
  weather: Array<{
    description: string;
    icon: string;
  }>;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private weatherDataSubject = new BehaviorSubject<WeatherData | null>(null);
  public weatherData$: Observable<WeatherData | null> = this.weatherDataSubject.asObservable();

  private errorSubject = new BehaviorSubject<string | null>(null);
  public error$: Observable<string | null> = this.errorSubject.asObservable();

  private updateInterval: any;

  constructor(private http: HttpClient) { }

  /**
   * Inicia la obtención de datos del clima
   */
  async startWeatherUpdates(): Promise<void> {
    // Obtener datos inmediatamente
    await this.updateWeather();

    // Configurar actualización periódica
    this.updateInterval = setInterval(() => {
      this.updateWeather();
    }, environment.weatherUpdateInterval);
  }

  /**
   * Actualiza los datos del clima
   */
  private async updateWeather(): Promise<void> {
    try {
      const position = await this.getCurrentPosition();
      const weatherData = await this.fetchWeatherData(position.coords.latitude, position.coords.longitude);
      this.weatherDataSubject.next(weatherData);
      this.errorSubject.next(null);
    } catch (error) {
      console.error('Error obteniendo datos del clima:', error);
      this.errorSubject.next('No se pudo obtener el clima');
    }
  }

  /**
   * Obtiene la posición actual del usuario
   */
  private getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalización no soportada'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => reject(error),
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000 // 5 minutos
        }
      );
    });
  }

  /**
   * Obtiene los datos del clima desde OpenWeatherMap API
   */
  private fetchWeatherData(lat: number, lon: number): Promise<WeatherData> {
    const url = `${environment.weatherApiUrl}?lat=${lat}&lon=${lon}&units=metric&lang=es&appid=${environment.openWeatherMapApiKey}`;

    return new Promise((resolve, reject) => {
      this.http.get<OpenWeatherResponse>(url).subscribe({
        next: (response) => {
          const weatherData: WeatherData = {
            temperature: Math.round(response.main.temp),
            feelsLike: Math.round(response.main.feels_like),
            description: response.weather[0].description,
            location: response.name,
            icon: response.weather[0].icon
          };
          resolve(weatherData);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }

  /**
   * Detiene las actualizaciones automáticas
   */
  stopWeatherUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Obtiene los datos del clima actuales
   */
  getCurrentWeatherData(): WeatherData | null {
    return this.weatherDataSubject.value;
  }
}
