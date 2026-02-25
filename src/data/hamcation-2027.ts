import { Session, MapImage, Room, Exhibitor, Booth, Prize, PrizeWinner, UserProfile } from '@/types/conference';

export const samplePrizes: Prize[] = [
  {
    id: 'p1',
    name: 'Yaesu FT-65R Handheld',
    description: 'Dual-band 5W handheld',
    imageUrl: '/assets/prizes/p1.jpg',
    donor: 'Yaesu',
    winner: 'winner1',
    category: 'Prize',
  },
  {
    id: 'p2',
    name: 'Antenna Tuner',
    description: 'For HF bands, LDG Z-100 Plus',
    imageUrl: '/assets/prizes/p2.jpg',
    donor: 'Pacificon Committee',
    winner: 'winner2',
    category: 'Prize',
  },
  {
    id: 'p3',
    name: 'ARRL Handbook',
    description: 'Latest Technician study manual',
    imageUrl: '/assets/prizes/p3.jpg',
    donor: 'ARRL',
    winner: 'winner3',
    category: 'Prize',
  },
];

export const samplePrizeWinners: PrizeWinner[] = [
  {
    id: 'winner1',
    prizeId: ['p1'],
    winnerCallsign: 'K6AL',
    winnerName: 'Alice Cooper',
    winningTicket: '1001',
  },
  //  winnerEmail?: string;
  //  notifiedAt?: string;
  //  claimedAt?: string;
  //  drawing?: string;
  //}
  {
    id: 'winner2',
    prizeId: ['p2'],
    winningTicket: '2042',
  },
  {
    id: 'winner3',
    prizeId: ['p3'],
    winningTicket: '3155',
    winnerCallsign: 'W6CW',
    winnerName: 'Carol Williams',
  },

];

export const mapBooths: [string, Booth[]] = [
    "/hamcation-2026-pavilion.png", [
    {
      id: 1,
      coords: [[1, 3], [57, 3], [57, 90], [1, 90]], // Bottom Left
      locationZone: 'b',
    },
  ],

];


export const mapExhibitors: [string, Exhibitor[]] = [
  "/hamcation-2026-pavilion.png", [
  {
    id: 'arrl',
    name: 'ARRL',
    description: 'American Radio Relay League',
    boothName: '4  5',
    location: [4, 5],
    type: 'vendor-booth',
    color: '#77cff4',
    url: 'https://www.arrl.org',
  },
  {
    id: 'exhibitor-unitrend',
    name: 'Uni-Trend Technology US Inc',
    description: 'worlds most renowned test and measurement solutions providers',
    boothName: "1  2  3",
    location: [1, 2, 3],
    type: 'vendor-booth',
    color: '#77cff4',
    url: 'https://www.uni-trendus.com',
  },
  {
    id: 'exhibitor-platinum',
    name: 'Platinum Coast Amateur Radio Society',
    description: 'Cables, Connectors, LEDs and Adapters',
    boothName: '4',
    location: [4],
    color: '#77cff4',
    type: 'vendor',
    url: 'https://www.pcards.org',
  },
  {
    id: 'exhibitor-w5yi',
    name: 'W5YI Licensing Services Inc',
    description: 'licensing',
    boothName: '5  6',
    location: [5, 6],
    type: 'nonprofit',
    color: '#77cff4',
    url: 'https://www.w5yi-vec.org',
  },
],
];

