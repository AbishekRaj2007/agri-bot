import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';

export default function Auth() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: mode === 'login' ? 'Welcome back!' : 'Account created!',
      description: 'Redirecting to dashboard...',
    });
    setTimeout(() => navigate('/dashboard'), 800);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Panel */}
      <div className="hidden md:flex md:w-1/2 bg-primary relative overflow-hidden items-center justify-center p-12 grain-overlay">
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 400 400" className="w-full h-full">
            <path d="M200,50 Q250,100 200,150 Q150,200 200,250 Q250,300 200,350" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary-foreground" />
            <path d="M100,100 Q150,150 100,200 Q50,250 100,300" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary-foreground" />
            <path d="M300,80 Q350,130 300,180 Q250,230 300,280" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary-foreground" />
          </svg>
        </div>
        <div className="relative z-10 text-center max-w-md">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary-foreground/20 flex items-center justify-center mb-6">
            <Leaf className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="font-display text-4xl font-bold text-primary-foreground mb-4">AgriShield</h1>
          <p className="text-lg text-primary-foreground/80">{t('heroSubtitle')}</p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <Card className="w-full max-w-md card-agri">
          <CardHeader className="text-center">
            <div className="md:hidden flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Leaf className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold">AgriShield</span>
            </div>
            <CardTitle className="font-display text-2xl">
              {mode === 'login' ? t('login') : t('register')}
            </CardTitle>
            <div className="flex gap-2 mt-4 justify-center">
              <Button
                variant={mode === 'login' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMode('login')}
              >
                {t('login')}
              </Button>
              <Button
                variant={mode === 'register' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMode('register')}
              >
                {t('register')}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div className="space-y-2">
                  <Label>{t('fullName')}</Label>
                  <Input placeholder="Ramesh Kumar" />
                </div>
              )}
              <div className="space-y-2">
                <Label>{t('email')}</Label>
                <Input placeholder="phone@example.com" />
              </div>
              {mode === 'register' && (
                <>
                  <div className="space-y-2">
                    <Label>{t('phone')}</Label>
                    <Input placeholder="+91 98765 43210" />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('state')}</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {['Haryana', 'Uttar Pradesh', 'Gujarat', 'Punjab', 'West Bengal'].map((s) => (
                          <SelectItem key={s} value={s.toLowerCase().replace(' ', '-')}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('prefLanguage')}</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="hi">हिंदी</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label>{t('password')}</Label>
                <Input type="password" placeholder="••••••••" />
              </div>
              {mode === 'login' && (
                <button type="button" className="text-sm text-primary hover:underline">
                  {t('forgotPassword')}
                </button>
              )}
              <Button type="submit" className="w-full">
                {mode === 'login' ? t('loginBtn') : t('registerBtn')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
