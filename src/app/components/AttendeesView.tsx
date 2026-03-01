import { useRef, useEffect, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/app/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import { ExternalLink, Send, User } from "lucide-react";
import { UserProfile } from "@/types/conference";
import { ATTENDEE_DATA, ATTENDEE_SUPPLEMENTAL_TOKEN } from "@/lib/attendeeData";
import { useConference } from "@/app/contexts/ConferenceContext";
import { blendWithWhite, contrastingColor } from "@/lib/colorUtils";
import {
  formatUpdateToken,
  formatUpdateTokenDetail,
} from "@/lib/overrideUtils";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/app/components/ui/tooltip";

interface AttendeeCardProps {
  attendee: UserProfile;
  isHighlighted: boolean;
}

function AttendeeCard({ attendee, isHighlighted }: AttendeeCardProps) {
  const attendeeRef = useRef<HTMLDivElement>(null);
  //console.log(attendee);

  useEffect(() => {
    if (isHighlighted && attendeeRef.current) {
      attendeeRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
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
          {call}&nbsp;
          <ExternalLink className="flex h-4 w-4" />
        </a>
      );
    } else {
      return "";
    }
  }

  if (attendee.displayName) {
    return (
      <div
        ref={attendeeRef}
        id={`attendee-${attendee.uid}`}
        className={`mb-4 transition-all w-full ${
          isHighlighted ? "ring-2 ring-blue-500 shadow-lg scale-105" : ""
        }`}
      >
        <Card
          className={`transition-all w-full  ${isHighlighted ? "ring-2 ring-blue-500 shadow-lg scale-105" : ""}`}
        >
          <CardHeader>
            <div className="flex space-y-2 gap-2 justify-between items-start">
              <User className="h-4 w-4" />
              <CardTitle className="flex text-lg mb-2 w-full gap-2 space-y-2">
                {attendee.displayName}&nbsp;&nbsp;
                {displayCallsign(attendee.callsign)}
              </CardTitle>
              <span className="float-right items-center space-y-2 gap-2 text-gray-700 dark:text-gray-300">
                <a href={`mailto:${attendee.email}`} className="flex">
                  email&nbsp;
                  <Send className="flex h-4 w-4" />
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
    return "";
  }
}

interface AttendeesViewProps {
  highlightAttendeeId?: string;
}

export function AttendeesView({ highlightAttendeeId }: AttendeesViewProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { activeConference, allConferencesList, setActiveConference } =
    useConference();
  const attendees = ATTENDEE_DATA[activeConference.id] || [];
  const updateToken = ATTENDEE_SUPPLEMENTAL_TOKEN[activeConference.id];
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Derive category lists from UserProfile attributes
  const speakers = attendees.filter(
    (a) => a.sessions && a.sessions.length > 0,
  );
  const exhibitors = attendees.filter(
    (a) => a.exhibitors && a.exhibitors.length > 0,
  );
  // Users with any group membership are treated as organizers/staff
  const organizers = attendees.filter(
    (a) => a.groups && a.groups.length > 0,
  );

  // Build the list of visible category tabs (only show non-empty ones)
  const categoryTabs = (
    [
      { key: "speakers", label: "Speakers", list: speakers },
      { key: "exhibitors", label: "Exhibitors", list: exhibitors },
      { key: "organizers", label: "Organizers", list: organizers },
    ] as { key: string; label: string; list: UserProfile[] }[]
  ).filter((cat) => cat.list.length > 0);

  const tabBg = blendWithWhite(activeConference.primaryColor);
  const tabText = contrastingColor(tabBg);

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
      <Tabs
        value={selectedCategory}
        onValueChange={setSelectedCategory}
        className="w-full"
      >
        <div
          className="rounded-lg p-2 mb-6 w-full"
          style={{ backgroundColor: tabBg, color: tabText }}
        >
          <TabsList className="w-full flex-wrap h-auto bg-transparent">
            <TabsTrigger value="all">All Attendees</TabsTrigger>
            {categoryTabs.map((cat) => (
              <TabsTrigger key={cat.key} value={cat.key}>
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <TabsContent value="all">
          {attendees.map((attendee) => (
            <AttendeeCard
              key={attendee.uid}
              attendee={attendee}
              isHighlighted={highlightAttendeeId === attendee.uid}
            />
          ))}
        </TabsContent>
        {categoryTabs.map((cat) => (
          <TabsContent key={cat.key} value={cat.key}>
            {cat.list.map((attendee) => (
              <AttendeeCard
                key={attendee.uid}
                attendee={attendee}
                isHighlighted={highlightAttendeeId === attendee.uid}
              />
            ))}
          </TabsContent>
        ))}
      </Tabs>
      {updateToken && (
        <p className="text-xs text-gray-400 mt-4">
          Updated:{" "}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="underline decoration-dotted cursor-help"
              >
                {formatUpdateToken(updateToken)}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              {formatUpdateTokenDetail(updateToken)}
            </TooltipContent>
          </Tooltip>
        </p>
      )}
    </div>
  );
}
