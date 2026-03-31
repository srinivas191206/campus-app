// CampuSync Data Models — Backend-ready architecture

export interface Subject {
  id: string;
  name: string;
  credits: number;
  grade: string;
}

export interface Semester {
  id: string;
  number: number;
  subjects: Subject[];
  sgpa: number | null;
}

export interface SemesterRecord {
  id: string;
  title: string;
  academicYear?: string;
  studentName: string;
  course: string;
  year: string;
  subjects: Subject[];
  lastUpdated: string;
  sgpa: number;
}

export interface TimetableEntry {
  id: string;
  day: string;
  subject: string;
  time: string;
  room?: string;
}

export interface AttendanceRecord {
  id: string;
  subject: string;
  totalClasses: number;
  attendedClasses: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'internal' | 'lab' | 'semester' | 'holiday';
  description?: string;
}

export interface Assignment {
  id: string;
  subject: string;
  title: string;
  deadline: string;
  description: string;
  completed: boolean;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  date: string;
  expiryDate: string;
  category: 'Academic' | 'Exam' | 'Event' | 'Placement';
  audience: string;
  source: string;
  priority: 'urgent' | 'important' | 'general';
  course: 'All' | 'B.Tech' | 'M.Tech';
  year: 'All' | '1st' | '2nd' | '3rd' | '4th';
  attachmentURL?: string;
  attachmentType?: 'pdf' | 'image' | 'document';
  isPinned: boolean;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  venue: string;
  description: string;
  image?: string;
  links?: { title: string, url: string }[];
}

export type CourseType = 'B.Tech' | 'M.Tech';

export const CLASS_OPTIONS: Record<CourseType, string[]> = {
  'B.Tech': ['CSE', 'AIML', 'CSE-ICP', 'AIML-ICP'],
  'M.Tech': ['Cyber Security', 'Data Science'],
};

export const YEAR_OPTIONS: Record<CourseType, number[]> = {
  'B.Tech': [1, 2, 3, 4],
  'M.Tech': [1, 2],
};

export interface UserProfile {
  id: string;
  name: string;
  nickname: string;
  rollNumber: string;
  course: CourseType;
  className: string;
  year: number;
  semester: number;
  email: string;
  profilePicture?: string;
}

export const GRADE_POINTS: Record<string, number> = {
  'S': 10, 'A': 9, 'B': 8, 'C': 7, 'D': 6, 'E': 5, 'F': 0,
};

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

export const GRADES = ['S', 'A', 'B', 'C', 'D', 'E', 'F'] as const;
