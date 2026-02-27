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
  "/assets/maps/yuma-vendors-20260225.png",
  // must match mapBooths URL
  // Source: https://www.yumahamfest.com/vendorlayout.html (extracted 2026-02-25)
  [
    // ── Hospitality / organizing committee ────────────────────────────────
    {
      id: "yarho-hospitality",
      name: "Hospitality",
      description:
        "Yuma Amateur Radio Hamfest Organization — hamfest information and welcome area",
      boothName: "1  2  3  4  5  6  7  8",
      location: [1, 2, 3, 4, 5, 6, 7, 8],
      type: "hospitality",
      color: "#f87171",
      url: "https://www.yumahamfest.com",
    },
    {
      id: "yarho-committee",
      name: "YARHO (Organizing Committee)",
      description:
        "Yuma Amateur Radio Hamfest Organization — event staff and operations",
      boothName: "9  10  11  12  13  14",
      location: [9, 10, 11, 12, 13, 14],
      type: "hospitality",
      color: "#f87171",
      url: "https://www.yumahamfest.com",
    },
    // ── Commercial vendors (paid/red) ─────────────────────────────────────
    {
      id: "rosies-915-sweets",
      name: "Rosie's 915 Sweets",
      description: "Sweet treats and concessions",
      boothName: "15  16",
      location: [15, 16],
      type: "food",
      color: "#f87171",
      url: "",
    },
    {
      id: "dx-store",
      name: "DX Store",
      description: "Amateur radio equipment and accessories",
      boothName: "17  18  19",
      location: [17, 18, 19],
      type: "vendor-booth",
      color: "#f87171",
      url: "",
    },
    {
      id: "american-red-cross",
      name: "American Red Cross",
      description: "Disaster relief, blood donation and emergency preparedness",
      boothName: "20",
      location: [20],
      type: "nonprofit",
      color: "#f87171",
      url: "https://www.redcross.org",
    },
    {
      id: "cert",
      name: "CERT",
      description: "Community Emergency Response Team — emergency preparedness",
      boothName: "21  22",
      location: [21, 22],
      type: "nonprofit",
      color: "#f87171",
      url: "",
    },
    {
      id: "twisted-lemon",
      name: "Twisted Lemon",
      description: "Lisa Clarke — refreshments",
      boothName: "24",
      location: [24],
      type: "food",
      color: "#f87171",
      url: "",
    },
    // ── Swap meet / tailgate ──────────────────────────────────────────────
    {
      id: "mini-pancakes",
      name: "Mini Pancakes",
      description: "Patricia Lopez — mini pancakes, cash only (reserved)",
      boothName: "23",
      location: [23],
      type: "food",
      color: "#fde047",
      url: "",
    },
    // ── Reserved spaces (vendor-list assigned, map pending update) ────────
    {
      id: "ac-fulcher",
      name: "AC Fulcher",
      description: "Swap meet vendor (reserved)",
      boothName: "29",
      location: [29],
      type: "flea-market",
      color: "#fde047",
      url: "",
    },
    {
      id: "5-shot-firearms",
      name: "5 Shot Firearms",
      description: "Ken McMurdie — firearms and accessories (reserved)",
      boothName: "31",
      location: [31],
      type: "vendor-booth",
      color: "#fde047",
      url: "",
    },
    {
      id: "rv-connection",
      name: "RV Connection",
      description: "Thomas Bulinski — RV accessories and supplies (reserved)",
      boothName: "32",
      location: [32],
      type: "vendor-booth",
      color: "#fde047",
      url: "",
    },
    {
      id: "northwest-radio",
      name: "Northwest Radio / Hi-Tech Liquidators",
      description:
        "Richard Hammerschlag — electronics and amateur radio equipment (reserved)",
      boothName: "33  34  35  36  37",
      location: [33, 34, 35, 36, 37],
      type: "flea-market",
      color: "#fde047",
      url: "",
    },
    {
      id: "girl-scout-cookies",
      name: "Girl Scout Cookies",
      description: "Girl Scouts — cookies and refreshments (reserved)",
      boothName: "38",
      location: [38],
      type: "food",
      color: "#fde047",
      url: "",
    },
    // ── Bottom-left booths (isolated) ─────────────────────────────────────
    {
      id: "refreshment-haven",
      name: "Refreshment Haven",
      description: "Heather Acosta — refreshments and concessions",
      boothName: "41",
      location: [41],
      type: "food",
      color: "#f87171",
      url: "",
    },
    {
      id: "ych-robotics-shamrocks",
      name: "YCH Robotics / The Shamrocks",
      description: "STEM education and robotics",
      boothName: "42  43",
      location: [42, 43],
      type: "club-booth",
      color: "#f87171",
      url: "",
    },
    {
      id: "flexradio",
      name: "Flex Radio",
      description: "Software-defined radio transceivers",
      boothName: "44",
      location: [44],
      type: "vendor-booth",
      color: "#f87171",
      url: "https://www.flexradio.com",
    },
    // ── Right-side club / organization row ────────────────────────────────
    {
      id: "club-row",
      name: "Club Row",
      description:
        "Area reserved for amateur radio clubs — information and membership (reserved)",
      boothName: "45",
      location: [45],
      type: "club-booth",
      color: "#fde047",
      url: "",
    },
    {
      id: "radio-society-tucson",
      name: "Radio Society of Tucson",
      description: "Amateur radio club — Tucson, AZ",
      boothName: "46",
      location: [46],
      type: "club-booth",
      color: "#f87171",
      url: "",
    },
    {
      id: "ansr",
      name: "Arizona Near Space Research (ANSR)",
      description:
        "High-altitude balloon and near-space amateur radio experiments",
      boothName: "47",
      location: [47],
      type: "club-booth",
      color: "#f87171",
      url: "https://www.ansr.org",
    },
    {
      id: "amo",
      name: "Arizona Mesh Organization (AMO)",
      description: "Amateur radio high-speed mesh networking in Arizona",
      boothName: "48",
      location: [48],
      type: "club-booth",
      color: "#f87171",
      url: "",
    },
    {
      id: "ovarc",
      name: "OVARC — Amateur Radio Club, Greater Tucson",
      description:
        "Oro Valley Amateur Radio Club — club information and membership",
      boothName: "49",
      location: [49],
      type: "club-booth",
      color: "#f87171",
      url: "",
    },
    {
      id: "london-bridge-ara",
      name: "London Bridge Amateur Radio Association",
      description: "Amateur radio club — Lake Havasu City, AZ",
      boothName: "50",
      location: [50],
      type: "club-booth",
      color: "#f87171",
      url: "",
    },
    {
      id: "arca",
      name: "ARCA — Amateur Radio Council of Arizona",
      description: "Statewide amateur radio council coordinating Arizona clubs",
      boothName: "51",
      location: [51],
      type: "club-booth",
      color: "#f87171",
      url: "https://www.arca-az.org",
    },
    {
      id: "arrl",
      name: "ARRL",
      description:
        "American Radio Relay League — membership, publications and awards",
      boothName: "52",
      location: [52],
      type: "club-booth",
      color: "#f87171",
      url: "https://www.arrl.org",
    },
    {
      id: "palomar-engineers",
      name: "PALOMAR Engineers",
      description:
        "Bob Brehm — RFI filters, chokes and ferrite products (reserved)",
      boothName: "53  54",
      location: [53, 54],
      type: "vendor-booth",
      color: "#fde047",
      url: "https://www.palomar-engineers.com",
    },
    {
      id: "wf7x-gb-radio-club",
      name: "WF7X — GB Radio Club",
      description: "Bruce C. Thompson — amateur radio club",
      boothName: "55",
      location: [55],
      type: "club-booth",
      color: "#f87171",
      url: "",
    },
    {
      id: "noaa-phoenix",
      name: "NOAA Phoenix",
      description: "National Weather Service — weather information and Skywarn",
      boothName: "56",
      location: [56],
      type: "nonprofit",
      color: "#f87171",
      url: "https://www.weather.gov",
    },
    {
      id: "yarc-yacs",
      name: "YARC / YACS",
      description:
        "Yuma Amateur Radio Club / Yuma Amateur Communications Society — Bill Johnson",
      boothName: "57",
      location: [57],
      type: "club-booth",
      color: "#f87171",
      url: "",
    },
    // ── Right-side lower commercial row ───────────────────────────────────
    {
      id: "arlan-communications",
      name: "ARLAN Communications",
      description: "David Bottom — amateur radio communications equipment",
      boothName: "65  66  67",
      location: [65, 66, 67],
      type: "vendor-booth",
      color: "#f87171",
      url: "",
    },
    {
      id: "off-grid-gear",
      name: "Off Grid Gear 2 Go",
      description:
        "Craig Carnahan — off-grid and emergency preparedness equipment",
      boothName: "68",
      location: [68],
      type: "vendor-booth",
      color: "#f87171",
      url: "",
    },
    {
      id: "impulse-electronics",
      name: "Impulse Electronics",
      description:
        "Electronic components, batteries and amateur radio accessories",
      boothName: "69  84",
      location: [69, 84],
      type: "vendor-booth",
      color: "#f87171",
      url: "",
    },
    {
      id: "hitched4fun",
      name: "Hitched4fun.com",
      description: "Aaron Scullin — outdoor and recreational vendor",
      boothName: "70",
      location: [70],
      type: "vendor-booth",
      color: "#f87171",
      url: "https://www.hitched4fun.com",
    },
    {
      id: "two-little-sips",
      name: "Two Little Sips Co",
      description: "Beverages and refreshments",
      boothName: "71",
      location: [71],
      type: "food",
      color: "#f87171",
      url: "",
    },
    {
      id: "yuma-gem-mineral-club",
      name: "Yuma Gem and Mineral Club",
      description: "Gem, mineral and lapidary club — Yuma, AZ",
      boothName: "72",
      location: [72],
      type: "club-booth",
      color: "#f87171",
      url: "",
    },
    {
      id: "cozy-crumbs",
      name: "Cozy Crumbs",
      description: "Jenna Molina — baked goods and refreshments",
      boothName: "73",
      location: [73],
      type: "food",
      color: "#f87171",
      url: "",
    },
    // ── Bottom-right booths ────────────────────────────────────────────────
    {
      id: "12-volt-power",
      name: "12 Volt Power",
      description:
        "Kevin Karamanos — batteries, power supplies and 12V accessories",
      boothName: "78",
      location: [78],
      type: "vendor-booth",
      color: "#f87171",
      url: "",
    },
    {
      id: "comet-antennas-daiwa",
      name: "Comet Antennas / Daiwa Meter",
      description: "Kevin Karamanos — VHF/UHF antennas and SWR/power meters",
      boothName: "79  80",
      location: [79, 80],
      type: "vendor-booth",
      color: "#f87171",
      url: "",
    },
    {
      id: "papa-inc",
      name: "Papa Inc",
      description: "Cecil Casillas — vendor",
      boothName: "81  82  83",
      location: [81, 82, 83],
      type: "vendor-booth",
      color: "#f87171",
      url: "",
    },
    {
      id: "hro-phx",
      name: "Ham Radio Outlet — Phoenix",
      description: "Ron A McKee — new and used amateur radio equipment",
      boothName: "85  86  87",
      location: [85, 86, 87],
      type: "vendor-booth",
      color: "#f87171",
      url: "https://www.hamradio.com",
    },
    {
      id: "wired-communications",
      name: "Wired Communications LLC",
      description: "Roger Deane — communications equipment and accessories",
      boothName: "88  89  90  91",
      location: [88, 89, 90, 91],
      type: "vendor-booth",
      color: "#f87171",
      url: "",
    },
  ],
];

