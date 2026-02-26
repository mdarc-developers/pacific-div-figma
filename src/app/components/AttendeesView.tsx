import { useRef, useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { ExternalLink, Send, User } from 'lucide-react';
import { UserProfile } from '@/types/conference';
import { useConference } from '@/app/contexts/ConferenceContext';

interface AttendeeCardProps {
  attendee: UserProfile;
  isHighlighted: boolean;
}

function AttendeeCard({ attendee, isHighlighted }: AttendeeCardProps) {
  const attendeeRef = useRef<HTMLDivElement>(null);
  //console.log(attendee);

  useEffect(() => {
    if (isHighlighted && attendeeRef.current) {
      attendeeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isHighlighted]);

  function displayCallsign(call: string | undefined) {
    if (call) {
      return (
        <a
          className="hover:underline flex"
          href={`https://www.qrz.com/db/${call}`}
          rel="noopener noreferrer"
          target="_blank"
        >
          {call}&nbsp;<ExternalLink className="flex h-4 w-4" />
        </a>
      );
    } else {
      return ('');
    }
  }

  if (attendee.displayName) {
    return (
      <div
        ref={attendeeRef}
        id={`attendee-${attendee.uid}`}
        className={`mb-4 transition-all w-full ${isHighlighted
          ? 'ring-2 ring-blue-500 shadow-lg scale-105'
          : ''
          }`}
      >
        <Card className={`transition-all w-full  ${isHighlighted ? 'ring-2 ring-blue-500 shadow-lg scale-105' : ''}`}>
          <CardHeader>
            <div className="flex space-y-2 gap-2 justify-between items-start">
              <User className="h-4 w-4" />
              <CardTitle className="flex text-lg mb-2 w-full gap-2 space-y-2">
                {attendee.displayName}&nbsp;&nbsp;
                {displayCallsign(attendee.callsign)}


              </CardTitle>
              <span className="float-right items-center space-y-2 gap-2 text-gray-700 dark:text-gray-300">
                <a href={`mailto:${attendee.email}`} className="flex">
                  email&nbsp;<Send className="flex h-4 w-4" />
                </a>
              </span>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
    //     hover text? profiles waste a lot of vertical space
    //<CardContent>
    //  <div className="text-sm space-y-2 flex gap-2 text-gray-600 dark:text-gray-400 mb-3">
    //    <Info className="h-4 w-4" />
    //    {attendee.profile}<br/>
    //  </div>
    //</CardContent>
  } else {
    return '';
  }
}

interface AttendeeModule {
  sampleAttendees?: UserProfile[];
  [key: string]: unknown;
}

// Import all attendee data files at once using Vite's glob import
const conferenceModules = import.meta.glob('../../data/*-20[0-9][0-9].ts', { eager: true });

// Process the modules into a lookup object
const ATTENDEE_DATA: Record<string, UserProfile[]> = {};
Object.entries(conferenceModules).forEach(([path, module]) => {
  const conferenceId = path.split('/').pop()?.replace('.ts', '') || '';
  const typedModule = module as AttendeeModule;
  if (typedModule.sampleAttendees) {
    ATTENDEE_DATA[conferenceId] = typedModule.sampleAttendees;
  }
});

interface AttendeesViewProps {
  highlightAttendeeId?: string;
}

export function AttendeesView({
  highlightAttendeeId }: AttendeesViewProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { activeConference, allConferencesList, setActiveConference } = useConference();
  const attendees = ATTENDEE_DATA[activeConference.id] || [];
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Group attendees by category
  //const groupAttendeesByCategory = (attendee: UserProfile[]) => {
  //const grouped: Record<string, UserProfile[]> = {};
  //attendees.forEach(loopattendee => {
  //  const category = loopattendee.category ? loopattendee.category : 'Attendee';
  //  if (!grouped[category]) {
  //    grouped[category] = [];
  //  }
  //  grouped[category].push(loopattendee);
  //});
  //return grouped;
  //};

  //const groupedAttendees = groupAttendeesByCategory(attendees);
  //const categoryKeys = Object.keys(groupedAttendees).sort();

  //export interface UserProfile {
  //  uid: string;
  //  email: string;
  //  callsign?: string;
  //  displayName?: string;
  //  displayProfile?: string;
  //  darkMode: boolean;
  //  bookmarkedSessions: string[];
  //  notificationsEnabled: boolean;
  //  smsNotifications: boolean;
  //  phoneNumber?: string;
  //}

  return (
    <div className="w-full">
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="hidden w-full mb-6 flex-wrap h-auto">
          <TabsTrigger value="all">Attendees</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          {attendees
            .map(attendee => (
              <AttendeeCard
                key={attendee.uid}
                attendee={attendee}
                isHighlighted={highlightAttendeeId === attendee.uid}
              />
            ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
