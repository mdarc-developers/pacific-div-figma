import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Calendar, Map, User, Bell } from 'lucide-react';
import { ScheduleView } from '@/app/components/ScheduleView';
import { MapsView } from '@/app/components/MapsView';
import { ConferenceHeader } from '@/app/components/ConferenceHeader';
import { ConferenceSelector } from '@/app/components/ConferenceSelector';
import { pacificonData, sampleSessions, sampleMaps } from '@/data/pacificon-sample';
import { allConferences } from '@/data/all-conferences';
import { Conference } from '@/types/conference';

export default function App() {
  const [activeConference, setActiveConference] = useState<Conference>(pacificonData);
  const [bookmarkedSessions, setBookmarkedSessions] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('schedule');

  const handleToggleBookmark = (sessionId: string) => {
    setBookmarkedSessions(prev => 
      prev.includes(sessionId)
        ? prev.filter(id => id !== sessionId)
        : [...prev, sessionId]
    );
  };

  // Filter sessions and maps based on active conference
  const conferenceSessions = sampleSessions.filter(
    session => session.conferenceId === activeConference.id
  );
  const conferenceMaps = sampleMaps.filter(
    map => map.conferenceId === activeConference.id
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header with Conference Selector */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div className="flex-1 min-w-0">
            <ConferenceHeader conference={activeConference} />
          </div>
          <div className="flex-shrink-0">
            <ConferenceSelector
              conferences={allConferences}
              activeConference={activeConference}
              onSelectConference={setActiveConference}
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Schedule</span>
            </TabsTrigger>
            <TabsTrigger value="maps" className="flex items-center gap-2">
              <Map className="h-4 w-4" />
              <span className="hidden sm:inline">Maps</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Alerts</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schedule">
            <ScheduleView 
              sessions={conferenceSessions}
              bookmarkedSessions={bookmarkedSessions}
              onToggleBookmark={handleToggleBookmark}
            />
          </TabsContent>

          <TabsContent value="maps">
            <MapsView maps={conferenceMaps} />
          </TabsContent>

          <TabsContent value="profile">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
              <User className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">Account Features</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Sign in to access personalized features:
              </p>
              <ul className="text-left max-w-md mx-auto space-y-2 text-gray-700 dark:text-gray-300">
                <li>• Bookmark favorite sessions</li>
                <li>• Receive prize winner notifications</li>
                <li>• Send messages to other attendees</li>
                <li>• Dark mode preferences</li>
                <li>• SMS & email notifications</li>
              </ul>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-6">
                Authentication will be enabled with Firebase configuration
              </p>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
              <Bell className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">Prize Notifications</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Sign in to receive notifications when you win prizes!
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                In-app, email, and SMS notifications available
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            For questions or suggestions, contact:{' '}
            <a 
              href="mailto:webmaster@pacificon.org" 
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              webmaster@pacificon.org
            </a>
          </p>
          <p className="mt-2">
            Multi-conference support • Timezone aware • Offline capable
          </p>
        </footer>
      </div>
    </div>
  );
}