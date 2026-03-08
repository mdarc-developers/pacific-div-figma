import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { SearchBar } from "@/app/components/SearchBar";
import { Navigation } from "@/app/components/Navigation";
import { FirebaseThemeSync } from "@/app/components/FirebaseThemeSync";
import { FirebaseConferenceSync } from "@/app/components/FirebaseConferenceSync";
import { FirebaseBookmarkSync } from "@/app/components/FirebaseBookmarkSync";
import { FirebaseExhibitorBookmarkSync } from "@/app/components/FirebaseExhibitorBookmarkSync";
import { FirebaseBookmarkCountsSync } from "@/app/components/FirebaseBookmarkCountsSync";
import { FirebaseNotesSync } from "@/app/components/FirebaseNotesSync";
import { FirebaseExhibitorNotesSync } from "@/app/components/FirebaseExhibitorNotesSync";
import { FirebaseVoteSync } from "@/app/components/FirebaseVoteSync";
import { FirebaseExhibitorVoteSync } from "@/app/components/FirebaseExhibitorVoteSync";
import { FirebaseHeaderCollapsedSync } from "@/app/components/FirebaseHeaderCollapsedSync";
import { FirebaseVoteCountsSync } from "@/app/components/FirebaseVoteCountsSync";
import { FirebaseActivitySectionsSync } from "@/app/components/FirebaseActivitySectionsSync";
//import { useState } from 'react';
//import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
//import { Calendar, Map, User, Bell } from 'lucide-react';
//import { ScheduleView } from '@/app/components/ScheduleView';
//import { MapsView } from '@/app/components/MapsView';
import { ConferenceHeader } from "@/app/components/ConferenceHeader";
import { ConferenceHeaderErrorBoundary } from "@/app/components/ConferenceHeaderErrorBoundary";
import { AdminStatsBar } from "@/app/components/AdminStatsBar";
import { useMdarcDeveloper } from "@/app/hooks/useMdarcDeveloper";
import { ConferenceFooter } from "@/app/components/ConferenceFooter";

const MapsPage = lazy(() => import("@/app/pages/MapsPage").then((m) => ({ default: m.MapsPage })));
const PrizesPage = lazy(() => import("@/app/pages/PrizesPage").then((m) => ({ default: m.PrizesPage })));
const AttendeesPage = lazy(() => import("@/app/pages/AttendeesPage").then((m) => ({ default: m.AttendeesPage })));
const ExhibitorsPage = lazy(() => import("@/app/pages/ExhibitorsPage").then((m) => ({ default: m.ExhibitorsPage })));
const SchedulePage = lazy(() => import("@/app/pages/SchedulePage").then((m) => ({ default: m.SchedulePage })));
const ForumsPage = lazy(() => import("@/app/pages/ForumsPage").then((m) => ({ default: m.ForumsPage })));
const AlertsPage = lazy(() => import("@/app/pages/AlertsPage").then((m) => ({ default: m.AlertsPage })));
const ProfilePage = lazy(() => import("@/app/pages/ProfilePage").then((m) => ({ default: m.ProfilePage })));
const LoginPage = lazy(() => import("@/app/pages/LoginPage").then((m) => ({ default: m.LoginPage })));
const SignUpPage = lazy(() => import("@/app/pages/SignUpPage").then((m) => ({ default: m.SignUpPage })));
const SearchPage = lazy(() => import("@/app/pages/SearchPage").then((m) => ({ default: m.SearchPage })));
const PrizesAdminPage = lazy(() => import("@/app/pages/PrizesAdminPage").then((m) => ({ default: m.PrizesAdminPage })));
const PacificonSvgExhibitorMap = lazy(() => import("@/app/components/PacificonSvgExhibitorMap").then((m) => ({ default: m.PacificonSvgExhibitorMap })));
const PrivacyPage = lazy(() => import("@/app/pages/PrivacyPage").then((m) => ({ default: m.PrivacyPage })));
const TermsOfServicePage = lazy(() => import("@/app/pages/TermsOfServicePage").then((m) => ({ default: m.TermsOfServicePage })));
const ConferenceRedirectPage = lazy(() => import("@/app/pages/ConferenceRedirectPage").then((m) => ({ default: m.ConferenceRedirectPage })));

export default function App() {
  const isMdarcDeveloper = useMdarcDeveloper();
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <FirebaseThemeSync />
      <FirebaseConferenceSync />
      <FirebaseBookmarkSync />
      <FirebaseExhibitorBookmarkSync />
      <FirebaseBookmarkCountsSync />
      <FirebaseNotesSync />
      <FirebaseExhibitorNotesSync />
      <FirebaseVoteSync />
      <FirebaseExhibitorVoteSync />
      <FirebaseVoteCountsSync />
      <FirebaseHeaderCollapsedSync />
      <FirebaseActivitySectionsSync />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {isMdarcDeveloper && <AdminStatsBar />}
        <ConferenceHeaderErrorBoundary>
          <ConferenceHeader />
        </ConferenceHeaderErrorBoundary>

        <SearchBar />
        <Navigation />

        <Suspense fallback={<div className="flex justify-center py-8"><div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" /></div>}>
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
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms-of-service" element={<TermsOfServicePage />} />
            <Route
              path="/pacificonfloormap"
              element={<PacificonSvgExhibitorMap />}
            />
            {/* Conference slug redirect — must stay AFTER all static routes.
                Any new static single-segment routes (e.g. /about) must be added ABOVE this line. */}
            <Route path="/:conferenceSlug" element={<ConferenceRedirectPage />} />
            <Route path="*" element={<Navigate to="/404.html" replace />} />
          </Routes>
        </Suspense>

        <ConferenceFooter />
      </div>
    </div>
  );
}
