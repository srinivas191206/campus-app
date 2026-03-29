import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Hash, BookOpen, GraduationCap, Settings, Camera, Layers } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { store } from '@/lib/store';
import BackButton from '@/components/BackButton';
import type { UserProfile, CourseType } from '@/types';
import { CLASS_OPTIONS, YEAR_OPTIONS } from '@/types';

const DEFAULT_PROFILE: UserProfile = {
  id: '1',
  name: '',
  nickname: '',
  rollNumber: '',
  course: 'B.Tech',
  className: 'CSE',
  year: 1,
  semester: 1,
  email: '',
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile>(() => store.get('profile', DEFAULT_PROFILE));
  const [editing, setEditing] = useState(!profile.name);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const save = () => {
    store.set('profile', profile);
    setEditing(false);
  };

  const update = (field: keyof UserProfile, value: string | number) => {
    const updated = { ...profile, [field]: value };

    // Reset dependent fields when course changes
    if (field === 'course') {
      const course = value as CourseType;
      updated.className = CLASS_OPTIONS[course][0];
      updated.year = YEAR_OPTIONS[course][0];
    }

    setProfile(updated);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setProfile({ ...profile, profilePicture: base64 });
      store.set('profile', { ...profile, profilePicture: base64 });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="cs-page">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        <button onClick={() => navigate('/settings')} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
          <Settings className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Avatar with upload */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full cs-gradient-primary flex items-center justify-center overflow-hidden shadow-lg">
            {profile.profilePicture ? (
              <img src={profile.profilePicture} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-primary-foreground text-3xl font-bold">
                {(profile.name || 'S').charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          {editing && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md border-2 border-card"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        </div>
        <p className="font-bold text-lg text-foreground mt-3">{profile.name || 'Set up your profile'}</p>
        <p className="text-sm text-muted-foreground">CSE Department · JNTUK UCEK</p>
      </div>

      {/* Fields */}
      <div className="space-y-3">
        <ProfileField icon={User} label="Full Name" value={profile.name} editing={editing}
          onChange={(v) => update('name', v)} placeholder="Enter your name" />
        <ProfileField icon={User} label="Nickname" value={profile.nickname} editing={editing}
          onChange={(v) => update('nickname', v)} placeholder="e.g. Varun" />
        <ProfileField icon={Hash} label="Roll Number" value={profile.rollNumber} editing={editing}
          onChange={(v) => update('rollNumber', v)} placeholder="e.g. 21B01A0501" />
        <ProfileField icon={Mail} label="Email" value={profile.email} editing={editing}
          onChange={(v) => update('email', v)} placeholder="your@email.com" type="email" />

        {/* Course Dropdown */}
        <div className="cs-card p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Course</p>
            {editing ? (
              <Select value={profile.course} onValueChange={(v) => update('course', v)}>
                <SelectTrigger className="h-7 text-sm font-medium border-0 bg-transparent p-0 shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="B.Tech">B.Tech</SelectItem>
                  <SelectItem value="M.Tech">M.Tech</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm font-medium text-card-foreground">{profile.course || '—'}</p>
            )}
          </div>
        </div>

        {/* Class Dropdown */}
        <div className="cs-card p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Layers className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Class</p>
            {editing ? (
              <Select value={profile.className} onValueChange={(v) => update('className', v)}>
                <SelectTrigger className="h-7 text-sm font-medium border-0 bg-transparent p-0 shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CLASS_OPTIONS[profile.course].map((cls) => (
                    <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm font-medium text-card-foreground">{profile.className || '—'}</p>
            )}
          </div>
        </div>

        {/* Year Dropdown */}
        <div className="cs-card p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Year</p>
            {editing ? (
              <Select value={String(profile.year)} onValueChange={(v) => update('year', +v)}>
                <SelectTrigger className="h-7 text-sm font-medium border-0 bg-transparent p-0 shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {YEAR_OPTIONS[profile.course].map((y) => (
                    <SelectItem key={y} value={String(y)}>Year {y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm font-medium text-card-foreground">{profile.year ? `Year ${profile.year}` : '—'}</p>
            )}
          </div>
        </div>

        {/* Semester Dropdown */}
        <div className="cs-card p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Semester</p>
            {editing ? (
              <Select value={String(profile.semester)} onValueChange={(v) => update('semester', +v)}>
                <SelectTrigger className="h-7 text-sm font-medium border-0 bg-transparent p-0 shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Semester 1</SelectItem>
                  <SelectItem value="2">Semester 2</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm font-medium text-card-foreground">{profile.semester ? `Semester ${profile.semester}` : '—'}</p>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={editing ? save : () => setEditing(true)}
        className="w-full mt-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold active:scale-[0.98] transition-transform"
      >
        {editing ? 'Save Profile' : 'Edit Profile'}
      </button>
    </div>
  );
};

function ProfileField({
  icon: Icon, label, value, editing, onChange, placeholder, type = 'text',
}: {
  icon: any; label: string; value: string; editing: boolean; onChange: (v: string) => void; placeholder: string; type?: string;
}) {
  return (
    <div className="cs-card p-3 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
        {editing ? (
          <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
            className="w-full bg-transparent text-sm font-medium text-card-foreground outline-none" />
        ) : (
          <p className="text-sm font-medium text-card-foreground">{value || '—'}</p>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
