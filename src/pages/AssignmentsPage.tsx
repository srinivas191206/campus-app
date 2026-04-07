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
  const [filterSubject, setFilterSubject] = useState('All Subjects');
  const [sortBy, setSortBy] = useState<'deadline' | 'priority' | 'latest'>('deadline');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ subject: '', title: '', deadline: '', description: '', priority: 'Medium' as 'High' | 'Medium' | 'Low' });

  // Extract unique subjects from existing assignments for suggestions
  const savedSubjects = useMemo(() => {
    const subjects = assignments.map(a => a.subject).filter(Boolean);
    return Array.from(new Set(subjects));
  }, [assignments]);

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
    setForm({ subject: '', title: '', deadline: '', description: '', priority: 'Medium' });
    setShowAdd(false);
    toast.success("Added to Pending", {
      icon: <FileText className="w-4 h-4 text-primary" />
    });
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

  const getCountdown = (deadlineStr: string): string => {
    const target = new Date(deadlineStr);
    const now = new Date();
    const diffMs = target.getTime() - now.getTime();
    if (diffMs < 0) return 'Overdue';
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHrs < 1) return '< 1h left';
    if (diffHrs < 24) return `${diffHrs}h left`;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} left`;
  };

  // Structured Logic engines
  const priorityScore = { High: 3, Medium: 2, Low: 1 };

  const getDeadlineGroup = (deadlineStr: string) => {
    const diff = getDaysDiff(deadlineStr);
    if (diff === null) return 'No Deadline';
    if (diff < 0) return 'Overdue';
    if (diff === 0) return 'Due Today';
    if (diff === 1) return 'Tomorrow';
    if (diff <= 7) return 'This Week';
    return 'Later';
  };

  const processedPending = useMemo(() => {
    let filtered = assignments.filter(a => !a.completed);
    
    if (filterSubject !== 'All Subjects') {
      filtered = filtered.filter(a => a.subject === filterSubject);
    }

    return filtered.sort((a, b) => {
      if (sortBy === 'deadline') {
        const diffA = getDaysDiff(a.deadline) ?? 999;
        const diffB = getDaysDiff(b.deadline) ?? 999;
        return diffA - diffB;
      }
      if (sortBy === 'priority') {
        const pA = priorityScore[a.priority] || 0;
        const pB = priorityScore[b.priority] || 0;
        if (pB !== pA) return pB - pA;
        // fallback to deadline if priority is same
        const diffA = getDaysDiff(a.deadline) ?? 999;
        const diffB = getDaysDiff(b.deadline) ?? 999;
        return diffA - diffB;
      }
      if (sortBy === 'latest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return 0;
    });
  }, [assignments, filterSubject, sortBy]);

  const groupedPending = useMemo(() => {
    const groups: { label: string; items: EnhancedAssignment[] }[] = [
       { label: 'Overdue', items: [] },
       { label: 'Due Today', items: [] },
       { label: 'Tomorrow', items: [] },
       { label: 'This Week', items: [] },
       { label: 'Later', items: [] },
       { label: 'No Deadline', items: [] }
    ];
    
    processedPending.forEach(a => {
      const groupLabel = getDeadlineGroup(a.deadline);
      const group = groups.find(g => g.label === groupLabel);
      if (group) group.items.push(a);
    });
    
    return groups.filter(g => g.items.length > 0);
  }, [processedPending]);

  const completed = useMemo(() => {
    return assignments
      .filter(a => a.completed)
      .sort((a, b) => {
        const timeA = new Date(a.completedAt || a.createdAt).getTime();
        const timeB = new Date(b.completedAt || b.createdAt).getTime();
        return timeB - timeA;
      });
  }, [assignments]);

  const dueTodayCount = useMemo(() => {
    return assignments.filter(a => !a.completed && getDaysDiff(a.deadline) === 0).length;
  }, [assignments]);

  return (
    <div className="cs-page min-h-screen pb-24">
      <div className="flex flex-col gap-2 mb-6">
        <div className="flex items-center justify-between mb-2">
          <BackButton />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Assignments</h1>
        <p className="text-sm font-medium text-muted-foreground tracking-wide mt-1">Smart task & deadline tracking</p>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <div className="bg-card border border-border/50 rounded-2xl p-3 flex flex-col justify-between shadow-sm items-center text-center">
          <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Pending</span>
          <span className="text-2xl font-black text-foreground">{assignments.filter(a => !a.completed).length}</span>
        </div>
        <div className="bg-card border border-orange-500/20 bg-gradient-to-b from-orange-500/10 to-transparent rounded-2xl p-3 flex flex-col justify-between shadow-sm items-center text-center">
          <span className="text-[9px] font-bold uppercase tracking-widest text-orange-600 dark:text-orange-500 mb-1">Due Today</span>
          <span className="text-2xl font-black text-orange-600 dark:text-orange-500">{dueTodayCount}</span>
        </div>
        <div className="bg-card border border-emerald-500/20 bg-gradient-to-b from-emerald-500/10 to-transparent rounded-2xl p-3 flex flex-col justify-between shadow-sm items-center text-center">
          <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-500 mb-1">Finished</span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-500">{completed.length}</span>
        </div>
      </div>

      {/* Segmented Control Tabs */}
      <div className="flex bg-secondary/50 p-1.5 rounded-2xl mb-4 shadow-inner mx-0.5">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
            activeTab === 'pending'
              ? 'bg-card text-foreground shadow-sm ring-1 ring-black/5'
              : 'text-muted-foreground opacity-70 hover:opacity-100'
          }`}
        >
          <Clock className="w-4 h-4" /> Pending
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
            activeTab === 'completed'
              ? 'bg-card text-foreground shadow-sm ring-1 ring-black/5'
              : 'text-muted-foreground opacity-70 hover:opacity-100'
          }`}
        >
          <CheckCircle className="w-4 h-4" /> Completed
        </button>
      </div>

      {/* Filter & Sort Bar */}
      {activeTab === 'pending' && (
        <div className="flex flex-col gap-3 mb-6 px-0.5 animate-in fade-in duration-500">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar max-w-[calc(100%-40px)]">
                <button 
                  onClick={() => setFilterSubject('All Subjects')}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                    filterSubject === 'All Subjects' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                  }`}
                >
                  All
                </button>
                {savedSubjects.map(sub => (
                  <button 
                    key={sub}
                    onClick={() => setFilterSubject(sub)}
                    className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                      filterSubject === sub 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
              
              <div className="relative">
                <button 
                  onClick={() => {
                    const options: ('deadline' | 'priority' | 'latest')[] = ['deadline', 'priority', 'latest'];
                    const next = options[(options.indexOf(sortBy) + 1) % options.length];
                    setSortBy(next);
                    toast(`Sorted by ${next}`, { duration: 1000 });
                  }}
                  className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <FileText className="w-4 h-4" />
                </button>
              </div>
           </div>
        </div>
      )}

      {/* --------- PENDING TAB --------- */}
      {activeTab === 'pending' && (
        <div className="animate-in fade-in slide-in-from-left-4 duration-300">
          {/* Prominent Add Button (Dashed Card) */}
          <button 
            onClick={() => setShowAdd(true)}
            className="w-full cs-card p-6 border-dashed border-2 bg-primary/5 hover:bg-primary/10 border-primary/20 transition-all flex flex-col items-center justify-center gap-3 mb-8 group active:scale-95 duration-200 shadow-sm"
          >
            <div className="w-14 h-14 bg-primary text-primary-foreground rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              <Plus className="w-8 h-8 stroke-[3.5px]" />
            </div>
            <div className="text-center">
              <p className="font-black text-lg text-foreground tracking-tight">Create Assignment</p>
              <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-[0.1em] mt-1 opacity-70">Add a new task to your schedule</p>
            </div>
          </button>

          {groupedPending.length > 0 ? (
            <div className="space-y-8">
              {groupedPending.map((group) => (
                <div key={group.label} className="space-y-3">
                  <div className="flex items-center gap-3 px-1">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{group.label}</h3>
                    <div className="h-px flex-1 bg-border/40"></div>
                    <span className="text-[10px] font-bold text-muted-foreground/40">{group.items.length}</span>
                  </div>
                  
                  <div className="space-y-3">
                    {group.items.map((a) => {
                      const diff = getDaysDiff(a.deadline);
                      
                      let smartDeadlineText = "No deadline";
                      let statusColor = "text-muted-foreground";
                      let bgGradient = "bg-card";
                      let borderColor = "border-border/40 shadow-sm shadow-black/5";
                      let IconType = Clock;

                      if (diff !== null) {
                        if (diff < 0) {
                          smartDeadlineText = "Overdue";
                          statusColor = "text-red-500";
                          bgGradient = "bg-gradient-to-br from-red-500/[0.03] to-card";
                          borderColor = "border-red-500/20";
                          IconType = AlertCircle;
                        } else if (diff === 0) {
                          smartDeadlineText = "Today";
                          statusColor = "text-orange-500";
                          bgGradient = "bg-gradient-to-br from-orange-500/[0.05] to-card";
                          borderColor = "border-orange-500/20";
                          IconType = AlertTriangle;
                        } else if (diff === 1) {
                          smartDeadlineText = "Tomorrow";
                          statusColor = "text-amber-500";
                          borderColor = "border-amber-500/20";
                        } else if (diff <= 7) {
                          smartDeadlineText = `${diff}d left`;
                          statusColor = "text-primary/70";
                        } else {
                          smartDeadlineText = `${diff} days`;
                        }
                      }

                      const priorityConfig = {
                        High: { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-500/10' },
                        Medium: { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
                        Low: { color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10' }
                      };

                      return (
                        <div key={a.id} className={`group flex items-start gap-4 p-5 rounded-[1.8rem] border transition-all duration-300 active:scale-[0.98] ${bgGradient} ${borderColor}`}>
                           <button 
                             onClick={() => toggleComplete(a.id, false)} 
                             className="mt-1 flex-shrink-0 active:scale-90 transition-transform"
                           >
                             <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/20 flex items-center justify-center group-hover:border-primary/40 transition-colors">
                               <CheckCircle2 className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-20 translate-y-px transition-opacity" />
                             </div>
                           </button>
                           
                           <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                             <div className="flex items-center gap-2 mb-0.5">
                               {a.subject && (
                                 <span className="px-2 py-0.5 rounded-lg bg-secondary text-[9px] font-black uppercase tracking-widest text-muted-foreground truncate">{a.subject}</span>
                               )}
                               <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${priorityConfig[a.priority].bg} ${priorityConfig[a.priority].color}`}>
                                 {a.priority}
                               </span>
                             </div>

                             <p className="font-bold text-[15px] text-foreground leading-tight">{a.title}</p>
                             
                             <div className="flex items-center gap-3 mt-1">
                                <div className="flex items-center gap-1.5">
                                   <IconType className={`w-3 h-3 ${statusColor}`} />
                                   <span className={`text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>{smartDeadlineText}</span>
                                </div>
                                <div className="flex items-center gap-1.5 opacity-60">
                                   <Clock className="w-3 h-3" />
                                   <span className="text-[10px] font-bold uppercase tracking-wider">{getCountdown(a.deadline)}</span>
                                </div>
                             </div>

                             {a.description && (
                               <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed opacity-60 font-medium">{a.description}</p>
                             )}
                           </div>
                           
                           <button onClick={(e) => removeAssignment(a.id, e)} className="p-2 -mr-2 text-muted-foreground/20 hover:text-red-500 transition-colors">
                              <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="cs-card p-14 text-center border-dashed border-border/40 bg-secondary/10 flex flex-col items-center justify-center rounded-[2.5rem] shadow-sm">
              <div className="w-20 h-20 rounded-full bg-emerald-500/5 flex items-center justify-center mb-6">
                <CheckCircle className="w-10 h-10 text-emerald-500/40" />
              </div>
              <p className="text-base font-black text-foreground mb-1 tracking-tight">No pending assignments!</p>
              <p className="text-sm text-muted-foreground font-medium opacity-60">You're completely caught up today.</p>
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
                <div key={a.id} className="flex items-start gap-4 p-5 rounded-[2rem] border border-emerald-500/10 bg-emerald-500/[0.02] shadow-sm transition-all grayscale-[0.5] opacity-80">
                  <button onClick={() => toggleComplete(a.id, true)} className="mt-1 flex-shrink-0 active:scale-90 transition-transform">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 fill-emerald-500/10" />
                  </button>
                  
                  <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                    {a.subject && (
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 truncate block">{a.subject}</span>
                    )}
                    <p className="font-bold text-[15px] text-foreground/60 line-through decoration-muted-foreground/30 leading-tight">{a.title}</p>
                    
                    <div className="flex items-center gap-1.5 mt-1">
                      <Clock className="w-3 h-3 text-muted-foreground/40" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/40">
                        Done on {new Date(a.completedAt || a.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  
                  <button onClick={(e) => removeAssignment(a.id, e)} className="p-2 -mr-2 text-muted-foreground/20 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
             <div className="cs-card p-14 text-center border-dashed border-border/40 bg-secondary/10 flex flex-col items-center justify-center rounded-[2.5rem] shadow-sm">
                <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-6">
                  <FileText className="w-10 h-10 text-muted-foreground/20" />
                </div>
                <p className="text-base font-black text-foreground mb-1 tracking-tight">No completed work</p>
                <p className="text-sm text-muted-foreground font-medium opacity-60">Finished tasks will be archived here.</p>
             </div>
          )}
        </div>
      )}

      {/* --------- QUICK ADD BOTTOM SHEET --------- */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/60 backdrop-blur-[2px] animate-in fade-in duration-300" onClick={() => setShowAdd(false)}>
           <div 
             className="bg-card w-full max-w-lg rounded-t-[2.5rem] border-t border-x border-border shadow-2xl p-8 animate-in slide-in-from-bottom-full duration-500"
             onClick={(e) => e.stopPropagation()}
           >
             <div className="w-12 h-1.5 bg-secondary rounded-full mx-auto mb-8 opacity-40"></div>
             
             <div className="flex justify-between items-center mb-8">
               <div>
                <h3 className="text-2xl font-black tracking-tight">Add Task</h3>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-60">Academic Productivity</p>
               </div>
               <button onClick={() => setShowAdd(false)} className="w-10 h-10 bg-secondary rounded-2xl flex items-center justify-center text-muted-foreground hover:bg-secondary/80 transition-colors">
                 <XCircle className="w-5 h-5"/>
               </button>
             </div>

             <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3 block px-1">Task Details</label>
                  <input
                    type="text"
                    placeholder="E.g. Database Lab Record"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full bg-secondary/50 border border-border/40 tracking-wide text-foreground rounded-2xl px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:bg-secondary transition-all font-bold placeholder:text-muted-foreground/30"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3 block px-1">Subject</label>
                    <input
                      type="text"
                      list="saved-subjects"
                      placeholder="Select..."
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full bg-secondary/50 border border-border/40 text-foreground rounded-2xl px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:bg-secondary transition-all font-bold placeholder:text-muted-foreground/30"
                    />
                    <datalist id="saved-subjects">
                      {savedSubjects.map((subject, index) => (
                        <option key={index} value={subject} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                     <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3 block px-1">Due Date</label>
                     <input
                      type="date"
                      value={form.deadline}
                      onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                      className="w-full bg-secondary/50 border border-border/40 text-foreground rounded-2xl px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:bg-secondary transition-all font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3 block px-1">Urgency Level</label>
                  <div className="flex bg-secondary/50 p-1 rounded-2xl border border-border/40">
                    {(['Low', 'Medium', 'High'] as const).map(p => (
                      <button
                        key={p}
                        onClick={() => setForm({ ...form, priority: p })}
                        className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                          form.priority === p 
                            ? 'bg-card text-foreground shadow-sm shadow-black/5 ring-1 ring-black/5' 
                            : 'text-muted-foreground opacity-60 hover:opacity-100'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 pb-2">
                  <button 
                    onClick={addAssignment} 
                    className="w-full py-5 rounded-[1.8rem] bg-primary text-primary-foreground text-[11px] font-black shadow-[0_10px_30px_rgba(0,0,0,0.1)] shadow-primary/20 active:scale-95 transition-all uppercase tracking-[0.2em]"
                  >
                    Launch Assignment
                  </button>
                </div>
             </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default AssignmentsPage;
