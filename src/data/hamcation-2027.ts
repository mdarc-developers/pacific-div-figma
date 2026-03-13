import {
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
    donor: "Pacificon Committee",
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

export const mapBooths: [string, Booth[]] = [
  "/assets/maps/hamcation-2026-north.png",
  // must match mapExhibitors URL
  [
    {
      id: 182,
      coords: [
        [412, 194],
        [493, 194],
        [493, 273],
        [412, 273],
      ],
      locationZone: "north",
    },
    {
      id: 183,
      coords: [
        [412, 275],
        [493, 275],
        [493, 353],
        [412, 353],
      ],
      locationZone: "north",
    },
  ],
];

export const mapExhibitors: [string, Exhibitor[]] = [
  "/assets/maps/hamcation-2026-north.png",
  // must match mapBooths URL
  [
    {
      id: "arrl",
      name: "ARRL",
      description: "American Radio Relay League",
      boothName: "4  5",
      location: [4, 5],
      type: "vendor-booth",
      color: "#77cff4",
      url: "https://www.arrl.org",
    },
    {
      id: "exhibitor-unitrend",
      name: "Uni-Trend Technology US Inc",
      description:
        "worlds most renowned test and measurement solutions providers",
      boothName: "1  2  3",
      location: [1, 2, 3],
      type: "vendor-booth",
      color: "#77cff4",
      url: "https://www.uni-trendus.com",
    },
    {
      id: "exhibitor-platinum",
      name: "Platinum Coast Amateur Radio Society",
      description: "Cables, Connectors, LEDs and Adapters",
      boothName: "4",
      location: [4],
      color: "#77cff4",
      type: "vendor",
      url: "https://www.pcards.org",
    },
    {
      id: "exhibitor-w5yi",
      name: "W5YI Licensing Services Inc",
      description: "licensing",
      boothName: "5  6",
      location: [5, 6],
      type: "nonprofit",
      color: "#77cff4",
      url: "https://www.w5yi-vec.org",
    },
  ],
];

// Define your room polygons here
// Coords format: [[y_bottom, x_left], [y_top, x_left], [y_top, x_right], [y_bottom, x_right]]
// NOTE: All x values must be <= origWidthNum (582) and y values <= origHeightNum (256)
// The Pleasanton/Danville/San Ramon coords below are PLACEHOLDERS — update them to match
// your actual image. Their original x values (630–715) exceeded the image width of 582.
export const mapRooms: [string, Room[]] = [
  "/assets/maps/hamcation-2026-pavilion.png",
  // must match mapSessions URL
  [
    // ... (your forumRooms data) ...
    // [[y_bottom, x_left], [y_top, x_left], [y_top, x_right], [y_bottom, x_right]]
    {
      name: "Tent 1",
      //coords: [[5, 58], [47, 7], [65, 24], [25, 75]], x 8
      coords: [
        [40, 464],
        [376, 56],
        [520, 192],
        [200, 600],
      ],
      color: "#10B981",
    },
    {
      name: "Tent 2",
      //coords: [[25, 75], [65, 24], [80, 37], [40, 90]],
      coords: [
        [200, 600],
        [520, 192],
        [640, 296],
        [320, 720],
      ],
      color: "#3B82F6",
    },
    {
      name: "Tent 3",
      //coords: [[80, 37], [40, 90], [53, 103], [93, 50]],
      coords: [
        [640, 296],
        [320, 720],
        [424, 824],
        [764, 410],
      ],
      color: "#F59E0B",
    },
    {
      name: "Restrooms",
      //coords: [[53, 103], [70, 82], [85,94], [67, 114]],
      coords: [
        [424, 820],
        [573, 656],
        [680, 752],
        [536, 912],
      ],
      color: "#005CF6",
    },
  ],
];

// moved to a supplemental
//export const mapSessions: [string, Session[]] = [
//  "/assets/maps/hamcation-2026-pavilion.png",
//  // must match mapRooms URL
//  [
//  ],
//];

// map images - in production these may be bundled images
export const conferenceMaps: MapImage[] = [
  {
    id: "map-1",
    name: "Fairground",
    url: "/assets/maps/hamcation-2026-fairgrounds.png",
    order: 1,
    origHeightNum: 647,
    origWidthNum: 1200,
  },
  {
    id: "map-2",
    name: "East and West Halls",
    url: "/assets/maps/hamcation-2026-eastwest.png",
    order: 2,
    origHeightNum: 425,
    origWidthNum: 1199,
  },
  {
    id: "map-3",
    name: "North Hall",
    url: "/assets/maps/hamcation-2026-north.png",
    order: 3,
    origHeightNum: 550,
    origWidthNum: 1199,
  },
  {
    id: "map-4",
    name: "Pavilion",
    url: "/assets/maps/hamcation-2026-pavilion.png",
    order: 4,
    origHeightNum: 840,
    origWidthNum: 1016,
  },
  {
    id: "map-5",
    name: "Outline",
    url: "/assets/maps/hamcation-map-2026.png",
    order: 5,
  },
];

export const mapUserProfiles: UserProfile[] = [
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
  {
    uid: "2JjLExoVgiVdblnPFUVX1YJzqdA2",
    email: "grantbow@mdarc.org",
    darkMode: false,
    bookmarkedSessions: [],
    notificationsEnabled: true,
    smsNotifications: true,
    groups: ["prize-admin", "mdarc-developers"],
    displayName: "Grant B",
    callsign: "K6CBK",
  },
];