export const mapBooths: [string, Booth[]] = [
  "/assets/maps/yuma-vendors-20260225.png",
  // must match mapExhibitors URL
  // Source: https://www.yumahamfest.com/vendorlayout.html (SVG extracted 2026-02-25)
  // SVG viewBox 0 0 724.2 378.4  →  image 1166 × 609
  // Coords format: [[y_bottom, x_left], [y_top, x_left], [y_top, x_right], [y_bottom, x_right]]
  // All y values measured from the bottom; all x values measured from the left.
  [
    {
      id: 1,
      coords: [
        [533, 476],
        [591, 476],
        [591, 535],
        [533, 535],
      ],
      locationZone: "vendor-floor-left",
    },
    {
      id: 2,
      coords: [
        [533, 418],
        [591, 418],
        [591, 476],
        [533, 476],
      ],
      locationZone: "vendor-floor-left",
    },
    {
      id: 3,
      coords: [
        [533, 359],
        [591, 359],
        [591, 418],
        [533, 418],
      ],
      locationZone: "vendor-floor-left",
    },
    {
      id: 4,
      coords: [
        [533, 301],
        [591, 301],
        [591, 360],
        [533, 360],
      ],
      locationZone: "vendor-floor-left",
    },
    {
      id: 5,
      coords: [
        [533, 243],
        [591, 243],
        [591, 301],
        [533, 301],
      ],
      locationZone: "vendor-floor-left",
    },
    {
      id: 6,
      coords: [
        [533, 184],
        [591, 184],
        [591, 243],
        [533, 243],
      ],
      locationZone: "vendor-floor-left",
    },
    {
      id: 7,
      coords: [
        [533, 126],
        [591, 126],
        [591, 184],
        [533, 184],
      ],
      locationZone: "vendor-floor-left",
    },
    {
      id: 8,
      coords: [
        [533, 67],
        [591, 67],
        [591, 126],
        [533, 126],
      ],
      locationZone: "vendor-floor-left",
    },
    {
      id: 9,
      coords: [
        [418, 67],
        [475, 67],
        [475, 126],
        [418, 126],
      ],
      locationZone: "vendor-floor-left",
    },
    {
      id: 10,
      coords: [
        [418, 126],
        [475, 126],
        [475, 184],
        [418, 184],
      ],
      locationZone: "vendor-floor-left",
    },
    {
      id: 11,
      coords: [
        [418, 184],
        [475, 184],
        [475, 243],
        [418, 243],
      ],
      locationZone: "vendor-floor-left",
    },
    {
      id: 12,
      coords: [
        [418, 243],
        [475, 243],
        [475, 301],
        [418, 301],
      ],
      locationZone: "vendor-floor-left",
    },
    {
      id: 13,
      coords: [
        [418, 301],
        [475, 301],
        [475, 360],
        [418, 360],
      ],
      locationZone: "vendor-floor-left",
    },
    {
      id: 14,
      coords: [
        [418, 359],
        [475, 359],
        [475, 418],
        [418, 418],
      ],
      locationZone: "vendor-floor-left",
    },
    {
      id: 15,
      coords: [
        [418, 418],
        [475, 418],
        [475, 476],
        [418, 476],
      ],
      locationZone: "vendor-floor-left",
    },
    {
      id: 16,
      coords: [
        [418, 476],
        [475, 476],
        [475, 535],
        [418, 535],
      ],
      locationZone: "vendor-floor-left",
    },
    {
      id: 17,
      coords: [
        [361, 476],
        [418, 476],
        [418, 535],
        [361, 535],
      ],
      locationZone: "vendor-floor-left",
    },
    {
      id: 18,
      coords: [
        [361, 418],
        [418, 418],
        [418, 476],
        [361, 476],
      ],
      locationZone: "vendor-floor-left",
    },
    {
      id: 19,
      coords: [
        [361, 359],
        [418, 359],
        [418, 418],
        [361, 418],
      ],
      locationZone: "vendor-floor-left",
    },
    {
      id: 20,
      coords: [
        [361, 301],
        [418, 301],
        [418, 360],
        [361, 360],
      ],
      locationZone: "vendor-floor-left",
    },
    {
      id: 21,
      coords: [
        [361, 243],
        [418, 243],
        [418, 301],
        [361, 301],
      ],
      locationZone: "vendor-floor-left",
    },
    {
      id: 22,
      coords: [
        [361, 184],
        [418, 184],
        [418, 243],
        [361, 243],
      ],
      locationZone: "vendor-floor-left",
    },
    {
      id: 23,
      coords: [
        [361, 126],
        [418, 126],
        [418, 184],
        [361, 184],
      ],
      locationZone: "vendor-floor-left",
    },
    {
      id: 24,
      coords: [
        [361, 67],
        [418, 67],
        [418, 126],
        [361, 126],
      ],
      locationZone: "vendor-floor-left",
    },
    {
      id: 25,
      coords: [
        [244, 67],
        [301, 67],
        [301, 126],
        [244, 126],
      ],
      locationZone: "vendor-floor-left",
    },
    {
      id: 26,
      coords: [
        [244, 126],
        [301, 126],
        [301, 184],
        [244, 184],
      ],
      locationZone: "vendor-floor-left",
    },
    {
      id: 27,
      coords: [
        [244, 184],
        [301, 184],
        [301, 243],
        [244, 243],
      ],
      locationZone: "vendor-floor-left",
    },
    {
      id: 28,
      coords: [
        [244, 243],
        [301, 243],
        [301, 301],
        [244, 301],
      ],
      locationZone: "vendor-floor-left",
    },
    {
      id: 29,
      coords: [
        [244, 301],
        [301, 301],
        [301, 360],
        [244, 360],
      ],
      locationZone: "vendor-floor-left",
    },
    {
      id: 30,
      coords: [
        [244, 359],
        [301, 359],
        [301, 418],
        [244, 418],
      ],
      locationZone: "vendor-floor-left",
    },
    {
      id: 31,
      coords: [
        [244, 418],
        [301, 418],
        [301, 476],
        [244, 476],
      ],
      locationZone: "vendor-floor-left",
    },
    {
      id: 32,
      coords: [
        [244, 476],
        [301, 476],
        [301, 535],
        [244, 535],
      ],
      locationZone: "vendor-floor-left",
    },
    {
      id: 33,
      coords: [
        [186, 476],
        [244, 476],
        [244, 535],
        [186, 535],
      ],
      locationZone: "vendor-floor-left",
    },
    {
      id: 34,
      coords: [
        [186, 418],
        [244, 418],
        [244, 476],
        [186, 476],
      ],
      locationZone: "vendor-floor-left",
    },
    {
      id: 35,
      coords: [
        [186, 359],
        [244, 359],
        [244, 418],
        [186, 418],
      ],
      locationZone: "vendor-floor-left",
    },
    {
      id: 36,
      coords: [
        [186, 301],
        [244, 301],
        [244, 360],
        [186, 360],
      ],
      locationZone: "vendor-floor-left",
    },
    {
      id: 37,
      coords: [
        [186, 243],
        [244, 243],
        [244, 301],
        [186, 301],
      ],
      locationZone: "vendor-floor-left",
    },
    {
      id: 38,
      coords: [
        [186, 184],
        [244, 184],
        [244, 243],
        [186, 243],
      ],
      locationZone: "vendor-floor-left",
    },
    {
      id: 39,
      coords: [
        [186, 126],
        [244, 126],
        [244, 184],
        [186, 184],
      ],
      locationZone: "vendor-floor-left",
    },
    {
      id: 40,
      coords: [
        [186, 67],
        [244, 67],
        [244, 126],
        [186, 126],
      ],
      locationZone: "vendor-floor-left",
    },
    {
      id: 41,
      coords: [
        [69, 69],
        [127, 69],
        [127, 128],
        [69, 128],
      ],
      locationZone: "vendor-floor-left",
    },
    {
      id: 42,
      coords: [
        [69, 244],
        [127, 244],
        [127, 303],
        [69, 303],
      ],
      locationZone: "vendor-floor-left",
    },
    {
      id: 43,
      coords: [
        [69, 303],
        [127, 303],
        [127, 361],
        [69, 361],
      ],
      locationZone: "vendor-floor-left",
    },
    {
      id: 44,
      coords: [
        [69, 478],
        [127, 478],
        [127, 536],
        [69, 536],
      ],
      locationZone: "vendor-floor-left",
    },
    {
      id: 45,
      coords: [
        [533, 1039],
        [591, 1039],
        [591, 1097],
        [533, 1097],
      ],
      locationZone: "vendor-floor-right",
    },
    {
      id: 46,
      coords: [
        [533, 981],
        [591, 981],
        [591, 1039],
        [533, 1039],
      ],
      locationZone: "vendor-floor-right",
    },
    {
      id: 47,
      coords: [
        [533, 922],
        [591, 922],
        [591, 981],
        [533, 981],
      ],
      locationZone: "vendor-floor-right",
    },
    {
      id: 48,
      coords: [
        [533, 864],
        [591, 864],
        [591, 922],
        [533, 922],
      ],
      locationZone: "vendor-floor-right",
    },
    {
      id: 49,
      coords: [
        [533, 806],
        [591, 806],
        [591, 864],
        [533, 864],
      ],
      locationZone: "vendor-floor-right",
    },
    {
      id: 50,
      coords: [
        [533, 747],
        [591, 747],
        [591, 806],
        [533, 806],
      ],
      locationZone: "vendor-floor-right",
    },
    {
      id: 51,
      coords: [
        [533, 689],
        [591, 689],
        [591, 747],
        [533, 747],
      ],
      locationZone: "vendor-floor-right",
    },
    {
      id: 52,
      coords: [
        [533, 630],
        [591, 630],
        [591, 689],
        [533, 689],
      ],
      locationZone: "vendor-floor-right",
    },
    {
      id: 53,
      coords: [
        [418, 630],
        [475, 630],
        [475, 689],
        [418, 689],
      ],
      locationZone: "vendor-floor-right",
    },
    {
      id: 54,
      coords: [
        [418, 689],
        [475, 689],
        [475, 747],
        [418, 747],
      ],
      locationZone: "vendor-floor-right",
    },
    {
      id: 55,
      coords: [
        [418, 747],
        [475, 747],
        [475, 806],
        [418, 806],
      ],
      locationZone: "vendor-floor-right",
    },
    {
      id: 56,
      coords: [
        [418, 806],
        [475, 806],
        [475, 864],
        [418, 864],
      ],
      locationZone: "vendor-floor-right",
    },
    {
      id: 57,
      coords: [
        [418, 864],
        [475, 864],
        [475, 922],
        [418, 922],
      ],
      locationZone: "vendor-floor-right",
    },
    {
      id: 58,
      coords: [
        [418, 922],
        [475, 922],
        [475, 981],
        [418, 981],
      ],
      locationZone: "vendor-floor-right",
    },
    {
      id: 59,
      coords: [
        [418, 981],
        [475, 981],
        [475, 1039],
        [418, 1039],
      ],
      locationZone: "vendor-floor-right",
    },
    {
      id: 60,
      coords: [
        [418, 1039],
        [475, 1039],
        [475, 1097],
        [418, 1097],
      ],
      locationZone: "vendor-floor-right",
    },
    {
      id: 61,
      coords: [
        [361, 1039],
        [418, 1039],
        [418, 1097],
        [361, 1097],
      ],
      locationZone: "vendor-floor-right",
    },
    {
      id: 62,
      coords: [
        [361, 981],
        [418, 981],
        [418, 1039],
        [361, 1039],
      ],
      locationZone: "vendor-floor-right",
    },
    {
      id: 63,
      coords: [
        [361, 922],
        [418, 922],
        [418, 981],
        [361, 981],
      ],
      locationZone: "vendor-floor-right",
    },
    {
      id: 64,
      coords: [
        [361, 864],
        [418, 864],
        [418, 922],
        [361, 922],
      ],
      locationZone: "vendor-floor-right",
    },
    {
      id: 65,
      coords: [
        [361, 806],
        [418, 806],
        [418, 864],
        [361, 864],
      ],
      locationZone: "vendor-floor-right",
    },
    {
      id: 66,
      coords: [
        [361, 747],
        [418, 747],
        [418, 806],
        [361, 806],
      ],
      locationZone: "vendor-floor-right",
    },
    {
      id: 67,
      coords: [
        [361, 689],
        [418, 689],
        [418, 747],
        [361, 747],
      ],
      locationZone: "vendor-floor-right",
    },
    {
      id: 68,
      coords: [
        [361, 630],
        [418, 630],
        [418, 689],
        [361, 689],
      ],
      locationZone: "vendor-floor-right",
    },
    {
      id: 69,
      coords: [
        [244, 630],
        [301, 630],
        [301, 689],
        [244, 689],
      ],
      locationZone: "vendor-floor-right",
    },
    {
      id: 70,
      coords: [
        [244, 689],
        [301, 689],
        [301, 747],
        [244, 747],
      ],
      locationZone: "vendor-floor-right",
    },
    {
      id: 71,
      coords: [
        [244, 747],
        [301, 747],
        [301, 806],
        [244, 806],
      ],
      locationZone: "vendor-floor-right",
    },
    {
      id: 72,
      coords: [
        [244, 806],
        [301, 806],
        [301, 864],
        [244, 864],
      ],
      locationZone: "vendor-floor-right",
    },
    {
      id: 73,
      coords: [
        [244, 864],
        [301, 864],
        [301, 922],
        [244, 922],
      ],
      locationZone: "vendor-floor-right",
    },
    {
      id: 74,
      coords: [
        [244, 922],
        [301, 922],
        [301, 981],
        [244, 981],
      ],
      locationZone: "vendor-floor-right",
    },
    {
      id: 75,
      coords: [
        [244, 981],
        [301, 981],
        [301, 1039],
        [244, 1039],
      ],
      locationZone: "vendor-floor-right",
    },
    {
      id: 76,
      coords: [
        [244, 1039],
        [301, 1039],
        [301, 1097],
        [244, 1097],
      ],
      locationZone: "vendor-floor-right",
    },
    {
      id: 77,
      coords: [
        [186, 1039],
        [244, 1039],
        [244, 1097],
        [186, 1097],
      ],
      locationZone: "vendor-floor-right",
    },
    {
      id: 78,
      coords: [
        [186, 981],
        [244, 981],
        [244, 1039],
        [186, 1039],
      ],
      locationZone: "vendor-floor-right",
    },
    {
      id: 79,
      coords: [
        [186, 922],
        [244, 922],
        [244, 981],
        [186, 981],
      ],
      locationZone: "vendor-floor-right",
    },
    {
      id: 80,
      coords: [
        [186, 864],
        [244, 864],
        [244, 922],
        [186, 922],
      ],
      locationZone: "vendor-floor-right",
    },
    {
      id: 81,
      coords: [
        [186, 806],
        [244, 806],
        [244, 864],
        [186, 864],
      ],
      locationZone: "vendor-floor-right",
    },
    {
      id: 82,
      coords: [
        [186, 747],
        [244, 747],
        [244, 806],
        [186, 806],
      ],
      locationZone: "vendor-floor-right",
    },
    {
      id: 83,
      coords: [
        [186, 689],
        [244, 689],
        [244, 747],
        [186, 747],
      ],
      locationZone: "vendor-floor-right",
    },
    {
      id: 84,
      coords: [
        [186, 630],
        [244, 630],
        [244, 689],
        [186, 689],
      ],
      locationZone: "vendor-floor-right",
    },
    {
      id: 85,
      coords: [
        [69, 630],
        [127, 630],
        [127, 689],
        [69, 689],
      ],
      locationZone: "vendor-floor-right",
    },
    {
      id: 86,
      coords: [
        [69, 689],
        [127, 689],
        [127, 747],
        [69, 747],
      ],
      locationZone: "vendor-floor-right",
    },
    {
      id: 87,
      coords: [
        [69, 747],
        [127, 747],
        [127, 806],
        [69, 806],
      ],
      locationZone: "vendor-floor-right",
    },
    {
      id: 88,
      coords: [
        [69, 864],
        [127, 864],
        [127, 922],
        [69, 922],
      ],
      locationZone: "vendor-floor-right",
    },
    {
      id: 89,
      coords: [
        [69, 922],
        [127, 922],
        [127, 981],
        [69, 981],
      ],
      locationZone: "vendor-floor-right",
    },
    {
      id: 90,
      coords: [
        [69, 981],
        [127, 981],
        [127, 1039],
        [69, 1039],
      ],
      locationZone: "vendor-floor-right",
    },
    {
      id: 91,
      coords: [
        [69, 1039],
        [127, 1039],
        [127, 1097],
        [69, 1097],
      ],
      locationZone: "vendor-floor-right",
    },
  ],
];

