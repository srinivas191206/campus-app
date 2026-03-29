import { useNavigate } from 'react-router-dom';
import { Calculator, Clock, BarChart3, CalendarDays, FileText, Megaphone, ChevronRight, CalendarX } from 'lucide-react';
import { store } from '@/lib/store';
import { sampleAnnouncements, sampleCalendar } from '@/lib/sample-data';
import type { TimetableEntry } from '@/types';

const QUICK_ACTIONS = [
  { label: 'GPA Calci', icon: Calculator, path: '/utilities/cgpa', gradient: 'cs-gradient-primary' },
  { label: 'Timetable', icon: Clock, path: '/utilities/timetable', gradient: 'cs-gradient-accent' },
  { label: 'Attendance', icon: BarChart3, path: '/utilities/attendance', gradient: 'cs-gradient-warm' },
  { label: 'Assignments', icon: FileText, path: '/utilities/assignments', gradient: 'cs-gradient-purple' },
];

const HomePage = () => {
  const navigate = useNavigate();
  const profile = store.get('profile', { name: 'Student', nickname: '', profilePicture: '' });
  const timetable: TimetableEntry[] = store.get('timetable', []);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayClasses = timetable.filter((e) => e.day === today);

  const upcomingDates = sampleCalendar
    .filter((e) => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const latestAnnouncement = sampleAnnouncements[0];

  const displayName = profile.nickname || (profile.name || 'Student').split(' ')[0];

  return (
    <div className="cs-page">
      {/* Premium Header Card */}
      <div className="cs-header-card rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <p className="text-muted-foreground text-sm font-medium mb-1">Good {getGreeting()} 👋</p>
            <h1 className="text-xl font-bold text-foreground leading-tight">Welcome back, {displayName}</h1>
          </div>
          <button onClick={() => navigate('/profile')} className="w-14 h-14 rounded-full cs-gradient-primary flex items-center justify-center shadow-sm ring-4 ring-primary/5 overflow-hidden shrink-0 ml-4">
            {profile.profilePicture ? (
              <img src={profile.profilePicture} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-primary-foreground font-bold text-xl">
                {displayName.charAt(0).toUpperCase()}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <section className="mb-7">
        <p className="cs-section-title mb-3">Quick Access</p>
        <div className="grid grid-cols-4 gap-4">
          {QUICK_ACTIONS.map(({ label, icon: Icon, path, gradient }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex flex-col items-center gap-3 active:scale-95 transition-transform"
            >
              <div className={`w-[60px] h-[60px] rounded-2xl ${gradient} flex items-center justify-center shadow-sm`}>
                <Icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <span className="text-[11px] font-medium text-foreground text-center">{label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Today's Classes */}
      <section className="mb-7">
        <div className="flex items-center justify-between mb-3">
          <p className="cs-section-title">Today's Classes</p>
          <button onClick={() => navigate('/utilities/timetable')} className="text-xs text-primary font-semibold">
            View All
          </button>
        </div>
        {todayClasses.length > 0 ? (
          <div className="space-y-3">
            {todayClasses.map((entry) => (
              <div key={entry.id} className="cs-card-elevated p-4 flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-card-foreground truncate">{entry.subject}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{entry.time}{entry.room ? ` · ${entry.room}` : ''}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="cs-card-elevated p-8 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center mb-3">
              <CalendarX className="w-6 h-6 text-muted-foreground/60" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No classes scheduled for today</p>
            <button onClick={() => navigate('/utilities/timetable')} className="text-[13px] text-primary font-semibold mt-2 hover:underline">
              Set up timetable &rarr;
            </button>
          </div>
        )}
      </section>

      {/* Upcoming Academic Dates */}
      <section className="mb-7">
        <div className="flex items-center justify-between mb-3">
          <p className="cs-section-title">Upcoming Dates</p>
          <button onClick={() => navigate('/utilities/calendar')} className="text-xs text-primary font-semibold">
            Calendar
          </button>
        </div>
        <div className="space-y-3">
          {upcomingDates.map((event) => (
            <div key={event.id} className="cs-card-elevated p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                event.type === 'holiday' ? 'bg-accent/10' : 
                event.type === 'semester' ? 'bg-destructive/10' : 'bg-primary/10'
              }`}>
                <CalendarDays className={`w-5 h-5 ${
                  event.type === 'holiday' ? 'text-accent' : 
                  event.type === 'semester' ? 'text-destructive' : 'text-primary'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[15px] text-card-foreground truncate mb-1">{event.title}</p>
                <p className="text-[13px] text-muted-foreground">
                  {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </p>
              </div>
              <TypeBadge type={event.type} />
            </div>
          ))}
        </div>
      </section>

      {/* Latest Announcement */}
      {latestAnnouncement && (
        <section className="mb-6">
          <p className="cs-section-title mb-3">Latest Announcement</p>
          <button
            onClick={() => navigate('/announcements')}
            className="cs-card-elevated p-5 w-full text-left active:scale-[0.98] transition-transform group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Megaphone className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-xs text-muted-foreground font-medium">
                    {new Date(latestAnnouncement.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <p className="font-semibold text-[15px] text-card-foreground leading-tight">{latestAnnouncement.title}</p>
                <p className="text-[13px] text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">{latestAnnouncement.shortDescription || (latestAnnouncement as any).description}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground/50 flex-shrink-0 mt-1 group-hover:text-primary transition-colors" />
            </div>
          </button>
        </section>
      )}
    </div>
  );
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}

function TypeBadge({ type }: { type: string }) {
  const styles: Record<string, string> = {
    internal: 'bg-primary/5 text-primary',
    lab: 'bg-accent/5 text-accent',
    semester: 'bg-destructive/5 text-destructive',
    holiday: 'bg-accent/5 text-accent',
  };
  return (
    <span className={`text-[11px] font-medium px-3 py-1.5 rounded-full ${styles[type] || styles.internal}`}>
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  );
}

export default HomePage;
