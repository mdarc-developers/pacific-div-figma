import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { SearchBar } from '@/app/components/SearchBar';
import { Navigation } from '@/app/components/Navigation';
//import { useState } from 'react';
//import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
//import { Calendar, Map, User, Bell } from 'lucide-react';
//import { ScheduleView } from '@/app/components/ScheduleView';
//import { MapsView } from '@/app/components/MapsView';
import { ConferenceHeader } from '@/app/components/ConferenceHeader';
import { ConferenceFooter } from '@/app/components/ConferenceFooter';
import { MapsPage } from '@/app/pages/MapsPage';
import { SchedulePage } from '@/app/pages/SchedulePage';
import { AlertsPage } from '@/app/pages/AlertsPage';
import { ProfilePage } from '@/app/pages/ProfilePage';
import { LoginPage } from '@/app/pages/LoginPage';
import { SignUpPage } from '@/app/pages/SignUpPage';
//import { pacificonData } from '@/data/pacificon-sample';
//import { pacificonData, sampleSessions, sampleMaps } from '@/data/pacificon-sample';
//import { useConference } from '@/app/contexts/ConferenceContext';
//import { allConferences } from '@/data/all-conferences';
//import { Conference } from '@/types/conference';


//activeConference: Conference | null;
//allConferences: Conference[] | null;

export default function App() {
  //const [bookmarkedSessions, setBookmarkedSessions] = useState<string[]>([]);
  //const [activeTab, setActiveTab] = useState('maps');

  //const handleToggleBookmark = (sessionId: string) => {
  //  setBookmarkedSessions(prev =>
  //    prev.includes(sessionId)
  //      ? prev.filter(id => id !== sessionId)
  //      : [...prev, sessionId]
  //  );
  //};

  //const { activeConference, allConferencesList, setActiveConference } = useConference();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <ConferenceHeader />

        <SearchBar />
        <Navigation />

        <Routes>
          <Route path="/" element={<Navigate to="/maps" replace />} />
          <Route path="/maps" element={<MapsPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="*" element={<Navigate to="/404.html" replace />} />
        </Routes>

        <ConferenceFooter />

      </div>
    </div>
  );
}