// Define your room polygons here
// Coords format: [[y_bottom, x_left], [y_top, x_left], [y_top, x_right], [y_bottom, x_right]]
// NOTE: All y values are measured from the bottom, not from the top and y values <= origHeightNum (562)
// NOTE: All x values are measured from the left and must be <= origWidthNum (998)
export const mapRooms: [string, Room[]] = [
  "/assets/maps/yuma_map_2026-01-06_160549-1.png",
  // must match mapSessions URL
  [
    // ... (your forumRooms data) ...
    // [[y_bottom, x_left], [y_top, x_left], [y_top, x_right], [y_bottom, x_right]]
    {
      name: "Seminar Room 1 (Fine Arts Building)",
      coords: [
        [375, 734],
        [400, 734],
        [400, 747],
        [375, 747],
      ],
      color: "#E63946", //Red
    },
    {
      name: "Seminar Room 2 (4H Building)",
      coords: [
        [436, 725],
        [451, 725],
        [451, 757],
        [436, 757],
      ],
      color: "#457B9D", // steel blue
    },
    {
      name: "Hospitality (Old Theater Building)",
      coords: [
        [288, 700],
        [360, 700],
        [360, 748],
        [288, 748],
      ],
      color: "#F4A261", // Orange
    },
  ],
];

export const mapSessions: [string, Session[]] = [
  "/assets/maps/yuma_map_2026-01-06_160549-1.png",
  // must match mapRooms URL
  // Source: https://www.yumahamfest.com/seminars.html (extracted 2026-02-25)
  [
    // ── Seminar Room 1 (Fine Arts Building) ──────────────────────────────────
    {
      id: "yuma-session-1",
      title: "Kit Building Techniques for Success",
      description:
        "A look at hints and tips for kit builders from beginners to advanced. We look at the proper tools, test equipment and work surface needed to have the best chance at success enjoying this very rewarding part of amateur radio.",
      speaker: ["Joe Eisenberg (K0NEB)"],
      location: "Seminar Room 1 (Fine Arts Building)",
      startTime: "2026-02-27T13:00:00",
      endTime: "2026-02-27T14:00:00",
      category: "Forums",
    },
    {
      id: "yuma-session-2",
      title: "VSWR and NANO VNAs",
      description:
        "Review of VSWR how it affects transmitting and receiving and followed by how to measure VSWR using an inexpensive Nano VNA.",
      speaker: ["Carl Foster (KB7AZ)"],
      location: "Seminar Room 1 (Fine Arts Building)",
      startTime: "2026-02-27T14:20:00",
      endTime: "2026-02-27T15:20:00",
      category: "Forums",
    },
    {
      id: "yuma-session-3",
      title: "ABC's of RFI for Hams",
      description:
        "Is your transmitter the SOURCE of RFI affecting electronic devices in your own house or your neighbor's house? Are you the VICTIM of RFI from your own electronic devices or from devices in your neighborhood? Do you want to reduce your receiver noise floor so you can hear local contacts and more DX? If you answered YES to any of these questions and would you like to find a quick and easy solution, then you should attend this presentation.",
      speaker: ["Bob Brehm (AK6R)"],
      location: "Seminar Room 1 (Fine Arts Building)",
      startTime: "2026-02-27T15:40:00",
      endTime: "2026-02-27T16:40:00",
      category: "Forums",
    },
    {
      id: "yuma-session-4",
      title: "Meshtastic vs Meshcore",
      description:
        "This talk will give a basic overview of the underlying technology (LoRa), the similarities and differences between Meshtastic and Meshcore, as well as some recommendations for which to use in different scenarios. I will also have a variety of devices to show.",
      speaker: ["Michael Rickey (AF6FB)"],
      location: "Seminar Room 1 (Fine Arts Building)",
      startTime: "2026-02-28T09:00:00",
      endTime: "2026-02-28T10:00:00",
      category: "Forums",
    },
    {
      id: "yuma-session-5",
      title: "FlexRadio - Aurora: The Future of Ham Radio",
      description:
        "Join us as Steve Hicks, FlexRadio CTO, N5AC, presents an exclusive look at the new Aurora transceiver from FlexRadio, Inc. Drawing on his technical expertise and leadership in software-defined radio innovation, Steve will highlight how Aurora sets a new standard in performance, advanced signal processing, and operator flexibility. Discover how these cutting-edge features deliver real-world benefits for the amateur radio community.",
      speaker: ["Steve Hicks (N5AC)", "CTO & VP Engineering, FlexRadio"],
      location: "Seminar Room 1 (Fine Arts Building)",
      startTime: "2026-02-28T10:20:00",
      endTime: "2026-02-28T11:20:00",
      category: "Forums",
    },
    {
      id: "yuma-session-6",
      title: "Are you compliant with FCC RF exposure rules?",
      description:
        "Carl, KB7AZ, is the Arizona Section Technical Coordinator. He will present the new rules and how to be compliant with those rules. Compliance is not difficult, but just takes a little time and effort.",
      speaker: ["Carl Foster (KB7AZ)"],
      location: "Seminar Room 1 (Fine Arts Building)",
      startTime: "2026-02-28T11:40:00",
      endTime: "2026-02-28T12:40:00",
      category: "Forums",
    },
    {
      id: "yuma-session-7",
      title: "Slow Scan Television (SSTV)",
      description:
        "SSTV is another mode of amateur radio communication. The first SSTV images were displayed on a long-persistence phosphor CRT. Today amateurs can send and receive color images across the country, and around the world. As Cycle 25 improves propagation, working DX on SSTV will be possible on the HF bands. This seminar will show how easy it is to get on the air with SSTV using the same setup that is used for FT8 and AFSK RTTY. All that is required is a computer with a sound card interface to a transceiver. The software is free and easy to set up. Sending and receiving color pictures on the HF bands is a great addition to CW, SSB, RTTY, and digital modes.",
      speaker: ["Carl Foster (KB7AZ)"],
      location: "Seminar Room 1 (Fine Arts Building)",
      startTime: "2026-02-28T13:00:00",
      endTime: "2026-02-28T14:00:00",
      category: "Forums",
    },
    {
      id: "yuma-session-8",
      title: "Consumer Electronics Show 2026",
      description:
        "Joe will share his experience at the Consumer Electronics Show 2026 in Las Vegas. Included will be the up and coming and new innovations. Joe will have a slideshow of his experience.",
      speaker: ["Joe Eisenberg (K0NEB)"],
      location: "Seminar Room 1 (Fine Arts Building)",
      startTime: "2026-02-28T14:20:00",
      endTime: "2026-02-28T15:20:00",
      category: "Forums",
    },
    {
      id: "yuma-session-9",
      title: "ARRL Updates and Forum",
      description:
        "The Southwestern Division Director and other ARRL officers will provide updates and lead the ARRL Forum. The forum is an opportunity for hams to find out about new developments within the ARRL, and to get their questions answered by their ARRL leadership. It is open to all hams and discussion and feedback are welcome.",
      speaker: ["Dick Norton (N6AA)", "ARRL Southwestern Division Director"],
      location: "Seminar Room 1 (Fine Arts Building)",
      startTime: "2026-02-28T15:40:00",
      endTime: "2026-02-28T17:00:00",
      category: "Forums",
    },
    // ── Seminar Room 2 (4H Building) ─────────────────────────────────────────
    {
      id: "yuma-session-10",
      title:
        "End Fed Antenna Secrets for Portable, Emergency and Stealth Installations",
      description:
        "Learn how to select, choose and setup an end fed antenna system that works on multiple bands, is stealthy and radiates well at low heights. Find out the secrets of antenna matching, reducing RFI and minimizing noise present on many end fed antennas. Example installations and antenna dimensions will be shown for 160-6 meter operations.",
      speaker: ["Bob Brehm (AK6R)"],
      location: "Seminar Room 2 (4H Building)",
      startTime: "2026-02-27T13:00:00",
      endTime: "2026-02-27T14:00:00",
      category: "Forums",
    },
    {
      id: "yuma-session-11",
      title: "Red Cross Ready",
      description:
        'Everyone knows the Red Cross helps people during emergencies. But you may not know that it\'s also part of our mission to help you help yourself! Becoming "Red Cross Ready" for an emergency means following our simple steps in advance to ensure you can weather a crisis safely and comfortably. This session will offer tips on building a kit to prepare for various emergencies like wildfires, flash floods or earthquakes. Being prepared may not prevent a disaster, but it will give you confidence to meet the challenge.',
      speaker: ["Red Cross"],
      location: "Seminar Room 2 (4H Building)",
      startTime: "2026-02-27T14:20:00",
      endTime: "2026-02-27T15:20:00",
      category: "Forums",
    },
    {
      id: "yuma-session-12",
      title: "Red Cross - Hands Only CPR",
      description:
        "Recent studies report about 90 percent of people who suffer out-of-hospital cardiac arrests die. CPR, especially if performed immediately, can double or triple a cardiac arrest victim's chance of survival. People who survive a cardiac emergency are often helped by a bystander. In this short, free session, you can learn how to perform Hands-Only CPR \u2013 so that you can help deliver life-saving care until professional responders arrive.",
      speaker: ["Red Cross"],
      location: "Seminar Room 2 (4H Building)",
      startTime: "2026-02-27T15:40:00",
      endTime: "2026-02-27T16:40:00",
      category: "Forums",
    },
    {
      id: "yuma-session-13",
      title:
        "Wheels On The Air (WOTA): A Mobility Forward Twist on Ham Radio Activations",
      description:
        "Members of the Amateur Radio Club of El Cajon, CA convert access and functional-need amateur radio operators into contest rovers utilizing only public transportation. This seminar outlines mission planning using the Incident Command System (ICS), explores expanded ARRL rules, and examines the real-world challenges of coordinating operations across disabled and public transit systems. The After Action Report will provide a practical, repeatable template for other amateur radio clubs seeking inclusive, mobility-forward activations.",
      speaker: ["Grant Warren (KO6IHG)"],
      location: "Seminar Room 2 (4H Building)",
      startTime: "2026-02-28T09:00:00",
      endTime: "2026-02-28T10:00:00",
      category: "Forums",
    },
    {
      id: "yuma-session-14",
      title: "Remote DXpeditioning",
      description:
        'The Radio-In-a-Box (RIB) technology has made a big impact in the DX (and contesting) realm. Its use in high-profile DXpeditions has changed the DXing game forever. The use of RIBs in DXpeditions can provide numerous benefits such as reduced project costs, lower environmental impact and safer operations. The "Remote DXpedition" presentation will provide AA7A\'s perspective on the nearly seven-year development effort of the RIB concept and other emerging technologies and how their application to DXing is an exciting step forward in amateur radio.',
      speaker: ["Ned Stearns (AA7A)"],
      location: "Seminar Room 2 (4H Building)",
      startTime: "2026-02-28T10:20:00",
      endTime: "2026-02-28T11:20:00",
      category: "Forums",
    },
    {
      id: "yuma-session-15",
      title: "A Life of Ham Radio Adventures",
      description:
        "An active DXer and contester, first licensed as WN9EBT in Chicago in 1962. He is Top of DXCC Honor Roll with all 340 current entities confirmed, has 3,030 entities confirmed in DXCC Challenge, and holds 5 Band Worked All Zones (5BWAZ). An avid CW operator, Lee is a member of both FOC and CWops but has also been very active on digital modes in recent years. Lee will talk about his path in ham radio from building a Knight-Kit SpanMaster in 1960 to honing his CW skills in high school by handling messages for the National Traffic System and on through his evolution as a DXer and contester to becoming a pioneer today in the evolution of remote station operation.",
      speaker: ["Lee Finkel (KY7M)"],
      location: "Seminar Room 2 (4H Building)",
      startTime: "2026-02-28T11:40:00",
      endTime: "2026-02-28T12:40:00",
      category: "Forums",
    },
    {
      id: "yuma-session-16",
      title: "Transformers, More Than Meets the Eye",
      description:
        "The lowly transformer. It doesn't get much attention. We mostly know what it does when we poke it with some voltage or current, but what is really going on? Let's talk about it from Maxwell on up, and see if we can understand these simple, yet deep devices. You might be surprised at what they can do and how they do it.",
      speaker: ["Kristen McIntyre (K6WX)", "ARRL 1st Vice President"],
      location: "Seminar Room 2 (4H Building)",
      startTime: "2026-02-28T13:00:00",
      endTime: "2026-02-28T14:00:00",
      category: "Forums",
    },
    {
      id: "yuma-session-17",
      title: "Vero Telecom Radio (VGC NR-7x Radios)",
      description:
        "Vero makes mobile and handheld radios with some unique capabilities and an affordable price. This talk will discuss the radios from VGC and the other brands with compatible radios. These radios are unique in that they offer programming via a mobile app, APRS, network channels, text messaging, satellite operations, Bluetooth TNC, and more.",
      speaker: ["Michael Rickey (AF6FB)"],
      location: "Seminar Room 2 (4H Building)",
      startTime: "2026-02-28T14:20:00",
      endTime: "2026-02-28T15:20:00",
      category: "Forums",
    },
    {
      id: "yuma-session-18",
      title: "How to set up MMTTY and other RTTY software and get on the air",
      description:
        "Amateurs have been using RTTY since the 1940s. Originally, they used mechanical machines to send and receive messages. Around 1980, they slowly switched to using computers to generate and receive RTTY signals. However, there are a lot of amateurs who still use machinery instead of computers. The over-the-air signals are the same, so it doesn't matter which method you use. Learn how to easily set up a PC with an SSB transceiver to get on the air with this digital mode.",
      speaker: ["Carl Foster (KB7AZ)"],
      location: "Seminar Room 2 (4H Building)",
      startTime: "2026-02-28T15:40:00",
      endTime: "2026-02-28T17:00:00",
      category: "Forums",
    },
    // ── Hospitality Seminars (Old Theater Building) ───────────────────────────
    {
      id: "yuma-session-19",
      title: "Skywarn Spotter Training - Refresher",
      description:
        "A condensed version of the National Weather Service Skywarn Spotter Training Refresher. This refresher is recommended every other year in order to keep you up to date and informed as a Skywarn Spotter.",
      speaker: [
        "Tom Frieders (National Weather Service)",
        "Ted Whittock (National Weather Service)",
      ],
      location: "Hospitality (Old Theater Building)",
      startTime: "2026-02-27T13:00:00",
      endTime: "2026-02-27T14:00:00",
      category: "Forums",
    },
    {
      id: "yuma-session-20",
      title: "Rope Baskets",
      description:
        "I became interested in designs using rope and fabric two years ago when a friend shared what she had learned at a quilt store class. I was immediately hooked, and as my hubby says, addicted. Soon I had baskets, trivets, wall hangings and table runners galore! My favorite challenge is to create rope art that looks like pottery. Come enjoy creating Rope Baskets with me!",
      speaker: ["Patti Tellechia (Rope Art By Patti T)"],
      location: "Hospitality (Old Theater Building)",
      startTime: "2026-02-27T14:00:00",
      endTime: "2026-02-27T15:00:00",
      category: "Forums",
    },
    {
      id: "yuma-session-21",
      title: "Family Search",
      description:
        "I am a Family Search Consultant. Over the years I have gathered many stories, pictures, and worked with Ancestory.com, Family Search and other genealogy sites. I hope I will be able answer your questions that you may have, how to begin, finding one special story, or that one relative you do not know anything about or are just curious who you look like. Come search with me!",
      speaker: ["Marsha Spates"],
      location: "Hospitality (Old Theater Building)",
      startTime: "2026-02-28T13:00:00",
      endTime: "2026-02-28T14:00:00",
      category: "Forums",
    },
    {
      id: "yuma-session-22",
      title: "Sewing Tips",
      description:
        "Brenda's Quilting Studio is a small, family owned, longarm quilting business located in the Yuma foothills area for over 20 years. With a background in custom tailoring-including formals and wedding alterations-Brenda brings deep expertise in fabric, fit and finishing to all she does. Today, she is passionate about helping quilters of all skill levels achieve a beautiful, professional finish on their hand-created quilts. Come join Brenda for Sewing tips!",
      speaker: ["Brenda Farris (Brenda's Quilting Studio)"],
      location: "Hospitality (Old Theater Building)",
      startTime: "2026-02-28T14:00:00",
      endTime: "2026-02-28T15:00:00",
      category: "Forums",
    },
    {
      id: "yuma-session-23",
      title: "Chair Yoga",
      description:
        "Michelle has practiced yoga for over 15 years and became a certified yoga teacher in 2025. Michelle is passionate about sharing the gift of yoga with others. Her classes welcome both beginners and seasoned yogis, offering a supportive space for self-discovery and growth\u2014physically and spiritually. Her compassionate teaching style focuses on the whole client and their personal intention for practice. She strives to empower clients to explore their goals fully through self-awareness and the intentional development of mobility, range of motion, strength, and flexibility. Come try Chair Yoga with Michelle!",
      speaker: ["Michelle Estes (Certified Yoga Teacher, 2025)"],
      location: "Hospitality (Old Theater Building)",
      startTime: "2026-02-28T15:00:00",
      endTime: "2026-02-28T16:00:00",
      category: "Forums",
    },
  ],
];

