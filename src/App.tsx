import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ScrollToTop from "@/components/ScrollToTop";
import MobileLayout from "@/components/MobileLayout";
import HomePage from "@/pages/HomePage";
import UtilitiesPage from "@/pages/UtilitiesPage";
import CGPACalculator from "@/pages/CGPACalculator";
import TimetablePage from "@/pages/TimetablePage";
import AttendancePage from "@/pages/AttendancePage";
import CalendarPage from "@/pages/CalendarPage";
import AssignmentsPage from "@/pages/AssignmentsPage";
import AnnouncementsPage from "@/pages/AnnouncementsPage";
import EventsPage from "@/pages/EventsPage";
import ProfilePage from "@/pages/ProfilePage";
import SettingsPage from "@/pages/SettingsPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route element={<MobileLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/utilities" element={<UtilitiesPage />} />
            <Route path="/utilities/cgpa" element={<CGPACalculator />} />
            <Route path="/utilities/timetable" element={<TimetablePage />} />
            <Route path="/utilities/attendance" element={<AttendancePage />} />
            <Route path="/utilities/calendar" element={<CalendarPage />} />
            <Route path="/utilities/assignments" element={<AssignmentsPage />} />
            <Route path="/announcements" element={<AnnouncementsPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
