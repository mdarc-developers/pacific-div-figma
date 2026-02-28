import { Conference } from "@/types/conference";

export const allConferences: Conference[] = [
  //  {
  //    id: 'hamcation-2026',
  //    name: 'Hamcation 2026',
  //    location: '4603 W Colonial Drive,\
  //Orlando, FL 32808',
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
  //    //mapSessionsUrl: '/hamcation-2026-pavilion.png', // for Room[]
  //    //mapExhibitorsUrl: [ '/hamcation-2026-north.png', '/hamcation-2026-eastwest.png'], // for Booth[]
  //  },
  {
    id: "yuma-2026",
    name: "Yuma Hamfest 2026",
    location: "2520 E 32nd St,\
Yuma, AZ 85365",
    venue: "Yuma County Fairgrounds",
    startDate: "2026-02-27",
    endDate: "2026-02-28",
    timezone: "America/Phoenix",
    primaryColor: "#F5E556",
    secondaryColor: "#253C61",
    conferenceWebsite: "https://www.yumahamfest.com",
    venuePhone: "(928) 726-4420",
    venueGPS: "32.6707,-114.5943",
    venueGridSquare: "DM22qq",
    venueWebsite: "https://www.yumafair.com",
    timezoneNumeric: "-0700", // does not observe DST
    parkingWebsite: "https://www.yumahamfest.com/parking.html",
    icalUrl: "",
    googlecalUrl: "",
    contactEmail: "info@yumahamfest.org",
    logoUrl: "/assets/images/yuma-buzzard.webp",
    //mapSessionsUrl: '/assets/maps/hamvention-forums-2026-2.png', // for Room[]
    //mapExhibitorsUrl: ['/assets/maps/hamvention-2026-Booths-Exhibits-Overview-v20.pdf'], // for Booth[]
  },
  {
    id: "hamvention-2026",
    name: "Hamvention 2026",
    location: "120 Fairground Road,\
Xenia, OH 45385",
    venue: "Greene County Fairgrounds",
    startDate: "2026-05-15",
    endDate: "2026-05-17",
    timezone: "America/New_York",
    primaryColor: "#dc2626",
    secondaryColor: "#ef4444",
    conferenceWebsite: "https://www.hamvention.org",
    venuePhone: "937-372-8621x12",
    venueGPS: "39.6990,-83.9412",
    venueGridSquare: "EM89aq",
    venueWebsite: "https://greenecoexpocenter.com/",
    timezoneNumeric: "-0400", // EDT in May (Eastern Daylight Time)
    parkingWebsite: "https://hamvention.org/travel-parking/directions/",
    icalUrl: "",
    googlecalUrl: "",
    contactEmail: "",
    logoUrl: "/assets/images/hamvention_logo.png",
    //mapSessionsUrl: '/assets/maps/hamvention-forums-2026-2.png', // for Room[]
    //mapExhibitorsUrl: ['/assets/maps/hamvention-2026-Booths-Exhibits-Overview-v20.pdf'], // for Booth[]
  },
  {
    id: "seapac-2026",
    name: "Sea-Pac 2026",
    location: "415 First Avenue,\
Seaside, OR 97138",
    venue: "Seaside Convention Center",
    startDate: "2026-06-05",
    endDate: "2026-06-07",
    timezone: "America/Los_Angeles",
    primaryColor: "#87CEEB",
    secondaryColor: "#253C61",
    conferenceWebsite: "https://www.seapac.org",
    venuePhone: "(503) 738-8585",
    venueGPS: "45.9940,-123.9280",
    venueGridSquare: "CN85ax",
    venueWebsite: "https://www.seasideconvention.com",
    timezoneNumeric: "-0700", // PDT in June (Pacific Daylight Time)
    parkingWebsite: "https://seapac.org/#map",
    icalUrl: "",
    googlecalUrl: "",
    contactEmail: "info@seapac.org",
    logoUrl: "/assets/images/seapac-logo.png",
  },
  {
    id: "huntsville-hamfest-2026",
    name: "Huntsville Hamfest 2026",
    location: "700 Monroe Street SW,\
Huntsville, AL 35801",
    venue: "Von Braun Center",
    startDate: "2026-08-21",
    endDate: "2026-08-22",
    timezone: "America/Chicago",
    primaryColor: "#7c3aed",
    secondaryColor: "#8b5cf6",
    conferenceWebsite: "https://www.hamfest.org",
    venuePhone: "256-533-1953",
    venueGPS: "34.7269,-86.5934",
    venueGridSquare: "EM64qr",
    venueWebsite: "http://www.vonbrauncenter.com/",
    timezoneNumeric: "-0500", // CDT in August (Central Daylight Time)
    parkingWebsite: "https://hamfest.org/directions",
    icalUrl: "",
    googlecalUrl: "",
    contactEmail: "",
    logoUrl: "/assets/images/huntsville-logo.png",
  },
  {
    id: "pacificon-2026",
    name: "Pacificon 2026",
    venue: "San Ramon Marriott",
    startDate: "2026-10-16", // Third Friday of October 2026
    endDate: "2026-10-18",
    timezone: "America/Los_Angeles",
    primaryColor: "#3d71a3", // our blue
    secondaryColor: "#3b82f6", // blue-500
    location: "2600 Bishop Drive,\
San Ramon, CA 94583", // changed
    conferenceWebsite: "https://www.pacificon.org", // changed
    venuePhone: "925-867-9200",
    venueGPS: "37.7629,-121.9674",
    venueGridSquare: "CM97as",
    venueWebsite:
      "https://www.marriott.com/en-us/hotels/oaksr-san-ramon-marriott/overview/",
    timezoneNumeric: "-0700", // DST, PDT ends early Nov
    parkingWebsite: "https://www.pacificon.org/resources/parking",
    icalUrl: "/pacificon-2026.ics",
    googlecalUrl:
      "https://calendar.google.com/calendar/event?action=TEMPLATE&amp;tmeid=MW9yajdlbDEwNmYwczN2bzl1aTM0OGwzbDEgZ3JhbnRib3dAbWRhcmMub3Jn&amp;tmsrc=grantbow%40mdarc.org",
    contactEmail: "webmaster@pacificon.org",
    logoUrl: "/2026-pacificon-logo-208-110.jpg",
    //mapSessionsUrl: '/pacificon-hotel-2025.jpg', // for Room[] and Session[] - move to attribute in MapImage[]?
    //mapExhibitorsUrl: ['/pacificon-exhibitors-2025.png'], // for Booth[] and Exhibitor[] - move to attribute in MapImage[]?
  },
  {
    id: "quartzfest-2027",
    name: "Quartzfest 2027",
    location: "US 95 @ La Paz Valley Road,\
La Paz Valley, AZ, 85346",
    venue: "BLM La Posa LTVA,\
Roadrunner Camping Area",
    startDate: "2027-01-17",
    endDate: "2027-01-23",
    timezone: "America/Phoenix",
    primaryColor: "#53DEBF",
    secondaryColor: "#f97316",
    conferenceWebsite: "https://www.quartzfest.org",
    venuePhone: "",
    venueGPS: "33.5852,-114.2225",
    venueGridSquare: "DM23vn",
    venueWebsite: "https://www.blm.gov/visit/la-posa-long-term-visitor-area",
    timezoneNumeric: "-0700", // does not observe DST
    parkingWebsite: "https://www.blm.gov/visit/la-posa-long-term-visitor-area",
    icalUrl: "",
    googlecalUrl: "",
    contactEmail: "hkey073@gmail.com",
    logoUrl: "/assets/images/quartzfest-logo-w1000_h1000.webp",
  },
  {
    id: "hamcation-2027",
    name: "Hamcation 2027",
    location: "4603 W Colonial Drive,\
Orlando, FL 32808",
    venue: "Central Florida Fairgrounds",
    startDate: "2027-02-13",
    endDate: "2027-02-15",
    timezone: "America/New_York",
    primaryColor: "#000000",
    secondaryColor: "#f97316",
    conferenceWebsite: "https://www.hamcation.com",
    venuePhone: "407-385-3247",
    venueGPS: "28.5556,-81.4402",
    venueGridSquare: "EL98gn",
    venueWebsite: "https://www.centralfloridafair.com/",
    timezoneNumeric: "-0500", // EST in February (Eastern Standard Time)
    parkingWebsite: "",
    icalUrl: "",
    googlecalUrl: "",
    contactEmail: "",
    logoUrl: "/hamcation-2026-logo.png",
    //mapSessionsUrl: '/hamcation-2026-pavilion.png', // for Room[]
    //mapExhibitorsUrl: [ '/hamcation-2026-north.png', '/hamcation-2026-eastwest.png'], // for Booth[]
  },
]; // 53DEBF
