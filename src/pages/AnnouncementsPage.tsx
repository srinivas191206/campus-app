import { useState, useMemo, useEffect } from 'react';
import { 
  Megaphone, Search, SlidersHorizontal, X, FileText, 
  Download, ExternalLink, CalendarDays, Building2, Pin, ChevronLeft, Image as ImageIcon, Users
} from 'lucide-react';
import { sampleAnnouncements } from '@/lib/sample-data';
import type { Announcement } from '@/types';
import BackButton from '@/components/BackButton';
import { store } from '@/lib/store';

const PRIORITY_CONFIG = {
  urgent: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'bg-red-500', label: 'Urgent' },
  important: { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'bg-orange-500', label: 'Important' },
  general: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'bg-blue-500', label: 'General' },
};

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => store.get('announcements', sampleAnnouncements));
  const [readAnnouncements, setReadAnnouncements] = useState<string[]>(() => store.get('readAnnouncements', []));
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  
  const [filters, setFilters] = useState({
    course: 'All',
    year: 'All',
    priority: 'All',
    category: 'All',
    attachmentOnly: false,
  });

  // Safe unread state logic hook internally to persist updates to localStorage visually
  const markAsRead = (a: Announcement) => {
    if (!readAnnouncements.includes(a.id)) {
      const updated = [...readAnnouncements, a.id];
      setReadAnnouncements(updated);
      store.set('readAnnouncements', updated);
    }
    setSelectedAnnouncement(a);
  };

  const togglePin = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = announcements.map(a => 
      a.id === id ? { ...a, isPinned: !a.isPinned } : a
    );
    setAnnouncements(updated);
    store.set('announcements', updated);

    // Sync modal state if currently viewed
    if (selectedAnnouncement && selectedAnnouncement.id === id) {
      setSelectedAnnouncement(updated.find(a => a.id === id) || null);
    }
  };

  // 1. Core Filter Engine
  const filteredAnnouncements = useMemo(() => {
    return announcements.filter(a => {
      // Search Box Hook
      const q = searchQuery.toLowerCase();
      if (q) {
        const matchesSearch = 
          a.title.toLowerCase().includes(q) || 
          a.shortDescription.toLowerCase().includes(q) || 
          a.source.toLowerCase().includes(q) ||
          a.audience.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }

      // Dropdown Matrix Hook
      if (filters.course !== 'All' && a.course !== 'All' && a.course !== filters.course) return false;
      if (filters.year !== 'All' && a.year !== 'All' && a.year !== filters.year) return false;
      if (filters.priority !== 'All' && a.priority !== filters.priority) return false;
      if (filters.category !== 'All' && a.category !== filters.category) return false;
      if (filters.attachmentOnly && !a.attachmentURL) return false;

      return true;
    });
  }, [searchQuery, filters, announcements]);

  // 2. Automated Archival & Segregation Matrix
  const { pinned, recent, archived } = useMemo(() => {
    const today = new Date();
    today.setHours(0,0,0,0);

    const pinnedFlow: Announcement[] = [];
    const recentFlow: Announcement[] = [];
    const archivedFlow: Announcement[] = [];

    // Sort globally by date descending first to retain temporal hierarchy
    const sorted = [...filteredAnnouncements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    sorted.forEach(a => {
      const exp = new Date(a.expiryDate);
      exp.setHours(0,0,0,0);

      // Rule: Pinned overrides archival state entirely
      if (a.isPinned) {
        pinnedFlow.push(a);
      } else if (today.getTime() > exp.getTime()) {
        archivedFlow.push(a);
      } else {
        recentFlow.push(a);
      }
    });

    return { pinned: pinnedFlow, recent: recentFlow, archived: archivedFlow };
  }, [filteredAnnouncements]);

  const isNew = (dateStr: string) => {
    const diff = new Date().getTime() - new Date(dateStr).getTime();
    return diff <= 3 * 24 * 60 * 60 * 1000;
  };

  const isRead = (id: string) => readAnnouncements.includes(id);

  const handleApplyFilter = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ course: 'All', year: 'All', priority: 'All', category: 'All', attachmentOnly: false });
    setIsFilterSheetOpen(false);
  };

  return (
    <div className="cs-page min-h-screen pb-24">
      <div className="flex items-center justify-between mb-4">
        <BackButton />
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-black text-foreground">Announcements</h1>
        <p className="text-sm font-medium text-muted-foreground tracking-wide mt-1">Official institutional updates</p>
      </div>

      {/* Premium Search & Filter Ribbon */}
      <div className="flex items-center gap-3 mb-8">
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search announcements"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-card border border-border/60 text-foreground rounded-2xl pl-12 pr-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm font-medium"
          />
        </div>
        
        <button 
          onClick={() => setIsFilterSheetOpen(true)}
          className="w-12 h-12 rounded-2xl bg-card border border-border/60 flex items-center justify-center text-muted-foreground hover:bg-secondary/80 active:scale-95 transition-all relative shadow-sm"
        >
          <SlidersHorizontal className="w-5 h-5" />
          {(filters.course !== 'All' || filters.year !== 'All' || filters.priority !== 'All' || filters.category !== 'All' || filters.attachmentOnly) && (
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-primary ring-2 ring-card" />
          )}
        </button>
      </div>

      {/* Empty State Guard */}
      {pinned.length === 0 && recent.length === 0 && archived.length === 0 ? (
        <div className="cs-card p-10 text-center border-dashed border-border/60 bg-secondary/10 flex flex-col items-center justify-center rounded-[2rem] shadow-sm mt-8">
          <Megaphone className="w-14 h-14 text-muted-foreground/20 mb-4" />
          <p className="text-lg font-bold text-foreground mb-1">No announcements found</p>
          <p className="text-sm text-muted-foreground font-medium max-w-[80%] mx-auto">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          
          {/* SEC 1: Pinned Notifications */}
          {pinned.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4 px-1">
                <Pin className="w-4 h-4 text-primary fill-primary" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Pinned Notice</h3>
              </div>
              <div className="space-y-4">
                {pinned.map(a => (
                  <AnnouncementCard 
                    key={a.id} a={a} isNew={isNew(a.date)} isRead={isRead(a.id)}
                    onClick={() => markAsRead(a)} 
                  />
                ))}
              </div>
            </section>
          )}

          {/* SEC 2: Recent Standard Feed */}
          {recent.length > 0 && (
            <section>
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4 px-1">Active Updates</h3>
              <div className="space-y-4">
                {recent.map(a => (
                  <AnnouncementCard 
                    key={a.id} a={a} isNew={isNew(a.date)} isRead={isRead(a.id)}
                    onClick={() => markAsRead(a)} 
                  />
                ))}
              </div>
            </section>
          )}

          {/* SEC 3: Archived Historical Feed */}
          {archived.length > 0 && (
            <section>
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4 px-1">Archived</h3>
              <div className="space-y-4">
                {archived.map(a => (
                  <AnnouncementCard 
                    key={a.id} a={a} isNew={false} isRead={isRead(a.id)} isArchived={true}
                    onClick={() => markAsRead(a)} 
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Filter Bottom Sheet Expansion */}
      {isFilterSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity" onClick={() => setIsFilterSheetOpen(false)} />
          <div className="relative w-full max-w-md mx-auto bg-card rounded-t-[2.5rem] border-t border-x border-border shadow-2xl p-6 pb-12 animate-in slide-in-from-bottom flex flex-col duration-300">
            <div className="flex justify-between items-center mb-8">
               <h3 className="text-xl font-black text-foreground">Filters</h3>
               <button onClick={() => setIsFilterSheetOpen(false)} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground active:scale-90 transition-transform"><X className="w-5 h-5"/></button>
            </div>

            <div className="space-y-6 flex-1 overflow-y-auto pr-2 pb-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 block">Course</label>
                  <select 
                    value={filters.course} onChange={(e) => handleApplyFilter('course', e.target.value)}
                    className="w-full bg-secondary border border-border/50 text-foreground font-bold rounded-xl px-4 py-3 text-sm outline-none appearance-none"
                  >
                    <option value="All">All Courses</option>
                    <option value="B.Tech">B.Tech</option>
                    <option value="M.Tech">M.Tech</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 block">Academic Year</label>
                  <select 
                    value={filters.year} onChange={(e) => handleApplyFilter('year', e.target.value)}
                    className="w-full bg-secondary border border-border/50 text-foreground font-bold rounded-xl px-4 py-3 text-sm outline-none appearance-none"
                  >
                    <option value="All">All Years</option>
                    <option value="1st">1st Year</option>
                    <option value="2nd">2nd Year</option>
                    <option value="3rd">3rd Year</option>
                    <option value="4th">4th Year</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 block">Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {['All', 'Academic', 'Exam', 'Event', 'Placement'].map((c) => {
                    const isSelected = filters.category === c;
                    return (
                      <button 
                        key={c} onClick={() => handleApplyFilter('category', c)}
                        className={`py-3 rounded-xl text-xs font-bold transition-all border ${
                          isSelected 
                            ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20' 
                            : 'bg-card border-border/50 text-muted-foreground hover:bg-secondary'
                        }`}
                      >
                        {c}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 block">Urgency / Priority</label>
                <div className="flex flex-wrap gap-2">
                  {['All', 'urgent', 'important', 'general'].map((p) => {
                    const isSelected = filters.priority === p;
                    return (
                      <button 
                        key={p} onClick={() => handleApplyFilter('priority', p)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                          isSelected 
                            ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20' 
                            : 'bg-card border-border/50 text-muted-foreground hover:bg-secondary'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center justify-between cursor-pointer p-5 rounded-2xl border border-border/50 bg-secondary/30">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-foreground">Attachments Only</span>
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">Filter lists with linked files</span>
                  </div>
                  <div className={`w-12 h-6 rounded-full p-1 transition-colors ${filters.attachmentOnly ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
                    <div className={`w-4 h-4 bg-background rounded-full transition-transform ${filters.attachmentOnly ? 'translate-x-6' : 'translate-x-0'}`} />
                  </div>
                  <input type="checkbox" className="hidden" checked={filters.attachmentOnly} onChange={(e) => handleApplyFilter('attachmentOnly', e.target.checked)} />
                </label>
              </div>

            </div>
            
            <div className="flex gap-3 pt-4 pb-2 border-t border-border/50 mt-4">
              <button onClick={clearFilters} className="py-4 px-6 rounded-2xl bg-secondary text-foreground text-sm font-bold tracking-wide active:scale-95 transition-transform">
                Clear All
              </button>
              <button 
                onClick={() => setIsFilterSheetOpen(false)} 
                className="flex-1 py-4 rounded-2xl bg-primary text-primary-foreground text-sm font-bold tracking-wide shadow-lg shadow-primary/20 active:scale-95 transition-transform"
              >
                Apply Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expanded Premium Detail Modal Content */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md overflow-y-auto animate-in fade-in duration-300">
           <div className="min-h-screen p-4 sm:p-6 flex flex-col items-center">
             
             {/* Sticky Nav inside modal */}
             <div className="w-full max-w-2xl flex justify-between items-center mb-6 mt-2 sticky top-4 z-10">
                <button 
                  onClick={() => setSelectedAnnouncement(null)} 
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground active:scale-95 transition-all bg-card/80 backdrop-blur-xl border border-border/50 px-4 py-2.5 rounded-full shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4"/> Back to List
                </button>
                <button 
                  onClick={() => togglePin(selectedAnnouncement.id)} 
                  className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest active:scale-95 transition-all bg-card/80 backdrop-blur-xl border border-border/50 px-4 py-2.5 rounded-full shadow-sm ${selectedAnnouncement.isPinned ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Pin className={`w-4 h-4 ${selectedAnnouncement.isPinned ? 'fill-primary' : ''}`}/> {selectedAnnouncement.isPinned ? 'Unpin' : 'Pin'}
                </button>
             </div>

             <div className="w-full max-w-2xl bg-card rounded-[2.5rem] border border-border/60 shadow-2xl overflow-hidden mb-12 animate-in slide-in-from-bottom-8 duration-500">
                
                {/* Visual Header Block */}
                <div className="p-8 pb-8 border-b border-border/30 bg-secondary/10 relative overflow-hidden">
                   <div className={`absolute top-0 left-0 right-0 h-1 ${PRIORITY_CONFIG[selectedAnnouncement.priority].border}`} />
                   
                   <div className="flex items-center gap-2 mb-5 mt-1">
                     <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border border-border/30 ${PRIORITY_CONFIG[selectedAnnouncement.priority].bg} ${PRIORITY_CONFIG[selectedAnnouncement.priority].text}`}>
                       {PRIORITY_CONFIG[selectedAnnouncement.priority].label} Priority
                     </span>
                     <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg bg-secondary text-muted-foreground border border-border/30">
                       {selectedAnnouncement.category}
                     </span>
                   </div>

                   <h2 className="text-xl sm:text-2xl font-bold text-foreground leading-snug tracking-tight mb-8 flex flex-wrap items-center gap-3">
                     {selectedAnnouncement.title}
                     {isNew(selectedAnnouncement.date) && (
                       <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-primary/10 text-primary translate-y-[-1px]">
                         NEW
                       </span>
                     )}
                   </h2>

                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-border/30 pt-6">
                     <div className="flex flex-col gap-1.5">
                       <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Date</span>
                       <span className="text-sm font-semibold text-foreground">
                         {new Date(selectedAnnouncement.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                       </span>
                     </div>
                     <div className="flex flex-col gap-1.5">
                       <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Source</span>
                       <span className="text-sm font-semibold text-foreground">
                         {selectedAnnouncement.source}
                       </span>
                     </div>
                     <div className="flex flex-col gap-1.5">
                       <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Audience</span>
                       <span className="text-sm font-semibold text-foreground">
                         {selectedAnnouncement.audience}
                       </span>
                     </div>
                   </div>
                </div>

                <div className="p-8 pt-8">
                   <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-foreground leading-loose mb-10 opacity-90 font-medium tracking-wide">
                     <p>{selectedAnnouncement.fullDescription}</p>
                   </div>
                   
                   {selectedAnnouncement.attachmentURL && (
                     <div className="mt-10 border-t border-border/30 pt-8">
                       <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-5">Attachment</h4>
                       
                       <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl bg-secondary/30 border border-border/30 shadow-sm gap-4">
                          <div className="flex items-center gap-4 w-full sm:w-auto">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              selectedAnnouncement.attachmentType === 'pdf' ? 'bg-red-500/10 text-red-500' : 
                              selectedAnnouncement.attachmentType === 'image' ? 'bg-blue-500/10 text-blue-500' : 'bg-primary/10 text-primary'
                            }`}>
                              {selectedAnnouncement.attachmentType === 'pdf' ? <FileText className="w-6 h-6" /> : 
                               selectedAnnouncement.attachmentType === 'image' ? <ImageIcon className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-sm font-bold text-foreground truncate max-w-[200px]">Official_Document.{selectedAnnouncement.attachmentType || 'pdf'}</span>
                              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mt-0.5">Click to preview or save</span>
                            </div>
                          </div>

                          <div className="flex w-full sm:w-auto items-center gap-3">
                            <button 
                              onClick={() => window.open(selectedAnnouncement.attachmentURL, '_blank')}
                              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-card border border-border/40 shadow-sm text-xs font-bold text-foreground hover:bg-secondary transition-all active:scale-95"
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> View
                            </button>
                            <a 
                              href={selectedAnnouncement.attachmentURL}
                              download
                              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/20 text-xs font-bold hover:opacity-90 active:scale-95 transition-all"
                            >
                              <Download className="w-3.5 h-3.5" /> Download
                            </a>
                          </div>
                       </div>
                     </div>
                   )}
                </div>
             </div>
           </div>
        </div>
      )}
    </div>
  );
}

// Highly structured rigorous 4-line padding layout logic.
function AnnouncementCard({ a, isNew, isRead, isArchived, onClick }: { a: Announcement, isNew: boolean, isRead: boolean, isArchived?: boolean, onClick: () => void }) {
  const cfg = PRIORITY_CONFIG[a.priority];
  
  return (
    <div 
      onClick={onClick}
      className={`relative overflow-hidden group flex flex-col p-6 bg-card border border-border/40 shadow-sm hover:shadow-md cursor-pointer hover:border-border transition-all duration-300 active:scale-[0.98] ${a.isPinned ? 'rounded-[2.5rem] border-primary/20 bg-gradient-to-br from-primary/5 to-transparent' : 'rounded-[2rem]'} ${isArchived ? 'opacity-60 grayscale-[10%]' : ''}`}
    >
      <div className={`absolute top-0 bottom-0 left-0 w-1.5 ${cfg.border} opacity-80`} />
      
      {/* Absolute Unread Dot Indicator */}
      {!isRead && !isArchived && (
        <span className="absolute top-6 right-6 w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_10px_rgba(0,0,0,0.5)] shadow-primary/50 animate-pulse" />
      )}

      {/* LINE 1: Clean Bold Title Matrix (Pushing against right dot boundary securely) */}
      <h3 className={`text-lg font-bold text-foreground leading-[1.3] mb-2 pr-4 ${isRead ? 'opacity-85' : ''}`}>
        {a.title}
      </h3>

      {/* LINE 2: Short Preview */}
      <p className={`text-sm font-medium text-muted-foreground leading-relaxed line-clamp-2 mb-5 ${isRead ? 'opacity-70' : ''}`}>
        {a.shortDescription}
      </p>

      {/* LINE 3: Precise Wide Tracking Spatial Row (Audience & Date) */}
      <div className="flex items-center justify-between mb-5 border-t border-border/30 pt-4">
        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-secondary/50 px-2 py-1 rounded-md">
          {a.audience}
        </span>
        <span className="text-[10px] font-bold text-foreground opacity-60 uppercase tracking-widest pl-2">
          {new Date(a.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}
        </span>
      </div>

      {/* LINE 4: Substantive Badge Matrix Block */}
      <div className="flex flex-wrap items-center gap-2 mt-auto">
        <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border border-border/50 bg-secondary text-muted-foreground opacity-90">
          {a.category}
        </span>
        <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md ${cfg.bg} ${cfg.text}`}>
          {cfg.label} Priority
        </span>
        
        {/* NEW Threshold appended naturally here if unread/non-archived */}
        {isNew && !isArchived && (
           <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md bg-primary/10 text-primary animate-pulse ml-auto">
             NEW
           </span>
        )}

        {/* Attachment logic shifted seamlessly right aligning with visual flow standard. */}
        {a.attachmentURL && !isNew && (
          <div className="flex items-center gap-1.5 ml-auto border border-border/30 bg-secondary/20 px-2.5 py-1 rounded-md opacity-80">
            {a.attachmentType === 'pdf' ? (
              <FileText className="w-3 h-3 text-red-500/80" />
            ) : (
              <Megaphone className="w-3 h-3 text-blue-500/80" />
            )}
            <span className="text-[9px] font-black text-foreground uppercase tracking-widest opacity-80">
              {a.attachmentType === 'pdf' ? 'PDF Attached' : 'Linked File'}
            </span>
          </div>
        )}
      </div>

    </div>
  );
}
