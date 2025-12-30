import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { environment } from '../../environments/environment';

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  description: string;
  location: string;
  weatherCode: number;
}

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

  async startWeatherUpdates(): Promise<void> {
    await this.updateWeather();

    this.updateInterval = setInterval(() => {
      this.updateWeather();
    }, environment.weatherUpdateInterval);
  }

  private async updateWeather(): Promise<void> {
    try {
      const position = await this.getCurrentPosition();
      const weatherData = await this.fetchWeatherData(position.coords.latitude, position.coords.longitude);
      this.weatherDataSubject.next(weatherData);
      this.errorSubject.next(null);
    } catch (error) {
      console.error('Error obteniendo datos del clima:', error);

      // Intentar API alternativa antes de fallback
      try {
        console.log('Intentando API alternativa (wttr.in)...');
        const position = await this.getCurrentPosition();
        const altWeatherUrl = `https://wttr.in/${position.coords.latitude},${position.coords.longitude}?format=j1&lang=es`;
        const altResponse = await this.http.get<any>(altWeatherUrl).toPromise();

        if (altResponse && altResponse.current_condition && altResponse.current_condition.length > 0) {
          const current = altResponse.current_condition[0];
          const altWeatherData: WeatherData = {
            temperature: parseInt(current.temp_C) || 999,
            feelsLike: parseInt(current.FeelsLikeC) || parseInt(current.temp_C) || 999,
            description: current.weatherDesc?.[0]?.value || 'No disponible',
            location: altResponse.nearest_area?.[0]?.areaName?.[0]?.value || 'Tu ubicación',
            weatherCode: -1
          };
          console.log('✅ Usando API alternativa exitosamente');
          this.weatherDataSubject.next(altWeatherData);
          this.errorSubject.next(null);
          return;
        }
      } catch (altError) {
        console.warn('API alternativa también falló:', altError);
      }

      // Fallback final
      const fallbackData: WeatherData = {
        temperature: 999,
        feelsLike: 999,
        description: 'Servicio temporalmente no disponible',
        location: 'Tu ubicación',
        weatherCode: -1
      };
      this.weatherDataSubject.next(fallbackData);
      this.errorSubject.next(null);
    }
  }

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
          maximumAge: 300000
        }
      );
    });
  }

  private async fetchWeatherData(lat: number, lon: number): Promise<WeatherData> {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,weather_code&timezone=auto`;
    const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?latitude=${lat}&longitude=${lon}&count=1&language=es&format=json`;

    try {
      const weatherResponse = await this.http.get<OpenMeteoResponse>(weatherUrl).toPromise();

      let location = 'Tu ubicación';
      try {
        const geoResponse = await this.http.get<any>(geocodingUrl).toPromise();
        if (geoResponse && geoResponse.results && geoResponse.results.length > 0) {
          const place = geoResponse.results[0];
          if (place.name) {
            location = place.admin1 ? `${place.name}, ${place.admin1}` : `${place.name}, ${place.country}`;
          } else {
            console.warn('Respuesta de geocoding sin campo name:', place);
            location = place.country || 'Ubicación desconocida';
          }
        } else {
          console.warn('No se encontraron resultados de geocoding para las coordenadas');
        }
      } catch (geoError) {
        console.warn('No se pudo obtener nombre de ubicación:', geoError);
        // Mantener 'Tu ubicación' como fallback
      }

      if (!weatherResponse || !weatherResponse.current) {
        throw new Error('Respuesta inválida de la API del clima');
      }

      const weatherData: WeatherData = {
        temperature: Math.round(weatherResponse.current.temperature_2m) || 999,
        feelsLike: Math.round(weatherResponse.current.apparent_temperature) || 999,
        description: this.getWeatherDescription(weatherResponse.current.weather_code),
        location: location,
        weatherCode: weatherResponse.current.weather_code
      };

      return weatherData;
    } catch (error) {
      console.error('Error obteniendo datos del clima:', error);

      const fallbackData: WeatherData = {
        temperature: 999,
        feelsLike: 999,
        description: 'No disponible',
        location: 'Tu ubicación',
        weatherCode: -1
      };

      return fallbackData;
    }
  }

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

  stopWeatherUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  getCurrentWeatherData(): WeatherData | null {
    return this.weatherDataSubject.value;
  }
}
