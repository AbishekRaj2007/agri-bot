import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  MessageCircle,
  Cloud,
  Sprout,
  BarChart,
  FileText,
  Settings,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  Leaf,
  LogOut,
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navItems = [
  { key: 'dashboard' as const, icon: Home, path: '/dashboard' },
  { key: 'chat' as const, icon: MessageCircle, path: '/dashboard/chat' },
  { key: 'weather' as const, icon: Cloud, path: '/dashboard/weather' },
  { key: 'crops' as const, icon: Sprout, path: '/dashboard/crops' },
  { key: 'market' as const, icon: BarChart, path: '/dashboard/market' },
  { key: 'schemes' as const, icon: FileText, path: '/dashboard/schemes' },
  { key: 'settings' as const, icon: Settings, path: '/dashboard/settings' },
];

export default function DashboardSidebar() {
  const { t, language, setLanguage } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/auth', { replace: true });
  };

  // Build avatar initials from the user's name
  const initials = user?.fullName
    ? user.fullName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <aside
      className={cn(
        'flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 h-screen sticky top-0',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 p-4 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center flex-shrink-0">
          <Leaf className="w-4 h-4 text-sidebar-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="font-display text-lg font-bold text-sidebar-foreground">
            AgriShield
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.key}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-primary font-semibold'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{t(item.key)}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom controls */}
      <div className="border-t border-sidebar-border p-3 space-y-2">
        {/* Language toggle */}
        <button
          onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent transition-colors"
        >
          <span className="text-base flex-shrink-0">🌐</span>
          {!collapsed && <span>{language === 'en' ? 'हिंदी' : 'English'}</span>}
        </button>

        {/* Dark mode toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent transition-colors"
        >
          {isDark ? <Sun className="w-5 h-5 flex-shrink-0" /> : <Moon className="w-5 h-5 flex-shrink-0" />}
          {!collapsed && <span>{isDark ? t('lightMode') : t('darkMode')}</span>}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent transition-colors"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          {!collapsed && <span>Collapse</span>}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>

        {/* User profile */}
        <div className="flex items-center gap-3 px-3 py-2 border-t border-sidebar-border mt-1 pt-3">
          <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center flex-shrink-0 text-xs font-bold text-sidebar-primary-foreground">
            {initials}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.fullName || 'Farmer'}
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                {user?.state || user?.email || ''}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
