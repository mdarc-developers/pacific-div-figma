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
  //mapSessionsUrl: string;
  //mapExhibitorsUrl: string[];
  votes?: number;
}

export interface MapImage {
  id: string;
  name: string;
  url: string;
  floor?: string;
  order: number;
  origWidthNum?: number;
  origHeightNum?: number;
}

export interface Booth {
  id: number;
  coords: [number, number][];
  locationZone: string;
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
}

export interface Room {
  name: string;
  coords: [number, number][];
  color: string;
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
  id: string;
  prizeId: string[];
  winningTicket: string;
  winnerCallsign?: string;
  winnerEmail?: string;
  winnerName?: string;
  drawing?: string;
  notifiedAt?: string;
  claimedAt?: string;
  votes?: number;
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
  displayName?: string;
  displayProfile?: string; // like a public QRZ text for display
  phoneNumber?: string;
  raffleTickets?: string[];
  votes?: number;
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
