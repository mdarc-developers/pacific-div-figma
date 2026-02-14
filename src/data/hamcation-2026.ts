import { Session, MapImage, Room, Exhibitor, Booth } from '@/types/conference';

export const exhibitorBooths: Booth[] = [
  {
    id: 1,
    coords: [[1, 2], [3, 4], [5, 6], [7, 8]],
    locationZone: 'eastwest',
    conferenceId: 'hamcation-2026',
  },
  {
    id: 2,
    coords: [[1, 2], [3, 4], [5, 6], [7, 8]],
    locationZone: 'eastwest',
    conferenceId: 'hamcation-2026',
  },
  {
    id: 3,
    coords: [[1, 2], [3, 4], [5, 6], [7, 8]],
    locationZone: 'eastwest',
    conferenceId: 'hamcation-2026',
  },
  {
    id: 4,
    coords: [[1, 2], [3, 4], [5, 6], [7, 8]],
    locationZone: 'eastwest',
    conferenceId: 'hamcation-2026',
  },
  {
    id: 5,
    coords: [[1, 2], [3, 4], [5, 6], [7, 8]],
    locationZone: 'eastwest',
    conferenceId: 'hamcation-2026',
  },
  {
    id: 6,
    coords: [[1, 2], [3, 4], [5, 6], [7, 8]],
    locationZone: 'eastwest',
    conferenceId: 'hamcation-2026',
  },
  {
    id: 110,
    coords: [[1, 2], [3, 4], [5, 6], [7, 8]],
    locationZone: 'eastwest',
    conferenceId: 'hamcation-2026',
  },
  {
    id: 111,
    coords: [[1, 2], [3, 4], [5, 6], [7, 8]],
    locationZone: 'eastwest',
    conferenceId: 'hamcation-2026',
  },
  {
    id: 112,
    coords: [[1, 2], [3, 4], [5, 6], [7, 8]],
    locationZone: 'eastwest',
    conferenceId: 'hamcation-2026',
  },
  {
    id: 113,
    coords: [[1, 2], [3, 4], [5, 6], [7, 8]],
    locationZone: 'eastwest',
    conferenceId: 'hamcation-2026',
  },
  {
    id: 114,
    coords: [[1, 2], [3, 4], [5, 6], [7, 8]],
    locationZone: 'eastwest',
    conferenceId: 'hamcation-2026',
  },
  {
    id: 115,
    coords: [[1, 2], [3, 4], [5, 6], [7, 8]],
    locationZone: 'eastwest',
    conferenceId: 'hamcation-2026',
  },
  {
    id: 121,
    coords: [[1, 2], [3, 4], [5, 6], [7, 8]],
    locationZone: 'eastwest',
    conferenceId: 'hamcation-2026',
  },
  {
    id: 122,
    coords: [[1, 2], [3, 4], [5, 6], [7, 8]],
    locationZone: 'eastwest',
    conferenceId: 'hamcation-2026',
  },
  {
    id: 190,
    coords: [[1, 2], [3, 4], [5, 6], [7, 8]],
    locationZone: 'north',
    conferenceId: 'hamcation-2026',
  },
];

