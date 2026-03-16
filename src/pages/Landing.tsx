import { Link } from 'react-router-dom';
import { Bot, AlertTriangle, Sprout, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import Navbar from '@/components/layout/Navbar';
import { useLanguage } from '@/hooks/useLanguage';
import heroImage from '@/assets/hero-paddy.jpg';

const WaveDivider = () => (
  <svg viewBox="0 0 1440 80" className="w-full -mb-1 block" preserveAspectRatio="none">
    <path
      fill="hsl(var(--background))"
      d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,50 1440,40 L1440,80 L0,80 Z"
    />
  </svg>
);

export default function Landing() {
  const { t } = useLanguage();

  const features = [
    { icon: Bot, title: t('featAiTitle'), desc: t('featAiDesc') },
    { icon: AlertTriangle, title: t('featFloodTitle'), desc: t('featFloodDesc') },
    { icon: Sprout, title: t('featCropTitle'), desc: t('featCropDesc') },
    { icon: TrendingUp, title: t('featMarketTitle'), desc: t('featMarketDesc') },
  ];

  const testimonials = [
    {
      quote: 'AgriShield warned me 4 days before the flood. I saved my entire kharif harvest.',
      name: 'Ramesh Kumar',
      region: 'Haryana',
      initials: 'RK',
    },
    {
      quote: 'The AI told me exactly which variety to plant after the flood receded.',
      name: 'Meena Devi',
      region: 'West Bengal',
      initials: 'MD',
    },
    {
      quote: 'I never knew about PM Fasal Bima until AgriShield told me.',
      name: 'Suresh Patel',
      region: 'Gujarat',
      initials: 'SP',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden grain-overlay">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(153,42%,18%,0.85)] to-[hsl(152,39%,52%,0.6)]" />
        <div className="relative z-10 container mx-auto px-4 py-24 md:py-36 text-center">
          <Badge className="mb-6 rounded-full bg-accent text-accent-foreground border-0 px-4 py-1.5 text-sm font-medium">
            {t('trustBadge')}
          </Badge>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-[hsl(50,89%,94%)] max-w-4xl mx-auto leading-tight">
            {t('heroTitle')}
          </h1>
          <p className="mt-6 text-lg md:text-xl text-[hsl(50,89%,94%,0.85)] max-w-2xl mx-auto">
            {t('heroSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <Button asChild size="lg" className="text-base px-8 rounded-full">
              <Link to="/auth">{t('getStarted')}</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base px-8 rounded-full border-[hsl(50,89%,94%,0.4)] text-[hsl(50,89%,94%)] hover:bg-[hsl(50,89%,94%,0.1)]">
              <Link to="/">{t('watchDemo')}</Link>
            </Button>
          </div>
        </div>
        <WaveDivider />
      </section>

      {/* Features */}
      <section className="py-20 container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <Card key={f.title} className="card-agri hover:glow-green transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Impact Stats */}
      <section className="bg-primary py-12">
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '40%', label: t('statLoss') },
            { value: '30%', label: t('statYield') },
            { value: '10,000+', label: t('statFarmers') },
            { value: '₹25,000', label: t('statSavings') },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl md:text-4xl font-display font-bold text-primary-foreground">{s.value}</p>
              <p className="text-sm text-primary-foreground/70 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 container mx-auto px-4">
        <h2 className="font-display text-3xl font-bold text-center text-foreground mb-12">
          Trusted by Farmers Across India
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((tm) => (
            <Card key={tm.name} className="card-agri">
              <CardContent className="p-6">
                <p className="text-foreground italic leading-relaxed">"{tm.quote}"</p>
                <div className="flex items-center gap-3 mt-6">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                    {tm.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{tm.name}</p>
                    <p className="text-xs text-muted-foreground">{tm.region}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <Sprout className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-bold text-primary-foreground">AgriShield</span>
            </div>
            <nav className="flex gap-6">
              {[
                { label: t('home'), to: '/' },
                { label: t('chat'), to: '/dashboard/chat' },
                { label: t('weather'), to: '/dashboard/weather' },
                { label: t('crops'), to: '/dashboard/crops' },
              ].map((link) => (
                <Link key={link.to} to={link.to} className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  {link.label}
                </Link>
              ))}
            </nav>
            <p className="text-sm text-primary-foreground/60">{t('footerTagline')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
