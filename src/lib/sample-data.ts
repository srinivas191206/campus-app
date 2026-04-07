import type { Announcement, Event, CalendarEvent } from '@/types';

export const sampleAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'Mid Semester Examinations Schedule Released',
    shortDescription: 'The mid-semester examination schedule for all CSE sections has been published.',
    fullDescription: 'The mid-semester examination schedule for all CSE sections has been officially published by the examination branch. All students are strongly advised to check the attached timetable document and prepare accordingly. Seating arrangements will be updated exactly 2 days prior to the first examination. Make sure to carry your ID cards.',
    date: '2026-03-28', // Recent post to trigger NEW badge
    expiryDate: '2026-04-10', // Still active
    category: 'Exam',
    audience: 'For: All B.Tech CSE',
    source: 'Examination Cell',
    priority: 'urgent',
    course: 'B.Tech',
    year: 'All',
    attachmentURL: '#', // Simulate PDF link
    attachmentType: 'pdf',
    isPinned: true,
  },
  {
    id: '2',
    title: 'Workshop on Machine Learning with Python',
    shortDescription: 'A two-day workshop on ML fundamentals will be conducted by the CSE department.',
    fullDescription: 'A comprehensive two-day workshop covering Machine Learning fundamentals, scikit-learn, and basic neural networks will be conducted. Registration is open to all years. Spaces are limited to 60 students per batch, so register quickly at the department office.',
    date: '2026-03-22',
    expiryDate: '2026-04-05', // Still active
    category: 'Event',
    audience: 'For: All Students',
    source: 'CSE Department Head',
    priority: 'important',
    course: 'All',
    year: 'All',
    isPinned: false,
  },
  {
    id: '3',
    title: 'Library Books Return Deadline Expired',
    shortDescription: 'The deadline for returning all borrowed library books has passed.',
    fullDescription: 'Due to the completion of the previous academic term, the library administration mandated the return of all borrowed text books. This timeframe has now officially expired. Fines will be calculated.',
    date: '2026-01-20',
    expiryDate: '2026-02-15', // Passed - effectively Archiving this
    category: 'Academic',
    audience: 'For: 4th Year CSE',
    source: 'Central Library',
    priority: 'general',
    course: 'B.Tech',
    year: '4th',
    attachmentURL: '#', // Simulate Document link
    attachmentType: 'document',
    isPinned: false,
  },
];

export const sampleEvents: Event[] = [
  {
    id: '1',
    title: 'TechFest 2026',
    date: '2026-04-10',
    venue: 'University Auditorium',
    category: 'Fest',
    description: 'Annual technical festival featuring coding competitions, hackathons, and guest lectures from industry experts. Register before the deadline at https://techfest.campus.edu or check our official social channels.',
    links: [
      { title: 'Official Brochure', url: 'https://campus.edu/brochure.pdf' }
    ]
  },
  {
    id: '2',
    title: 'Alumni Meet & Greet',
    date: '2026-04-18',
    venue: 'CSE Seminar Hall',
    category: 'Seminar',
    description: 'Interactive session with successful alumni from the CSE department sharing their career experiences.',
  },
  {
    id: '3',
    title: 'Project Exhibition',
    date: '2026-04-25',
    venue: 'CSE Labs Block',
    category: 'Exhibition',
    description: 'Final year students showcase their capstone projects. Open for all students and faculty. Project submission portal is officially active and accepting links: https://forms.gle/dummyxyz submission form.',
  },
];

export const sampleCalendar: CalendarEvent[] = [
  { id: '1', title: 'Mid-1 Examinations Begin', date: '2026-04-01', type: 'internal' },
  { id: '2', title: 'Mid-1 Examinations End', date: '2026-04-05', type: 'internal' },
  { id: '3', title: 'Lab External Exams', date: '2026-05-10', type: 'lab' },
  { id: '4', title: 'Semester End Exams Begin', date: '2026-05-20', type: 'semester' },
  { id: '5', title: 'Ugadi Holiday', date: '2026-03-29', type: 'holiday' },
  { id: '6', title: 'Good Friday', date: '2026-04-03', type: 'holiday' },
  { id: '7', title: 'Mid-2 Examinations', date: '2026-04-20', type: 'internal' },
];