// map images - in production these may be bundled images
export const conferenceMaps: MapImage[] = [
  {
    id: "map-3",
    name: "Yuma Hamfest",
    url: "/assets/maps/yuma_map_2026-01-06_160549-1.png",
    order: 1,
    origHeightNum: 562,
    origWidthNum: 998,
  },
  {
    id: "map-2",
    name: "Exhibitors",
    //url: 'https://www.yumahamfest.com/vendorlayout.html',
    url: "/assets/maps/yuma-vendors-20260225.png",
    //floor: '2',
    order: 2,
    origWidthNum: 1166,
    origHeightNum: 609,
  },
];

export const sampleAttendees: UserProfile[] = [
  {
    uid: "7dBAeZv7kJbVOI5A99Zol06dCTU2",
    email: "grantbow@gmail.com",
    darkMode: false,
    bookmarkedSessions: [],
    notificationsEnabled: true,
    smsNotifications: true,
    groups: ["prize-admin"],
    displayName: "Grant B",
    callsign: "K6CBK",
  },
  {
    uid: "2JjLExoVgiVdblnPFUVX1YJzqdA2",
    email: "grantbow@mdarc.org",
    darkMode: false,
    bookmarkedSessions: [],
    notificationsEnabled: true,
    smsNotifications: true,
    groups: ["prize-admin"],
    displayName: "Grant B",
    callsign: "K6CBK",
  },
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
