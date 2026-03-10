import {
  Session,
  MapImage,
  Room,
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

//export interface Exhibitor {
//  id: string;
//  name: string;
//  description: string;
//  boothName: string;
//  location: number[];
//  type?: string;
//  url?: string;
//  color?: string;
//  votes?: number;
//  prizesDonated?: string[];
//}
export const mapExhibitors: [string, Exhibitor[]] = [
  "/assets/maps/seapac-exhibitors-20260227.png",
  // must match mapBooths URL
  [
    {
      id: "1",
      name: "7th Area QSL Bureau / WV DX Club",
      description: "",
      boothName: "1",
      location: [1],
      url: "https://wvdxc.org/history-of-the-arrl-7th-area-incoming-qsl-bureau/",
    },
    {
      id: "2",
      name: "Amateur Radio Relay Group",
      description: "ARRG owns and operates the eighteen plus VHF and UHF repeaters that make up the statewide K7RPT Repeater system.",
      boothName: "2",
      location: [2],
      url: "https://www.arrg.org",
    },
    {
      id: "3",
      name: "ARRL",
      description: "Amateur Radio Relay League",
      boothName: "3",
      location: [3],
      url: "https://www.arrl.org",
    },
    {
      id: "5",
      name: "Buddipole",
      description: "",
      boothName: "5",
      location: [5],
      url: "https://www.buddipole.com",
    },
    {
      id: "6",
      name: "Compudigital Industries",
      description: "",
      boothName: "6",
      location: [6],
      url: "https://www.",
    },
    {
      id: "7",
      name: "Elecraft",
      description: "",
      boothName: "7",
      location: [7],
      url: "https://www.elecraft.com",
    },
    {
      id: "8",
      name: "Fast Track Ham Radio Education",
      description: "",
      boothName: "8",
      location: [8],
      url: "https://www.",
    },
    {
      id: "9",
      name: "Flex Radio",
      description: "",
      boothName: "9",
      location: [9],
      url: "https://www.",
    },
    {
      id: "10",
      name: "Geochron",
      description: "",
      boothName: "10",
      location: [10],
      url: "https://www.geochron.com",
    },
    {
      id: "11",
      name: "Great Maps LLC / Hear Ham",
      description: "",
      boothName: "11",
      location: [11],
      url: "https://www.",
    },
    {
      id: "12",
      name: "Halibut Electronics.com",
      description: "",
      boothName: "12",
      location: [12],
      url: "https://www.",
    },
    {
      id: "13",
      name: "Ham Radio Outlet",
      description: "",
      boothName: "13",
      location: [13],
      url: "https://www.hamradio.com",
    },
    {
      id: "14",
      name: "Hip Ham Shirts",
      description: "",
      boothName: "14",
      location: [14],
      url: "https://www.hiphamshirts.com",
    },
    {
      id: "15",
      name: "Hitched4Fun",
      description: "",
      boothName: "15",
      location: [15],
      url: "https://www.hitched4fun.com",
    },
    {
      id: "16",
      name: "ICOM America",
      description: "",
      boothName: "16",
      location: [16],
      url: "https://www.icomamerica.com/personal_use/amateur_radio/",
    },
    {
      id: "17",
      name: "Impulse Electronics",
      description: "",
      boothName: "17",
      location: [17],
      url: "https://impulseelectronics.com",
    },
    {
      id: "18",
      name: "Inovato",
      description: "",
      boothName: "18",
      location: [4],
      url: "https://www.",
    },
    {
      id: "19",
      name: "JPoles.com",
      description: "",
      boothName: "19",
      location: [19],
      url: "https://www.",
    },
    {
      id: "20",
      name: "Lido Radio Products",
      description: "",
      boothName: "20",
      location: [20],
      url: "https://www.lidoradio.com",
    },
    {
      id: "21",
      name: "NW Radio / Hi-Tech Liquidators",
      description: "",
      boothName: "21",
      location: [21],
      url: "https://www.",
    },
    {
      id: "22",
      name: "Pacific Amateur Radio Guild",
      description: "",
      boothName: "22",
      location: [22],
      url: "https://www.",
    },
    {
      id: "23",
      name: "PreciseRF",
      description: "",
      boothName: "23",
      location: [23],
      url: "https://www.",
    },
    {
      id: "24",
      name: "PreppComm Amateur Radio",
      description: "",
      boothName: "24",
      location: [24],
      url: "https://www.",
    },
    {
      id: "25",
      name: "Quarter Cuntury Wire",
      description: "",
      boothName: "25",
      location: [25],
      url: "https://www.",
    },
    {
      id: "26",
      name: "Samlex America",
      description: "",
      boothName: "26",
      location: [26],
      url: "https://www.",
    },
    {
      id: "27",
      name: "Sierra Radio Systems / PackTenna",
      description: "",
      boothName: "27",
      location: [27],
      url: "https://www.",
    },
    {
      id: "28",
      name: "Sunset Empire Amateur Radio Club (SEARC)",
      description: "",
      boothName: "28",
      location: [28],
      url: "https://www.",
    },
    {
      id: "29",
      name: "Western Case",
      description: "",
      boothName: "29",
      location: [29],
      url: "https://www.westerncasecompany.com",
    },
    {
      id: "30",
      name: "Wired Communications",
      description: "",
      boothName: "30",
      location: [30],
      url: "https://www.wiredco.com",
    },
    {
      id: "31",
      name: "Yaesu USA",
      description: "",
      boothName: "31",
      location: [31],
      url: "https://yaesu.com/product-categories.aspx?Division=Amateur",
    },
    {
      id: "32",
      name: "Young Ladies Radio League",
      description: "",
      boothName: "32",
      location: [32],
      url: "https://ylrl.net",
    },
  ],
];

//export const mapBooths: [string, Booth[]] = [
//  "/assets/maps/seapac-exhibitors-20260227.png",
//  // must match mapExhibitors URL
//  // Source: https://www.yumahamfest.com/vendorlayout.html (SVG extracted 2026-02-25)
//  // SVG viewBox 0 0 724.2 378.4  →  image 1166 × 609
//  // Coords format: [[y_bottom, x_left], [y_top, x_left], [y_top, x_right], [y_bottom, x_right]]
//  // All y values measured from the bottom; all x values measured from the left.
//  [],
//];

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
    {
      name: "Seaside A",
      coords: [
        [208, 340],
        [291, 340],
        [291, 404],
        [208, 404],
      ],
      color: "#ffffff",
    },
    {
      name: "Seaside B",
      coords: [
        [206, 252],
        [290, 252],
        [290, 339],
        [206, 339],
      ],
      color: "#ffffff",
    },
    {
      name: "Seaside C",
      coords: [
        [209, 187],
        [289, 187],
        [289, 250],
        [209, 250],
      ],
      color: "#ffffff",
    },
    {
      name: "Riverside A",
      coords: [
        [16, 341],
        [179, 341],
        [179, 404],
        [16, 404],
      ],
      color: "#ffffff",
    },
    {
      name: "Riverside B",
      coords: [
        [16, 252],
        [180, 252],
        [180, 338],
        [16, 338],
      ],
      color: "#ffffff",
    },
    {
      name: "Riverside C",
      coords: [
        [16, 186],
        [179, 186],
        [179, 250],
        [16, 250],
      ],
      color: "#ffffff",
    },
    {
      name: "Sunrise",
      coords: [
        [16, 11],
        [83, 11],
        [83, 79],
        [16, 79],
      ],
      color: "#ffffff",
    },
  ],
];

export const mapSessions: [string, Session[]] = [
  "/assets/maps/seapac-forums-20260227.png",
  // must match mapRooms URL
  // Source: https://www.yumahamfest.com/seminars.html (extracted 2026-02-25)
  [],
];

// map images - in production these may be bundled images
export const conferenceMaps: MapImage[] = [
  {
    id: "map-1",
    name: "Lobby",
    url: "/assets/maps/seapac-lobby-20260227.png",
    floor: "lobby",
    order: 1,
    origWidthNum: 473,
    origHeightNum: 624,
  },
  {
    id: "map-2",
    name: "Exhibitors",
    url: "/assets/maps/seapac-exhibitors-20260227.png",
    floor: "Main",
    order: 2,
    origWidthNum: 677,
    origHeightNum: 741,
  },
  {
    id: "map-3",
    name: "Forums",
    url: "/assets/maps/seapac-forums-20260227.png",
    floor: "Upstairs",
    order: 3,
    origWidthNum: 638,
    origHeightNum: 726,
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
];
