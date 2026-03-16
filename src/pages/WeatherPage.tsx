import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/hooks/useLanguage';
import { useWeather } from '@/hooks/useWeather';
import WeatherCard from '@/components/weather/WeatherCard';
import ForecastRow from '@/components/weather/ForecastRow';
import {
  currentWeather as mockWeather,
  floodRisk as mockFloodRisk,
  fiveDayForecast as mockForecast,
  rainfallData as mockRainfall,
} from '@/data/mockWeather';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Loader2, AlertCircle } from 'lucide-react';

export default function WeatherPage() {
  const { t } = useLanguage();
  const { data, isLoading, isError, error, locationError, isLocating, hasApiKey } = useWeather();

  // Fall back to mock data when no API key is configured or while loading
  const currentWeather = data?.currentWeather ?? mockWeather;
  const floodRisk = data?.floodRisk ?? mockFloodRisk;
  const fiveDayForecast = data?.fiveDayForecast ?? mockForecast;
  const rainfallData = data?.rainfallData ?? mockRainfall;

  const riskColor =
    floodRisk.level === 'High'
      ? 'bg-destructive text-destructive-foreground'
      : floodRisk.level === 'Medium'
      ? 'bg-accent text-accent-foreground'
      : 'bg-primary-light text-primary-foreground';

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* API key notice */}
      {!hasApiKey && (
        <div className="rounded-2xl bg-muted/60 border border-border px-6 py-4 flex items-start gap-3 text-sm text-muted-foreground">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>
            Live weather is disabled. Add your{' '}
            <a
              href="https://openweathermap.org/api"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-primary"
            >
              OpenWeatherMap API key
            </a>{' '}
            to <code className="text-xs bg-muted rounded px-1">.env.local</code> to enable it.
            Showing demo data.
          </span>
        </div>
      )}

      {/* Location / fetch status */}
      {hasApiKey && isLocating && (
        <div className="rounded-2xl bg-muted/60 border border-border px-6 py-4 flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Detecting your location…
        </div>
      )}

      {hasApiKey && locationError && (
        <div className="rounded-2xl bg-muted/60 border border-border px-6 py-4 flex items-start gap-3 text-sm text-muted-foreground">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          {locationError}
        </div>
      )}

      {hasApiKey && isLoading && !isLocating && (
        <div className="rounded-2xl bg-muted/60 border border-border px-6 py-4 flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Fetching live weather…
        </div>
      )}

      {hasApiKey && isError && (
        <div className="rounded-2xl bg-destructive/10 border border-destructive/20 px-6 py-4 flex items-start gap-3 text-sm text-destructive">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          {(error as Error)?.message ?? 'Failed to load weather data. Showing demo data.'}
        </div>
      )}

      {/* Alert banner */}
      {floodRisk.level !== 'Low' && (
        <div className="rounded-2xl bg-accent-warm/15 border border-accent-warm/30 px-6 py-4 text-sm text-foreground">
          {t('alertBanner')}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Weather */}
        <div>
          <h2 className="font-display text-xl font-semibold mb-4">{t('currentWeather')}</h2>
          <WeatherCard {...currentWeather} />
        </div>

        {/* Flood Risk */}
        <div>
          <h2 className="font-display text-xl font-semibold mb-4">{t('floodRiskAssessment')}</h2>
          <Card className="card-agri">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-sm text-muted-foreground">Risk Level:</span>
                <Badge className={`rounded-full border-0 ${riskColor}`}>{floodRisk.level}</Badge>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden mb-4">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width:
                      floodRisk.level === 'High'
                        ? '90%'
                        : floodRisk.level === 'Medium'
                        ? '55%'
                        : '20%',
                    background:
                      floodRisk.level === 'High'
                        ? 'hsl(0, 84%, 60%)'
                        : floodRisk.level === 'Medium'
                        ? 'hsl(29, 87%, 67%)'
                        : 'hsl(152, 39%, 52%)',
                  }}
                />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {floodRisk.description}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 5-Day Forecast */}
      <div>
        <h2 className="font-display text-xl font-semibold mb-4">{t('fiveDayForecast')}</h2>
        <ForecastRow days={fiveDayForecast} />
      </div>

      {/* Precipitation Chart */}
      <Card className="card-agri">
        <CardHeader>
          <CardTitle className="font-display text-lg">{t('precipitation')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rainfallData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} unit=" mm" />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.75rem',
                  }}
                />
                <Bar dataKey="rainfall" fill="hsl(var(--primary-light))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
