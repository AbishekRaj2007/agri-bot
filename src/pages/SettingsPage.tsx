import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/use-toast';
import {
  User,
  Tractor,
  Bell,
  Sliders,
  Sun,
  Moon,
  Check,
  Info,
} from 'lucide-react';

interface ToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
}

function ToggleRow({ label, description, checked, onToggle }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-border last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <button
        onClick={onToggle}
        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
          checked ? 'bg-primary' : 'bg-muted'
        }`}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const { t, language, setLanguage } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const { toast } = useToast();

  const [profile, setProfile] = useState({
    name: 'Ramesh Kumar',
    phone: '+91 98765 43210',
    state: 'Haryana',
    village: 'Karnal',
  });

  const [farm, setFarm] = useState({
    landArea: '4.5',
    primaryCrops: 'Wheat, Rice, Mustard',
    irrigationType: 'Canal + Borewell',
  });

  const [notifications, setNotifications] = useState({
    weatherAlerts: true,
    marketUpdates: true,
    schemeAlerts: false,
  });

  function handleSave() {
    toast({
      title: 'Settings saved',
      description: 'Your profile and preferences have been updated.',
    });
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="font-display text-2xl font-bold">{t('settingsTitle')}</h1>

      {/* Profile */}
      <Card className="card-agri">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            {t('profileSection')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {t('fullName')}
              </label>
              <Input
                value={profile.name}
                onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {t('phone')}
              </label>
              <Input
                value={profile.phone}
                onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {t('state')}
              </label>
              <select
                value={profile.state}
                onChange={(e) => setProfile((p) => ({ ...p, state: e.target.value }))}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {['Haryana', 'Uttar Pradesh', 'Gujarat', 'Punjab', 'West Bengal', 'Maharashtra', 'Rajasthan', 'Madhya Pradesh'].map(
                  (s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ),
                )}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {t('village')}
              </label>
              <Input
                value={profile.village}
                onChange={(e) => setProfile((p) => ({ ...p, village: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Farm Details */}
      <Card className="card-agri">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base flex items-center gap-2">
            <Tractor className="w-4 h-4 text-primary" />
            {t('farmDetails')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {t('landArea')}
              </label>
              <Input
                type="number"
                min="0"
                step="0.5"
                value={farm.landArea}
                onChange={(e) => setFarm((f) => ({ ...f, landArea: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {t('irrigationType')}
              </label>
              <select
                value={farm.irrigationType}
                onChange={(e) => setFarm((f) => ({ ...f, irrigationType: e.target.value }))}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {[
                  'Canal + Borewell',
                  'Drip Irrigation',
                  'Sprinkler',
                  'Rain-fed',
                  'Borewell only',
                  'Canal only',
                ].map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {t('primaryCropsField')}
              </label>
              <Input
                value={farm.primaryCrops}
                onChange={(e) => setFarm((f) => ({ ...f, primaryCrops: e.target.value }))}
                placeholder="e.g. Wheat, Rice, Mustard"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card className="card-agri">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base flex items-center gap-2">
            <Sliders className="w-4 h-4 text-primary" />
            {t('preferencesSection')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Language */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{t('prefLanguage')}</p>
              <p className="text-xs text-muted-foreground mt-0.5">App display language</p>
            </div>
            <div className="flex gap-2">
              <Badge
                className="cursor-pointer rounded-full"
                variant={language === 'en' ? 'default' : 'outline'}
                onClick={() => setLanguage('en')}
              >
                English
              </Badge>
              <Badge
                className="cursor-pointer rounded-full"
                variant={language === 'hi' ? 'default' : 'outline'}
                onClick={() => setLanguage('hi')}
              >
                हिंदी
              </Badge>
            </div>
          </div>

          {/* Theme */}
          <div className="flex items-center justify-between border-t border-border pt-4">
            <div>
              <p className="text-sm font-medium">{isDark ? t('lightMode') : t('darkMode')}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Toggle app theme</p>
            </div>
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/70 transition-colors"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="card-agri">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            {t('notificationsSection')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ToggleRow
            label={t('weatherAlerts')}
            description="Rain forecasts and flood risk warnings"
            checked={notifications.weatherAlerts}
            onToggle={() =>
              setNotifications((n) => ({ ...n, weatherAlerts: !n.weatherAlerts }))
            }
          />
          <ToggleRow
            label={t('marketUpdates')}
            description="Daily commodity price changes"
            checked={notifications.marketUpdates}
            onToggle={() =>
              setNotifications((n) => ({ ...n, marketUpdates: !n.marketUpdates }))
            }
          />
          <ToggleRow
            label={t('schemeAlerts')}
            description="New government scheme announcements"
            checked={notifications.schemeAlerts}
            onToggle={() =>
              setNotifications((n) => ({ ...n, schemeAlerts: !n.schemeAlerts }))
            }
          />
        </CardContent>
      </Card>

      {/* App Info */}
      <Card className="card-agri">
        <CardContent className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Info className="w-4 h-4" />
            <span>AgriShield</span>
            <Badge variant="outline" className="rounded-full text-xs">
              v1.0.0
            </Badge>
          </div>
          <span className="text-xs text-muted-foreground">Made for Indian Farmers 🌾</span>
        </CardContent>
      </Card>

      {/* Save */}
      <Button className="w-full" size="lg" onClick={handleSave}>
        <Check className="w-4 h-4 mr-2" />
        {t('saveChanges')}
      </Button>
    </div>
  );
}