// Define your room polygons here
// Coords format: [[y_bottom, x_left], [y_top, x_left], [y_top, x_right], [y_bottom, x_right]]
// NOTE: All x values must be <= origWidthNum (582) and y values <= origHeightNum (256)
// The Pleasanton/Danville/San Ramon coords below are PLACEHOLDERS — update them to match
// your actual image. Their original x values (630–715) exceeded the image width of 582.
export const forumRooms: Room[] = [
  // ... (your forumRooms data) ...
  // [[y_bottom, x_left], [y_top, x_left], [y_top, x_right], [y_bottom, x_right]]
  {
    name: 'Tent 1',
    //coords: [[5, 58], [47, 7], [65, 24], [25, 75]], x 8
    coords: [[40, 464], [376, 56], [520, 192], [200, 600]],
    color: '#10B981',
  },
  {
    name: 'Tent 2',
    //coords: [[25, 75], [65, 24], [80, 37], [40, 90]],
    coords: [[200, 600], [520, 192], [640, 296], [320, 720]],
    color: '#3B82F6',
  },
  {
    name: 'Tent 3',
    //coords: [[80, 37], [40, 90], [53, 103], [93, 50]],
    coords: [[640, 296], [320, 720], [424, 824], [764, 410]],
    color: '#F59E0B',
  },
  {
    name: 'Restrooms',
    //coords: [[53, 103], [70, 82], [85,94], [67, 114]],
    coords: [[424, 820], [573, 656], [680, 752], [536, 912]],
    color: '#005CF6',
  },
];

export const mapSessions: [string, Session[]] = [
  '/hamcation-2026-pavilion.png', [
  {
    id: 'session-1',
    title: 'Florida AUXCOMM ESF2 Stakeholder Forum',
    description: 'Hear from Floridas Statewide Interoperability Coordinator (SWIC) and from Floridas ESF2 team on the year in review for Floridas AUXCOMM program, ICT Communications updates, exercise and training opportunities and presentation of Flroidas annual AUXCOMM Service Award',
    speaker: ['Roger Lord (FDEM SWIC)', 'David Byrun (FL AUXCOMM)'],
    location: 'Pavillion Tent 1',
    startTime: '2027-02-13T09:15:00',
    endTime: '2027-02-13T10:15:00',
    category: 'EmComm',
    track: 'EmComm'
  },
  {
    id: 'session-2',
    title: 'Getting Started in QRP',
    description: 'Steve has been a ham for more than five decades...',
    speaker: ['Steve Hudson, AA4BW'],
    location: 'Pavillion Tent 3',
    startTime: '2027-02-13T09:15:00',
    endTime: '2027-02-13T10:15:00',
    category: 'Operating',
    track: 'QRP'
  },
  {
    id: 'session-3',
    title: 'High Performance HF multi-band Antenna and Lightning Protection System',
    description: 'Gary from trueladderline.com, will discuss the high efficiency HF multi-band antenna model and methods of lightning protection for it.',
    speaker: ['Gary Baker, K7EMF'],
    location: 'Pavillion Tent 2',
    startTime: '2027-02-13T09:15:00',
    endTime: '2027-02-13T10:15:00',
    category: 'Technical',
    track: 'Station'
  },
  {
    id: 'session-4',
    title: 'D-STAR',
    description: 'Join D-STAR enthusiasts for whats new and how to get the most from your D-STAR equipment. Well discuss how easy it is to get on the air, connect with others around the world, the easiest programming of your radio, how to update your radio with the current list of repeaters and get your hotspot connection for D-STAR.F',
    speaker: ['John Davis, WB4QDX'],
    location: 'Pavilion Tent 2',
    startTime: '2027-02-13T10:30:00',
    endTime: '2027-02-13T11:30:00',
    category: 'Operating',
    track: 'Digital'
  },
  {
    id: 'session-5',
    title: 'DX Marathon',
    description: 'Join the Chase: Why the DX Marathon Should Be Your Next Ham Radio Challenge',
    speaker: ['Mark Wohlschlegel, WC3W'],
    location: 'Pavilion Tent 3',
    startTime: '2027-02-13T10:30:00',
    endTime: '2027-02-13T11:30:00',
    category: 'Contesting',
    track: 'DX'
  },
  {
    id: 'session-6',
    title: 'Elecraft K4 Update with Q&A',
    description: 'Eric Swartz, WA6HHQ, Elecraft Co-Founder, will discuss: K4 Transceiver, K4 Software Eleases and Updates, K$/0 TRemote System, Q&A on all Elecraft products',
    speaker: ['Eric Swartz, WA6HHQ'],
    location: 'Pavilion Tent 2',
    startTime: '2027-02-13T10:30:00',
    endTime: '2027-02-13T11:30:00',
    category: 'Equipment',
    track: 'Product'
  },
  {
    id: 'session-7',
    title: 'DX Contesting from V26B in Antigua',
    description: 'The presentation will introduce the fun and challenges of HF contesting...',
    speaker: ['Ray Conrad, NM2O'],
    location: 'Pavilion Tent 3',
    startTime: '2027-02-13T11:45:00',
    endTime: '2027-02-13T12:45:00',
    category: 'Contesting',
    track: 'DX',
  },
],
];

