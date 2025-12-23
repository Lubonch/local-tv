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

// Respuesta de Open-Meteo (sin API key requerida)
interface OpenMeteoResponse {
  current: {
    temperature_2m: number;
    apparent_temperature: number;
    weather_code: number;
  };
  current_units: {
    temperature_2m: string;
  };
}

// Respuesta de geocoding inverso para obtener nombre de ubicación
interface ReverseGeocodingResponse {
  results?: Array<{
    name: string;
    admin1?: string;
    country: string;
  }>;
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
   * Obtiene los datos del clima desde Open-Meteo API (sin API key requerida)
   */
  private async fetchWeatherData(lat: number, lon: number): Promise<WeatherData> {
    // Open-Meteo API - Completamente gratuito, sin API key
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,weather_code&timezone=auto`;
    const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?latitude=${lat}&longitude=${lon}&count=1&language=es&format=json`;

    try {
      // Obtener datos del clima
      const weatherResponse = await this.http.get<OpenMeteoResponse>(weatherUrl).toPromise();

      // Obtener nombre de la ubicación
      let location = 'Tu ubicación';
      try {
        const geoResponse = await this.http.get<ReverseGeocodingResponse>(geocodingUrl).toPromise();
        if (geoResponse && geoResponse.results && geoResponse.results.length > 0) {
          const place = geoResponse.results[0];
          location = place.admin1 ? `${place.name}, ${place.admin1}` : `${place.name}, ${place.country}`;
        }
      } catch (geoError) {
        console.warn('No se pudo obtener nombre de ubicación:', geoError);
      }

      if (!weatherResponse || !weatherResponse.current) {
        throw new Error('Respuesta inválida de la API del clima');
      }

      const weatherData: WeatherData = {
        temperature: Math.round(weatherResponse.current.temperature_2m),
        feelsLike: Math.round(weatherResponse.current.apparent_temperature),
        description: this.getWeatherDescription(weatherResponse.current.weather_code),
        location: location,
        icon: this.getWeatherIcon(weatherResponse.current.weather_code)
      };

      return weatherData;
    } catch (error) {
      console.error('Error obteniendo datos del clima:', error);
      throw error;
    }
  }

  /**
   * Convierte el código WMO en descripción del clima
   * https://open-meteo.com/en/docs
   */
  private getWeatherDescription(code: number): string {
    const descriptions: { [key: number]: string } = {
      0: 'Despejado',
      1: 'Mayormente despejado',
      2: 'Parcialmente nublado',
      3: 'Nublado',
      45: 'Niebla',
      48: 'Niebla helada',
      51: 'Llovizna ligera',
      53: 'Llovizna moderada',
      55: 'Llovizna densa',
      61: 'Lluvia ligera',
      63: 'Lluvia moderada',
      65: 'Lluvia intensa',
      71: 'Nevada ligera',
      73: 'Nevada moderada',
      75: 'Nevada intensa',
      77: 'Granizo',
      80: 'Chubascos ligeros',
      81: 'Chubascos moderados',
      82: 'Chubascos violentos',
      85: 'Nieve ligera',
      86: 'Nieve intensa',
      95: 'Tormenta',
      96: 'Tormenta con granizo ligero',
      99: 'Tormenta con granizo intenso'
    };
    return descriptions[code] || 'Desconocido';
  }

  /**
   * Convierte el código WMO en un icono simple
   */
  private getWeatherIcon(code: number): string {
    if (code === 0) return '☀️';
    if (code <= 3) return '⛅';
    if (code <= 48) return '🌫️';
    if (code <= 55) return '🌦️';
    if (code <= 65) return '🌧️';
    if (code <= 77) return '❄️';
    if (code <= 82) return '🌧️';
    if (code <= 86) return '🌨️';
    return '⛈️';
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
