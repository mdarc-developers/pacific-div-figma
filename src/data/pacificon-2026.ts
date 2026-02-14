import { Session, MapImage, Room, Exhibitor, Booth } from '@/types/conference';

export const exhibitorBooths: Booth[] = [
  // origHeightNum: 1702,
  // origWidthNum: 1280,
  // ... (your exhibitorBooths data) ...
  // x is normal, y from bottom so 1702 - y
  // [[y_bottom, x_left], [y_top, x_left], [y_top, x_right], [y_bottom, x_right]]
  // down 70 in bishop ranch column, 51 wide
  {
    id: 1, // 875, 505 - 927, 526 done via gimp - so top left is [1185, 875], bot right is [1176,927]
    //coords: [[775, 505], [827, 505], [827, 526], [775, 526]],
    //coords: [[1196, 876], [1196, 927], [1126, 927], [1126, 526]],
    coords: [[1126, 875], [1196, 875], [1196, 926], [1126, 926]],
    locationZone: 'bishop-ranch',
    conferenceId: 'pacificon-2026',
  },
  {
    id: 2,
    coords: [[1056, 875], [1126, 875], [1126, 926], [1056, 926]],
    locationZone: 'bishop-ranch',
    conferenceId: 'pacificon-2026',
  },
  {
    id: 3,
    coords: [[986, 875], [1056, 875], [1056, 926], [986, 926]],
    locationZone: 'bishop-ranch',
    conferenceId: 'pacificon-2026',
  },
  {
    id: 4,
    coords: [[915, 875], [985, 875], [985, 926], [915, 926]],
    locationZone: 'bishop-ranch',
    conferenceId: 'pacificon-2026',
  },
  {
    id: 5,
    coords: [[842, 875], [915, 875], [915, 926], [842, 926]],
    locationZone: 'bishop-ranch',
    conferenceId: 'pacificon-2026',
  },
  {
    id: 6,
    // [[y_bottom, x_left], [y_top, x_left], [y_top, x_right], [y_bottom, x_right]]
    coords: [[1126, 926], [1196, 926], [1196, 977], [1126, 977]],
    locationZone: 'bishop-ranch',
    conferenceId: 'pacificon-2026',
  },
  {
    id: 7,
    coords: [[1056, 926], [1126, 926], [1126, 977], [1056, 977]],
    locationZone: 'bishop-ranch',
    conferenceId: 'pacificon-2026',
  },
  {
    id: 8,
    coords: [[986, 926], [1056, 926], [1056, 977], [986, 977]],
    locationZone: 'bishop-ranch',
    conferenceId: 'pacificon-2026',
  },
  {
    id: 9,
    coords: [[915, 926], [985, 926], [985, 977], [915, 977]],
    locationZone: 'bishop-ranch',
    conferenceId: 'pacificon-2026',
  },
  {
    id: 10,
    coords: [[842, 926], [915, 926], [915, 977], [842, 977]],
    locationZone: 'bishop-ranch',
    conferenceId: 'pacificon-2026',
  },
  {
    // [[y_bottom, x_left], [y_top, x_left], [y_top, x_right], [y_bottom, x_right]]
    id: 11,// 1041, 506 top left gimp so 1702-506= 1196, 1041 vs 1196,875 so 166 pixels to right
    coords: [[1126, 1041], [1196, 1041], [1196, 1092], [1126, 1092]],
    locationZone: 'bishop-ranch',
    conferenceId: 'pacificon-2026',
  },
  {
    id: 12,
    coords: [[1056, 1041], [1126, 1041], [1126, 1092], [1056, 1092]],
    locationZone: 'bishop-ranch',
    conferenceId: 'pacificon-2026',
  },
  {
    id: 13,
    coords: [[986, 1041], [1056, 1041], [1056, 1092], [986, 1092]],
    locationZone: 'bishop-ranch',
    conferenceId: 'pacificon-2026',
  },
  {
    id: 14,
    coords: [[915, 1041], [985, 1041], [985, 1092], [915, 1092]],
    locationZone: 'bishop-ranch',
    conferenceId: 'pacificon-2026',
  },
  {
    id: 15,
    coords: [[842, 1041], [915, 1041], [915, 1092], [842, 1092]],
    locationZone: 'bishop-ranch',
    conferenceId: 'pacificon-2026',
  },
  {
    id: 16,
    // [[y_bottom, x_left], [y_top, x_left], [y_top, x_right], [y_bottom, x_right]]
    coords: [[1126, 1093], [1196, 1093], [1196, 1145], [1126, 1145]],
    locationZone: 'bishop-ranch',
    conferenceId: 'pacificon-2026',
  },
  {
    id: 17,
    coords: [[1056, 1093], [1126, 1093], [1126, 1145], [1056, 1145]],
    locationZone: 'bishop-ranch',
    conferenceId: 'pacificon-2026',
  },
  {
    id: 18,
    coords: [[986, 1093], [1056, 1093], [1056, 1145], [986, 1145]],
    locationZone: 'bishop-ranch',
    conferenceId: 'pacificon-2026',
  },
  {
    id: 19,
    coords: [[915, 1093], [985, 1093], [985, 1145], [915, 1145]],
    locationZone: 'bishop-ranch',
    conferenceId: 'pacificon-2026',
  },
  {
    id: 20,
    // [[y_bottom, x_left], [y_top, x_left], [y_top, x_right], [y_bottom, x_right]]
    coords: [[842, 1093], [915, 1093], [915, 1145], [842, 1145]],
    locationZone: 'bishop-ranch',
    conferenceId: 'pacificon-2026',
  },
  {
    id: 21,
    // [[y_bottom, x_left], [y_top, x_left], [y_top, x_right], [y_bottom, x_right]]
    coords: [[723, 853], [774, 853], [774, 923], [723, 923]],
    locationZone: 'bishop-ranch',
    conferenceId: 'pacificon-2026',
  },
  {
    id: 22,
    // [[y_bottom, x_left], [y_top, x_left], [y_top, x_right], [y_bottom, x_right]]
    coords: [[723, 924], [774, 924], [774, 994], [723, 994]],
    locationZone: 'bishop-ranch',
    conferenceId: 'pacificon-2026',
  },
  {
    id: 23,
    // [[y_bottom, x_left], [y_top, x_left], [y_top, x_right], [y_bottom, x_right]]
    coords: [[723, 995], [774, 995], [774, 1065], [723, 1065]],
    locationZone: 'bishop-ranch',
    conferenceId: 'pacificon-2026',
  },
  {
    id: 24,
    // [[y_bottom, x_left], [y_top, x_left], [y_top, x_right], [y_bottom, x_right]]
    coords: [[723, 1066], [774, 1066], [774, 1136], [723, 1136]],
    locationZone: 'bishop-ranch',
    conferenceId: 'pacificon-2026',
  },
  {
    id: 25,
    // [[y_bottom, x_left], [y_top, x_left], [y_top, x_right], [y_bottom, x_right]]
    coords: [[723, 1137], [774, 1137], [774, 1208], [723, 1208]],
    locationZone: 'bishop-ranch',
    conferenceId: 'pacificon-2026',
  },
  {
    id: 26,
    // [[y_bottom, x_left], [y_top, x_left], [y_top, x_right], [y_bottom, x_right]]
    coords: [[775, 1209], [847, 1209], [847, 1259], [775, 1259]],
    locationZone: 'bishop-ranch',
    conferenceId: 'pacificon-2026',
  },
  {
    id: 27,
    // [[y_bottom, x_left], [y_top, x_left], [y_top, x_right], [y_bottom, x_right]]
    coords: [[847, 1209], [916, 1209], [916, 1258], [847, 1258]],
    locationZone: 'bishop-ranch',
    conferenceId: 'pacificon-2026',
  },
  {
    id: 28,
    // [[y_bottom, x_left], [y_top, x_left], [y_top, x_right], [y_bottom, x_right]]
    coords: [[991, 1206], [1062, 1206], [1062, 1256], [991, 1256]],
    locationZone: 'bishop-ranch',
    conferenceId: 'pacificon-2026',
  },
  {
    id: 29,
    // [[y_bottom, x_left], [y_top, x_left], [y_top, x_right], [y_bottom, x_right]]
    coords: [[1163, 1207], [1233, 1207], [1233, 1258], [1163, 1258]],
    locationZone: 'bishop-ranch',
    conferenceId: 'pacificon-2026',
  },
  {
    id: 31,
    coords: [[1, 2], [3, 4], [5, 6], [7, 8]],
    locationZone: 'bishop-ranch-hallway',
    conferenceId: 'pacificon-2026',
  },
  {
    id: 32,
    coords: [[1, 2], [3, 4], [5, 6], [7, 8]],
    locationZone: 'bishop-ranch-hallway',
    conferenceId: 'pacificon-2026',
  },
  {
    id: 33,
    coords: [[1, 2], [3, 4], [5, 6], [7, 8]],
    locationZone: 'bishop-ranch-hallway',
    conferenceId: 'pacificon-2026',
  },
  {
    id: 34,
    coords: [[1, 2], [3, 4], [5, 6], [7, 8]],
    locationZone: 'bishop-ranch-hallway',
    conferenceId: 'pacificon-2026',
  },
  {
    id: 35,
    coords: [[1, 2], [3, 4], [5, 6], [7, 8]],
    locationZone: 'bishop-ranch-hallway',
    conferenceId: 'pacificon-2026',
  },
  {
    id: 36,
    coords: [[1, 2], [3, 4], [5, 6], [7, 8]],
    locationZone: 'bishop-ranch-hallway',
    conferenceId: 'pacificon-2026',
  },
  {
    id: 37,
    coords: [[1, 2], [3, 4], [5, 6], [7, 8]],
    locationZone: 'bishop-ranch-hallway',
    conferenceId: 'pacificon-2026',
  },
  {
    id: 38,
    coords: [[1, 2], [3, 4], [5, 6], [7, 8]],
    locationZone: 'bishop-ranch-hallway',
    conferenceId: 'pacificon-2026',
  },
  {
    id: 39,
    coords: [[1, 2], [3, 4], [5, 6], [7, 8]],
    locationZone: 'bishop-ranch-hallway',
    conferenceId: 'pacificon-2026',
  },
  {
    id: 40,
    coords: [[1, 2], [3, 4], [5, 6], [7, 8]],
    locationZone: 'bishop-ranch-hallway',
    conferenceId: 'pacificon-2026',
  },
  {
    id: 41,
    coords: [[1, 2], [3, 4], [5, 6], [7, 8]],
    locationZone: 'bishop-ranch-hallway',
    conferenceId: 'pacificon-2026',
  },
  {
    id: 42,
    coords: [[1, 2], [3, 4], [5, 6], [7, 8]],
    locationZone: 'bishop-ranch-hallway',
    conferenceId: 'pacificon-2026',
  },
  {
    id: 43,
    coords: [[1, 2], [3, 4], [5, 6], [7, 8]],
    locationZone: 'bishop-ranch-hallway',
    conferenceId: 'pacificon-2026',
  },
  {
    id: 44,
    coords: [[1, 2], [3, 4], [5, 6], [7, 8]],
    locationZone: 'bishop-ranch-hallway',
    conferenceId: 'pacificon-2026',
  },
  {
    id: 45,
    coords: [[1, 2], [3, 4], [5, 6], [7, 8]],
    locationZone: 'bishop-ranch-hallway',
    conferenceId: 'pacificon-2026',
  },
  {
    id: 46,
    coords: [[1, 2], [3, 4], [5, 6], [7, 8]],
    locationZone: 'bishop-ranch-hallway',
    conferenceId: 'pacificon-2026',
  },
  {
    id: 47,
    coords: [[1, 2], [3, 4], [5, 6], [7, 8]],
    locationZone: 'bishop-ranch-hallway',
    conferenceId: 'pacificon-2026',
  },
  {
    id: 48,
    coords: [[1, 2], [3, 4], [5, 6], [7, 8]],
    locationZone: 'bishop-ranch-hallway',
    conferenceId: 'pacificon-2026',
  },
  {
    id: 49,
    coords: [[1, 2], [3, 4], [5, 6], [7, 8]],
    locationZone: 'bishop-ranch-hallway',
    conferenceId: 'pacificon-2026',
  },
  {
    id: 50,
    coords: [[1, 2], [3, 4], [5, 6], [7, 8]],
    locationZone: 'bishop-ranch-hallway',
    conferenceId: 'pacificon-2026',
  },
  {
    id: 51,
    coords: [[1, 2], [3, 4], [5, 6], [7, 8]],
    locationZone: 'bishop-ranch-hallway',
    conferenceId: 'pacificon-2026',
  },
  {
    id: 52,
    coords: [[1, 2], [3, 4], [5, 6], [7, 8]],
    locationZone: 'bishop-ranch-hallway',
    conferenceId: 'pacificon-2026',
  },
  {
    id: 53,
    coords: [[1, 2], [3, 4], [5, 6], [7, 8]],
    locationZone: 'bishop-ranch-hallway',
    conferenceId: 'pacificon-2026',
  },
  {
    id: 54,
    coords: [[1, 2], [3, 4], [5, 6], [7, 8]],
    locationZone: 'bishop-ranch-hallway',
    conferenceId: 'pacificon-2026',
  },
  {
    id: 55,
    coords: [[1, 2], [3, 4], [5, 6], [7, 8]],
    locationZone: 'bishop-ranch-hallway',
    conferenceId: 'pacificon-2026',
  },
  {
    id: 65,
    coords: [[1, 2], [3, 4], [5, 6], [7, 8]],
    locationZone: 'contra-costa-hallway',
    conferenceId: 'pacificon-2026',
  },
  {
    id: 119,
    coords: [[1, 2], [3, 4], [5, 6], [7, 8]],
    locationZone: 'contra-costa',
    conferenceId: 'pacificon-2026',
  },
];

