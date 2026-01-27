import { Conference, Session, MapImage } from '@/types/conference';

export const pacificonData: Conference = {
  id: 'pacificon-2026',
  name: 'Pacificon 2026',
  venue: 'San Ramon Marriott',
  location: '2600 Bishop Drive, San Ramon, CA 94583',
  venuePhone: '925-867-9200',
  venueGPS: '37.7629,-121.9674',
  venueGridsquare: 'CM97as',
  venueWebsite: 'https://www.marriott.com/en-us/hotels/oaksr-san-ramon-marriott/overview/',
  startDate: '2026-10-16', // Third Friday of October 2026
  endDate: '2026-10-18',
  timezone: 'America/Los_Angeles',
  timezoneNumeric: '-0700', // DST, PDT ends early Nov
  primaryColor: '#ff4e00', // international orange
  secondaryColor: '#3b82f6', // blue-500
  conferenceWebsite: 'https://www.pacificon.org',
  parkingWebsite: 'https://www.pacificon.org/resources/parking',
  icalUrl: '/pacificon-2026.ics',
  contactEmail: 'webmaster@pacificon.org'
};

export const sampleSessions: Session[] = [
  {
    id: 'session-1',
    conferenceId: 'pacificon-2026',
    title: 'Introduction to HF Digital Modes',
    description: 'Learn about popular digital modes including FT8, PSK31, and RTTY. This session covers equipment requirements, software setup, and operating techniques.',
    speaker: 'John Smith, K6JS',
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
    speaker: 'Sarah Johnson, KI6SJ',
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
    speaker: 'Michael Chen, W6MC',
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
    speaker: 'Robert Davis, N6RD',
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
    speaker: 'Lisa Anderson, KF6LA',
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
    speaker: 'David Wilson, K6DW',
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
    speaker: 'Emily Martinez, KJ6EM',
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
    speaker: 'Panel Discussion',
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
    speaker: 'ARRL Officials',
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
    speaker: 'Tom Harris, W6TH',
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
    speaker: 'Tom Harris, W6TH',
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
    name: 'Exhibitors',
    url: '/pacificon-exhibitors-2025.png',
    //floor: '2',
    order: 1
  },
  {
    id: 'map-2',
    conferenceId: 'pacificon-2026',
    name: 'Hotel',
    url: '/pacificon-hotel-2025.jpg',
    //floor: '1',
    order: 2
  },
  {
    id: 'map-3',
    conferenceId: 'pacificon-2026',
    name: 'Hamfest Parking',
    url: '/hamfest-parking-map-20260101.jpg',
    order: 3
  },
  {
    id: 'map-4',
    conferenceId: 'pacificon-2026',
    name: 'Hamfest Layout',
    url: '/hamfest-layout-2026.png',
    order: 4
  },
  {
    id: 'map-5',
    conferenceId: 'pacificon-2026',
    name: 'Hamcation Site',
    url: '/hamcation-map-2026.png',
    order: 5
  },
];

