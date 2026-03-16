import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { WeatherDay, RainfallDay } from '@/data/mockWeather';

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getWeatherEmoji(id: number): string {
  if (id >= 200 && id < 300) return '⛈️';
  if (id >= 300 && id < 400) return '🌦️';
  if (id >= 500 && id < 520) return '🌧️';
  if (id >= 520 && id < 600) return '🌧️';
  if (id >= 600 && id < 700) return '❄️';
  if (id >= 700 && id < 800) return '🌫️';
  if (id === 800) return '☀️';
  if (id === 801) return '🌤️';
  if (id === 802) return '⛅';
  if (id >= 803) return '☁️';
  return '🌡️';
}

function capitalize(str: string) {
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

type FloodRiskLevel = 'Low' | 'Medium' | 'High';

function computeFloodRisk(forecastList: OWMForecastItem[]): {
  level: FloodRiskLevel;
  description: string;
} {
  const next48 = forecastList.slice(0, 16); // 16 × 3 h = 48 h
  const totalRain = next48.reduce((sum, item) => sum + (item.rain?.['3h'] ?? 0), 0);

  if (totalRain > 50) {
    return {
      level: 'High',
      description: `Heavy rainfall of ${totalRain.toFixed(1)} mm expected in the next 48 hours. Protect crops and monitor drainage channels closely.`,
    };
  }
  if (totalRain > 15) {
    return {
      level: 'Medium',
      description: `Moderate rainfall of ${totalRain.toFixed(1)} mm expected in the next 48 hours. Monitor local drainage and keep harvesting equipment ready.`,
    };
  }
  return {
    level: 'Low',
    description: `Low rainfall of ${totalRain.toFixed(1)} mm expected in the next 48 hours. Conditions are favourable for field operations.`,
  };
}

// ---------- OpenWeatherMap response shapes ----------

interface OWMWeatherItem {
  id: number;
  description: string;
}

interface OWMCurrentResponse {
  name: string;
  sys: { country: string };
  main: { temp: number; humidity: number };
  weather: OWMWeatherItem[];
  wind: { speed: number };
  rain?: { '1h'?: number };
}

interface OWMForecastItem {
  dt_txt: string;
  main: { temp_max: number; temp_min: number };
  weather: OWMWeatherItem[];
  pop?: number;
  rain?: { '3h'?: number };
}

interface OWMForecastResponse {
  list: OWMForecastItem[];
}

// ---------- fetch helper ----------

async function fetchWeatherData(lat: number, lon: number) {
  const base = 'https://api.openweathermap.org/data/2.5';
  const params = `lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

  const [currentRes, forecastRes] = await Promise.all([
    fetch(`${base}/weather?${params}`),
    fetch(`${base}/forecast?${params}`),
  ]);

  if (!currentRes.ok || !forecastRes.ok) {
    throw new Error('Failed to fetch weather data from OpenWeatherMap');
  }

  const [current, forecast]: [OWMCurrentResponse, OWMForecastResponse] = await Promise.all([
    currentRes.json(),
    forecastRes.json(),
  ]);

  // Current weather
  const currentWeather = {
    location: `${current.name}, ${current.sys.country}`,
    temperature: Math.round(current.main.temp),
    condition: capitalize(current.weather[0].description),
    humidity: current.main.humidity,
    windSpeed: Math.round(current.wind.speed * 3.6), // m/s → km/h
    rainfallToday: current.rain?.['1h'] ?? 0,
    icon: getWeatherEmoji(current.weather[0].id),
  };

  // Group forecast items by calendar date
  const dayMap = new Map<string, OWMForecastItem[]>();
  for (const item of forecast.list) {
    const date = item.dt_txt.split(' ')[0];
    if (!dayMap.has(date)) dayMap.set(date, []);
    dayMap.get(date)!.push(item);
  }

  // 5-day forecast (one entry per day)
  const fiveDayForecast: WeatherDay[] = Array.from(dayMap.entries())
    .slice(0, 5)
    .map(([dateStr, items]) => {
      const date = new Date(dateStr);
      const maxTemp = Math.round(Math.max(...items.map((i) => i.main.temp_max)));
      const minTemp = Math.round(Math.min(...items.map((i) => i.main.temp_min)));
      const midItem =
        items.find((i) => i.dt_txt.includes('12:00:00')) ?? items[Math.floor(items.length / 2)];
      const maxPop = Math.round(Math.max(...items.map((i) => (i.pop ?? 0) * 100)));
      return {
        day: DAYS[date.getDay()],
        high: maxTemp,
        low: minTemp,
        condition: capitalize(midItem.weather[0].description),
        icon: getWeatherEmoji(midItem.weather[0].id),
        rainProbability: maxPop,
      };
    });

  // Rainfall chart — daily totals
  const rainfallData: RainfallDay[] = Array.from(dayMap.entries())
    .slice(0, 7)
    .map(([dateStr, items]) => {
      const date = new Date(dateStr);
      const dailyRain = items.reduce((sum, i) => sum + (i.rain?.['3h'] ?? 0), 0);
      return {
        day: DAYS[date.getDay()],
        rainfall: parseFloat(dailyRain.toFixed(1)),
      };
    });

  const floodRisk = computeFloodRisk(forecast.list);

  return { currentWeather, fiveDayForecast, rainfallData, floodRisk };
}

// ---------- hook ----------

export function useWeather() {
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported — using default location.');
      setCoords({ lat: 29.6857, lon: 76.9905 }); // Karnal, Haryana fallback
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => {
        setLocationError('Location access denied — using default location.');
        setCoords({ lat: 29.6857, lon: 76.9905 });
      },
    );
  }, []);

  const hasApiKey = !!API_KEY && API_KEY !== 'your_openweathermap_api_key_here';

  const query = useQuery({
    queryKey: ['weather', coords?.lat, coords?.lon],
    queryFn: () => fetchWeatherData(coords!.lat, coords!.lon),
    enabled: !!coords && hasApiKey,
    staleTime: 1000 * 60 * 15, // cache for 15 minutes
    retry: 1,
  });

  return {
    ...query,
    locationError,
    isLocating: !coords,
    hasApiKey,
  };
}
