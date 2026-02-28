import {
  Session,
  MapImage,
  Room,
  Exhibitor,
  Booth,
  Prize,
  PrizeWinner,
  UserProfile,
} from "@/types/conference";

export const samplePrizes: Prize[] = [
  {
    id: "p1",
    name: "Yaesu FT-65R Handheld",
    description: "Dual-band 5W handheld",
    imageUrl: "/assets/prizes/p1.jpg",
    donor: "Yaesu",
    winner: "winner1",
    category: "Prize",
  },
  {
    id: "p2",
    name: "Antenna Tuner",
    description: "For HF bands, LDG Z-100 Plus",
    imageUrl: "/assets/prizes/p2.jpg",
    donor: "Hamfest Committee",
    winner: "winner2",
    category: "Prize",
  },
  {
    id: "p3",
    name: "ARRL Handbook",
    description: "Latest Technician study manual",
    imageUrl: "/assets/prizes/p3.jpg",
    donor: "ARRL",
    winner: "winner3",
    category: "Prize",
  },
];

export const samplePrizeWinners: PrizeWinner[] = [
  {
    id: "winner1",
    prizeId: ["p1"],
    winnerCallsign: "K6AL",
    winnerName: "Alice Cooper",
    winningTicket: "1001",
  },
  //  winnerEmail?: string;
  //  notifiedAt?: string;
  //  claimedAt?: string;
  //  drawing?: string;
  //}
  {
    id: "winner2",
    prizeId: ["p2"],
    winningTicket: "2042",
  },
  {
    id: "winner3",
    prizeId: ["p3"],
    winningTicket: "3155",
    winnerCallsign: "W6CW",
    winnerName: "Carol Williams",
  },
];

export const mapExhibitors: [string, Exhibitor[]] = [
  "/assets/maps/seapac-exhibitors-20260227.png",
  // must match mapBooths URL
  [
  ]
];

export const mapBooths: [string, Booth[]] = [
  "/assets/maps/seapac-exhibitors-20260227.png",
  // must match mapExhibitors URL
  // Source: https://www.yumahamfest.com/vendorlayout.html (SVG extracted 2026-02-25)
  // SVG viewBox 0 0 724.2 378.4  →  image 1166 × 609
  // Coords format: [[y_bottom, x_left], [y_top, x_left], [y_top, x_right], [y_bottom, x_right]]
  // All y values measured from the bottom; all x values measured from the left.
  [
  ],
];

// Define your room polygons here
// Coords format: [[y_bottom, x_left], [y_top, x_left], [y_top, x_right], [y_bottom, x_right]]
// NOTE: All y values are measured from the bottom, not from the top and y values <= origHeightNum (562)
// NOTE: All x values are measured from the left and must be <= origWidthNum (998)
export const mapRooms: [string, Room[]] = [
  "/assets/maps/seapac-forums-20260227.png",
  // must match mapSessions URL
  [
    // ... (your forumRooms data) ...
    // [[y_bottom, x_left], [y_top, x_left], [y_top, x_right], [y_bottom, x_right]]
  ],
];

export const mapSessions: [string, Session[]] = [
  "/assets/maps/seapac-forums-20260227.png",
  // must match mapRooms URL
  // Source: https://www.yumahamfest.com/seminars.html (extracted 2026-02-25)
  [
  ],
];

// map images - in production these may be bundled images
export const conferenceMaps: MapImage[] = [
  {
    id: "map-1",
    name: "Lobby",
    url: "/assets/maps/seapac-lobby-20260227.png",
    floor: 'lobby',
    order: 1,
    origWidthNum: 473,
    origHeightNum: 624,
  },
  {
    id: "map-2",
    name: "Exhibitors",
    url: "/assets/maps/seapac-exhibitors-20260227.png",
    floor: 'Main',
    order: 2,
    origWidthNum: 677,
    origHeightNum: 741,
  },
  {
    id: "map-3",
    name: "Forums",
    url: "/assets/maps/seapac-forums-20260227.png",
    floor: 'Upstairs',
    order: 3,
    origWidthNum: 638,
    origHeightNum: 726,
  },
];

export const sampleAttendees: UserProfile[] = [
  {
    uid: "1",
    email: "test1test.com",
    callsign: "K6AL",
    displayName: "Alice Cooper",
    displayProfile: "Something about me",
    darkMode: false,
    bookmarkedSessions: [],
    notificationsEnabled: false,
    smsNotifications: false,
  },
  {
    uid: "2",
    email: "test2@test.com",
    callsign: "N6YZ",
    displayName: "Bob Johnson",
    displayProfile: "Something about me",
    darkMode: false,
    bookmarkedSessions: [],
    notificationsEnabled: false,
    smsNotifications: false,
  },
  {
    uid: "3",
    email: "test3@test.com",
    callsign: "W6CW",
    displayName: "Carol Williams",
    displayProfile: "Something about me",
    darkMode: false,
    bookmarkedSessions: [],
    notificationsEnabled: false,
    smsNotifications: false,
  },
  {
    uid: "4",
    email: "test4@test.com",
    displayName: "David Lee",
    displayProfile: "Something about me",
    darkMode: false,
    bookmarkedSessions: [],
    notificationsEnabled: false,
    smsNotifications: false,
  },
  {
    uid: "5",
    email: "test5@test.com",
    callsign: "K6ABC",
    displayName: "Jane Smith",
    displayProfile: "Something about me",
    darkMode: false,
    bookmarkedSessions: [],
    notificationsEnabled: false,
    smsNotifications: false,
  },
  {
    uid: "6",
    email: "test6@test.com",
    callsign: "WB6NOA",
    displayName: "Gordon West",
    displayProfile: "Something about me",
    darkMode: false,
    bookmarkedSessions: [],
    notificationsEnabled: false,
    smsNotifications: false,
  },
  {
    uid: "7",
    email: "test7@test.com",
    callsign: "AA6PP",
    displayName: "Dr. Antonis Papatsaras",
    displayProfile: "Something about me",
    darkMode: false,
    bookmarkedSessions: [],
    notificationsEnabled: false,
    smsNotifications: false,
  },
];
