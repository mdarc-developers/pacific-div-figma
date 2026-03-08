import { useRef, useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import {
  Building2,
  ExternalLink,
  Info,
  Mic,
  Send,
  Trophy,
  User,
} from "lucide-react";
import { Session, Exhibitor, Prize, UserProfile } from "@/types/conference";
import {
  ATTENDEE_DATA,
  ATTENDEE_SUPPLEMENTAL_TOKEN,
} from "@/lib/userProfileData";
import { SESSION_DATA, EXHIBITOR_DATA } from "@/lib/sessionData";
import { PRIZE_DATA } from "@/lib/prizesData";
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

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

interface AttendeeCardProps {
  attendee: UserProfile;
  isHighlighted: boolean;
  sessionMap: Map<string, Session>;
  exhibitorMap: Map<string, Exhibitor>;
  prizeMap: Map<string, Prize>;
}

function AttendeeCard({
  attendee,
  isHighlighted,
  sessionMap,
  exhibitorMap,
  prizeMap,
}: AttendeeCardProps) {
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
    const isSpeaker = attendee.sessions && attendee.sessions.length > 0;
    const hasExhibitors = attendee.exhibitors && attendee.exhibitors.length > 0;
    const hasPrizes =
      attendee.prizesDonated && attendee.prizesDonated.length > 0;
    const hasContent =
      attendee.displayProfile || isSpeaker || hasExhibitors || hasPrizes;

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
              {isSpeaker && <Mic className="h-4 w-4" />}
              <User className="h-4 w-4" />
              <CardTitle className="flex text-lg mb-2 w-full gap-2 space-y-2">
                {attendee.displayName}&nbsp;&nbsp;
                {displayCallsign(attendee.callsign)}
              </CardTitle>
              {isValidEmail(attendee.email) && (
                <span className="float-right items-center space-y-2 gap-2 text-gray-700 dark:text-gray-300">
                  <a href={`mailto:${attendee.email}`} className="flex">
                    email&nbsp;
                    <Send className="flex h-4 w-4" />
                  </a>
                </span>
              )}
            </div>
          </CardHeader>
          {hasContent && (
            <CardContent>
              {attendee.displayProfile && (
                <div className="text-sm flex gap-2 text-gray-600 dark:text-gray-400 mb-3">
                  <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{attendee.displayProfile}</span>
                </div>
              )}
              {isSpeaker && (
                <div className="text-sm space-y-1 mb-2">
                  <p className="font-semibold">Speaker</p>
                  {attendee.sessions?.map((sessionId) => {
                    const session = sessionMap.get(sessionId);
                    return (
                      <div
                        key={sessionId}
                        className="flex items-center gap-2 text-gray-700 dark:text-gray-300"
                      >
                        <Mic className="h-4 w-4" />
                        <Link
                          to={`/search?highlight=${sessionId}`}
                          className="hover:underline"
                        >
                          {session ? session.title : sessionId}
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
              {hasExhibitors && (
                <div className="text-sm space-y-1 mb-2">
                  <p className="font-semibold">Exhibitor</p>
                  {attendee.exhibitors?.map((exhibitorId) => {
                    const exhibitor = exhibitorMap.get(exhibitorId);
                    return (
                      <div
                        key={exhibitorId}
                        className="flex items-center gap-2 text-gray-700 dark:text-gray-300"
                      >
                        <Building2 className="h-4 w-4" />
                        <Link
                          to={`/exhibitors#${exhibitorId}`}
                          className="hover:underline"
                        >
                          {exhibitor ? exhibitor.name : exhibitorId}
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
              {hasPrizes && (
                <div className="text-sm space-y-1">
                  <p className="font-semibold">Donated Prizes</p>
                  {attendee.prizesDonated?.map((prizeId) => {
                    const prize = prizeMap.get(prizeId);
                    return (
                      <div
                        key={prizeId}
                        className="flex items-center gap-2 text-gray-700 dark:text-gray-300"
                      >
                        <Trophy className="h-4 w-4" />
                        <Link
                          to={`/prizes#prize-${prizeId}`}
                          className="hover:underline"
                        >
                          {prize ? prize.name : prizeId}
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          )}
        </Card>
      </div>
    );
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
  const attendees = (ATTENDEE_DATA[activeConference.id] || []).filter(
    (a) => a.profileVisible !== false,
  );
  const updateToken = ATTENDEE_SUPPLEMENTAL_TOKEN[activeConference.id];
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Build lookup maps for sessions, exhibitors, and prizes (memoized per conference)
  const sessionMap = useMemo(
    () =>
      new Map((SESSION_DATA[activeConference.id] || []).map((s) => [s.id, s])),
    [activeConference.id],
  );
  const exhibitorMap = useMemo(() => {
    const entry = EXHIBITOR_DATA[activeConference.id];
    return new Map((entry ? entry[1] : []).map((e) => [e.id, e]));
  }, [activeConference.id]);
  const prizeMap = useMemo(
    () =>
      new Map((PRIZE_DATA[activeConference.id] || []).map((p) => [p.id, p])),
    [activeConference.id],
  );

  // Derive category lists from UserProfile attributes
  const speakers = attendees.filter((a) => a.sessions && a.sessions.length > 0);
  const exhibitors = attendees.filter(
    (a) => a.exhibitors && a.exhibitors.length > 0,
  );
  // Users with any group membership are treated as organizers/staff
  const organizers = attendees.filter((a) => a.groups && a.groups.length > 0);

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
              sessionMap={sessionMap}
              exhibitorMap={exhibitorMap}
              prizeMap={prizeMap}
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
                sessionMap={sessionMap}
                exhibitorMap={exhibitorMap}
                prizeMap={prizeMap}
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
