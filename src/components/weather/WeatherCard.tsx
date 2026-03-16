import { Card, CardContent } from '@/components/ui/card';
import { Droplets, Wind, CloudRain } from 'lucide-react';

interface Props {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  rainfallToday: number;
  icon: string;
}

export default function WeatherCard({ location, temperature, condition, humidity, windSpeed, rainfallToday, icon }: Props) {
  return (
    <Card className="card-agri overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{location}</p>
            <div className="flex items-end gap-2 mt-1">
              <span className="text-5xl font-display font-bold text-foreground">{temperature}°</span>
              <span className="text-lg text-muted-foreground mb-2">C</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{condition}</p>
          </div>
          <span className="text-6xl">{icon}</span>
        </div>
        <div className="flex gap-6 mt-6 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-primary-light" />
            <span className="text-sm text-muted-foreground">{humidity}%</span>
          </div>
          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4 text-primary-light" />
            <span className="text-sm text-muted-foreground">{windSpeed} km/h</span>
          </div>
          <div className="flex items-center gap-2">
            <CloudRain className="w-4 h-4 text-primary-light" />
            <span className="text-sm text-muted-foreground">{rainfallToday} mm</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
