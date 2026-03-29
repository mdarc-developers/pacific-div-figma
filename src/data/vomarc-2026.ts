import {
  //  Session,
    MapImage,
  //  Room,
  //  Exhibitor,
  //  Booth,
  //  Prize,
  //  PrizeWinner,
  UserProfile,
} from "@/types/conference";

// map images - in production these may be bundled images
export const conferenceMaps: MapImage[] = [
  {
    id: "map-1",
    name: "Parking",
    url: "/assets/maps/vomarc-20260329.png",
    order: 1,
    origWidthNum: 1548,
    origHeightNum: 843,
  },
];

//export const samplePrizes: Prize[] = [
//];

//export const samplePrizeWinners: PrizeWinner[] = [
//];

//export const mapExhibitors: [string, Exhibitor[]] = [
//  "",
//  [
//  ],
//];

// Define your Booth polygons here
// Coords format: [[y_bottom, x_left], [y_top, x_left], [y_top, x_right], [y_bottom, x_right]]
// NOTE: All y values are measured from the bottom, not from the top and y values <= origHeightNum (562)
// NOTE: All x values are measured from the left and must be <= origWidthNum (998)
//export const mapBooths: [string, Booth[]] = [
//  "",
//  [
//  ],
//];

// Define your Room polygons here
// Coords format: [[y_bottom, x_left], [y_top, x_left], [y_top, x_right], [y_bottom, x_right]]
// NOTE: All y values are measured from the bottom, not from the top and y values <= origHeightNum (562)
// NOTE: All x values are measured from the left and must be <= origWidthNum (998)
//export const mapRooms: [string, Room[]] = [
//  "",
//  [
//  ],
//];

//export const mapSessions: [string, Session[]] = [
//  "",
//  [
//  ],
//];

export const mapUserProfiles: UserProfile[] = [
  {
    uid: "2JjLExoVgiVdblnPFUVX1YJzqdA2",
    email: "grantbow@mdarc.org",
    darkMode: false,
    bookmarkedSessions: [],
    notificationsEnabled: true,
    smsNotifications: true,
    groups: ["prize-admin", "forums-admin", "exhibitor-admin", "more-admin"],
    displayName: "Grant B",
    callsign: "K6CBK",
  },
];
