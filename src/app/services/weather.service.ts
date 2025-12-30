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

interface OpenWeatherMapResponse {
  main: {
    temp: number;
    feels_like: number;
  };
  weather: Array<{
    description: string;
    id: number;
  }>;
  name: string;
}

interface WeatherAPIResponse {
  current: {
    temp_c: number;
    feelslike_c: number;
    condition: {
      text: string;
      code: number;
    };
  };
  location: {
    name: string;
    region?: string;
    country: string;
  };
}

interface AccuWeatherResponse {
  [0]: {
    Temperature: {
      Metric: {
        Value: number;
      };
    };
    RealFeelTemperature: {
      Metric: {
        Value: number;
      };
    };
    WeatherText: string;
    WeatherIcon: number;
  };
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
    let position: GeolocationPosition | null = null;

    try {
      position = await this.getCurrentPosition();
      const weatherData = await this.fetchWeatherData(position.coords.latitude, position.coords.longitude);
      this.weatherDataSubject.next(weatherData);
      this.errorSubject.next(null);
      return; // ✅ Éxito con Open-Meteo
    } catch (error) {
      console.error('Error obteniendo datos del clima con Open-Meteo:', error);
    }

    // 🔄 FALLBACK 1: Intentar wttr.in si Open-Meteo falló
    if (position) {
      try {
        console.log('🔄 Intentando API alternativa 1 (wttr.in)...');
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
          console.log('✅ Usando wttr.in exitosamente');
          this.weatherDataSubject.next(altWeatherData);
          this.errorSubject.next(null);
          return; // ✅ Éxito con wttr.in
        } else {
          console.warn('Respuesta inválida de wttr.in:', altResponse);
        }
      } catch (altError) {
        console.warn('❌ wttr.in también falló:', altError);
      }
    }

    // 🔄 FALLBACK 2: Intentar OpenWeatherMap si las anteriores fallaron
    if (position && environment.openWeatherMapApiKey) {
      try {
        console.log('🔄 Intentando API alternativa 2 (OpenWeatherMap)...');
        const weatherData = await this.fetchOpenWeatherMapData(position.coords.latitude, position.coords.longitude);
        console.log('✅ Usando OpenWeatherMap exitosamente');
        this.weatherDataSubject.next(weatherData);
        this.errorSubject.next(null);
        return; // ✅ Éxito con OpenWeatherMap
      } catch (error) {
        console.warn('❌ OpenWeatherMap también falló:', error);
      }
    } else if (position && !environment.openWeatherMapApiKey) {
      console.warn('⚠️ OpenWeatherMap API key no configurada, saltando...');
    }

    // 🔄 FALLBACK 3: Intentar WeatherAPI si las anteriores fallaron
    if (position && environment.weatherApiKey) {
      try {
        console.log('🔄 Intentando API alternativa 3 (WeatherAPI)...');
        const weatherData = await this.fetchWeatherAPIData(position.coords.latitude, position.coords.longitude);
        console.log('✅ Usando WeatherAPI exitosamente');
        this.weatherDataSubject.next(weatherData);
        this.errorSubject.next(null);
        return; // ✅ Éxito con WeatherAPI
      } catch (error) {
        console.warn('❌ WeatherAPI también falló:', error);
      }
    } else if (position && !environment.weatherApiKey) {
      console.warn('⚠️ WeatherAPI key no configurada, saltando...');
    }

    // 🔄 FALLBACK 4: Intentar AccuWeather si las anteriores fallaron
    if (position && environment.accuWeatherApiKey) {
      try {
        console.log('🔄 Intentando API alternativa 4 (AccuWeather)...');
        const weatherData = await this.fetchAccuWeatherData(position.coords.latitude, position.coords.longitude);
        console.log('✅ Usando AccuWeather exitosamente');
        this.weatherDataSubject.next(weatherData);
        this.errorSubject.next(null);
        return; // ✅ Éxito con AccuWeather
      } catch (error) {
        console.warn('❌ AccuWeather también falló:', error);
      }
    } else if (position && !environment.accuWeatherApiKey) {
      console.warn('⚠️ AccuWeather API key no configurada, saltando...');
    }

    // ❌ FALLBACK FINAL: Si todas las APIs fallaron
    console.error('Todas las APIs de clima fallaron (Open-Meteo, wttr.in, OpenWeatherMap, WeatherAPI, AccuWeather), usando datos de fallback');
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

    // Obtener datos del clima
    const weatherResponse = await this.http.get<OpenMeteoResponse>(weatherUrl).toPromise();

    // Obtener nombre de ubicación (con fallback si falla)
    let location = 'Tu ubicación';
    try {
      const geoResponse = await this.http.get<any>(geocodingUrl).toPromise();
      if (geoResponse && geoResponse.results && geoResponse.results.length > 0) {
        const place = geoResponse.results[0];
        if (place.name) {
          location = place.admin1 ? `${place.name}, ${place.admin1}` : `${place.name}, ${place.country}`;
        }
      }
    } catch (geoError) {
      // Geocoding es opcional, mantener 'Tu ubicación'
    }

    if (!weatherResponse || !weatherResponse.current) {
      throw new Error('Respuesta inválida de Open-Meteo');
    }

    const weatherData: WeatherData = {
      temperature: Math.round(weatherResponse.current.temperature_2m) || 999,
      feelsLike: Math.round(weatherResponse.current.apparent_temperature) || 999,
      description: this.getWeatherDescription(weatherResponse.current.weather_code),
      location: location,
      weatherCode: weatherResponse.current.weather_code
    };

    return weatherData;
  }

  private async fetchOpenWeatherMapData(lat: number, lon: number): Promise<WeatherData> {
    if (!environment.openWeatherMapApiKey) {
      throw new Error('OpenWeatherMap API key no configurada');
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${environment.openWeatherMapApiKey}&units=metric&lang=es`;
    const response = await this.http.get<OpenWeatherMapResponse>(url).toPromise();

    if (!response || !response.main || !response.weather || response.weather.length === 0) {
      throw new Error('Respuesta inválida de OpenWeatherMap');
    }

    return {
      temperature: Math.round(response.main.temp) || 999,
      feelsLike: Math.round(response.main.feels_like) || 999,
      description: response.weather[0].description || 'No disponible',
      location: response.name || 'Tu ubicación',
      weatherCode: response.weather[0].id || -1
    };
  }

  private async fetchWeatherAPIData(lat: number, lon: number): Promise<WeatherData> {
    if (!environment.weatherApiKey) {
      throw new Error('WeatherAPI key no configurada');
    }

    const url = `https://api.weatherapi.com/v1/current.json?key=${environment.weatherApiKey}&q=${lat},${lon}&lang=es`;
    const response = await this.http.get<WeatherAPIResponse>(url).toPromise();

    if (!response || !response.current || !response.location) {
      throw new Error('Respuesta inválida de WeatherAPI');
    }

    return {
      temperature: Math.round(response.current.temp_c) || 999,
      feelsLike: Math.round(response.current.feelslike_c) || 999,
      description: response.current.condition.text || 'No disponible',
      location: response.location.region
        ? `${response.location.name}, ${response.location.region}`
        : `${response.location.name}, ${response.location.country}`,
      weatherCode: response.current.condition.code || -1
    };
  }

  private async fetchAccuWeatherData(lat: number, lon: number): Promise<WeatherData> {
    if (!environment.accuWeatherApiKey) {
      throw new Error('AccuWeather API key no configurada');
    }

    // Primero necesitamos obtener el Location Key de AccuWeather
    const locationUrl = `https://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apikey=${environment.accuWeatherApiKey}&q=${lat},${lon}&language=es`;
    const locationResponse = await this.http.get<any>(locationUrl).toPromise();

    if (!locationResponse || !locationResponse.Key) {
      throw new Error('No se pudo obtener Location Key de AccuWeather');
    }

    const locationKey = locationResponse.Key;
    const weatherUrl = `https://dataservice.accuweather.com/currentconditions/v1/${locationKey}?apikey=${environment.accuWeatherApiKey}&language=es&details=true`;
    const weatherResponse = await this.http.get<AccuWeatherResponse>(weatherUrl).toPromise();

    if (!weatherResponse || !weatherResponse[0]) {
      throw new Error('Respuesta inválida de AccuWeather');
    }

    const current = weatherResponse[0];
    return {
      temperature: Math.round(current.Temperature.Metric.Value) || 999,
      feelsLike: Math.round(current.RealFeelTemperature.Metric.Value) || 999,
      description: current.WeatherText || 'No disponible',
      location: locationResponse.LocalizedName
        ? `${locationResponse.LocalizedName}, ${locationResponse.AdministrativeArea?.LocalizedName || ''}`
        : 'Tu ubicación',
      weatherCode: current.WeatherIcon || -1
    };
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