// map images - in production these may be bundled images
export const conferenceMaps: MapImage[] = [
  {
    id: 'map-1',
    name: 'Fairground',
    url: '/hamcation-2026-fairgrounds.png',
    order: 1,
    origHeightNum: 647,
    origWidthNum: 1200,
  },
  {
    id: 'map-2',
    name: 'East and West Halls',
    url: '/hamcation-2026-eastwest.png',
    order: 2,
    origHeightNum: 425,
    origWidthNum: 1199,
  },
  {
    id: 'map-3',
    name: 'North Hall',
    url: '/hamcation-2026-north.png',
    order: 3,
    origHeightNum: 550,
    origWidthNum: 1199,
  },
  {
    id: 'map-4',
    name: 'Pavilion',
    url: '/hamcation-2026-pavilion.png',
    order: 4,
    origHeightNum: 840,
    origWidthNum: 1016,
  },
  {
    id: 'map-5',
    name: 'Outline',
    url: '/hamcation-map-2026.png',
    order: 5,
  },
];

export const sampleAttendees: UserProfile[] = [
  {
    uid: '1',
    email: 'test1test.com',
    callsign: 'K6AL',
    displayName: 'Alice Cooper',
    displayProfile: 'Something about me', 
    darkMode: false,
    bookmarkedSessions: [],
    notificationsEnabled: false,
    smsNotifications: false,
  },
  {
    uid: '2',
    email: 'test2@test.com',
    callsign: 'N6YZ',
    displayName: 'Bob Johnson',
    displayProfile: 'Something about me', 
    darkMode: false,
    bookmarkedSessions: [],
    notificationsEnabled: false,
    smsNotifications: false,
  },
  {
    uid: '3',
    email: 'test3@test.com',
    callsign: 'W6CW',
    displayName: 'Carol Williams',
    displayProfile: 'Something about me', 
    darkMode: false,
    bookmarkedSessions: [],
    notificationsEnabled: false,
    smsNotifications: false,
  },
  {
    uid: '4',
    email: 'test4@test.com',
    displayName: 'David Lee',
    displayProfile: 'Something about me', 
    darkMode: false,
    bookmarkedSessions: [],
    notificationsEnabled: false,
    smsNotifications: false,
  },
  {
    uid: '5',
    email: 'test5@test.com',
    callsign: 'K6ABC',
    displayName: 'Jane Smith',
    displayProfile: 'Something about me', 
    darkMode: false,
    bookmarkedSessions: [],
    notificationsEnabled: false,
    smsNotifications: false,
  },
  {
    uid: '6',
    email: 'test6@test.com',
    callsign: 'WB6NOA',
    displayName: 'Gordon West',
    displayProfile: 'Something about me', 
    darkMode: false,
    bookmarkedSessions: [],
    notificationsEnabled: false,
    smsNotifications: false,
  },
  {
    uid: '7',
    email: 'test7@test.com',
    callsign: 'AA6PP',
    displayName: 'Dr. Antonis Papatsaras',
    displayProfile: 'Something about me', 
    darkMode: false,
    bookmarkedSessions: [],
    notificationsEnabled: false,
    smsNotifications: false,
  },
];

