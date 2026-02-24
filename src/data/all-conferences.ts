import { Conference } from '@/types/conference';

export const allConferences: Conference[] = [
//  {
//    id: 'hamcation-2026',
//    name: 'Hamcation 2026',
//    location: '4603 W Colonial Drive, Orlando, FL 32808',
//    venue: 'Central Florida Fairgrounds',
//    startDate: '2026-02-13',
//    endDate: '2026-02-15',
//    timezone: 'America/New_York',
//    primaryColor: '#000000',
//    secondaryColor: '#f97316',
//    conferenceWebsite: 'https://www.hamcation.com',
//    venuePhone: '407-385-3247',
//    venueGPS: '28.5556,-81.4402',
//    venueGridSquare: 'EL98gn',
//    venueWebsite: 'https://www.centralfloridafair.com/',
//    timezoneNumeric: '-0700', // DST, PDT ends early Nov
//    parkingWebsite: '',
//    icalUrl: '',
//    googlecalUrl: '',
//    contactEmail: '',
//    logoUrl: '/hamcation-2026-logo.png',
//    mapSessionsUrl: '/hamcation-2026-pavilion.png', // for Room[]
//    mapExhibitorsUrl: [ '/hamcation-2026-north.png', '/hamcation-2026-eastwest.png'], // for Booth[]
//  },
  {
    id: 'hamvention-2026',
    name: 'Hamvention 2026',
    location: '120 Fairground Road, Xenia, OH 45385',
    venue: 'Greene County Fairgrounds',
    startDate: '2026-05-15',
    endDate: '2026-05-17',
    timezone: 'America/New_York',
    primaryColor: '#dc2626',
    secondaryColor: '#ef4444',
    conferenceWebsite: 'https://www.hamvention.org',
    venuePhone: '937-372-8621x12',
    venueGPS: '39.6990,-83.9412',
    venueGridSquare: 'EM89aq',
    venueWebsite: 'https://greenecoexpocenter.com/',
    timezoneNumeric: '-0700', // DST, PDT ends early Nov
    parkingWebsite: '',
    icalUrl: '',
    googlecalUrl: '',
    contactEmail: '',
    logoUrl: '',
    mapSessionsUrl: '/assets/maps/hamvention-forums-2026-2.png', // for Room[]
    mapExhibitorsUrl: ['/assets/maps/hamvention-2026-Booths-Exhibits-Overview-v20.pdf'], // for Booth[]
  },
  {
    id: 'huntsville-hamfest-2026',
    name: 'Huntsville Hamfest 2026',
    location: '700 Monroe Street SW, Huntsville, AL 35801',
    venue: 'Von Braun Center',
    startDate: '2026-08-21',
    endDate: '2026-08-22',
    timezone: 'America/Chicago',
    primaryColor: '#7c3aed',
    secondaryColor: '#8b5cf6',
    conferenceWebsite: 'https://www.hamfest.org',
    venuePhone: '256-533-1953',
    venueGPS: '34.7269,-86.5934',
    venueGridSquare: 'EM64qr',
    venueWebsite: 'http://www.vonbrauncenter.com/',
    timezoneNumeric: '-0700', // DST, PDT ends early Nov
    parkingWebsite: '',
    icalUrl: '',
    googlecalUrl: '',
    contactEmail: '',
    logoUrl: '',
    mapSessionsUrl: '', // for Room[]
    mapExhibitorsUrl: ['/hamfest-layout-2026.png'], // for Booth[]
  },
  {
    id: 'pacificon-2026',
    name: 'Pacificon 2026',
    venue: 'San Ramon Marriott',
    startDate: '2026-10-16', // Third Friday of October 2026
    endDate: '2026-10-18',
    timezone: 'America/Los_Angeles',
    primaryColor: '#3d71a3', // our blue
    secondaryColor: '#3b82f6', // blue-500
    location: '2600 Bishop Drive, San Ramon, CA 94583', // changed
    conferenceWebsite: 'https://www.pacificon.org', // changed
    venuePhone: '925-867-9200',
    venueGPS: '37.7629,-121.9674',
    venueGridSquare: 'CM97as',
    venueWebsite: 'https://www.marriott.com/en-us/hotels/oaksr-san-ramon-marriott/overview/',
    timezoneNumeric: '-0700', // DST, PDT ends early Nov
    parkingWebsite: 'https://www.pacificon.org/resources/parking',
    icalUrl: '/pacificon-2026.ics',
    googlecalUrl: 'https://calendar.google.com/calendar/event?action=TEMPLATE&amp;tmeid=MW9yajdlbDEwNmYwczN2bzl1aTM0OGwzbDEgZ3JhbnRib3dAbWRhcmMub3Jn&amp;tmsrc=grantbow%40mdarc.org',
    contactEmail: 'webmaster@pacificon.org',
    logoUrl: '/2026-pacificon-logo-208-110.jpg',
    mapSessionsUrl: '/pacificon-hotel-2025.jpg', // for Room[] and Session[] - move to attribute in MapImage[]?
    mapExhibitorsUrl: ['/pacificon-exhibitors-2025.png'], // for Booth[] and Exhibitor[] - move to attribute in MapImage[]?
  },
  {
    id: 'hamcation-2027',
    name: 'Hamcation 2027',
    location: '4603 W Colonial Drive, Orlando, FL 32808',
    venue: 'Central Florida Fairgrounds',
    startDate: '2027-02-13',
    endDate: '2027-02-15',
    timezone: 'America/New_York',
    primaryColor: '#000000',
    secondaryColor: '#f97316',
    conferenceWebsite: 'https://www.hamcation.com',
    venuePhone: '407-385-3247',
    venueGPS: '28.5556,-81.4402',
    venueGridSquare: 'EL98gn',
    venueWebsite: 'https://www.centralfloridafair.com/',
    timezoneNumeric: '-0700', // DST, PDT ends early Nov
    parkingWebsite: '',
    icalUrl: '',
    googlecalUrl: '',
    contactEmail: '',
    logoUrl: '/hamcation-2026-logo.png',
    mapSessionsUrl: '/hamcation-2026-pavilion.png', // for Room[]
    mapExhibitorsUrl: [ '/hamcation-2026-north.png', '/hamcation-2026-eastwest.png'], // for Booth[]
  },
];

