import { ConferenceListItem } from "@/types/conference";

// moved from static mapSessionsUrl and mapExhibitorsUrl arrays on each conference
//   to dynamically built arrays loaded from supplemental files
//   in a big ConferenceModule for the activeConferenceId
//   via src/lib/supplementalData.ts which reads session, booth, room and exhibitor
//     supplemental files; conference-level functions live in src/lib/conferenceData.ts
// code is still being updated
//
// Rooms and Booths lead the detection and display for /schedule and /exhibitors
//
//interface ConferenceModule {
//  conferenceMaps?: MapImage[]; // array of MapImage; each url must be unique within the conference
//  mapSessions?: [string, Session[]];
//  mapRooms?: [string, Room[]];
//  mapExhibitors?: [string, Exhibitor[]];  // array now supported via supplemental files
//  mapBooths?: [string, Booth[]];          // array now supported via supplemental files
//  [key: string]: unknown;
//}
//
// as a check, the code uses dynamic mapSessionRooms to track if
//   sessions and rooms were loaded for each mapUrl
// as a check, the code uses dynamic mapExhibitorBooths to track if
//   exhibitors and booths were loaded for each mapUrl
//
// for a file like hamvention-2026.ts a supplemental will
//   override the data if the url matches
//   and simply add the data if the mapUrl is different
//
// things are more complicated now that we handle multiple
//   png/jpg image files different from
//   pdf files different from
//   svg files
//

