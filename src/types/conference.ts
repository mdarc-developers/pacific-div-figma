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
  contactEmail: string;
  logoUrl: string;
}

export interface Session {
  id: string;
  conferenceId: string;
  title: string;
  description: string;
  speaker: string;
  location: string;
  startTime: string; // stored in local date and time for the conference timezone
  endTime: string; // stored in local date and time for the conference timezone
  category: string;
  track?: string;
}

export interface MapImage {
  id: string;
  conferenceId: string;
  name: string;
  url: string;
  floor?: string;
  order: number;
  origWidthNum?: number;
  origHeightNum?: number;
}

export interface Prize {
  id: string;
  conferenceId: string;
  name: string;
  description: string;
  category: string;
}

export interface PrizeWinner {
  id: string;
  prizeId: string;
  winnerCallsign?: string;
  winnerEmail?: string;
  winnerName: string;
  notifiedAt?: string;
  claimedAt?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  callsign?: string;
  displayName?: string;
  darkMode: boolean;
  bookmarkedSessions: string[];
  notificationsEnabled: boolean;
  smsNotifications: boolean;
  phoneNumber?: string;
}

export interface Message {
  id: string;
  conferenceId: string;
  from: string; // user id or callsign
  to?: string; // optional for public messages
  isPublic: boolean;
  content: string;
  boardId?: string; // for public board messages
  votes: number;
  createdAt: string;
  isAdmin: boolean;
  adminRole: string;
}

export interface Room {
  name: string;
  coords: [number, number][];
  color: string;
  origHeightNum?: number;
  origWidthNum?: number;
};