export const sampleExhibitors: Exhibitor[] = [
  {
    id: 'exhibitor-flexradio',
    conferenceId: 'pacificon-2026',
    name: 'Flex Radio',
    description: 'software defined radios',
    location: [1, 2, 3],
    type: 'vendor',
    url: 'https://www.flexradio.com',
  },
  {
    id: 'exhibitor-arrl',
    conferenceId: 'pacificon-2026',
    name: 'ARRL',
    description: 'American Radio Relay League',
    location: [4, 5],
    type: 'vendor',
    url: 'https://www.arrl.org',
  },
  {
    id: 'exhibitor-elecraft',
    conferenceId: 'pacificon-2026',
    name: 'Elecraft',
    description: 'full-featured transceivers and accessories',
    location: [22, 23, 24, 25],
    type: 'vendor',
    url: 'https://www.elecraft.com',
  },
  {
    id: 'exhibitor-wiredco',
    conferenceId: 'pacificon-2026',
    name: 'Wired Communications',
    description: 'Cables, Connectors, LEDs and Adapters',
    location: [32, 33, 34, 35, 36, 37, 38, 39],
    type: 'vendor',
    url: 'https://www.wiredco.com',
  },
  {
    id: 'exhibitor-qslbureau',
    conferenceId: 'pacificon-2026',
    name: 'QSL Bureau',
    description: 'ARRL Sixth District Incoming QSL Bureau',
    location: [65],
    type: 'nonprofit',
    url: 'https://www.qslbureau.org',
  },
  {
    id: 'exhibitor-mdarcbooth',
    conferenceId: 'pacificon-2026',
    name: 'mdarc.org',
    description: 'Mt Diablo Amateur Radio Club',
    location: [119],
    type: 'nonprofit',
    url: 'https://www.mdarc.org',
  },
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
    name: 'Salon 2',
    coords: [[1, 3], [57, 3], [57, 90], [1, 90]], // Bottom Left
    color: '#10B981',
  },
  {
    name: 'Salon E',
    coords: [[55, 310], [215, 310], [215, 413], [55, 413]], // Center-Right Large
    color: '#3B82F6',
  },
  {
    name: 'Salon H',
    coords: [[169, 414], [215, 414], [215, 487], [169, 487]], // Top Right Stack
    color: '#F59E0B',
  },
  {
    name: 'Salon G',
    coords: [[109, 414], [168, 414], [168, 487], [109, 487]], // Mid Right Stack
    color: '#F59E0B',
  },
  {
    name: 'Salon F',
    coords: [[55, 414], [108, 414], [108, 485], [55, 485]], // Bottom Right Stack
    color: '#F59E0B',
  },
  {
    name: 'Pleasanton',
    coords: [[193, 518], [255, 518], [255, 581], [193, 581]], // Far Right Top
    color: '#8B5CF6',
  },
  {
    name: 'Danville',
    coords: [[135, 518], [192, 518], [192, 581], [135, 581]], // Far Right Mid
    color: '#8B5CF6',
  },
  {
    name: 'San Ramon Boardroom',
    coords: [[58, 518], [134, 518], [134, 581], [58, 581]], // Far Right Bottom
    color: '#8B5CF6',
  },
  {
    name: 'Restrooms',
    coords: [[8, 488], [34, 488], [34, 531], [8, 531]],
    color: '#005CF6',
  },
];

