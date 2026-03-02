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
  "/assets/maps/hamfest-layout-2026.png",
  [
    // must match mapBooths URL
  ],
];

export const mapBooths: [string, Booth[]] = [
  "/assets/maps/hamfest-layout-2026.png",
  // must match mapExhibitors URL
  [],
];

// Define your room polygons here
// Coords format: [[y_bottom, x_left], [y_top, x_left], [y_top, x_right], [y_bottom, x_right]]
// NOTE: All x values must be <= origWidthNum (582) and y values <= origHeightNum (256)
// The Pleasanton/Danville/San Ramon coords below are PLACEHOLDERS — update them to match
// your actual image. Their original x values (630–715) exceeded the image width of 582.
export const mapRooms: [string, Room[]] = [
  "/assets/maps/hamfest-layout-2026.png",
  // must match mapSessions URL
  [
    // ... (your forumRooms data) ...
    // [[y_bottom, x_left], [y_top, x_left], [y_top, x_right], [y_bottom, x_right]]
    {
      name: "VBC Room 1",
      coords: [
        [1, 2],
        [3, 4],
        [5, 6],
        [7, 8],
      ],
      color: "#E63946", //Red
    },
    {
      name: "VBC Room 2",
      coords: [
        [1, 2],
        [3, 4],
        [5, 6],
        [7, 8],
      ],
      color: "#2A9D8F", // Teal
    },
    {
      name: "Embassy Redstone",
      coords: [
        [1, 2],
        [3, 4],
        [5, 6],
        [7, 8],
      ],
      color: "#E9C46A", // yellow
    },
    {
      name: "Embassy BigSpringD",
      coords: [
        [1, 2],
        [3, 4],
        [5, 6],
        [7, 8],
      ],
      color: "#457B9D", // steel blue
    },
    {
      name: "Embassy Madison",
      coords: [
        [1, 2],
        [3, 4],
        [5, 6],
        [7, 8],
      ],
      color: "#F4A261", // Orange
    },
    {
      name: "Embassy 4",
      coords: [
        [1, 2],
        [3, 4],
        [5, 6],
        [7, 8],
      ],
      color: "#6A4C93", // Purple
    },
  ],
];

export const mapSessions: [string, Session[]] = [
  "/assets/maps/hamfest-layout-2026.png",
  // must match mapRooms URL
  [],
];

// map images - in production these may be bundled images
export const conferenceMaps: MapImage[] = [
  {
    id: "map-2",
    name: "Exhibitors",
    url: "/assets/maps/hamfest-layout-2026.png", // for Booth[]
    //floor: '2',
    order: 2,
    origHeightNum: 1687,
    origWidthNum: 2560,
  },
  {
    id: "map-3",
    name: "Parking",
    url: "/assets/maps/hamfest-parking-map-20260101.jpg",
    order: 3,
    origHeightNum: 837,
    origWidthNum: 839,
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
