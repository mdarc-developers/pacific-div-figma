import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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
import { pacificonData } from '@/data/pacificon-sample';
//import { pacificonData, sampleSessions, sampleMaps } from '@/data/pacificon-sample';

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <ConferenceHeader conference={pacificonData} />

        <Navigation />

        <Routes>
          <Route path="/" element={<Navigate to="/maps" replace />} />
          <Route path="/maps" element={<MapsPage conference={pacificonData} />} />
          <Route path="/schedule" element={<SchedulePage conference={pacificonData} />} />
          <Route path="/alerts" element={<AlertsPage conference={pacificonData} />} />
          <Route path="/profile" element={<ProfilePage conference={pacificonData} />} />
          <Route path="/login" element={<LoginPage conference={pacificonData} />} />
          <Route path="/signup" element={<SignUpPage conference={pacificonData} />} />
          <Route path="*" element={<Navigate to="/404.html" replace />} />
        </Routes>

        <ConferenceFooter conference={pacificonData} />

      </div>
    </div>
  );
}