export const sampleSessions: Session[] = [
  {
    id: 'session-1',
    conferenceId: 'pacificon-2026',
    title: 'Introduction to HF Digital Modes',
    description: 'Learn about popular digital modes including FT8, PSK31, and RTTY. This session covers equipment requirements, software setup, and operating techniques.',
    speaker: ['John Smith, K6JS'],
    location: 'Main Ballroom',
    startTime: '2026-10-16T09:00:00',
    endTime: '2026-10-16T10:30:00',
    category: 'Technical',
    track: 'Digital Modes'
  },
  {
    id: 'session-2',
    conferenceId: 'pacificon-2026',
    title: 'Emergency Communications: ARES and RACES',
    description: 'Overview of emergency communication organizations and how to get involved in public service.',
    speaker: ['Sarah Johnson, KI6SJ'],
    location: 'Room 101',
    startTime: '2026-10-16T09:00:00',
    endTime: '2026-10-16T10:00:00',
    category: 'Public Service',
    track: 'EmComm'
  },
  {
    id: 'session-3',
    conferenceId: 'pacificon-2026',
    title: 'Antenna Theory and Design',
    description: 'Deep dive into antenna fundamentals, including impedance matching, SWR, and practical antenna designs for limited space.',
    speaker: ['Michael Chen, W6MC'],
    location: 'Main Ballroom',
    startTime: '2026-10-16T11:00:00',
    endTime: '2026-10-16T12:30:00',
    category: 'Technical',
    track: 'Antennas'
  },
  {
    id: 'session-4',
    conferenceId: 'pacificon-2026',
    title: 'Working DX: Tips and Techniques',
    description: 'Learn strategies for making successful DX contacts, understanding propagation, and using spotting networks.',
    speaker: ['Robert Davis, N6RD'],
    location: 'Room 102',
    startTime: '2026-10-16T11:00:00',
    endTime: '2026-10-16T12:00:00',
    category: 'Operating',
    track: 'DX'
  },
  {
    id: 'session-5',
    conferenceId: 'pacificon-2026',
    title: 'Software Defined Radio (SDR) Fundamentals',
    description: 'Introduction to SDR technology, popular SDR devices, and software applications for amateur radio.',
    speaker: ['Lisa Anderson, KF6LA'],
    location: 'Main Ballroom',
    startTime: '2026-10-16T14:00:00',
    endTime: '2026-10-16T15:30:00',
    category: 'Technical',
    track: 'Digital'
  },
  {
    id: 'session-6',
    conferenceId: 'pacificon-2026',
    title: 'VHF/UHF Contesting',
    description: 'Strategies for VHF/UHF contests, equipment recommendations, and rover operations.',
    speaker: ['David Wilson, K6DW'],
    location: 'Room 101',
    startTime: '2026-10-16T14:00:00',
    endTime: '2026-10-16T15:00:00',
    category: 'Operating',
    track: 'Contesting'
  },
  {
    id: 'session-7',
    conferenceId: 'pacificon-2026',
    title: 'Getting Started with Satellite Operations',
    description: 'Learn how to work amateur radio satellites, including equipment requirements, tracking software, and operating procedures.',
    speaker: ['Emily Martinez, KJ6EM'],
    location: 'Room 102',
    startTime: '2026-10-16T14:00:00',
    endTime: '2026-10-16T15:00:00',
    category: 'Operating',
    track: 'Satellite'
  },
  {
    id: 'session-8',
    conferenceId: 'pacificon-2026',
    title: 'Youth Forum: Getting Young People Excited About Ham Radio',
    description: 'Discussion panel on programs and activities that attract youth to amateur radio.',
    speaker: ['Panel Discussion'],
    location: 'Main Ballroom',
    startTime: '2026-10-16T16:00:00',
    endTime: '2026-10-16T17:00:00',
    category: 'General',
    track: 'Youth'
  },
  {
    id: 'session-9',
    conferenceId: 'pacificon-2026',
    title: 'ARRL Update and New Initiatives',
    description: 'Update from ARRL Pacific Division leadership on current programs and future plans.',
    speaker: ['ARRL Officials'],
    location: 'Main Ballroom',
    startTime: '2026-10-17T09:00:00',
    endTime: '2026-10-17T10:00:00',
    category: 'General',
    track: 'ARRL'
  },
  {
    id: 'session-10',
    conferenceId: 'pacificon-2026',
    title: 'Building Your Own Station',
    description: 'Tips for setting up a home station, from selecting equipment to installation and grounding.',
    speaker: ['Tom Harris, W6TH'],
    location: 'Room 101',
    startTime: '2026-10-17T09:00:00',
    endTime: '2026-10-17T10:30:00',
    category: 'Technical',
    track: 'Station Building'
  },
  {
    id: 'session-11',
    conferenceId: 'pacificon-2026',
    title: 'Building Your Own Station II',
    description: 'Tips for setting up a home station, from selecting equipment to installation and grounding.',
    speaker: ['Tom Harris, W6TH'],
    location: 'Room 101',
    startTime: '2026-10-18T09:00:00',
    endTime: '2026-10-18T10:30:00',
    category: 'Technical',
    track: 'Station Building'
  },
];

