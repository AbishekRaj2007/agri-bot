import { Link } from 'react-router-dom';
import { Leaf, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { useState } from 'react';

export default function Navbar() {
  const { t, language, setLanguage } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <Leaf className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-foreground">AgriShield</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            {t('home')}
          </Link>
          <Link to="/dashboard/chat" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            {t('chat')}
          </Link>
          <Link to="/dashboard/weather" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            {t('weather')}
          </Link>
          <Link to="/dashboard/crops" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            {t('crops')}
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
          >
            {language === 'en' ? 'हिंदी' : 'EN'}
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/auth">{t('login')}</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/auth">{t('getStarted')}</Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background p-4 space-y-3 animate-fade-in">
          <Link to="/" className="block py-2 text-sm" onClick={() => setMobileOpen(false)}>{t('home')}</Link>
          <Link to="/dashboard/chat" className="block py-2 text-sm" onClick={() => setMobileOpen(false)}>{t('chat')}</Link>
          <Link to="/dashboard/weather" className="block py-2 text-sm" onClick={() => setMobileOpen(false)}>{t('weather')}</Link>
          <Link to="/dashboard/crops" className="block py-2 text-sm" onClick={() => setMobileOpen(false)}>{t('crops')}</Link>
          <div className="flex gap-2 pt-2">
            <Button asChild variant="outline" size="sm" className="flex-1">
              <Link to="/auth" onClick={() => setMobileOpen(false)}>{t('login')}</Link>
            </Button>
            <Button asChild size="sm" className="flex-1">
              <Link to="/auth" onClick={() => setMobileOpen(false)}>{t('getStarted')}</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
