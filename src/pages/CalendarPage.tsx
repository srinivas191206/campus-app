import { useState } from 'react';
import { ChevronRight, CalendarDays, Palmtree, ChevronLeft, CalendarClock, School, GraduationCap } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { toast } from 'sonner';

type ScheduleGroup = {
  id: string;
  title: string;
  badge: 'B.Tech' | 'M.Tech';
  academicCalendarFile: string;
  holidaysFile: string;
  iconBg: string;
  iconColor: string;
};

const SCHEDULE_DATA: ScheduleGroup[] = [
  { 
    id: '1st-year', 
    title: '1st Year', 
    badge: 'B.Tech', 
    academicCalendarFile: '#', 
    holidaysFile: '#', // e.g. 'https://example.com/holidays.pdf'
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-500'
  },
  { 
    id: '2nd-year', 
    title: '2nd Year', 
    badge: 'B.Tech', 
    academicCalendarFile: '#', 
    holidaysFile: '#',
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary'
  },
  { 
    id: '3rd-year', 
    title: '3rd Year', 
    badge: 'B.Tech', 
    academicCalendarFile: '#', 
    holidaysFile: '#',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-500'
  },
  { 
    id: '4th-year', 
    title: '4th Year', 
    badge: 'B.Tech', 
    academicCalendarFile: '#', 
    holidaysFile: '#',
    iconBg: 'bg-indigo-500/10',
    iconColor: 'text-indigo-500'
  },
  { 
    id: 'm-tech', 
    title: 'M.Tech', 
    badge: 'M.Tech', 
    academicCalendarFile: '#', 
    holidaysFile: '#',
    iconBg: 'bg-rose-500/10',
    iconColor: 'text-rose-500'
  },
];

const CalendarPage = () => {
  const [selectedYear, setSelectedYear] = useState<ScheduleGroup | null>(null);

  const openFile = (url: string, type: string) => {
    // If backend isn't mapped to a proper URL yet, prevent crash.
    if (!url || url === '#') {
      toast.error(`The ${type} file has not been uploaded yet.`, {
        description: 'Check back soon!'
      });
      return;
    }
    
    // Natively kick out to a new open browser tab/pdf viewer
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="cs-page min-h-screen pb-24 overflow-x-hidden">
      
      {!selectedYear ? (
        // Master List View
        <div className="animate-in fade-in slide-in-from-left-4 duration-300">
          <div className="flex flex-col gap-2 mb-8">
            <div className="flex items-center justify-between mb-2">
              <BackButton />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Schedule</h1>
            <p className="text-sm font-medium text-muted-foreground tracking-wide flex items-center gap-2">
              <CalendarClock className="w-4 h-4" /> Academic Calendars & Holidays
            </p>
          </div>

          <div className="space-y-4">
            {SCHEDULE_DATA.map((year, idx) => (
              <div 
                key={year.id} 
                onClick={() => setSelectedYear(year)}
                className="group flex items-center justify-between p-5 rounded-[2rem] bg-card border border-border/50 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.1)] active:scale-95 transition-all cursor-pointer hover:border-border animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'both' }}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${year.iconBg} ${year.iconColor}`}>
                    {year.badge === 'B.Tech' ? <GraduationCap className="w-6 h-6" /> : <School className="w-6 h-6" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-foreground mb-0.5">{year.title}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-80">{year.badge} curriculum</span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center group-hover:bg-secondary transition-colors">
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </div>

      ) : (

        // Detail Documents View
        <div className="animate-in fade-in slide-in-from-right-8 duration-300">
          
          <div className="flex flex-col gap-2 mb-8">
            <button 
              onClick={() => setSelectedYear(null)} 
              className="flex items-center gap-2 w-max text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground active:scale-95 transition-all mb-4 px-2 py-1 rounded-lg bg-secondary/50"
            >
              <ChevronLeft className="w-4 h-4"/> Back
            </button>
            <h2 className="text-2xl font-black text-foreground flex items-center gap-3">
              <span className={`w-3 h-8 rounded-full ${selectedYear.iconBg.replace('/10', '')}`} />
              {selectedYear.title}
            </h2>
            <p className="text-sm font-medium text-muted-foreground tracking-wide opacity-80">{selectedYear.badge} File Repository</p>
          </div>

          <div className="flex flex-col gap-4">
            
            {/* Academic Calendar Card */}
            <div 
              onClick={() => openFile(selectedYear.academicCalendarFile, 'Academic Calendar')}
              className="group flex flex-col justify-between p-6 bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-[2rem] shadow-sm cursor-pointer active:scale-[0.98] transition-all overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <CalendarDays className="w-24 h-24 text-primary" />
              </div>

              <div className="flex items-center gap-4 mb-4 z-10">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <CalendarDays className="w-5 h-5 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70 mb-0.5">Primary Schedule</span>
                  <span className="text-lg font-bold text-foreground leading-tight">Academic Calendar</span>
                </div>
              </div>

              <div className="flex items-center justify-between z-10 mt-2">
                <span className="text-xs font-medium text-muted-foreground border border-border/50 bg-background/50 px-2.5 py-1 rounded-lg backdrop-blur-sm">View Document</span>
                <ChevronRight className="w-5 h-5 text-primary/50 group-hover:text-primary transition-colors translate-x-0 group-hover:translate-x-1" />
              </div>
            </div>

            {/* Holidays List Card */}
            <div 
              onClick={() => openFile(selectedYear.holidaysFile, 'Holidays List')}
              className="group flex flex-col justify-between p-6 bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-[2rem] shadow-sm cursor-pointer active:scale-[0.98] transition-all overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Palmtree className="w-24 h-24 text-emerald-500" />
              </div>

              <div className="flex items-center gap-4 mb-4 z-10">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <Palmtree className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600/70 mb-0.5">Time Off</span>
                  <span className="text-lg font-bold text-foreground leading-tight">Holidays List</span>
                </div>
              </div>

              <div className="flex items-center justify-between z-10 mt-2">
                <span className="text-xs font-medium text-muted-foreground border border-border/50 bg-background/50 px-2.5 py-1 rounded-lg backdrop-blur-sm">View Document</span>
                <ChevronRight className="w-5 h-5 text-emerald-500/50 group-hover:text-emerald-500 transition-colors translate-x-0 group-hover:translate-x-1" />
              </div>
            </div>

          </div>
        </div>

      )}
    </div>
  );
};

export default CalendarPage;
