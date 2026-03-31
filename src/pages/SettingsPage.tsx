import { useState } from 'react';
import {
  Bell, GraduationCap, Palette, Clock,
  Trash2, MessageSquare, Info, Sun, Moon, Monitor, Send,
  ChevronRight, RotateCcw,
} from 'lucide-react';
import BackButton from '@/components/BackButton';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { store } from '@/lib/store';
import { toast } from 'sonner';

interface NotificationSettings {
  announcements: boolean;
  events: boolean;
  assignments: boolean;
}

interface ReminderSettings {
  timing: string;
}

type ThemeMode = 'light' | 'dark' | 'system';

const REMINDER_OPTIONS = ['15 minutes', '30 minutes', '1 hour', '2 hours', '1 day'];

const SettingsPage = () => {

  const [notifications, setNotifications] = useState<NotificationSettings>(
    () => store.get('settings_notifications', { announcements: true, events: true, assignments: true })
  );
  const [theme, setTheme] = useState<ThemeMode>(
    () => store.get('settings_theme', 'system')
  );
  const [reminder, setReminder] = useState<ReminderSettings>(
    () => store.get('settings_reminder', { timing: '1 hour' })
  );
  const [feedback, setFeedback] = useState('');

  const updateNotification = (key: keyof NotificationSettings, value: boolean) => {
    const updated = { ...notifications, [key]: value };
    setNotifications(updated);
    store.set('settings_notifications', updated);
  };

  const updateTheme = (mode: ThemeMode) => {
    setTheme(mode);
    store.set('settings_theme', mode);
    const root = document.documentElement;
    root.classList.remove('dark');
    if (mode === 'dark') root.classList.add('dark');
    else if (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      root.classList.add('dark');
    }
    toast.success(`Theme set to ${mode}`);
  };

  const updateReminder = (timing: string) => {
    const updated = { timing };
    setReminder(updated);
    store.set('settings_reminder', updated);
    toast.success(`Reminder set to ${timing} before deadline`);
  };

  const resetData = (key: string, label: string) => {
    store.set(key, null);
    toast.success(`${label} data cleared`);
  };

  const submitFeedback = () => {
    if (!feedback.trim()) { toast.error('Please enter your feedback'); return; }
    // Future: POST to backend
    store.set('feedback_latest', { text: feedback, date: new Date().toISOString() });
    setFeedback('');
    toast.success('Thank you for your feedback!');
  };

  return (
    <div className="cs-page">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <BackButton label="Settings" />
      </div>

      <div className="space-y-5">
        {/* ─── Notification Settings ─── */}
        <SettingsSection icon={Bell} title="Notifications">
          <ToggleRow label="Announcements" description="Department news & updates" checked={notifications.announcements} onChange={(v) => updateNotification('announcements', v)} />
          <ToggleRow label="Events" description="Upcoming events & fests" checked={notifications.events} onChange={(v) => updateNotification('events', v)} />
          <ToggleRow label="Assignment Reminders" description="Deadline alerts" checked={notifications.assignments} onChange={(v) => updateNotification('assignments', v)} />
        </SettingsSection>

        {/* ─── Theme ─── */}
        <SettingsSection icon={Palette} title="Theme">
          <div className="grid grid-cols-3 gap-2">
            {([
              { mode: 'light' as ThemeMode, icon: Sun, label: 'Light' },
              { mode: 'dark' as ThemeMode, icon: Moon, label: 'Dark' },
              { mode: 'system' as ThemeMode, icon: Monitor, label: 'System' },
            ]).map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => updateTheme(mode)}
                className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all duration-200 ${
                  theme === mode
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-secondary/50 text-muted-foreground'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
        </SettingsSection>

        {/* ─── Reminder Timing ─── */}
        <SettingsSection icon={Clock} title="Reminder Timing">
          <SelectRow label="Before deadline" value={reminder.timing} options={REMINDER_OPTIONS} onChange={updateReminder} />
        </SettingsSection>

        {/* ─── Data Management ─── */}
        <SettingsSection icon={Trash2} title="Data Management">
          <ResetRow label="Reset Timetable" onReset={() => resetData('timetable', 'Timetable')} />
          <ResetRow label="Reset Attendance Data" onReset={() => resetData('attendance', 'Attendance')} />
          <ResetRow label="Reset CGPA / SGPA" onReset={() => resetData('semesters', 'CGPA/SGPA')} />
        </SettingsSection>

        {/* ─── Feedback ─── */}
        <SettingsSection icon={MessageSquare} title="Feedback">
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Share suggestions or report issues..."
            className="bg-secondary/50 border-border text-sm min-h-[80px] resize-none"
          />
          <button
            onClick={submitFeedback}
            className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold transition-colors hover:bg-primary/90"
          >
            <Send className="w-4 h-4" />
            Submit Feedback
          </button>
        </SettingsSection>

        {/* ─── About ─── */}
        <SettingsSection icon={Info} title="About CampuSync">
          <div className="space-y-2.5 text-sm">
            <AboutRow label="Version" value="1.0.0" />
            <AboutRow label="Purpose" value="Academic utility app for CSE students" />
            <AboutRow label="Department" value="CSE, JNTUK UCEK Kakinada" />
          </div>
        </SettingsSection>
      </div>

      <div className="h-4" />
    </div>
  );
};

/* ─── Reusable sub-components ─── */

function SettingsSection({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div className="cs-card p-4 space-y-3">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <h2 className="text-sm font-bold text-foreground">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-[11px] text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function SelectRow({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[130px] h-8 text-xs bg-secondary/50 border-border">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function ResetRow({ label, onReset }: { label: string; onReset: () => void }) {
  return (
    <button onClick={onReset} className="w-full flex items-center justify-between py-2 group">
      <div className="flex items-center gap-2.5">
        <RotateCcw className="w-4 h-4 text-destructive/70" />
        <span className="text-sm font-medium text-foreground">{label}</span>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-destructive transition-colors" />
    </button>
  );
}

function AboutRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground text-right max-w-[60%]">{value}</span>
    </div>
  );
}

export default SettingsPage;
