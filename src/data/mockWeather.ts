export interface WeatherDay {
  day: string;
  high: number;
  low: number;
  condition: string;
  icon: string;
  rainProbability: number;
}

export interface RainfallDay {
  day: string;
  rainfall: number;
}

export const currentWeather = {
  location: 'Karnal, Haryana',
  temperature: 28,
  condition: 'Partly Cloudy',
  humidity: 72,
  windSpeed: 14,
  rainfallToday: 2.5,
  icon: '⛅',
};

export const floodRisk = {
  level: 'Medium' as 'Low' | 'Medium' | 'High',
  description: 'Moderate rainfall expected over the next 48 hours. River water levels are rising in the Yamuna basin. Monitor local drainage and keep harvesting equipment ready.',
};

export const fiveDayForecast: WeatherDay[] = [
  { day: 'Mon', high: 30, low: 22, condition: 'Sunny', icon: '☀️', rainProbability: 10 },
  { day: 'Tue', high: 29, low: 23, condition: 'Cloudy', icon: '☁️', rainProbability: 40 },
  { day: 'Wed', high: 27, low: 22, condition: 'Rain', icon: '🌧️', rainProbability: 80 },
  { day: 'Thu', high: 26, low: 21, condition: 'Heavy Rain', icon: '⛈️', rainProbability: 90 },
  { day: 'Fri', high: 28, low: 22, condition: 'Partly Cloudy', icon: '⛅', rainProbability: 30 },
];

export const rainfallData: RainfallDay[] = [
  { day: 'Sun', rainfall: 5 },
  { day: 'Mon', rainfall: 12 },
  { day: 'Tue', rainfall: 8 },
  { day: 'Wed', rainfall: 25 },
  { day: 'Thu', rainfall: 45 },
  { day: 'Fri', rainfall: 32 },
  { day: 'Sat', rainfall: 18 },
];