// Mock map images - in production these would be bundled images
export const sampleMaps: MapImage[] = [
  {
    id: 'map-1',
    conferenceId: 'pacificon-2026',
    name: 'Hotel',
    url: '/pacificon-hotel-2025.jpg',
    //floor: '1',
    order: 1,
  },
  {
    id: 'map-2',
    conferenceId: 'pacificon-2026',
    name: 'Exhibitors',
    url: '/pacificon-exhibitors-2025.png',
    //floor: '2',
    order: 2,
    origHeightNum: 1702,
    origWidthNum: 1280,
  },
  {
    id: 'map-3',
    conferenceId: 'pacificon-2026',
    name: 'Hamfest Parking',
    url: '/hamfest-parking-map-20260101.jpg',
    order: 3,
  },
  {
    id: 'map-4',
    conferenceId: 'pacificon-2026',
    name: 'Hamfest Layout',
    url: '/hamfest-layout-2026.png',
    order: 4,
  },
  {
    id: 'map-5',
    conferenceId: 'pacificon-2026',
    name: 'Hamcation Site',
    url: '/hamcation-map-2026.png',
    order: 5,
  },
  {
    id: 'map-6',
    conferenceId: 'pacificon-2026',
    name: 'Forums',
    url: '/pacificon-forums-2025.jpg',
    //floor: '2',
    order: 6,
    origHeightNum: 256,
    origWidthNum: 582,
  },
];

