export const environment = {
  production: true,
  weatherUpdateInterval: 300000,
  weatherApiUrl: 'https://api.open-meteo.com/v1/forecast',

  // API Keys para servicios de clima adicionales (obtener gratis en sus sitios web)
  openWeatherMapApiKey: '', // Obtener en https://openweathermap.org/api (1,000 consultas/día gratis)
  weatherApiKey: '', // Obtener en https://www.weatherapi.com/ (1 millón de consultas/mes gratis)
  accuWeatherApiKey: '' // Obtener en https://developer.accuweather.com/ (límite generoso gratis)
};
