import { useState } from 'react';
import { Plus, Trash2, Clock, ChevronRight, GraduationCap, School, ChevronLeft, Folder, FileText, LayoutDashboard, Download } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { useNavigate } from 'react-router-dom';
import { store } from '@/lib/store';
import { DAYS } from '@/types';
import type { TimetableEntry } from '@/types';
import { toast } from 'sonner';

const TIMETABLE_REPO = [
  { id: '1st-year', title: '1st Year', badge: 'B.Tech', iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-500' },
  { id: '2nd-year', title: '2nd Year', badge: 'B.Tech', iconBg: 'bg-primary/10', iconColor: 'text-primary' },
  { id: '3rd-year', title: '3rd Year', badge: 'B.Tech', iconBg: 'bg-amber-500/10', iconColor: 'text-amber-500' },
  { id: '4th-year', title: '4th Year', badge: 'B.Tech', iconBg: 'bg-indigo-500/10', iconColor: 'text-indigo-500' },
];

const BRANCHES = [
  { id: 'cse', title: 'CSE / CSE-ICP', iconBg: 'bg-blue-500/10', iconColor: 'text-blue-500' },
  { id: 'aiml', title: 'AIML / AIML-ICP', iconBg: 'bg-purple-500/10', iconColor: 'text-purple-500' },
];

const TimetablePage = () => {
  const navigate = useNavigate();
  
  // Navigation State
  const [selectedYear, setSelectedYear] = useState<typeof TIMETABLE_REPO[0] | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<typeof BRANCHES[0] | null>(null);
  const [showPersonal, setShowPersonal] = useState(false);

  // Personal Timetable State
  const [entries, setEntries] = useState<TimetableEntry[]>(() => store.get('timetable', []));
  const [activeDay, setActiveDay] = useState(() => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return DAYS.includes(today as any) ? today : 'Monday';
  });
  const [showAdd, setShowAdd] = useState(false);
  const [newEntry, setNewEntry] = useState({ subject: '', time: '09:00', room: '' });

  const save = (updated: TimetableEntry[]) => {
    setEntries(updated);
    store.set('timetable', updated);
  };

  const addEntry = () => {
    if (!newEntry.subject.trim()) return;
    const entry: TimetableEntry = {
      id: crypto.randomUUID(),
      day: activeDay,
      subject: newEntry.subject,
      time: newEntry.time,
      room: newEntry.room,
    };
    save([...entries, entry]);
    setNewEntry({ subject: '', time: '09:00', room: '' });
    setShowAdd(false);
    toast.success('Class added to personal timetable');
  };

  const removeEntry = (id: string) => save(entries.filter((e) => e.id !== id));

  const dayEntries = entries
    .filter((e) => e.day === activeDay)
    .sort((a, b) => a.time.localeCompare(b.time));

  const openTimetable = (year: string, branch: string) => {
    toast.info('Opening the official timetable viewer...', {
      description: 'Document is loading in a new tab.'
    });
  };

  const downloadTimetable = (year: string, branch: string) => {
    toast.success('Download started!', {
      description: 'The timetable PDF is being saved to your device.'
    });
  };

  // ── Render Helpers ──

  if (showPersonal) {
    return (
      <div className="cs-page animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="mb-6">
          <button 
            onClick={() => setShowPersonal(false)}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-lg active:scale-95 transition-all"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Timetables
          </button>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Personal Timetable</h1>
            <p className="text-xs text-muted-foreground mt-1 tracking-tight">Your custom daily schedule manager</p>
          </div>
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="flex gap-2 mb-5 overflow-x-auto hide-scrollbar pb-1">
          {DAYS.map((day) => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                day === activeDay ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-secondary text-secondary-foreground'
              }`}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>

        {dayEntries.length > 0 ? (
          <div className="space-y-3 mb-6">
            {dayEntries.map((entry) => (
              <div key={entry.id} className="cs-card-elevated p-4 flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[15px] text-foreground truncate">{entry.subject}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground font-medium">{entry.time}</span>
                    {entry.room && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <span className="text-xs text-primary font-bold uppercase tracking-tighter opacity-80">{entry.room}</span>
                      </>
                    )}
                  </div>
                </div>
                <button onClick={() => removeEntry(entry.id)} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="cs-card p-10 text-center mb-6 flex flex-col items-center">
            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-3 opacity-50">
               <Clock className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No classes scheduled for {activeDay}</p>
          </div>
        )}

        {showAdd ? (
          <div className="cs-card-elevated p-5 space-y-4 animate-in zoom-in-95 duration-200">
            <h3 className="text-sm font-bold text-foreground">Add New Class</h3>
            <input
              type="text"
              placeholder="Subject Name"
              value={newEntry.subject}
              onChange={(e) => setNewEntry({ ...newEntry, subject: e.target.value })}
              className="w-full bg-secondary text-foreground rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
            <div className="flex gap-3">
              <input
                type="time"
                value={newEntry.time}
                onChange={(e) => setNewEntry({ ...newEntry, time: e.target.value })}
                className="flex-1 bg-secondary text-foreground rounded-xl px-4 py-3 text-sm outline-none"
              />
              <input
                type="text"
                placeholder="Room (e.g. 302)"
                value={newEntry.room}
                onChange={(e) => setNewEntry({ ...newEntry, room: e.target.value })}
                className="flex-1 bg-secondary text-foreground rounded-xl px-4 py-3 text-sm outline-none"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-3 rounded-xl bg-secondary text-foreground text-sm font-bold active:scale-95 transition-transform">
                Cancel
              </button>
              <button onClick={addEntry} className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-lg shadow-primary/20 active:scale-95 transition-transform">
                Add Class
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowAdd(true)} className="w-full py-4 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-95 transition-transform">
            <Plus className="w-5 h-5 stroke-[2.5px]" /> Add Class
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="cs-page pb-24 overflow-x-hidden">
      
      {!selectedYear ? (
        // LEVEL 0: Year Selection
        <div className="animate-in fade-in slide-in-from-left-4 duration-300">
          <div className="flex flex-col gap-2 mb-8">
            <div className="flex items-center justify-between mb-2">
              <BackButton />
            </div>
            <h1 className="text-3xl font-black text-foreground uppercase tracking-tight">Timetables</h1>
            <p className="text-sm font-medium text-muted-foreground tracking-wide flex items-center gap-2">
              <Clock className="w-4 h-4" /> Branch-wise Academic Schedules
            </p>
          </div>

          <div className="space-y-4">
            {/* Personal Timetable Option */}
            <div 
              onClick={() => setShowPersonal(true)}
              className="group flex flex-col p-6 rounded-[2rem] bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 shadow-sm active:scale-[0.98] transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <LayoutDashboard className="w-24 h-24 text-primary" />
              </div>
              <div className="flex items-center gap-4 mb-4 z-10">
                <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary/70 mb-0.5 block">Custom Schedule</span>
                  <span className="text-lg font-black text-foreground">My Personal Timetable</span>
                </div>
              </div>
              <div className="flex items-center justify-between z-10 mt-1">
                <span className="text-xs font-bold text-muted-foreground bg-background/50 px-3 py-1 rounded-full border border-border/50 backdrop-blur-sm">Management Console</span>
                <ChevronRight className="w-5 h-5 text-primary/50 group-hover:text-primary transition-all translate-x-0 group-hover:translate-x-1" />
              </div>
            </div>

            <div className="h-px bg-border/50 mx-4" />

            {/* Official Repos */}
            {TIMETABLE_REPO.map((year, idx) => (
              <div 
                key={year.id} 
                onClick={() => setSelectedYear(year)}
                className="group flex items-center justify-between p-5 rounded-[2rem] bg-card border border-border/50 shadow-sm active:scale-95 transition-all cursor-pointer hover:border-border/80 animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'both' }}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${year.iconBg} ${year.iconColor} group-hover:scale-110 transition-transform`}>
                    {year.badge === 'B.Tech' ? <GraduationCap className="w-6 h-6" /> : <School className="w-6 h-6" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-foreground mb-0.5">{year.title}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">Official Repository</span>
                  </div>
                </div>
                <div className="w-9 h-9 rounded-full bg-secondary/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>

      ) : !selectedBranch ? (
        // LEVEL 1: Branch Selection
        <div className="animate-in fade-in slide-in-from-right-8 duration-300">
          <div className="flex flex-col gap-2 mb-8">
            <button 
              onClick={() => setSelectedYear(null)} 
              className="flex items-center gap-2 w-max text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground active:scale-95 transition-all mb-4 px-2 py-1.5 rounded-lg bg-secondary/50"
            >
              <ChevronLeft className="w-4 h-4"/> Back
            </button>
            <h2 className="text-3xl font-black text-foreground flex items-center gap-3">
              <span className={`w-3 h-10 rounded-full ${selectedYear.iconBg.replace('/10', '')}`} />
              {selectedYear.title}
            </h2>
            <p className="text-sm font-medium text-muted-foreground tracking-wide opacity-80">Select your academic branch</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {BRANCHES.map((branch, idx) => (
              <div 
                key={branch.id}
                onClick={() => setSelectedBranch(branch)}
                className="group flex flex-col p-6 rounded-[2rem] bg-card border border-border/50 shadow-sm hover:border-primary/20 cursor-pointer active:scale-[0.98] transition-all relative overflow-hidden"
              >
                 <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                    <Folder className="w-24 h-24 text-foreground" />
                 </div>
                 
                 <div className="flex items-center gap-4 mb-4 z-10 transition-transform group-hover:translate-x-1">
                    <div className={`w-12 h-12 rounded-2xl ${branch.iconBg} ${branch.iconColor} flex items-center justify-center border border-current/10 shadow-sm`}>
                      <Folder className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5 block">Department</span>
                      <span className="text-lg font-extrabold text-foreground">{branch.title}</span>
                    </div>
                 </div>

                 <div className="flex items-center justify-between z-10 pt-2 border-t border-border/30">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-60">Verified Document</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-primary transition-all" />
                 </div>
              </div>
            ))}
          </div>
        </div>

      ) : (
        // LEVEL 2: Document View (Placeholder)
        <div className="animate-in fade-in zoom-in-95 duration-300">
           <div className="flex flex-col gap-2 mb-8">
            <button 
              onClick={() => setSelectedBranch(null)} 
              className="flex items-center gap-2 w-max text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground active:scale-95 transition-all mb-4 px-2 py-1.5 rounded-lg bg-secondary/50"
            >
              <ChevronLeft className="w-4 h-4"/> Back to Branches
            </button>
            <h2 className="text-2xl font-black text-foreground leading-tight">
              {selectedYear.title} / {selectedBranch.title.split(' / ')[0]}
            </h2>
            <p className="text-sm font-medium text-muted-foreground tracking-wide opacity-80">Official Academic Timetable</p>
          </div>

          <div 
            className="group flex flex-col p-8 rounded-[2.5rem] bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground shadow-2xl shadow-primary/30 relative overflow-hidden"
          >
             <div className="absolute -top-6 -right-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <FileText className="w-48 h-48" />
             </div>

             <div className="z-10 bg-white/20 w-16 h-16 rounded-[1.5rem] flex items-center justify-center backdrop-blur-md mb-6 border border-white/30 shadow-inner">
                <FileText className="w-8 h-8" />
             </div>

             <h3 className="text-2xl font-black mb-2 z-10">Semester Timetable</h3>
             <p className="text-sm font-medium text-white/70 mb-8 z-10 leading-relaxed max-w-[200px]">View or download the detailed schedule for classes and lab sessions.</p>

             <div className="z-10 flex gap-3">
                <button 
                  onClick={() => openTimetable(selectedYear.id, selectedBranch.id)}
                  className="flex-1 py-4 px-6 rounded-2xl bg-white text-primary font-black text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  View
                </button>
                <button 
                  onClick={() => downloadTimetable(selectedYear.id, selectedBranch.id)}
                  className="flex-1 py-4 px-6 rounded-2xl bg-white/20 border border-white/30 text-white font-black text-sm backdrop-blur-md active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download
                </button>
             </div>
          </div>

          <div className="mt-8 p-6 rounded-3xl bg-secondary/30 border border-border/50 text-center">
             <LayoutDashboard className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
             <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1 opacity-70">Notice</p>
             <p className="text-xs text-muted-foreground leading-relaxed">Timetables are updated periodically. Ensure you check for the latest version after mid-exams.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimetablePage;
