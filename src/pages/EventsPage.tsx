import { useState, useMemo } from 'react';
import { MapPin, CalendarDays, ExternalLink, Link as LinkIcon, ChevronLeft, Building2 } from 'lucide-react';
import { sampleEvents } from '@/lib/sample-data';
import type { Event } from '@/types';
import BackButton from '@/components/BackButton';

// Engine logic precisely strips complex URLs, generating highly structured text and link arrays.
function parseLinks(text: string, existingLinks?: {title: string, url: string}[]) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const rawUrls = text.match(urlRegex) || [];
  
  // Clean description completely devoid of messy routing strings
  const cleanText = text.replace(urlRegex, '').replace(/\s+/g, ' ').trim();

  const merged = [...(existingLinks || [])];
  
  rawUrls.forEach(url => {
    // Only map auto-extracted links if they aren't already specifically defined by admin
    if (!merged.find(l => l.url === url)) {
      merged.push({ title: 'Related Link', url });
    }
  });

  return { cleanText, mergedLinks: merged };
}

export default function EventsPage() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Parse state just for the modal
  const activeEventParsed = useMemo(() => {
    if (!selectedEvent) return null;
    return parseLinks(selectedEvent.description, selectedEvent.links);
  }, [selectedEvent]);

  return (
    <div className="cs-page min-h-screen pb-24">
      <div className="flex items-center justify-between mb-4">
        <BackButton />
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-black text-foreground">Events</h1>
        <p className="text-sm font-medium text-muted-foreground tracking-wide mt-1">Institutional gatherings & fests</p>
      </div>

      <div className="space-y-4">
        {sampleEvents.map(event => {
          const { mergedLinks, cleanText } = parseLinks(event.description, event.links);
          const hasLinks = mergedLinks.length > 0;

          return (
            <div 
              key={event.id} 
              onClick={() => setSelectedEvent(event)}
              className="relative overflow-hidden group flex flex-col p-6 bg-card border border-border/40 rounded-[2rem] shadow-sm cursor-pointer hover:border-border transition-all duration-300 active:scale-[0.98]"
            >
              <div className="absolute top-0 bottom-0 left-0 w-1 bg-primary opacity-80" />
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest px-3 py-1.5 rounded-lg bg-primary/10">
                  {new Date(event.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                </span>
                
                {hasLinks && (
                  <div className="flex items-center gap-1.5 border border-primary/20 bg-primary/5 px-2.5 py-1 rounded-md">
                    <LinkIcon className="w-3 h-3 text-primary" />
                    <span className="text-[9px] font-black text-primary uppercase tracking-widest opacity-90">
                      Link Available
                    </span>
                  </div>
                )}
              </div>

              <h3 className="text-xl font-bold text-foreground leading-snug tracking-tight mb-2 pr-4">{event.title}</h3>
              
              <p className="text-sm font-medium text-muted-foreground leading-relaxed line-clamp-2 mb-4 opacity-80">
                {cleanText}
              </p>

              <div className="flex items-center justify-between mt-auto border-t border-border/30 pt-4">
                 <div className="flex items-center gap-2">
                   <Building2 className="w-3.5 h-3.5 text-muted-foreground opacity-70" />
                   <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest truncate max-w-[150px]">
                     {event.venue}
                   </span>
                 </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Overlay */}
      {selectedEvent && activeEventParsed && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md overflow-y-auto animate-in fade-in duration-300">
           <div className="min-h-screen p-4 sm:p-6 flex flex-col items-center">
             
             {/* Sticky Nav inside modal */}
             <div className="w-full max-w-2xl flex justify-between items-center mb-6 mt-2 sticky top-4 z-10">
                <button 
                  onClick={() => setSelectedEvent(null)} 
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground active:scale-95 transition-all bg-card/80 backdrop-blur-xl border border-border/50 px-4 py-2.5 rounded-full shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4"/> Back
                </button>
             </div>

             <div className="w-full max-w-2xl bg-card rounded-[2.5rem] border border-border/60 shadow-2xl overflow-hidden mb-12 animate-in slide-in-from-bottom-8 duration-500">
                
                {/* Header Block */}
                <div className="p-8 pb-8 border-b border-border/30 bg-secondary/10 relative overflow-hidden">
                   <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
                   
                   <h2 className="text-2xl sm:text-3xl font-bold text-foreground leading-snug tracking-tight mb-8 mt-4">
                     {selectedEvent.title}
                   </h2>

                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-border/30 pt-6">
                     <div className="flex flex-col gap-1.5">
                       <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Date Organized</span>
                       <span className="text-sm font-semibold text-foreground">
                         {new Date(selectedEvent.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                       </span>
                     </div>
                     <div className="flex flex-col gap-1.5">
                       <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Operating Venue</span>
                       <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                         <MapPin className="w-4 h-4 text-primary" />
                         {selectedEvent.venue}
                       </span>
                     </div>
                   </div>
                </div>

                <div className="p-8 pt-8">
                   <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-foreground leading-loose mb-10 opacity-90 font-medium tracking-wide">
                     <p>{activeEventParsed.cleanText}</p>
                   </div>
                   
                   {/* Clean Explicit External Links System */}
                   {activeEventParsed.mergedLinks.length > 0 && (
                     <div className="mt-10 border-t border-border/30 pt-8">
                       <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-5">Related Links</h4>
                       
                       <div className="space-y-4">
                         {activeEventParsed.mergedLinks.map((link, idx) => (
                           <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30 border border-border/30 shadow-sm transition-all hover:bg-secondary/50">
                             
                             <div className="flex items-center gap-4">
                               <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                                 <LinkIcon className="w-6 h-6" />
                               </div>
                               <div className="flex flex-col max-w-[150px] sm:max-w-none truncate">
                                 <span className="text-sm font-bold text-foreground">{link.title}</span>
                                 <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-widest mt-0.5 truncate">
                                   Extracted URL Target
                                 </span>
                               </div>
                             </div>

                             <button 
                               onClick={() => window.open(link.url, '_blank')}
                               className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/20 text-xs font-bold hover:opacity-90 active:scale-95 transition-all"
                             >
                               <ExternalLink className="w-3.5 h-3.5" /> Open
                             </button>

                           </div>
                         ))}
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
