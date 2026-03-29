import { useState, useMemo, useEffect } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, Clock, CheckCircle, AlertTriangle, AlertCircle, FileText, XCircle } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { store } from '@/lib/store';
import type { Assignment, AttendanceRecord } from '@/types';
import { toast } from 'sonner';

type TabType = 'pending' | 'completed';

// Extend assignment type privately for the completedAt field if lacking
type EnhancedAssignment = Assignment & { completedAt?: string };

const AssignmentsPage = () => {
  const [assignments, setAssignments] = useState<EnhancedAssignment[]>(() => store.get('assignments', []));
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ subject: '', title: '', deadline: '', description: '' });

  // Extract unique subjects across the app for quick-dropdown
  const savedSubjects = useMemo(() => {
    const attendanceRecords: AttendanceRecord[] = store.get('attendance', []);
    const subjects = attendanceRecords.map(r => r.subject).filter(Boolean);
    return Array.from(new Set(subjects));
  }, []);

  const save = (updated: EnhancedAssignment[]) => {
    setAssignments(updated);
    store.set('assignments', updated);
  };

  const addAssignment = () => {
    if (!form.title.trim()) {
      toast.error("Assignment title is required");
      return;
    }
    const a: EnhancedAssignment = {
      id: crypto.randomUUID(),
      ...form,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    save([...assignments, a]);
    setForm({ subject: '', title: '', deadline: '', description: '' });
    setShowAdd(false);
    toast.success("Assignment added to Pending");
    setActiveTab('pending');
  };

  const toggleComplete = (id: string, currentlyCompleted: boolean) => {
    save(assignments.map((a) => {
      if (a.id === id) {
        return { 
          ...a, 
          completed: !currentlyCompleted,
          completedAt: !currentlyCompleted ? new Date().toISOString() : undefined
        };
      }
      return a;
    }));
    
    if (!currentlyCompleted) {
      toast.success("Marked as completed", {
        icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />
      });
    }
  };

  const removeAssignment = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    save(assignments.filter((a) => a.id !== id));
    toast("Assignment deleted");
  };

  const getDaysDiff = (deadlineStr: string | undefined): number | null => {
    if (!deadlineStr) return null;
    const target = new Date(deadlineStr);
    const now = new Date();
    target.setHours(0, 0, 0, 0);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Structured Logic engines
  const pending = useMemo(() => {
    return assignments
      .filter(a => !a.completed)
      .sort((a, b) => {
        const diffA = getDaysDiff(a.deadline);
        const diffB = getDaysDiff(b.deadline);
        if (diffA === null && diffB === null) return 0;
        if (diffA === null) return 1; // Unscheduled pushes to bottom
        if (diffB === null) return -1;
        return diffA - diffB; // Nearest deadline pulls to top
      });
  }, [assignments]);

  const completed = useMemo(() => {
    return assignments
      .filter(a => a.completed)
      .sort((a, b) => {
        const timeA = new Date(a.completedAt || a.createdAt).getTime();
        const timeB = new Date(b.completedAt || b.createdAt).getTime();
        return timeB - timeA; // Most recently finished at top
      });
  }, [assignments]);

  const dueTodayCount = useMemo(() => {
    return pending.filter(a => getDaysDiff(a.deadline) === 0).length;
  }, [pending]);

  return (
    <div className="cs-page min-h-screen pb-24">
      <div className="flex items-center justify-between mb-2">
        <BackButton />
        <button 
          onClick={() => setShowAdd(true)}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/10 text-primary hover:bg-primary/20 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Assignments</h1>
        <p className="text-sm font-medium text-muted-foreground tracking-wide mt-1">Smart task & deadline tracking</p>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <div className="bg-card border border-border/50 rounded-2xl p-4 flex flex-col justify-between shadow-sm items-center text-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Pending</span>
          <span className="text-3xl font-black text-foreground">{pending.length}</span>
        </div>
        <div className="bg-card border border-orange-500/20 bg-gradient-to-b from-orange-500/10 to-transparent rounded-2xl p-4 flex flex-col justify-between shadow-sm items-center text-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-orange-600 dark:text-orange-500 mb-1">Due Today</span>
          <span className="text-3xl font-black text-orange-600 dark:text-orange-500">{dueTodayCount}</span>
        </div>
        <div className="bg-card border border-emerald-500/20 bg-gradient-to-b from-emerald-500/10 to-transparent rounded-2xl p-4 flex flex-col justify-between shadow-sm items-center text-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-500 mb-1">Finished</span>
          <span className="text-3xl font-black text-emerald-600 dark:text-emerald-500">{completed.length}</span>
        </div>
      </div>

      {/* Segmented Control Tabs */}
      <div className="flex bg-secondary/50 p-1.5 rounded-2xl mb-6 shadow-inner mx-0.5">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
            activeTab === 'pending'
              ? 'bg-card text-foreground shadow-sm shadow-black/5'
              : 'text-muted-foreground hover:text-foreground/80'
          }`}
        >
          <Clock className="w-4 h-4" /> Pending
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
            activeTab === 'completed'
              ? 'bg-card text-foreground shadow-sm shadow-black/5'
              : 'text-muted-foreground hover:text-foreground/80'
          }`}
        >
          <CheckCircle className="w-4 h-4" /> Completed
        </button>
      </div>

      {/* --------- PENDING TAB --------- */}
      {activeTab === 'pending' && (
        <div className="animate-in fade-in slide-in-from-left-4 duration-300">
          {pending.length > 0 ? (
            <div className="space-y-3">
              {pending.map((a) => {
                const diff = getDaysDiff(a.deadline);
                
                let smartDeadlineText = "No deadline";
                let statusColor = "text-foreground opacity-60";
                let bgGradient = "bg-card";
                let borderColor = "border-border/50";
                let IconType = Clock;

                if (diff !== null) {
                  if (diff < 0) {
                    smartDeadlineText = "Overdue";
                    statusColor = "text-red-500";
                    bgGradient = "bg-gradient-to-r from-red-500/5 to-transparent";
                    borderColor = "border-red-500/20";
                    IconType = AlertCircle;
                  } else if (diff === 0) {
                    smartDeadlineText = "Due Today";
                    statusColor = "text-orange-500";
                    bgGradient = "bg-gradient-to-r from-orange-500/10 to-transparent";
                    borderColor = "border-orange-500/30";
                    IconType = AlertTriangle;
                  } else if (diff === 1) {
                    smartDeadlineText = "Due Tomorrow";
                    statusColor = "text-amber-500";
                    bgGradient = "bg-gradient-to-r from-amber-500/5 to-transparent";
                    borderColor = "border-amber-500/20";
                    IconType = Clock;
                  } else {
                    smartDeadlineText = `Due in ${diff} days`;
                    statusColor = "text-primary/80";
                    bgGradient = "bg-card";
                    borderColor = "border-border/50";
                  }
                }

                return (
                  <div key={a.id} className={`flex items-start gap-4 p-5 rounded-[2rem] border shadow-sm transition-all duration-300 ${bgGradient} ${borderColor}`}>
                     <button 
                       onClick={() => toggleComplete(a.id, false)} 
                       className="mt-1 flex-shrink-0 active:scale-90 transition-transform hover:opacity-80"
                     >
                       <Circle className="w-6 h-6 text-muted-foreground/40 fill-background" />
                     </button>
                     
                     <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                       {a.subject && (
                         <span className="text-[10px] font-bold uppercase tracking-widest text-primary/80 truncate block">{a.subject}</span>
                       )}
                       <p className="font-bold text-base text-foreground leading-tight">{a.title}</p>
                       
                       <div className="flex items-center gap-1.5 mt-1">
                          <IconType className={`w-3.5 h-3.5 ${statusColor}`} />
                          <span className={`text-xs font-bold uppercase tracking-wider ${statusColor}`}>{smartDeadlineText}</span>
                       </div>

                       {a.description && (
                         <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed opacity-80">{a.description}</p>
                       )}
                     </div>
                     
                     <button onClick={(e) => removeAssignment(a.id, e)} className="p-2 -mr-2 text-muted-foreground/30 hover:text-red-500 transition-colors bg-transparent border-0">
                        <Trash2 className="w-4 h-4" />
                     </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="cs-card p-10 text-center border-dashed border-border/60 bg-secondary/10 flex flex-col items-center justify-center rounded-[2rem] shadow-sm">
              <CheckCircle className="w-14 h-14 text-emerald-500/30 mb-4" />
              <p className="text-base font-bold text-foreground mb-1">No pending assignments!</p>
              <p className="text-sm text-muted-foreground font-medium">You are completely caught up.</p>
            </div>
          )}
        </div>
      )}

      {/* --------- COMPLETED TAB --------- */}
      {activeTab === 'completed' && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
          {completed.length > 0 ? (
            <div className="space-y-3">
              {completed.map((a) => (
                <div key={a.id} className="flex items-start gap-4 p-5 rounded-[2rem] border border-emerald-500/10 bg-emerald-500/5 shadow-sm transition-all">
                  <button onClick={() => toggleComplete(a.id, true)} className="mt-1 flex-shrink-0 active:scale-90 transition-transform">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 fill-emerald-500/20" />
                  </button>
                  
                  <div className="flex-1 min-w-0 flex flex-col gap-1.5 opacity-70">
                    {a.subject && (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground truncate block">{a.subject}</span>
                    )}
                    <p className="font-bold text-base text-foreground line-through decoration-muted-foreground/40 leading-tight">{a.title}</p>
                    
                    <div className="flex items-center gap-1.5 mt-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600/60" />
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-600/60">Completed Formally</span>
                    </div>
                  </div>
                  
                  <button onClick={(e) => removeAssignment(a.id, e)} className="p-2 -mr-2 text-muted-foreground/30 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
             <div className="cs-card p-10 text-center border-dashed border-border/60 bg-secondary/10 flex flex-col items-center justify-center rounded-[2rem] shadow-sm">
                <FileText className="w-14 h-14 text-muted-foreground/20 mb-4" />
                <p className="text-base font-bold text-foreground mb-1">No completed assignments yet</p>
                <p className="text-sm text-muted-foreground font-medium">Your finished work will appear here.</p>
             </div>
          )}
        </div>
      )}

      {/* --------- FLOATING PLUS MODAL --------- */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
           <div className="bg-card w-full max-w-sm rounded-[2rem] border border-border shadow-2xl p-6 animate-in slide-in-from-bottom-8 duration-500 sm:slide-in-from-bottom-0 sm:zoom-in-95">
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl font-bold">New Assignment</h3>
               <button onClick={() => setShowAdd(false)} className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-muted-foreground hover:bg-secondary/80 transition-colors">
                 <XCircle className="w-5 h-5"/>
               </button>
             </div>
             <div className="space-y-4">
                
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 block px-1">Assignment Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Unit 3 Programming"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full bg-secondary tracking-wide text-foreground rounded-2xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 block px-1">Subject</label>
                  <input
                    type="text"
                    list="saved-subjects"
                    placeholder="e.g. DBMS"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full bg-secondary text-foreground rounded-2xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                  />
                  <datalist id="saved-subjects">
                    {savedSubjects.map((subject, index) => (
                      <option key={index} value={subject} />
                    ))}
                  </datalist>
                </div>

                <div>
                   <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 block px-1">Due Date</label>
                   <input
                    type="date"
                    value={form.deadline}
                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                    className="w-full bg-secondary text-foreground rounded-2xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 block px-1">Optional Notes</label>
                  <textarea
                    placeholder="Any specific instructions..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full bg-secondary text-foreground rounded-2xl px-4 py-3.5 text-sm outline-none resize-none h-24 focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                  />
                </div>

                <button 
                  onClick={addAssignment} 
                  className="w-full mt-4 py-4 rounded-2xl bg-primary text-primary-foreground text-sm font-bold shadow-[0_4px_16px_rgba(0,0,0,0.15)] shadow-primary/30 active:scale-95 transition-transform uppercase tracking-widest"
                >
                  Create Assignment
                </button>
             </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default AssignmentsPage;
