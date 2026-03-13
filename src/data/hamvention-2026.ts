import {
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
    donor: "Hamvention Committee",
    winner: "winner2",
    category: "Raffle",
  },
  {
    id: "p3",
    name: "ARRL Handbook",
    description: "Latest Technician study manual",
    imageUrl: "/assets/prizes/p3.jpg",
    donor: "ARRL",
    winner: "winner3",
    category: "ARRL Drawing",
  },
  {
    id: "p4",
    name: "2M/440 L5 Elk Antenna",
    description:
      "Whether you are operating portable or permanent, you will find the convenience of a dual-band Log Periodic antenna to be an incredibly convenient and powerful tool in your communication operations. Having both 2 Meter and 70 cm Bands in a compact, two foot long package, without having to bother with a duplexer is just a real lifesaver to most operating environments. From bouncing signals off of satellites, to working simplex two or three counties aways – you cannot go wrong with the Elk 2M/440L5! All Elk 2M/440L5 models come with a handle for handheld operation, making this antenna perfectly set up for satellite, DFing, EmComm, and very portable operation.  The feed on all Elk Antennas is from the front of the antenna.  The end where you connect the feedline is where you point the antenna. By the way, this is an excellent antenna for GMRS and MURS operation!",
    imageUrl: "/assets/prizes/p4.png",
    donor: "Elk Antennas",
    category: "T-Hunting",
  },
];

export const samplePrizeWinners: PrizeWinner[] = [
  {
    id: "winner1",
    prizeId: ["p1"],
    winnerCallsign: "K6AL",
    winnerName: "Alice Cooper",
    winningTicket: "1001",
    claimedAt: "true",
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
    notifiedAt: "true",
  },
];

// moved to supplemental, mapped to only one map
//export const mapExhibitors: [string, Exhibitor[]] = [
  ////"/assets/maps/hamvention-2026-Booths-Exhibits-Overview-v20.pdf",
  //"/assets/maps/hamvention-2026-building-1-maxim.svg",
  //// must match mapBooths URL
  //[
    //export interface Exhibitor {
    //  id: string;                    ? auto assign ? use name
    //  name: string;                  good
    //  description: string;           ? '', as of updated
    // vendorContactName: string ?
    //  location: number[];            good, but ranges are a bit crazy
    //  boothName: string;             ? string(location)
    //  type: string;                  exhibitor-confirmed, exhibitor-reserved
    //  url: string;                   ? a few who must pay more
    //  color: string;                 ?
    //}
    // Extracted exhibitor data for Hamvention 2026
  //],
//];

// PDF with Booth[] not working yet so comment it out
//export const mapBooths: [string, Booth[]] = [
//  "/assets/maps/hamvention-2026-Booths-Exhibits-Overview-v20.pdf",
//  //"/assets/maps/hamvention-forums-2026-2.png",
//  // must match mapExhibitors URL
//  [],
//];

// Define your room polygons here
// Coords format: [[y_bottom, x_left], [y_top, x_left], [y_top, x_right], [y_bottom, x_right]]
// NOTE: All x values must be <= origWidthNum (953) and y values <= origHeightNum (710)
// Forum 4 coords below are PLACEHOLDERS — update to match actual image.
export const mapRooms: [string, Room[]] = [
  "/assets/maps/hamvention-forums-2026-2.png",
  // must match mapSessions URL
  //origHeightNum: 710,
  //origWidthNum: 953,
  [
    {
      name: "Forum 1",
      coords: [
        [151, 8],
        [282, 8],
        [282, 119],
        [151, 119],
      ],
      color: "#10B981",
    },
    {
      name: "Forum 2",
      coords: [
        [14, 10],
        [144, 10],
        [144, 121],
        [14, 121],
      ],
      color: "#3B82F6",
    },
    {
      name: "Forum 3",
      coords: [
        [159, 336],
        [254, 336],
        [254, 433],
        [159, 433],
      ],
      color: "#8B5CF6",
    },
    {
      name: "Forum 4",
      coords: [
        [630, 845],
        [697, 845],
        [697, 949],
        [630, 949],
      ],
      color: "#005CF6",
    },
  ],
];

// map images - in production these may be bundled images
export const conferenceMaps: MapImage[] = [
  {
    id: "map-1",
    name: "Exhibitors",
    url: "/assets/maps/hamvention-2026-Booths-Exhibits-Overview-v20.pdf", // for Booth[]
    //floor: '2',
    order: 1,
    origHeightNum: 745,
    origWidthNum: 961,
  },
  {
    id: "map-2",
    name: "Forums",
    url: "/assets/maps/hamvention-forums-2026-2.png", // for Booth[]
    //floor: '2',
    order: 3,
    origHeightNum: 710,
    origWidthNum: 953,
  },
  {
    id: "map-3",
    name: "Building 1 Maxim",
    url: "/assets/maps/hamvention-2026-building-1-maxim.svg", // for Booth[] (SVG interactive map)
    order: 3,
    origHeightNum: 816,
    origWidthNum: 1056,
  },
  {
    id: "map-4",
    name: "Building 2 Tesla",
    url: "/assets/maps/hamvention-2026-building-2-tesla.svg", // for Booth[] (SVG interactive map)
    order: 3,
    origHeightNum: 816,
    origWidthNum: 1056,
  },
  {
    id: "map-5",
    name: "Building 3 Marconi",
    url: "/assets/maps/hamvention-2026-building-3-marconi.svg", // for Booth[] (SVG interactive map)
    order: 4,
    origHeightNum: 816,
    origWidthNum: 1056,
  },
  {
    id: "map-6",
    name: "Building 4 Volta",
    url: "/assets/maps/hamvention-2026-building-4-volta.svg", // for Booth[] (SVG interactive map)
    order: 5,
    origHeightNum: 816,
    origWidthNum: 1056,
  },
  {
    id: "map-7",
    name: "Building 5 Hertz",
    url: "/assets/maps/hamvention-2026-building-5-hertz.svg", // for Booth[] (SVG interactive map)
    order: 6,
    origHeightNum: 816,
    origWidthNum: 1056,
  },
];

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