export const sampleExhibitors: Exhibitor[] = [
  {
    id: 'exhibitor-arrl',
    conferenceId: 'hamcation-2026',
    name: 'ARRL',
    description: 'American Radio Relay League',
    location: [110, 111, 112, 113, 114, 115, 121, 122],
    type: 'vendor',
    url: 'https://www.arrl.org',
  },
  {
    id: 'exhibitor-unitrend',
    conferenceId: 'hamcation-2026',
    name: 'Uni-Trend Technology US Inc',
    description: 'worlds most renowned test and measurement solutions providers',
    location: [1, 2, 3],
    type: 'vendor',
    url: 'https://www.uni-trendus.com',
  },
  {
    id: 'exhibitor-platinum',
    conferenceId: 'hamcation-2026',
    name: 'Platinum Coast Amateur Radio Society',
    description: 'Cables, Connectors, LEDs and Adapters',
    location: [4],
    type: 'vendor',
    url: 'https://www.pcards.org',
  },
  {
    id: 'exhibitor-w5yi',
    conferenceId: 'hamcation-2026',
    name: 'W5YI Licensing Services Inc',
    description: 'licensing',
    location: [5, 6],
    type: 'nonprofit',
    url: 'https://www.w5yi-vec.org',
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

export const sampleSessions: Session[] = [
  {
    id: 'session-1',
    conferenceId: 'hamcation-2026',
    title: 'Florida AUXCOMM ESF2 Stakeholder Forum',
    description: 'Hear from Floridas Statewide Interoperability Coordinator (SWIC) and from Floridas ESF2 team on the year in review for Floridas AUXCOMM program, ICT Communications updates, exercise and training opportunities and presentation of Flroidas annual AUXCOMM Service Award',
    speaker: ['Roger Lord (FDEM SWIC)', 'David Byrun (FL AUXCOMM)'],
    location: 'Pavillion Tent 1',
    startTime: '2026-02-13T09:15:00',
    endTime: '2026-02-13T10:15:00',
    category: 'EmComm',
    track: 'EmComm'
  },
  {
    id: 'session-2',
    conferenceId: 'hamcation-2026',
    title: 'Getting Started in QRP',
    description: 'Steve has been a ham for more than five decades...',
    speaker: ['Steve Hudson, AA4BW'],
    location: 'Pavillion Tent 3',
    startTime: '2026-02-13T09:15:00',
    endTime: '2026-02-13T10:15:00',
    category: 'Operating',
    track: 'QRP'
  },
  {
    id: 'session-3',
    conferenceId: 'hamcation-2026',
    title: 'High Performance HF multi-band Antenna and Lightning Protection System',
    description: 'Gary from trueladderline.com, will discuss the high efficiency HF multi-band antenna model and methods of lightning protection for it.',
    speaker: ['Gary Baker, K7EMF'],
    location: 'Pavillion Tent 2',
    startTime: '2026-02-13T09:15:00',
    endTime: '2026-02-13T10:15:00',
    category: 'Technical',
    track: 'Station'
  },
  {
    id: 'session-4',
    conferenceId: 'hamcation-2026',
    title: 'D-STAR',
    description: 'Join D-STAR enthusiasts for whats new and how to get the most from your D-STAR equipment. Well discuss how easy it is to get on the air, connect with others around the world, the easiest programming of your radio, how to update your radio with the current list of repeaters and get your hotspot connection for D-STAR.F',
    speaker: ['John Davis, WB4QDX'],
    location: 'Pavilion Tent 2',
    startTime: '2026-02-13T10:30:00',
    endTime: '2026-02-13T11:30:00',
    category: 'Operating',
    track: 'Digital'
  },
  {
    id: 'session-5',
    conferenceId: 'hamcation-2026',
    title: 'DX Marathon',
    description: 'Join the Chase: Why the DX Marathon Should Be Your Next Ham Radio Challenge',
    speaker: ['Mark Wohlschlegel, WC3W'],
    location: 'Pavilion Tent 3',
    startTime: '2026-02-13T10:30:00',
    endTime: '2026-02-13T11:30:00',
    category: 'Contesting',
    track: 'DX'
  },
  {
    id: 'session-6',
    conferenceId: 'hamcation-2026',
    title: 'Elecraft K4 Update with Q&A',
    description: 'Eric Swartz, WA6HHQ, Elecraft Co-Founder, will discuss: K4 Transceiver, K4 Software Eleases and Updates, K$/0 TRemote System, Q&A on all Elecraft products',
    speaker: ['Eric Swartz, WA6HHQ'],
    location: 'Pavilion Tent 2',
    startTime: '2026-02-13T10:30:00',
    endTime: '2026-02-13T11:30:00',
    category: 'Equipment',
    track: 'Product'
  },
  {
    id: 'session-7',
    conferenceId: 'hamcation-2026',
    title: 'DX Contesting from V26B in Antigua',
    description: 'The presentation will introduce the fun and challenges of HF contesting...',
    speaker: ['Ray Conrad, NM2O'],
    location: 'Pavilion Tent 3',
    startTime: '2026-02-13T11:45:00',
    endTime: '2026-02-13T12:45:00',
    category: 'Contesting',
    track: 'DX',
  },
];

// Mock map images - in production these would be bundled images
export const sampleMaps: MapImage[] = [
  {
    id: 'map-1',
    conferenceId: 'hamcation-2026',
    name: 'Fairground',
    url: '/hamcation-2026-fairgrounds.png',
    order: 1,
    origHeightNum: 647,
    origWidthNum: 1200,
  },
  {
    id: 'map-2',
    conferenceId: 'hamcation-2026',
    name: 'East and West Halls',
    url: '/hamcation-2026-eastwest.png',
    order: 2,
    origHeightNum: 425,
    origWidthNum: 1199,
  },
  {
    id: 'map-3',
    conferenceId: 'hamcation-2026',
    name: 'North Hall',
    url: '/hamcation-2026-north.png',
    order: 3,
    origHeightNum: 550,
    origWidthNum: 1199,
  },
  {
    id: 'map-4',
    conferenceId: 'hamcation-2026',
    name: 'Pavilion',
    url: '/hamcation-2026-pavilion.png',
    order: 4,
    origHeightNum: 840,
    origWidthNum: 1016,
  },
  {
    id: 'map-5',
    conferenceId: 'hamcation-2026',
    name: 'Outline',
    url: '/hamcation-map-2026.png',
    order: 5,
  },
];

