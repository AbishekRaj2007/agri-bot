import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Leaf, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/context/AuthContext';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Bihar', 'Chhattisgarh', 'Gujarat', 'Haryana',
  'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
  'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

export default function Auth() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('');
  const [language, setLanguage] = useState('en');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { login, register } = useAuth();

  // Redirect to the page the user was trying to access, or dashboard
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const resetForm = () => {
    setFullName('');
    setEmail('');
    setPhone('');
    setState('');
    setLanguage('en');
    setPassword('');
    setError('');
    setShowPassword(false);
  };

  const switchMode = (m: 'login' | 'register') => {
    setMode(m);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        await login(email.trim(), password);
      } else {
        await register({ fullName, email, phone, state, language, password });
      }
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* ── Left decorative panel ── */}
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

      {/* ── Right form panel ── */}
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
              <Button variant={mode === 'login' ? 'default' : 'outline'} size="sm" onClick={() => switchMode('login')}>
                {t('login')}
              </Button>
              <Button variant={mode === 'register' ? 'default' : 'outline'} size="sm" onClick={() => switchMode('register')}>
                {t('register')}
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Register-only fields */}
              {mode === 'register' && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">{t('fullName')} *</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Ramesh Kumar"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">{t('email')} *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="ramesh@example.com"
                  required
                  disabled={isSubmitting}
                />
              </div>

              {mode === 'register' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t('phone')}</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t('state')} *</Label>
                    <Select value={state} onValueChange={setState} disabled={isSubmitting}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your state" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDIAN_STATES.map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>{t('prefLanguage')}</Label>
                    <Select value={language} onValueChange={setLanguage} disabled={isSubmitting}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="hi">हिंदी</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">{t('password')} *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={mode === 'register' ? 6 : undefined}
                    disabled={isSubmitting}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowPassword(v => !v)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {mode === 'register' && (
                  <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
                )}
              </div>

              {/* Error message */}
              {error && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Submit */}
              <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSubmitting
                  ? mode === 'login' ? 'Signing in…' : 'Creating account…'
                  : mode === 'login' ? t('loginBtn') : t('registerBtn')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
