import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { SearchBar } from "@/app/components/SearchBar";
import { Navigation } from "@/app/components/Navigation";
import { FirebaseThemeSync } from "@/app/components/FirebaseThemeSync";
//import { useState } from 'react';
//import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
//import { Calendar, Map, User, Bell } from 'lucide-react';
//import { ScheduleView } from '@/app/components/ScheduleView';
//import { MapsView } from '@/app/components/MapsView';
import { ConferenceHeader } from "@/app/components/ConferenceHeader";
import { ConferenceFooter } from "@/app/components/ConferenceFooter";
import { MapsPage } from "@/app/pages/MapsPage";
import { PrizesPage } from "@/app/pages/PrizesPage";
import { AttendeesPage } from "@/app/pages/AttendeesPage";
import { ExhibitorsPage } from "@/app/pages/ExhibitorsPage";
import { SchedulePage } from "@/app/pages/SchedulePage";
import { ForumsPage } from "@/app/pages/ForumsPage";
import { AlertsPage } from "@/app/pages/AlertsPage";
import { ProfilePage } from "@/app/pages/ProfilePage";
import { LoginPage } from "@/app/pages/LoginPage";
import { SignUpPage } from "@/app/pages/SignUpPage";
import { SearchPage } from "@/app/pages/SearchPage";
import { PrizesAdminPage } from "@/app/pages/PrizesAdminPage";
import { PacificonFloorMap } from "@/app/components/PacificonFloorMap";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <FirebaseThemeSync />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <ConferenceHeader />

        <SearchBar />
        <Navigation />

        <Routes>
          <Route path="/" element={<Navigate to="/schedule" replace />} />
          <Route path="/maps" element={<MapsPage />} />
          <Route path="/prizes" element={<PrizesPage />} />
          <Route path="/attendees" element={<AttendeesPage />} />
          <Route path="/exhibitors" element={<ExhibitorsPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/forums" element={<ForumsPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/admin/prizes" element={<PrizesAdminPage />} />
          <Route path="/pacificonfloormap" element={<PacificonFloorMap />} />
          <Route path="*" element={<Navigate to="/404.html" replace />} />
        </Routes>

        <ConferenceFooter />
      </div>
    </div>
  );
}