export const allConferences: ConferenceListItem[] = [
  {
    id: "vomarc-2026",
    name: "Valley Of the Moon ARC Hamfest 2026",
    location: "252 W Spain St, Sonoma, CA 95476",
    venue: "First Congregational Church",
    startDate: "2026-04-18",
    endDate: "2026-04-18",
    timezone: "America/Los_Angeles",
    primaryColor: "#9A2E7C",
    secondaryColor: "#DCBf33",
    conferenceUrl: "https://vomarc.org",
    venuePhone: "+1-916-652-1840",
    venueGPS: "38.2945,-122.4621",
    venueGridSquare: "CM88sh",
    venueUrl:
      "https://sonomaucc.org/",
    timezoneNumeric: "-0700", // PDT in April (Pacific Daylight Time)
    parkingUrl: "",
    icalUrl: "",
    googlecalUrl: "",
    conferenceContactEmail: "valleyofthemoonarc@gmail.com",
    logoUrl: "/assets/images/vomarc-logo.png",
    //mapSessionsUrl: '/assets/maps/hamvention-forums-2026-2.png', // for Room[]
    //mapExhibitorsUrl: ['/assets/maps/hamvention-2026-Booths-Exhibits-Overview-v20.pdf'], // for Booth[]
    //mapSessionRooms?: [string, boolean, boolean]; // dynamic [mapUrl, sessions loaded, rooms loaded]
    //mapExhibitorBooths?: [string, boolean, boolean]; // dynamic [mapUrl, exhibitors loaded, booths loaded]
    conferenceProgramUrl:
      "/assets/programs/2026_vomarc_hamfest.pdf",
    conferenceProgramSourceUrl:
      "https://vomarc.org/events/Hamfest%20Flyer.pdf", // upstream filename reflects the year it was published, not the conference year
    conferenceAppPageUrl: "https://pacific-div.web/app/",
    firstConferenceYear: 1973,
    estimatedAttendees: 400,
  },
  {
    id: "renohamswap-2026",
    name: "Reno Ham Swap 2026",
    location: "8650 Boomtown Garson Road, Verdi, NV 89439",
    venue: "Cabelas Reno",
    startDate: "2026-05-09",
    endDate: "2026-05-09",
    timezone: "America/Los_Angeles",
    primaryColor: "#4EA9D5",
    secondaryColor: "#FFFFFF",
    conferenceUrl: "https://renohamswap.org",
    venuePhone: "+1-775-829-4100",
    venueGPS: "39.5131,-119.9688",
    venueGridSquare: "DM09am",
    venueUrl: "https://www.cabelas.com/home",
    timezoneNumeric: "-0700", // PDT in April (Pacific Daylight Time)
    parkingUrl: "",
    icalUrl: "",
    googlecalUrl: "",
    conferenceContactEmail: "snars@snars.org",
    logoUrl: "/assets/images/renohamswap_logo.png",
    //mapSessionsUrl: '/assets/maps/hamvention-forums-2026-2.png', // for Room[]
    //mapExhibitorsUrl: ['/assets/maps/hamvention-2026-Booths-Exhibits-Overview-v20.pdf'], // for Booth[]
    //mapSessionRooms?: [string, boolean, boolean]; // dynamic [mapUrl, sessions loaded, rooms loaded]
    //mapExhibitorBooths?: [string, boolean, boolean]; // dynamic [mapUrl, exhibitors loaded, booths loaded]
    conferenceProgramUrl:
      "/assets/programs/renohamswap-2026.pdf",
    conferenceProgramSourceUrl:
      "https://snars.org/activities/renohamswap/", // upstream filename reflects the year it was published, not the conference year
    conferenceAppPageUrl: "https://pacific-div.web/app/",
    firstConferenceYear: 2016,
    estimatedAttendees: 400,
  },
  {
    id: "hamvention-2026",
    name: "Hamvention 2026",
    location: "120 Fairground Road, Xenia, OH 45385",
    venue: "Greene County Fairgrounds",
    startDate: "2026-05-15",
    endDate: "2026-05-17",
    timezone: "America/New_York",
    primaryColor: "#dc2626",
    secondaryColor: "#ef4444",
    conferenceUrl: "https://www.hamvention.org",
    venuePhone: "937-372-8621x12",
    venueGPS: "39.6990,-83.9412",
    venueGridSquare: "EM89aq",
    venueUrl: "https://greenecoexpocenter.com/",
    timezoneNumeric: "-0400", // EDT in May (Eastern Daylight Time)
    parkingUrl: "https://hamvention.org/travel-parking/directions/",
    icalUrl: "",
    googlecalUrl: "",
    conferenceContactEmail: "info@hamvention.org",
    logoUrl: "/assets/images/hamvention_logo.png",
    //mapSessionsUrl: '/assets/maps/hamvention-forums-2026-2.png', // for Room[]
    //mapExhibitorsUrl: ['/assets/maps/hamvention-2026-Booths-Exhibits-Overview-v20.pdf'], // for Booth[]
    //mapSessionRooms?: [string, boolean, boolean]; // dynamic [mapUrl, sessions loaded, rooms loaded]
    //mapExhibitorBooths?: [string, boolean, boolean]; // dynamic [mapUrl, exhibitors loaded, booths loaded]
    conferenceProgramUrl: "/assets/programs/hamvention-2026-program.pdf",
    conferenceProgramSourceUrl:
      "https://hamvention.org/wp-content/uploads/2025/05/2025-Program-Web3.pdf", // upstream filename reflects the year it was published, not the conference year
    conferenceAppPageUrl: "https://hamvention.org/getconnected/",
    firstConferenceYear: 1952,
    estimatedAttendees: 36814,
  },
  {
    id: "seapac-2026",
    name: "Sea-Pac 2026",
    location: "415 First Avenue, Seaside, OR 97138",
    venue: "Seaside Convention Center",
    startDate: "2026-06-05",
    endDate: "2026-06-07",
    timezone: "America/Los_Angeles",
    primaryColor: "#87CEEB",
    secondaryColor: "#253C61",
    conferenceUrl: "https://www.seapac.org",
    venuePhone: "(503) 738-8585",
    venueGPS: "45.9940,-123.9280",
    venueGridSquare: "CN85ax",
    venueUrl: "https://www.seasideconvention.com",
    timezoneNumeric: "-0700", // PDT in June (Pacific Daylight Time)
    parkingUrl: "https://seapac.org/#map",
    icalUrl: "",
    googlecalUrl: "",
    conferenceContactEmail: "info@seapac.org",
    logoUrl: "/assets/images/seapac-logo.png",
    //mapSessionRooms?: [string, boolean, boolean]; // dynamic [mapUrl, sessions loaded, rooms loaded]
    //mapExhibitorBooths?: [string, boolean, boolean]; // dynamic [mapUrl, exhibitors loaded, booths loaded]
    firstConferenceYear: 1982,
    estimatedAttendees: 2500,
  },
  {
    id: "huntsville-2026",
    name: "Huntsville Hamfest 2026",
    location: "700 Monroe Street SW, Huntsville, AL 35801",
    venue: "Von Braun Center",
    startDate: "2026-08-21",
    endDate: "2026-08-22",
    timezone: "America/Chicago",
    primaryColor: "#7c3aed",
    secondaryColor: "#8b5cf6",
    conferenceUrl: "https://www.hamfest.org",
    venuePhone: "256-533-1953",
    venueGPS: "34.7269,-86.5934",
    venueGridSquare: "EM64qr",
    venueUrl: "http://www.vonbrauncenter.com/",
    timezoneNumeric: "-0500", // CDT in August (Central Daylight Time)
    parkingUrl: "https://hamfest.org/directions",
    icalUrl: "",
    googlecalUrl: "",
    conferenceContactEmail: "info@hamfest.org",
    logoUrl: "/assets/images/huntsville-logo.png",
    //mapSessionRooms?: [string, boolean, boolean]; // dynamic [mapUrl, sessions loaded, rooms loaded]
    //mapExhibitorBooths?: [string, boolean, boolean]; // dynamic [mapUrl, exhibitors loaded, booths loaded]
    conferenceProgramUrl:
      "/assets/programs/huntsville-hamfest-2026-program.pdf", // broadsheet for us
    conferenceProgramSourceUrl:
      "https://hamfest.org/wp-content/uploads/2025/08/Hamfest-Program-2025-08-FINAL.pdf",
    conferenceAppPageUrl: "https://www.hamcation.com/app/",
    firstConferenceYear: 1954,
    estimatedAttendees: 5981,
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
    location: "2600 Bishop Drive, San Ramon, CA 94583", // changed
    conferenceUrl: "https://www.pacificon.org", // changed
    venuePhone: "925-867-9200",
    venueGPS: "37.7629,-121.9674",
    venueGridSquare: "CM97as",
    venueUrl:
      "https://www.marriott.com/en-us/hotels/oaksr-san-ramon-marriott/overview/",
    timezoneNumeric: "-0700", // DST, PDT ends early Nov
    parkingUrl: "https://www.pacificon.org/resources/parking",
    icalUrl: "/assets/maps/pacificon-2026.ics",
    googlecalUrl:
      "https://calendar.google.com/calendar/event?action=TEMPLATE&amp;tmeid=MW9yajdlbDEwNmYwczN2bzl1aTM0OGwzbDEgZ3JhbnRib3dAbWRhcmMub3Jn&amp;tmsrc=grantbow%40mdarc.org",
    conferenceContactEmail: "webmaster@pacificon.org",
    logoUrl: "/assets/images/pacificon-2026-logo-208-110.jpg",
    //mapSessionsUrl: '/assets/maps/pacificon-hotel-2025.jpg', // for Room[] and Session[] - move to attribute in MapImage[]?
    //mapExhibitorsUrl: ['/assets/maps/pacificon-exhibitors-2025.png'], // for Booth[] and Exhibitor[] - move to attribute in MapImage[]?
    //mapSessionRooms?: [string, boolean, boolean]; // dynamic [mapUrl, sessions loaded, rooms loaded]
    //mapExhibitorBooths?: [string, boolean, boolean]; // dynamic [mapUrl, exhibitors loaded, booths loaded]
    conferenceProgramUrl:
      "https://drive.google.com/file/d/1TlaEhDC0xvCEiQgJc5QUYApp0WIpHvNm/view", // broadsheet for us; run scripts/fetch-programs.mjs to cache locally
    conferenceProgramSourceUrl:
      "https://drive.google.com/uc?export=download&id=1TlaEhDC0xvCEiQgJc5QUYApp0WIpHvNm",
    conferenceAppPageUrl: "https://www.pacificon.org/app/",
    firstConferenceYear: 1920,
    estimatedAttendees: 1300,
  },
  {
    id: "quartzfest-2027",
    name: "Quartzfest 2027",
    location: "US 95 @ La Paz Valley Road, La Paz Valley, AZ, 85346",
    venue:
      "BLM La Posa LTVA,\
Roadrunner Camping Area",
    startDate: "2027-01-17",
    endDate: "2027-01-23", // seven days, not two or three
    timezone: "America/Phoenix",
    primaryColor: "#53DEBF",
    secondaryColor: "#f97316",
    conferenceUrl: "https://www.quartzfest.org",
    venuePhone: "",
    venueGPS: "33.5852,-114.2225",
    venueGridSquare: "DM23vn",
    venueUrl: "https://www.blm.gov/visit/la-posa-long-term-visitor-area",
    timezoneNumeric: "-0700", // does not observe DST
    parkingUrl: "https://www.blm.gov/visit/la-posa-long-term-visitor-area",
    icalUrl: "",
    googlecalUrl: "",
    conferenceContactEmail: "hkey073@gmail.com",
    logoUrl: "/assets/images/quartzfest-logo-w1000_h1000.webp",
    //mapSessionRooms?: [string, boolean, boolean]; // dynamic [mapUrl, sessions loaded, rooms loaded]
    //mapExhibitorBooths?: [string, boolean, boolean]; // dynamic [mapUrl, exhibitors loaded, booths loaded]
    firstConferenceYear: 1997,
    estimatedAttendees: 450,
  },
  {
    id: "hamcation-2027",
    name: "Hamcation 2027",
    location: "4603 W Colonial Drive, Orlando, FL 32808",
    venue: "Central Florida Fairgrounds",
    startDate: "2027-02-12",
    endDate: "2027-02-14",
    timezone: "America/New_York",
    primaryColor: "#000000",
    secondaryColor: "#f97316",
    conferenceUrl: "https://www.hamcation.com",
    venuePhone: "407-385-3247",
    venueGPS: "28.5556,-81.4402",
    venueGridSquare: "EL98gn",
    venueUrl: "https://www.centralfloridafair.com/",
    timezoneNumeric: "-0500", // EST in February (Eastern Standard Time)
    parkingUrl: "",
    icalUrl: "",
    googlecalUrl: "",
    conferenceContactEmail: "info@hamcation.com",
    logoUrl: "/assets/images/hamcation-2026-logo.png",
    //mapSessionsUrl: '/assets/maps/hamcation-2026-pavilion.png', // for Room[]
    //mapExhibitorsUrl: [ '/assets/maps/hamcation-2026-north.png', '/assets/maps/hamcation-2026-eastwest.png'], // for Booth[]
    //mapSessionRooms?: [string, boolean, boolean]; // dynamic [mapUrl, sessions loaded, rooms loaded]
    //mapExhibitorBooths?: [string, boolean, boolean]; // dynamic [mapUrl, exhibitors loaded, booths loaded]
    conferenceProgramUrl: "/assets/programs/hamcation-2026-program.pdf", // 2027 program not yet available; using 2026 as placeholder
    conferenceProgramSourceUrl:
      "https://www.hamcation.com/PDF/HamCation-2027-Program.pdf", // run npm run fetch-programs when 2027 program is published
    conferenceAppPageUrl: "https://www.hamcation.com/app/",
    firstConferenceYear: 1946,
    estimatedAttendees: 23000,
  },
  {
    id: "yuma-2027",
    name: "Yuma Hamfest 2027",
    location: "2520 E 32nd St, Yuma, AZ 85365",
    venue: "Yuma County Fairgrounds",
    startDate: "2027-02-26",
    endDate: "2027-02-27",
    timezone: "America/Phoenix",
    primaryColor: "#F5E556",
    secondaryColor: "#253C61",
    conferenceUrl: "https://www.yumahamfest.com",
    venuePhone: "(928) 726-4420",
    venueGPS: "32.6707,-114.5943",
    venueGridSquare: "DM22qq",
    venueUrl: "https://www.yumafair.com",
    timezoneNumeric: "-0700", // does not observe DST
    parkingUrl: "https://www.yumahamfest.com/parking.html",
    icalUrl: "",
    googlecalUrl: "",
    conferenceContactEmail: "info@yumahamfest.org",
    logoUrl: "/assets/images/yuma-buzzard.webp",
    //mapSessionsUrl: '/assets/maps/hamvention-forums-2026-2.png', // for Room[]
    //mapExhibitorsUrl: ['/assets/maps/hamvention-2026-Booths-Exhibits-Overview-v20.pdf'], // for Booth[]
    //mapSessionRooms?: [string, boolean, boolean]; // dynamic [mapUrl, sessions loaded, rooms loaded]
    //mapExhibitorBooths?: [string, boolean, boolean]; // dynamic [mapUrl, exhibitors loaded, booths loaded]
    firstConferenceYear: 2005,
    estimatedAttendees: 1200,
  },
  { id: "---" },
  {
    id: "loomis-2026",
    name: "Loomis Hamfest 2026",
    location: "5775 Horseshoe Bar Rd, Loomis, CA 95650",
    venue: "Historic Loomis Train Station",
    startDate: "2026-03-28",
    endDate: "2026-03-28",
    timezone: "America/Los_Angeles",
    primaryColor: "#000080",
    secondaryColor: "#DCBf33",
    conferenceUrl: "https://hamfest.w6ek.org",
    venuePhone: "+1-916-652-1840",
    venueGPS: "38.8213,-121.1932",
    venueGridSquare: "CM98jt",
    venueUrl:
      "https://loomis.ca.gov/locations/historic-loomis-train-depot-plaza/",
    timezoneNumeric: "-0700", // PDT in March (Pacific Daylight Time)
    parkingUrl: "",
    icalUrl: "",
    googlecalUrl: "",
    conferenceContactEmail: "info@w6ek.org",
    logoUrl: "/assets/images/loomis-2026.png",
    //mapSessionsUrl: '/assets/maps/hamvention-forums-2026-2.png', // for Room[]
    //mapExhibitorsUrl: ['/assets/maps/hamvention-2026-Booths-Exhibits-Overview-v20.pdf'], // for Booth[]
    //mapSessionRooms?: [string, boolean, boolean]; // dynamic [mapUrl, sessions loaded, rooms loaded]
    //mapExhibitorBooths?: [string, boolean, boolean]; // dynamic [mapUrl, exhibitors loaded, booths loaded]
    conferenceProgramUrl:
      "/assets/programs/2026_loomishamfest_03082026_01-scaled.png",
    conferenceProgramSourceUrl:
      "https://www.w6ek.org/wp-content/uploads/2023/02/2026_loomishamfest_03082026_01-scaled.png", // upstream filename reflects the year it was published, not the conference year
    conferenceAppPageUrl: "https://pacific-div.web/app/",
    firstConferenceYear: 2016,
    estimatedAttendees: 400,
  },
  {
    id: "yuma-2026",
    name: "Yuma Hamfest 2026",
    location: "2520 E 32nd St, Yuma, AZ 85365",
    venue: "Yuma County Fairgrounds",
    startDate: "2026-02-27",
    endDate: "2026-02-28",
    timezone: "America/Phoenix",
    primaryColor: "#F5E556",
    secondaryColor: "#253C61",
    conferenceUrl: "https://www.yumahamfest.com",
    venuePhone: "(928) 726-4420",
    venueGPS: "32.6707,-114.5943",
    venueGridSquare: "DM22qq",
    venueUrl: "https://www.yumafair.com",
    timezoneNumeric: "-0700", // does not observe DST
    parkingUrl: "https://www.yumahamfest.com/parking.html",
    icalUrl: "",
    googlecalUrl: "",
    conferenceContactEmail: "info@yumahamfest.org",
    logoUrl: "/assets/images/yuma-buzzard.webp",
    //mapSessionsUrl: '/assets/maps/hamvention-forums-2026-2.png', // for Room[]
    //mapExhibitorsUrl: ['/assets/maps/hamvention-2026-Booths-Exhibits-Overview-v20.pdf'], // for Booth[]
    //mapSessionRooms?: [string, boolean, boolean]; // dynamic [mapUrl, sessions loaded, rooms loaded]
    //mapExhibitorBooths?: [string, boolean, boolean]; // dynamic [mapUrl, exhibitors loaded, booths loaded]
    firstConferenceYear: 2005,
    estimatedAttendees: 1200,
  },
  {
    id: "hamcation-2026",
    name: "Hamcation 2026",
    location: "4603 W Colonial Drive, Orlando, FL 32808",
    venue: "Central Florida Fairgrounds",
    startDate: "2026-02-13",
    endDate: "2026-02-15",
    timezone: "America/New_York",
    primaryColor: "#000000",
    secondaryColor: "#f97316",
    conferenceUrl: "https://www.hamcation.com",
    venuePhone: "407-385-3247",
    venueGPS: "28.5556,-81.4402",
    venueGridSquare: "EL98gn",
    venueUrl: "https://www.centralfloridafair.com/",
    timezoneNumeric: "-0700", // DST, PDT ends early Nov
    parkingUrl: "",
    icalUrl: "",
    googlecalUrl: "",
    conferenceContactEmail: "info@hamcation.com",
    logoUrl: "/assets/images/hamcation-2026-logo.png",
    //mapSessionsUrl: '/assets/maps/hamcation-2026-pavilion.png', // for Room[]
    //mapExhibitorsUrl: [ '/assets/maps/hamcation-2026-north.png', '/assets/maps/hamcation-2026-eastwest.png'], // for Booth[]
    //mapSessionRooms?: [string, boolean, boolean]; // dynamic [mapUrl, sessions loaded, rooms loaded]
    //mapExhibitorBooths?: [string, boolean, boolean]; // dynamic [mapUrl, exhibitors loaded, booths loaded]
    conferenceProgramUrl: "/assets/programs/hamcation-2026-program.pdf",
    conferenceProgramSourceUrl:
      "https://www.hamcation.com/PDF/HamCation-2026-Program.pdf",
    conferenceAppPageUrl: "https://www.hamcation.com/app/",
    firstConferenceYear: 1954,
    estimatedAttendees: 23000,
  },
];
