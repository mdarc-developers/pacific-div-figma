export type ConferenceSeparator = { id: "---" };
export type ConferenceListItem = Conference | ConferenceSeparator;

export interface Conference {
  id: string;
  name: string;
  venue: string;
  startDate: string; // stored in local date and time for the conference timezone
  endDate: string; // stored in local date and time for the conference timezone
  timezone: string;
  primaryColor: string;
  secondaryColor: string;
  location: string;
  conferenceWebsite: string;
  venuePhone: string;
  venueGPS: string;
  venueGridSquare: string;
  venueWebsite: string;
  timezoneNumeric: string;
  parkingWebsite: string;
  icalUrl: string;
  googlecalUrl: string;
  contactEmail: string;
  logoUrl: string;
  votes?: number;
  mapSessionRooms?: [string, boolean, boolean][];
  mapExhibitorBooths?: [string, boolean, boolean][];
  conferenceProgramUrl?: string;
  conferenceProgramSourceUrl?: string; // upstream URL used by scripts/fetch-programs.mjs to refresh the cached local copy
  conferenceAppPageUrl?: string;
  firstConferenceYear?: number;
  estimatedAttendees?: number;
}

export interface MapImage {
  id: string;
  name: string;
  url: string;
  floor?: string;
  order: number;
  origWidthNum?: number;
  origHeightNum?: number;
  category?: string[];
}

export interface Booth {
  id: number;
  coords: [number, number][];
  locationZone: string;
  /** Default booth label (overrides numeric id; e.g. "NP-5", "T-3"). */
  label?: string;
  /** X offset from the booth centre for placing the label, in the map's coordinate units. */
  labelOffsetX?: number;
  /** Y offset from the booth centre for placing the label, in the map's coordinate units. */
  labelOffsetY?: number;
  /** Label rotation in degrees. */
  labelRotation?: number;
  /** Horizontal text justification for the booth label. */
  labelJustify?: "left" | "center" | "right";
}

export interface Exhibitor {
  id: string;
  name: string;
  description: string;
  boothName: string;
  location: number[];
  type?: string;
  url?: string;
  color?: string;
  votes?: number;
  prizesDonated?: string[];
}

export interface Room {
  name: string;
  coords: [number, number][];
  color: string;
  locationZone?: string;
}

export interface Session {
  id: string;
  title: string;
  description: string;
  speaker: string[];
  location: string;
  startTime: string; // stored in local date and time for the conference timezone
  endTime: string; // stored in local date and time for the conference timezone
  category: string;
  url?: string;
  track?: string[];
  votes?: number;
}

export interface Prize {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: string;
  donor: string;
  winner?: string;
  votes?: number;
}

export interface PrizeWinner {
  // PrizeAwards? attributes of Prize? typically unidentified at first
  id: string; // multiple ids for multiple prizes won
  prizeId: string[]; // I think just string
  winningTicket: string; // public
  conferenceId?: string; // which conference this winner belongs to
  winnerCallsign?: string; // not public
  winnerEmail?: string; // not public
  winnerName?: string; // not public
  drawing?: string; // award
  notifiedAt?: string; // award
  claimedAt?: string; // award
  votes?: number;
}

export interface UserProfileGroups {
  uid: string;
  groups: string[];
}

export interface UserProfile {
  uid: string;
  email: string;
  darkMode: boolean;
  bookmarkedSessions: string[];
  notificationsEnabled: boolean;
  smsNotifications: boolean;
  roles?: string[];
  groups?: string[];
  callsign?: string;
  displayName?: string; // for exhibitors, speakers or anyone
  displayProfile?: string; // like a public QRZ text for display, also speaker bio - should not be empty for speakers
  phoneNumber?: string; // not for public display, just for alerts/notifications
  minutesBefore?: number; // minutes before a bookmarked session/forum to send a notification
  raffleTickets?: string[];
  votes?: number; // an interesting popularity contest for Gordo then everyone else!
  exhibitors?: string[]; // employees or owners, possibly associated with multiple exhibitors
  // including Pacificon, MDARC, ARRL, a vendor, a nonprofit, etc.
  sessions?: string[]; // could be leading more than one session
  prizesDonated?: string[];
  prizeWinnerId?: string[];
  profileVisible?: boolean; // whether the user's profile appears in /attendees
  showQrzLink?: boolean; // whether to show a QRZ.com lookup link for the callsign
}

/**
 * Public attendee profile stored in the `publicProfiles` Firestore collection.
 * Contains only the fields that are safe to expose to authenticated users.
 * Synced automatically by the `syncPublicProfile` Cloud Function whenever a
 * `users/{uid}` document changes and `profileVisible` is true.
 *
 * Fields intentionally excluded: email, groups, prizesDonated.
 * These are considered private and must never be stored in publicProfiles.
 * The `exhibitors` field is included as it represents a non-sensitive
 * organisational affiliation (employer / vendor / volunteer) that users
 * explicitly opt into by populating their own profile.
 * The `speakerSessions` field is included because presenting at a session
 * is explicitly opted into by the user via the Speaker card.
 */
export interface PublicAttendeeProfile {
  uid: string;
  displayName?: string;
  callsign?: string;
  displayProfile?: string;
  /** Exhibitor IDs this person is associated with (employee, owner, volunteer, etc.). */
  exhibitors?: string[];
  /**
   * Sessions this person has opted in to present at, keyed by conferenceId.
   * Set via the Speaker card on the profile page; reflected in /schedule and /forums.
   */
  speakerSessions?: Record<string, string[]>;
}

export interface Message {
  id: string;
  createdAt: string;
  from: string; // user id or callsign
  to?: string; // optional for public messages
  isPublic: boolean;
  content: string;
  boardId?: string; // for public board messages
  votes?: number;
}

/** A record of an alert (e.g. prize notification) that the user has seen. */
export interface AlertHistoryItem {
  /** Unique identifier for the alert (e.g. prizeWinnerId or a generated UUID). */
  id: string;
  /** Human-readable alert title (e.g. "Prize Winner!"). */
  title: string;
  /** Human-readable alert body (e.g. "You won a Yaesu FT-991A!"). */
  body: string;
  /** Unix epoch milliseconds when the alert was received. */
  timestamp: number;
  /** Conference the alert is associated with, if known. */
  conferenceId?: string;
}
