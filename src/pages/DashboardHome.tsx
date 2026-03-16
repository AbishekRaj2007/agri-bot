import { Link } from 'react-router-dom';
import {
  Cloud,
  AlertTriangle,
  Sprout,
  CalendarDays,
  MessageCircle,
  BarChart,
  FileText,
  Sun,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/hooks/useLanguage';
import { useWeather } from '@/hooks/useWeather';

export default function DashboardHome() {
  const { t } = useLanguage();
  const { data: weatherData } = useWeather();

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const weatherValue = weatherData
    ? `${weatherData.currentWeather.temperature}°C, ${weatherData.currentWeather.condition}`
    : '28°C, Cloudy';
  const weatherSub = weatherData?.currentWeather.location ?? 'Karnal, Haryana';
  const floodRiskValue = weatherData?.floodRisk.level ?? 'Medium';

  const quickStats = [
    {
      icon: Cloud,
      label: t('todayWeather'),
      value: weatherValue,
      sub: weatherSub,
    },
    {
      icon: AlertTriangle,
      label: t('floodRisk'),
      value: floodRiskValue,
      badge: true,
    },
    {
      icon: Sprout,
      label: t('activeCrops'),
      value: '3',
      sub: 'Swarna Sub-1, HD 3226, Okra',
    },
    {
      icon: CalendarDays,
      label: t('nextPlanting'),
      value: 'Oct 15',
      sub: 'Rabi Season Wheat',
    },
  ];

  const quickActions = [
    { icon: MessageCircle, label: t('chatWithAi'), to: '/dashboard/chat', color: 'bg-primary/10 text-primary' },
    { icon: Sun, label: t('viewForecast'), to: '/dashboard/weather', color: 'bg-accent/20 text-accent-foreground' },
    { icon: Sprout, label: t('browseCrops'), to: '/dashboard/crops', color: 'bg-primary-light/20 text-primary' },
    { icon: BarChart, label: t('marketPrices'), to: '/dashboard/market', color: 'bg-accent-warm/20 text-accent-foreground' },
    { icon: CalendarDays, label: t('plantingCalendar'), to: '/dashboard', color: 'bg-primary/10 text-primary' },
    { icon: FileText, label: t('govSchemes'), to: '/dashboard/schemes', color: 'bg-accent/20 text-accent-foreground' },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">{t('greeting')}</h1>
        <p className="text-muted-foreground mt-1">{today}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat) => (
          <Card key={stat.label} className="card-agri">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
              {stat.badge ? (
                <Badge className="rounded-full bg-accent text-accent-foreground border-0">
                  {stat.value}
                </Badge>
              ) : (
                <p className="text-xl font-display font-bold text-foreground">{stat.value}</p>
              )}
              {stat.sub && (
                <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="font-display text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Link key={action.label} to={action.to}>
              <Card className="card-agri hover:glow-green transition-shadow cursor-pointer">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${action.color}`}>
                    <action.icon className="w-6 h-6" />
                  </div>
                  <span className="font-medium text-sm text-foreground">{action.label}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
