import type { WeatherDay } from '@/data/mockWeather';

interface Props {
  days: WeatherDay[];
}

export default function ForecastRow({ days }: Props) {
  return (
    <div className="grid grid-cols-5 gap-3">
      {days.map((day) => (
        <div
          key={day.day}
          className="card-agri flex flex-col items-center p-4 text-center"
        >
          <span className="text-sm font-medium text-muted-foreground">{day.day}</span>
          <span className="text-3xl my-2">{day.icon}</span>
          <div className="text-sm">
            <span className="font-semibold text-foreground">{day.high}°</span>
            <span className="text-muted-foreground"> / {day.low}°</span>
          </div>
          <div className="w-full mt-3">
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary-light transition-all"
                style={{ width: `${day.rainProbability}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground mt-1">{day.rainProbability}% rain</span>
          </div>
        </div>
      ))}
    </div>
  );
}
