import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, Wrench, Megaphone, CalendarDays, User } from 'lucide-react';
import PageTransition from './PageTransition';

const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/utilities', label: 'Utilities', icon: Wrench },
  { path: '/announcements', label: 'News', icon: Megaphone },
  { path: '/events', label: 'Events', icon: CalendarDays },
  { path: '/profile', label: 'Profile', icon: User },
];

const MobileLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="cs-mobile-container bg-background">
      <div className="min-h-screen pb-20">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-card/95 backdrop-blur-xl border-t border-border z-50">
        <div className="flex items-center justify-around py-2.5 px-3">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
            const active = isActive(path);
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all duration-200 active:scale-90 ${
                  active
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                <div className={`relative ${active ? '' : ''}`}>
                  {active && (
                    <div className="absolute -inset-1.5 rounded-lg bg-primary/10" />
                  )}
                  <Icon className={`relative w-5 h-5 ${active ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                </div>
                <span className={`text-[10px] ${active ? 'font-bold' : 'font-medium'}`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
        {/* Safe area bottom */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>
    </div>
  );
};

export default MobileLayout;
