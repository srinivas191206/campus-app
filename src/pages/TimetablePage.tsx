import { useState } from 'react';
import { Plus, Trash2, Clock } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { useNavigate } from 'react-router-dom';
import { store } from '@/lib/store';
import { DAYS } from '@/types';
import type { TimetableEntry } from '@/types';

const TimetablePage = () => {
  const navigate = useNavigate();
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
  };

  const removeEntry = (id: string) => save(entries.filter((e) => e.id !== id));

  const dayEntries = entries
    .filter((e) => e.day === activeDay)
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="cs-page">
      <div className="mb-4">
        <BackButton />
      </div>

      <h1 className="text-xl font-bold text-foreground mb-4">Timetable</h1>

      {/* Day Tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto hide-scrollbar pb-1">
        {DAYS.map((day) => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              day === activeDay ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
            }`}
          >
            {day.slice(0, 3)}
          </button>
        ))}
      </div>

      {/* Entries */}
      {dayEntries.length > 0 ? (
        <div className="space-y-2 mb-4">
          {dayEntries.map((entry) => (
            <div key={entry.id} className="cs-card p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-card-foreground truncate">{entry.subject}</p>
                <p className="text-xs text-muted-foreground">{entry.time}{entry.room ? ` · ${entry.room}` : ''}</p>
              </div>
              <button onClick={() => removeEntry(entry.id)} className="p-1 text-destructive">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="cs-card p-6 text-center mb-4">
          <p className="text-sm text-muted-foreground">No classes for {activeDay}</p>
        </div>
      )}

      {/* Add Form */}
      {showAdd ? (
        <div className="cs-card-elevated p-4 space-y-3">
          <input
            type="text"
            placeholder="Subject name"
            value={newEntry.subject}
            onChange={(e) => setNewEntry({ ...newEntry, subject: e.target.value })}
            className="w-full bg-secondary text-secondary-foreground rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
          <div className="flex gap-2">
            <input
              type="time"
              value={newEntry.time}
              onChange={(e) => setNewEntry({ ...newEntry, time: e.target.value })}
              className="flex-1 bg-secondary text-secondary-foreground rounded-lg px-3 py-2 text-sm outline-none"
            />
            <input
              type="text"
              placeholder="Room (optional)"
              value={newEntry.room}
              onChange={(e) => setNewEntry({ ...newEntry, room: e.target.value })}
              className="flex-1 bg-secondary text-secondary-foreground rounded-lg px-3 py-2 text-sm outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowAdd(false)} className="flex-1 py-2 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium">
              Cancel
            </button>
            <button onClick={addEntry} className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
              Add Class
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowAdd(true)} className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Add Class
        </button>
      )}
    </div>
  );
};

export default TimetablePage;
