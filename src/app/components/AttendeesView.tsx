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
import { Button } from "@/app/components/ui/button";
import {
  Building2,
  Eye,
  ExternalLink,
  HatGlasses,
  Info,
  Mic,
  RefreshCw,
  Trophy,
  User,
} from "lucide-react";
import { useSignupCount } from "@/app/hooks/useSignupCount";
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
import { usePublicAttendees } from "@/app/hooks/usePublicAttendees";

/** Placeholder card shown for attendees who have not opted in to be visible. */
function HiddenAttendeeCard() {
  return (
    <div className="mb-4 w-full">
      <Card className="w-full opacity-60">
        <CardHeader>
          <div className="flex items-center gap-2">
            <HatGlasses className="h-5 w-5 text-gray-400" />
            <CardTitle className="text-base text-gray-400 italic">
              Anonymous Attendee
            </CardTitle>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
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
  const staticAttendees = (ATTENDEE_DATA[activeConference.id] || []).filter(
    (a) => a.profileVisible !== false,
  );
  const updateToken = ATTENDEE_SUPPLEMENTAL_TOKEN[activeConference.id];
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showVisibleOnly, setShowVisibleOnly] = useState(true);
  const signupCount = useSignupCount();

  // Fetch public attendees from Firestore (with localStorage caching)
  const {
    attendees: firestoreAttendees,
    loading: firestoreLoading,
    error: firestoreError,
    refresh: refreshAttendees,
  } = usePublicAttendees();

  // Merge static attendees with Firestore attendees.
  // Static entries take precedence (they carry curated session/exhibitor links).
  // Firestore entries whose uid is not already present in static data are appended.
  const staticUids = useMemo(
    () => new Set(staticAttendees.map((a) => a.uid)),
    [staticAttendees],
  );
  const attendees = useMemo(() => {
    const firestoreOnly = firestoreAttendees
      .filter((fa) => !staticUids.has(fa.uid))
      .map(
        (fa): UserProfile => ({
          uid: fa.uid,
          // email is not available in public profiles; empty string satisfies the
          // required field while AttendeeCard no longer displays it for privacy.
          email: "",
          darkMode: false,
          bookmarkedSessions: [],
          notificationsEnabled: false,
          smsNotifications: false,
          displayName: fa.displayName,
          callsign: fa.callsign,
          displayProfile: fa.displayProfile,
          profileVisible: true,
        }),
      );
    return [...staticAttendees, ...firestoreOnly];
  }, [staticAttendees, firestoreAttendees, staticUids]);

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

  /** Renders either an AttendeeCard or a HiddenAttendeeCard placeholder. */
  const renderAttendee = (attendee: UserProfile) => {
    if (!attendee.profileVisible) {
      return showVisibleOnly ? null : <HiddenAttendeeCard key={attendee.uid} />;
    }
    return (
      <AttendeeCard
        key={attendee.uid}
        attendee={attendee}
        isHighlighted={highlightAttendeeId === attendee.uid}
        sessionMap={sessionMap}
        exhibitorMap={exhibitorMap}
        prizeMap={prizeMap}
      />
    );
  };

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
          {/* Filter toolbar */}
          <div className="flex gap-2 mb-2 justify-between items-center">
            <div className="flex gap-2 items-center">
              <Button
                variant={showVisibleOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setShowVisibleOnly((v) => !v)}
                className="flex items-center gap-1"
              >
                <Eye
                  className={`h-4 w-4 ${showVisibleOnly ? "fill-current" : ""}`}
                />
                Visible
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshAttendees}
                disabled={firestoreLoading}
                className="flex items-center gap-1"
                title="Refresh attendee list from server"
              >
                <RefreshCw
                  className={`h-4 w-4 ${firestoreLoading ? "animate-spin" : ""}`}
                />
                Sync
              </Button>
            </div>
            {signupCount !== null && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/20">
                {signupCount} registered
              </span>
            )}
          </div>
          {firestoreError && (
            <p className="text-xs text-red-500 mb-2">
              Could not sync from server: {firestoreError}
            </p>
          )}

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
          {attendees.map((attendee) => renderAttendee(attendee))}
        </TabsContent>
        {categoryTabs.map((cat) => (
          <TabsContent key={cat.key} value={cat.key}>
            {cat.list.map((attendee) => renderAttendee(attendee))}
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
