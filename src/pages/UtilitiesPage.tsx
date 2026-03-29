import { useNavigate } from 'react-router-dom';
import { Calculator, Clock, BarChart3, CalendarDays, FileText, ChevronRight } from 'lucide-react';

const UTILITIES = [
  {
    title: 'CGPA / SGPA Calculator',
    desc: 'Calculate semester and cumulative GPA',
    icon: Calculator,
    path: '/utilities/cgpa',
    gradient: 'cs-gradient-primary',
  },
  {
    title: 'Timetable',
    desc: 'Set up and view your class schedule',
    icon: Clock,
    path: '/utilities/timetable',
    gradient: 'cs-gradient-accent',
  },
  {
    title: 'Attendance & Bunk Planner',
    desc: 'Track attendance and plan bunks safely',
    icon: BarChart3,
    path: '/utilities/attendance',
    gradient: 'cs-gradient-warm',
  },
  {
    title: 'Academic Calendar',
    desc: 'Exams, holidays, and important dates',
    icon: CalendarDays,
    path: '/utilities/calendar',
    gradient: 'cs-gradient-primary',
  },
  {
    title: 'Assignment Tracker',
    desc: 'Track deadlines and pending work',
    icon: FileText,
    path: '/utilities/assignments',
    gradient: 'cs-gradient-purple',
  },
];

const UtilitiesPage = () => {
  const navigate = useNavigate();

  return (
    <div className="cs-page">
      <h1 className="text-2xl font-bold text-foreground mb-1">Utilities</h1>
      <p className="text-sm text-muted-foreground mb-6">Academic tools at your fingertips</p>

      <div className="space-y-3">
        {UTILITIES.map(({ title, desc, icon: Icon, path, gradient }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className="cs-card-elevated p-4 w-full flex items-center gap-4 active:scale-[0.98] transition-transform"
          >
            <div className={`w-12 h-12 rounded-2xl ${gradient} flex items-center justify-center flex-shrink-0`}>
              <Icon className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="font-semibold text-sm text-card-foreground">{title}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default UtilitiesPage;
