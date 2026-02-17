import { Session, MapImage, Room, Exhibitor, Booth, Prize, PrizeWinner } from '@/types/conference';

export const samplePrizes: Prize[] = [
  {
    id: 'p1',
    name: 'Yaesu FT-65R Handheld',
    description: 'Dual-band 5W handheld',
    imageUrl: '/assets/prizes/p1.jpg',
    donor: 'Yaesu',
    winner: 'winner1',
  },
  {
    id: 'p2',
    name: 'Antenna Tuner',
    description: 'For HF bands, LDG Z-100 Plus',
    imageUrl: '/assets/prizes/p2.jpg',
    donor: 'Pacificon Committee',
    winner: 'winner2',
  },
  {
    id: 'p3',
    name: 'ARRL Handbook',
    description: 'Latest Technician study manual',
    imageUrl: '/assets/prizes/p3.jpg',
    donor: 'ARRL',
    winner: 'winner3',
  },
];

export const samplePrizeWinners: PrizeWinner[] = [
  {
    id: 'winner1',
    prizeId: 'p1',
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
    prizeId: 'p2',
    winningTicket: '2042',
  },
  {
    id: 'winner3',
    prizeId: 'p3',
    winningTicket: '3155',
    winnerCallsign: 'W6CW',
    winnerName: 'Carol Williams',
  },

];

export const exhibitorBooths: Booth[] = [
  // origHeightNum: 1702,
  // origWidthNum: 1280,
  // ... (your exhibitorBooths data) ...
  // using y, x not x, y   also,
  // x is normal, y from bottom so 1702 - y

  // [[y_bottom, x_left], [y_top, x_left], [y_top, x_right], [y_bottom, x_right]]

  // down 70 in bishop ranch column, 51 wide
  {
    id: 1, // 875, 505 - 927, 526 done via gimp - so top left is [1185, 875], bot right is [1176,927]
    coords: [[1126, 875], [1196, 875], [1196, 926], [1126, 926]],
    locationZone: 'bishop-ranch',
  },
  {
    id: 2,
    coords: [[1056, 875], [1126, 875], [1126, 926], [1056, 926]],
    locationZone: 'bishop-ranch',
  },
  {
    id: 3,
    coords: [[986, 875], [1056, 875], [1056, 926], [986, 926]],
    locationZone: 'bishop-ranch',
  },
  {
    id: 4,
    coords: [[915, 875], [985, 875], [985, 926], [915, 926]],
    locationZone: 'bishop-ranch',
  },
  {
    id: 5,
    coords: [[842, 875], [915, 875], [915, 926], [842, 926]],
    locationZone: 'bishop-ranch',
  },
  {
    id: 6,
    coords: [[1126, 926], [1196, 926], [1196, 977], [1126, 977]],
    locationZone: 'bishop-ranch',
  },
  {
    id: 7,
    coords: [[1056, 926], [1126, 926], [1126, 977], [1056, 977]],
    locationZone: 'bishop-ranch',
  },
  {
    id: 8,
    coords: [[986, 926], [1056, 926], [1056, 977], [986, 977]],
    locationZone: 'bishop-ranch',
  },
  {
    id: 9,
    coords: [[915, 926], [985, 926], [985, 977], [915, 977]],
    locationZone: 'bishop-ranch',
  },
  {
    id: 10,
    coords: [[842, 926], [915, 926], [915, 977], [842, 977]],
    locationZone: 'bishop-ranch',
  },
  {
    id: 11, // 1041, 506 top left gimp so 1702-506= 1196, 1041 vs 1196,875 so 166 pixels to right
    coords: [[1126, 1041], [1196, 1041], [1196, 1092], [1126, 1092]],
    locationZone: 'bishop-ranch',
  },
  {
    id: 12,
    coords: [[1056, 1041], [1126, 1041], [1126, 1092], [1056, 1092]],
    locationZone: 'bishop-ranch',
  },
  {
    id: 13,
    coords: [[986, 1041], [1056, 1041], [1056, 1092], [986, 1092]],
    locationZone: 'bishop-ranch',
  },
  {
    id: 14,
    coords: [[915, 1041], [985, 1041], [985, 1092], [915, 1092]],
    locationZone: 'bishop-ranch',
  },
  {
    id: 15,
    coords: [[842, 1041], [915, 1041], [915, 1092], [842, 1092]],
    locationZone: 'bishop-ranch',
  },
  {
    id: 16,
    coords: [[1126, 1093], [1196, 1093], [1196, 1145], [1126, 1145]],
    locationZone: 'bishop-ranch',
  },
  {
    id: 17,
    coords: [[1056, 1093], [1126, 1093], [1126, 1145], [1056, 1145]],
    locationZone: 'bishop-ranch',
  },
  {
    id: 18,
    coords: [[986, 1093], [1056, 1093], [1056, 1145], [986, 1145]],
    locationZone: 'bishop-ranch',
  },
  {
    id: 19,
    coords: [[915, 1093], [985, 1093], [985, 1145], [915, 1145]],
    locationZone: 'bishop-ranch',
  },
  {
    id: 20,
    coords: [[842, 1093], [915, 1093], [915, 1145], [842, 1145]],
    locationZone: 'bishop-ranch',
  },
  {
    id: 21,
    coords: [[723, 853], [774, 853], [774, 923], [723, 923]],
    locationZone: 'bishop-ranch',
  },
  {
    id: 22,
    coords: [[723, 924], [774, 924], [774, 994], [723, 994]],
    locationZone: 'bishop-ranch',
  },
  {
    id: 23,
    coords: [[723, 995], [774, 995], [774, 1065], [723, 1065]],
    locationZone: 'bishop-ranch',
  },
  {
    id: 24,
    coords: [[723, 1066], [774, 1066], [774, 1136], [723, 1136]],
    locationZone: 'bishop-ranch',
  },
  {
    id: 25,
    coords: [[723, 1137], [774, 1137], [774, 1208], [723, 1208]],
    locationZone: 'bishop-ranch',
  },
  {
    id: 26,
    coords: [[775, 1209], [847, 1209], [847, 1259], [775, 1259]],
    locationZone: 'bishop-ranch',
  },
  {
    id: 27,
    coords: [[847, 1209], [916, 1209], [916, 1258], [847, 1258]],
    locationZone: 'bishop-ranch',
  },
  {
    id: 28,
    coords: [[991, 1206], [1062, 1206], [1062, 1256], [991, 1256]],
    locationZone: 'bishop-ranch',
  },
  {
    id: 29,
    coords: [[1163, 1207], [1233, 1207], [1233, 1258], [1163, 1258]],
    locationZone: 'bishop-ranch',
  },
  {
    id: 30, //name: 'T-1',
    coords: [[1276, 620], [1356, 620], [1356, 677], [1276, 677]],
    locationZone: 'bishop-ranch-hallway',
  },
  {
    id: 31, //name: 'T-2',
    coords: [[1326, 756], [1356, 756], [1356, 812], [1325, 812]],
    locationZone: 'bishop-ranch-hallway',
  },
  {
    id: 32, //name: 'T-3',
    coords: [[1326, 812], [1356, 812], [1356, 869], [1326, 869]],
    locationZone: 'bishop-ranch-hallway',
  },
  // [[y_bottom, x_left], [y_top, x_left], [y_top, x_right], [y_bottom, x_right]]
  // [[, +56], [, same], [, +56], [y_bottom, same]]
  {
    id: 33, //name: 'T-4',
    coords: [[1326, 869], [1356, 869], [1356, 927], [1326, 927]],
    locationZone: 'bishop-ranch-hallway',
  },
  {
    id: 34, //name: 'T-5',
    coords: [[1326, 927], [1356, 927], [1356, 981], [1326, 981]],
    locationZone: 'bishop-ranch-hallway',
  },
  {
    id: 35, //name: 'T-6',
    coords: [[1326, 981], [1356, 981], [1356, 1038], [1326, 1038]],
    locationZone: 'bishop-ranch-hallway',
  },
  {
    id: 36, //name: 'T-7',
    coords: [[1326, 1038], [1356, 1038], [1356, 1094], [1326, 1094]],
    locationZone: 'bishop-ranch-hallway',
  },
  {
    id: 37, //name: 'T-8',
    coords: [[1326, 1094], [1356, 1094], [1356, 1150], [1326, 1150]],
    locationZone: 'bishop-ranch-hallway',
  },
  {
    id: 38, //name: 'T-9',
    coords: [[1326, 1150], [1356, 1150], [1356, 1206], [1326, 1206]],
    locationZone: 'bishop-ranch-hallway',
  },
  {
    id: 39, //name: 'T-10',
    coords: [[1132, 745], [1203, 745], [1203, 797], [1132, 797]],
    locationZone: 'bishop-ranch-hallway',
  },
  {
    id: 40, //name: 'T-11',
    coords: [[993, 745], [1065, 745], [1065, 797], [993, 797]],
    locationZone: 'bishop-ranch-hallway',
  },
  {
    id: 41, //name: 'T-13',
    coords: [[847, 745], [919, 745], [919, 797], [847, 797]],
    locationZone: 'bishop-ranch-hallway',
  },
  {
    id: 42, //name: 'T-14',
    coords: [[691, 746], [763, 746], [763, 795], [691, 795]],
    locationZone: 'bishop-ranch-hallway',
  },
  {
    id: 43, //name: 'T-15',
    coords: [[520, 745], [591, 745], [591, 796], [520, 796]],
    locationZone: 'bishop-ranch-hallway',
  },
  {
    id: 44, //name: 'T-16',
    coords: [[378, 746], [450, 746], [450, 796], [378, 796]],
    locationZone: 'bishop-ranch-hallway',
  },
  {
    id: 45, //name: 'T-18',
    coords: [[234, 746], [305, 746], [305, 796], [234, 796]],
    locationZone: 'bishop-ranch-hallway',
  },
  {
    id: 46, //name: 'NP-15',
    coords: [[45, 765], [102, 765], [102, 797], [45, 797]],
    locationZone: 'bishop-ranch-hallway',
  },
  {
    id: 47, //name: 'NP-14',
    coords: [[131, 654], [192, 654], [192, 689], [131, 689]],
    locationZone: 'bishop-ranch-hallway',
  },
  {
    id: 48, //name: 'NP-13',
    coords: [[191, 654], [247, 654], [247, 689], [191, 689]],
    locationZone: 'bishop-ranch-hallway',
  },
  {
    id: 49, //name: 'NP-12',
    coords: [[248, 654], [301, 654], [301, 689], [248, 689]],
    locationZone: 'bishop-ranch-hallway',
  },
  {
    id: 50, //name: 'T-17',
    coords: [[303, 654], [373, 654], [373, 706], [303, 706]],
    locationZone: 'bishop-ranch-hallway',
  },
  {
    id: 51, //name: 'NP-11',
    coords: [[574, 659], [636, 659], [636, 690], [574, 690]],
    locationZone: 'bishop-ranch-hallway',
  },
  {
    id: 52, //name: 'NP-10',
    coords: [[727, 659], [784, 659], [784, 691], [727, 691]],
    locationZone: 'bishop-ranch-hallway',
  },
  {
    id: 53,
    coords: [[868, 657], [925, 657], [925, 673], [868, 673]],
    locationZone: 'bishop-ranch-hallway',
  },
  {
    id: 54,
    coords: [[1036, 505], [1184, 505], [1184, 620], [1036, 620]],
    locationZone: 'bishop-ranch-hallway',
  },
  {
    id: 55,
    coords: [[201, 415], [374, 415], [374, 648], [201, 648]],
    locationZone: 'bishop-ranch-patio',
  },
  {
    id: 56, //name: 'Restrooms',
    coords: [[24, 418], [194, 418], [194, 650], [24, 650]],
    locationZone: 'bishop-ranch-hallway',
  },
  {
    id: 57, //name: 'Contra Costa Ballroom Salon 2',
    coords: [[1363, 626], [1597, 626], [1597, 786], [1363, 786]],
    locationZone: 'bishop-ranch-hallway',
  },
  {
    id: 58, //name: 'Salon E',
    coords: [[309, 800], [721, 800], [721, 1262], [309, 1262]],
    locationZone: 'bishop-ranch',
  },
  {
    // [[y_bottom, x_left], [y_top, x_left], [y_top, x_right], [y_bottom, x_right]]
    id: 59, //name: 'Salon F',
    coords: [[201, 800], [309, 800], [309, 945], [201, 945]],
    locationZone: 'bishop-ranch',
  },
  {
    id: 60, //name: 'Salon G',
    coords: [[201, 945], [309, 945], [309, 1127], [201, 1127]],
    locationZone: 'bishop-ranch',
  },
  {
    id: 61, //name: 'Salon H',
    coords: [[201, 1127], [309, 1127], [309, 1261], [201, 1261]],
    locationZone: 'bishop-ranch',
  },
  {
    id: 62, //name: 'San Ramon Boardroom',
    coords: [[26, 802], [112, 802], [112, 960], [26, 960]],
    locationZone: 'bishop-ranch-hallway',
  },
  {
    id: 63, //name: 'Pleasanton',
    coords: [[26, 967], [112, 967], [112, 1103], [26, 1103]],
    locationZone: 'bishop-ranch-hallway',
  },
  {
    id: 64, //name: 'Danville',
    coords: [[23, 1101], [114, 1101], [114, 1260], [23, 1260]],
    locationZone: 'bishop-ranch-hallway',
  },
  {
    id: 65, //name: 'NP-1',
    coords: [[1279, 140], [1309, 140], [1309, 195], [1279, 195]],
    locationZone: 'contra-costa-hallway',
  },
  {
    id: 66, //name: 'NP-2',
    coords: [[1278, 204], [1310, 204], [1310, 259], [1278, 259]],
    locationZone: 'contra-costa-hallway',
  },
  {
    id: 67, //name: 'NP-3',
    coords: [[1278, 267], [1310, 267], [1310, 322], [1278, 322]],
    locationZone: 'contra-costa-hallway',
  },
  {
    id: 68, //name: 'NP-4',
    coords: [[1278, 330], [1308, 330], [1308, 384], [1278, 384]],
    locationZone: 'contra-costa-hallway',
  },
  {
    id: 69, //name: 'NP-5',
    coords: [[1326, 315], [1357, 315], [1357, 370], [1326, 370]],
    locationZone: 'contra-costa-hallway',
  },
  {
    id: 70, //name: 'NP-6',
    coords: [[1326, 372], [1357, 372], [1357, 427], [1326, 427]],
    locationZone: 'contra-costa-hallway',
  },
  {
    id: 71, //name: 'NP-7',
    coords: [[1326, 437], [1357, 437], [1357, 491], [1326, 491]],
    locationZone: 'contra-costa-hallway',
  },
  {
    id: 72, //name: 'NP-8',
    coords: [[1325, 497], [1357, 497], [1357, 554], [1325, 554]],
    locationZone: 'contra-costa-hallway',
  },
  {
    id: 73, //name: 'NP-9',
    coords: [[1289, 575], [1345, 575], [1345, 606], [1289, 606]],
    locationZone: 'contra-costa-hallway',
  },
  {
    id: 74, //name: 'mdarc table', NP-19
    coords: [[1373, 126], [1429, 126], [1429, 159], [1373, 159]],
    locationZone: 'contra-costa',
  },
  {
    id: 75, // 37 free dv
    coords: [[1438, 118], [1509, 118], [1509, 168], [1438, 168]],
    locationZone: 'contra-costa',
  },
  {
    id: 76, // 33 Zero retries
    coords: [[1520, 117], [1591, 117], [1591, 168], [1520, 168]],
    locationZone: 'contra-costa',
  },
  {
    id: 77, // 41 loderma the potter
    coords: [[1599, 239], [1650, 239], [1650, 309], [1599, 309]],
    locationZone: 'contra-costa',
  },
  {
    id: 78,
    coords: [[1600, 313], [1650, 313], [1650, 378], [1600, 378]],
    locationZone: 'contra-costa',
  },
  {
    id: 79,
    coords: [[1607, 413], [1649, 413], [1649, 480], [1607, 480]],
    locationZone: 'contra-costa',
  },
  {
    id: 80,
    coords: [[1494, 246], [1546, 246], [1546, 317], [1494, 317]],
    locationZone: 'contra-costa',
  },
  {
    id: 81,
    coords: [[1546, 317], [1494, 317], [1496, 413], [1538, 413]],
    locationZone: 'contra-costa',
  },
  {
    id: 82,
    coords: [[1496, 413], [1538, 413], [1538, 484], [1496, 484]],
    locationZone: 'contra-costa',
  },
  {
    id: 83, // 34 licw
    coords: [[1442, 246], [1494, 246], [1494, 318], [1442, 318]],
    locationZone: 'contra-costa',
  },
  {
    id: 84, // 35 licw
    coords: [[1442, 317], [1494, 317], [1494, 389], [1442, 389]],
    locationZone: 'contra-costa',
  },
  {
    id: 85, // 36 AI6YM Radio
    coords: [[1443, 415], [1493, 415], [1493, 484], [1443, 484]],
    locationZone: 'contra-costa',
  },
  {
    id: 86, // NP-16 ORCA
    coords: [[1364, 349], [1396, 349], [1396, 405], [1364, 405]],
    locationZone: 'contra-costa',
  },
  {
    id: 87, // NP-17 Meshtastic
    coords: [[1364, 420], [1395, 420], [1395, 478], [1364, 478]],
    locationZone: 'contra-costa',
  },
  {
    id: 88, // NP-18 SF Skywarn
    coords: [[1365, 490], [1394, 490], [1394, 548], [1365, 548]],
    locationZone: 'contra-costa',
  },
  {
    id: 89, // Will-Call
    coords: [[1327, 24], [1419, 24], [1419, 48], [1327, 48]],
    locationZone: 'lobby',
  },
  {
    id: 90, // registration
    coords: [[1393, 2], [1488, 2], [1488, 23], [1393, 23]],
    locationZone: 'lobby',
  },
  {
    id: 91, // pacificon prize booth
    coords: [[1544, 23], [1650, 23], [1650, 79], [1544, 79]],
    locationZone: 'lobby',
  },

];

export const sampleExhibitors: Exhibitor[] = [
  {
    id: 'flexradio',
    name: 'Flex Radio',
    description: 'software defined radios',
    boothName: '1  2  3',
    location: [1, 2, 3],
    type: 'vendor-booth',
    color: '#77cff4',
    url: 'https://www.flexradio.com',
  },
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
    id: 'yaesu',
    name: 'Yaesu',
    description: 'HF, VHF and UHF amateur radios',
    boothName: '6  7',
    location: [6, 7],
    type: 'vendor-booth',
    color: '#77cff4',
    url: 'https://www.yaesu.com',
  },
  {
    id: 'impulse',
    name: 'Impulse Electronics',
    description: '',
    boothName: '8  9',
    location: [8, 9],
    type: 'vendor-booth',
    color: '#77cff4',
    url: 'https://www.impulseelectronics.com',
  },
  {
    id: 'abrindustries',
    name: 'ABR Industries',
    description: 'coax',
    boothName: '10',
    location: [10],
    type: 'vendor-booth',
    color: '#77cff4',
    url: 'https://www.abrind.com',
  },
  {
    id: 'hro',
    name: 'Ham Radio Outlet',
    description: 'ham radio sales',
    boothName: '11   12   13',
    location: [11, 12, 13],
    type: 'vendor-booth',
    color: '#77cff4',
    url: 'https://www.hamradio.com',
  },
  {
    id: '12voltpower',
    name: '12 Volt Power',
    description: 'barrery sales',
    boothName: '14   15',
    location: [14, 15],
    type: 'vendor-booth',
    color: '#77cff4',
    url: 'https://www.12voltpower.com',
  },
  {
    id: 'batteriesplus',
    name: 'Batteries Plus',
    description: 'barrery sales',
    boothName: '16   17',
    location: [16, 17],
    type: 'vendor-booth',
    color: '#77cff4',
    url: 'https://www.batteriesplus.com',
  },
  {
    id: 'mmdvm',
    name: 'MMDVM',
    description: 'multimode digital voice',
    boothName: '18',
    location: [18],
    type: 'vendor-booth',
    color: '#77cff4',
    url: 'https://www.batteriesplus.com',
  },
  {
    id: 'buddipole',
    name: 'Buddi Pole',
    description: 'portable antennas',
    boothName: '20',
    location: [20],
    type: 'vendor-booth',
    color: '#77cff4',
    url: 'https://www.buddipole.com',
  },
  {
    id: 'connectsystems',
    name: 'Connect Systems',
    description: 'remote control radios',
    boothName: '21',
    location: [21],
    type: 'vendor-booth',
    color: '#77cff4',
    url: 'https://www.connectsystems.com',
  },
  {
    id: 'elecraft',
    name: 'Elecraft',
    description: 'full-featured transceivers and accessories',
    boothName: '22   23   24   25',
    location: [22, 23, 24, 25],
    type: 'vendor-booth',
    color: '#77cff4',
    url: 'https://www.elecraft.com',
  },
  {
    id: 'halibut',
    name: 'Halibut Electronics',
    description: '',
    boothName: '26',
    location: [26],
    type: 'vendor-booth',
    color: '#77cff4',
    url: 'https://electronics.halibut.com',
  },
  {
    id: 'hitched4fun',
    name: 'Hitched 4 Fun',
    description: '',
    boothName: '27',
    location: [27],
    type: 'vendor-booth',
    color: '#77cff4',
    url: 'https://www.hitched4fun.com',
  },
  {
    id: 'parklane',
    name: 'Park Lane Jewelry',
    description: 'jewelry',
    boothName: '28',
    location: [28],
    type: 'vendor-booth',
    color: '#77cff4',
    url: 'https://parklanejewelry.com/rep/dawnbiocca',
  },
  {
    id: 'dronescan3d',
    name: 'Drone Scan 3D',
    description: '',
    boothName: '29',
    location: [29],
    type: 'vendor-booth',
    color: '#77cff4',
    url: 'https://dronescan3d.com',
  },
  {
    id: 'springboard',
    name: 'Springboard Group',
    description: 'Seller of high-power flashlights, kitchen, knives, high power magnets, pocket knives, tools and much more',
    boothName: 'T-1',
    location: [30],
    type: 'vendor-booth',
    color: '#77cff4',
    url: '',
  },
  {
    id: 'wiredco',
    name: 'Wired Communications',
    description: 'Cables, Connectors, LEDs and Adapters',
    boothName: 'T-2  through  T-9',
    location: [31, 32, 33, 33, 34, 35, 36, 37, 38],
    type: 'vendor-table',
    color: '#FFC000',
    url: 'https://www.wiredco.com',
  },
  {
    id: 'westerncase',
    name: 'Western Case',
    description: '',
    boothName: 'T-10',
    location: [39],
    type: 'vendor-table',
    color: '#FFC000',
    url: 'https://westerncasecompany.com/',
  },
  {
    id: 'hiphamshirts',
    name: 'Hip Ham Shirts',
    description: 't-shirts',
    boothName: 'T-11',
    location: [40],
    type: 'vendor-table',
    color: '#FFC000',
    url: 'https://hiphamshirts.com/',
  },
  {
    id: 'remotetx',
    name: 'Remote TX',
    description: 'remote control your radio',
    boothName: 'T-13',
    location: [41],
    type: 'vendor-table',
    color: '#FFC000',
    url: 'https://www.remotetx.net/',
  },
  {
    id: 'compudigital',
    name: 'Compudigital',
    description: 'We build Power Supply and PA rebuilding kits for the Kenwood TS-2000, TS-940, and TS-930 transceivers. ',
    boothName: 'T-14',
    location: [42],
    type: 'vendor-table',
    color: '#FFC000',
    url: 'https://k6iok.com/',
  },
  {
    id: 'open.space',
    name: 'Open.Space',
    description: '',
    boothName: 'T-15',
    location: [43],
    type: 'vendor-table',
    color: '#FFC000',
    url: 'https://open.space/',
  },
  {
    id: 'bioennopower',
    name: 'Bioenno Power',
    description: 'LiFePO4 batteries and solar products for ham radio applications.',
    boothName: 'T-16',
    location: [44],
    type: 'vendor-table',
    color: '#FFC000',
    url: 'https://www.bioennopower.com/',
  },
  {
    id: 'datv',
    name: 'DATV',
    description: '',
    boothName: 'NP-15',
    location: [46],
    type: 'nonprofit-table',
    color: '#FFFF00',
    url: 'https://www.bioennopower.com/',
  },
  {
    id: 'jeffreydahnfoundation',
    name: 'Jeffrey Dahn Memorial Foundation',
    description: 'The Jeffrey Dahn Memorial Foundation champions education in electronics for African youth, leveraging amateur radio to inspire innovation and unlock opportunities.',
    boothName: 'NP-14',
    location: [47],
    type: 'nonprofit-table',
    color: '#FFFF00',
    url: 'https://dahnfoundation.org/',
  },
  {
    id: 'sf-hab',
    name: 'SF High Altitude Balloons',
    description: '',
    boothName: 'NP-13',
    location: [48],
    type: 'nonprofit-table',
    color: '#FFFF00',
    url: 'https://sf-hab.org',
  },
  {
    id: 'lark',
    name: 'LARK, Livermore Amateur Radio Klub',
    description: '',
    boothName: 'NP-12',
    location: [49],
    type: 'nonprofit-table',
    color: '#FFFF00',
    url: 'https://livermoreark.org',
  },
  {
    id: 'parachutemobile',
    name: 'Parachute Mobile',
    description: 'Parachute Mobile\'s 14th year providing a unique combination of skydiving and ham radio.',
    boothName: 'NP-11',
    location: [51],
    type: 'nonprofit-table',
    color: '#FFFF00',
    url: 'http://parachutemobile.org',
  },
  {
    id: 'harc',
    name: 'USS Hornet ARC',
    description: 'A radio club on board the USS Hornet Air Sea and Space Museum. We promote amateur radio through our station NB6GC.',
    boothName: 'NP-10',
    location: [52],
    type: 'nonprofit-table',
    color: '#FFFF00',
    url: 'https://nb6gc.org',
  },
  {
    id: 'narcc',
    name: 'NARCC',
    boothName: 'NP-1',
    description: 'Northern Amateur Relay Council of California',
    location: [65],
    type: 'nonprofit-table',
    color: '#FFFF00',
    url: 'https://narcc.org',
  },
  {
    id: 'bayareamesh',
    name: 'Bay Area Mesh',
    boothName: 'NP-2',
    description: 'We provide a free-to-all microwave network around the Bay Area for AREDN, repeater linking, and other uses by the amateur radio community.',
    location: [66],
    type: 'nonprofit-table',
    color: '#FFFF00',
    url: 'http://wiki.bayareamesh.us',
  },
  {
    id: 'NCCC',
    name: 'NCCC',
    boothName: 'NP-3',
    description: 'Northern California Contest Club',
    location: [67],
    type: 'nonprofit-table',
    color: '#FFFF00',
    url: 'https://www.nccc.cc',
  },
  {
    id: 'roarintl',
    name: 'ROAR Intl',
    boothName: 'NP-4',
    description: 'International club focused on all forms of communication and technology including amateur radio, education, service and camaraderie.',
    location: [68],
    type: 'nonprofit-table',
    color: '#FFFF00',
    url: 'https://www.roarintl.org/',
  },
  {
    id: 'qslbureau',
    name: 'QSL Bureau',
    boothName: 'NP-5',
    description: 'ARRL Sixth District Incoming QSL Bureau',
    location: [69],
    type: 'nonprofit-table',
    color: '#FFFF00',
    url: 'https://www.qslbureau.org',
  },
  {
    id: 'sota',
    name: 'SOTA',
    boothName: 'NP-6',
    description: 'SOTA is an award scheme for radio amateurs that encourages portable operation in mountainous areas.',
    location: [70],
    type: 'nonprofit-table',
    color: '#FFFF00',
    url: 'https://sota.org.uk',
  },
  {
    id: 'ylrl',
    name: 'YLRL',
    boothName: 'NP-7',
    description: 'Young Ladies Radio League',
    location: [71],
    type: 'nonprofit-table',
    color: '#FFFF00',
    url: 'https://www.ylrl.net',
  },
  {
    id: 'snars',
    name: 'SNARS',
    boothName: 'NP-8',
    description: 'Sierra Nevada Amateur Radio Society',
    location: [72],
    type: 'nonprofit-table',
    color: '#FFFF00',
    url: 'https://www.snars.org',
  },
  {
    id: 'qcwa',
    name: 'QCWA',
    boothName: 'NP-9',
    description: 'Quarter Century Wireless Association',
    location: [73],
    type: 'nonprofit-table',
    color: '#FFFF00',
    url: 'https://www.qcwa.org',
  },
  {
    id: 'mdarc-table',
    name: 'MDARC',
    boothName: 'NP-19',
    description: 'Mt Diablo Amateur Radio Club',
    location: [74],
    type: 'nonprofit-table',
    color: '#FFFF00',
    url: 'https://www.mdarc.org',
  },
  {
    id: 'freedv',
    name: 'FreeDV',
    description: 'FreeDV is an open-source digital voice mode designed for use on the HF bands. Using machine learning techniques, we have achieved audio quality surpassing traditional modes.',
    boothName: '37',
    location: [75],
    type: 'vendor-booth',
    color: '#77cff4',
    url: 'https://freedv.org/',
  },
  {
    id: 'zeroretries',
    name: 'Zero Retries',
    description: 'An independent newsletter about technological innovation in Amateur Radio, promoting Amateur Radio as (literally) a license to experiment with and learn about radio technology.',
    boothName: '33',
    location: [76],
    type: 'vendor-booth',
    color: '#77cff4',
    url: 'https://www.zeroretries.org/',
  },
  {
    id: 'lodemathepotter',
    name: 'Lodema The Potter',
    description: 'Functional artistic pottery handmade by a master potter. Wares include Ham mugs and dragon mugs. Additionally, call sign bracelets for both men and women will be crafted on-site.',
    boothName: '41',
    location: [77],
    type: 'vendor-booth',
    color: '#77cff4',
    url: '',
  },
  {
    id: 'licw',
    name: 'Long Island CW Club',
    description: 'Learn morse code with the Long Island CW Club—live daily online classes (beginner–advanced) with a QSO-focused curriculum, plus daily forums, POTA/SOTA outings, and historic special-event operations.',
    boothName: '34   35',
    location: [83, 84],
    type: 'vendor-booth',
    color: '#77cff4',
    url: 'https://www.longislandcwclub.org',
  },
  {
    id: 'ai6ym.radio',
    name: 'AI6YM.Radio',
    description: 'Amateur radio kits and accessories. Always open source because you should be tinkering with your ham gear.',
    boothName: '36',
    location: [85],
    type: 'vendor-booth',
    color: '#77cff4',
    url: 'https://ai6ym.radio',
  },
  {
    id: 'orca',
    name: 'ORCA',
    boothName: 'NP-16',
    description: 'Oakland Radio Communications Association',
    location: [86],
    type: 'nonprofit-table',
    color: '#FFFF00',
    url: 'https://www.ww6or.org',
  },
  {
    id: 'meshtastic',
    name: 'Meshtastic',
    boothName: 'NP-17',
    description: 'Meshtastic',
    location: [87],
    type: 'nonprofit-table',
    color: '#FFFF00',
    url: 'https://meshtastic.org',
  },
  {
    id: 'sfskywarn',
    name: 'SF Skywarn',
    boothName: 'NP-18',
    description: '',
    location: [88],
    type: 'nonprofit-table',
    color: '#FFFF00',
    url: 'https://sfoskywarn.org',
  },
  {
    id: 'security',
    name: 'Security',
    description: '',
    boothName: '',
    location: [53],
    type: 'pacificon-activity',
    color: '#7ABB33',
    url: 'https://www.pacificon.org/resources/policies',
  },
  {
    id: 'kit-building',
    name: 'Pacificon Kit Building',
    description: 'Soldering',
    boothName: '',
    location: [54],
    type: 'pacificon-activity',
    color: '#7ABB33',
    url: 'https://www.pacificon.org/education/kit-building',
  },
  {
    id: 'special-event-station',
    name: 'W1AW/6',
    description: '24 hours of operating, GOTA',
    boothName: '',
    location: [55],
    type: 'pacificon-activity',
    color: '#7ABB33',
    url: 'https://www.pacificon.org/events/special=event-station',
  },
  {
    id: 'pacificon-will-call',
    name: 'WILL-CALL',
    description: '',
    boothName: '',
    location: [89],
    type: 'pacificon-activity',
    color: '#7ABB33',
    url: 'https://www.pacificon.org/registration/attendees',
  },
  {
    id: 'pacificon-registration',
    name: 'REGISTRATION',
    description: '',
    boothName: '',
    location: [90],
    type: 'pacificon-activity',
    color: '#7ABB33',
    url: 'https://www.pacificon.org/registration',
  },
  {
    id: 'pacificon-prize-booth',
    name: 'PACIFICON PRIZE BOOTH',
    description: '',
    boothName: '',
    location: [91],
    type: 'pacificon-activity',
    color: '#7ABB33',
    url: 'https://www.pacificon.org',
  },
  {
    id: 'cc-salon-2',
    name: 'Contra Costa Ballroom Salon 2',
    description: 'forums',
    boothName: '',
    location: [57],
    type: 'pacificon-activity',
    color: '#7ABB33',
    url: 'https://www.pacificon.org/schedule-forums',
  },
  {
    id: 'bishop-ranch-salon-e',
    name: 'Bishop Ranch Salon E',
    description: 'forums',
    boothName: '',
    location: [58],
    type: 'pacificon-activity',
    color: '#7ABB33',
    url: 'https://www.pacificon.org/schedule-forums',
  },
  {
    id: 'bishop-ranch-salon-f',
    name: 'Bishop Ranch Salon F',
    description: 'forums',
    boothName: '',
    location: [59],
    type: 'pacificon-activity',
    color: '#7ABB33',
    url: 'https://www.pacificon.org/schedule-forums',
  },
  {
    id: 'bishop-ranch-salon-g',
    name: 'Bishop Ranch Salon G',
    description: 'forums',
    boothName: '',
    location: [60],
    type: 'pacificon-activity',
    color: '#7ABB33',
    url: 'https://www.pacificon.org/schedule-forums',
  },
  {
    id: 'bishop-ranch-salon-h',
    name: 'Bishop Ranch Salon H',
    description: 'forums',
    boothName: '',
    location: [61],
    type: 'pacificon-activity',
    color: '#7ABB33',
    url: 'https://www.pacificon.org/schedule-forums',
  },
  {
    id: 'san-ramon-boardroom',
    name: 'San Ramon Boardroom',
    description: 'forums',
    boothName: '',
    location: [62],
    type: 'pacificon-activity',
    color: '#7ABB33',
    url: 'https://www.pacificon.org/schedule-forums',
  },
  {
    id: 'pleasanton',
    name: 'Pleasanton',
    description: 'forums',
    boothName: '',
    location: [63],
    type: 'pacificon-activity',
    color: '#7ABB33',
    url: 'https://www.pacificon.org/schedule-forums',
  },
  {
    id: 'danville',
    name: 'Danville',
    description: 'forums',
    boothName: '',
    location: [64],
    type: 'pacificon-activity',
    color: '#7ABB33',
    url: 'https://www.pacificon.org/schedule-forums',
  },
  {
    id: 'bishop-ranch-restrooms',
    name: 'Restrooms',
    boothName: '',
    description: '',
    location: [56],
    type: 'pacificon-activity',
    color: '#ffffff',
    url: '',
  },
];

export const mapBooths: [string, Booth[]] = [
  '/pacificon-exhibitors-2025.jpg', [
    {
      id: 1,
      coords: [[1, 3], [57, 3], [57, 90], [1, 90]], // Bottom Left
      locationZone: 'b',
    },
  ],

];

export const mapRooms: [string, Room[]] = [
  '/pacificon-hotel-2025.jpg', [
    //origHeightNum: 1201,
    //origWidthNum: 983,
    {
      name: 'Registration',
      coords: [[1, 3], [57, 3], [57, 90], [1, 90]], // Bottom Left
      color: '#10B981',
    },
    {
      name: 'Prize Booth',
      coords: [[1, 3], [57, 3], [57, 90], [1, 90]], // Bottom Left
      color: '#10B981',
    },
    {
      name: 'W1AW/6',
      coords: [[1, 3], [57, 3], [57, 90], [1, 90]], // Bottom Left
      color: '#10B981',
    },
    {
      name: 'Expo',
      coords: [[1, 3], [57, 3], [57, 90], [1, 90]], // Bottom Left
      color: '#10B981',
    },
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
      name: 'Grand Ballroom, E, F, G & H Combined',
      coords: [[57, 311], [214, 311], [214, 488], [57, 488]],
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
      name: 'Restrooms-Bishop-Hallway',
      coords: [[8, 488], [34, 488], [34, 531], [8, 531]],
      color: '#005CF6',
    },
    {
      name: 'Restrooms-Bar',
      coords: [[8, 488], [34, 488], [34, 531], [8, 531]],
      color: '#005CF6',
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
    name: 'Grand Ballroom, E, F, G & H Combined',
    coords: [[57, 311], [214, 311], [214, 488], [57, 488]],
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
    title: 'Building Your Own Station II',
    description: 'Tips for setting up a home station, from selecting equipment to installation and grounding.',
    speaker: ['Tom Harris, W6TH'],
    location: 'Room 101',
    startTime: '2026-10-18T09:00:00',
    endTime: '2026-10-18T10:30:00',
    category: 'Technical',
    track: 'Station Building'
  },
  {
    id: 'session-12',
    title: 'Gettings Started with Ham Radio',
    description: 'An introduction to amateur radio for new license holders. Topics include choosing equipment, first contacts and local clubs.',
    speaker: ['Gordon West, WB6NOA'],
    location: 'Grand Ballroom',
    startTime: '2026-10-16T09:00:00',
    endTime: '2026-10-16T10:00:00',
    category: 'Getting Started',
    track: ''
  },
];

// map images - in production these may be bundled images
export const sampleMaps: MapImage[] = [
  {
    id: 'map-1',
    name: 'Hotel',
    url: '/pacificon-hotel-2025.jpg',
    //floor: '1',
    order: 1,
    origHeightNum: 1201,
    origWidthNum: 983,
  },
  {
    id: 'map-2',
    name: 'Exhibitors',
    url: '/pacificon-exhibitors-2025.png',
    //floor: '2',
    order: 2,
    origHeightNum: 1702,
    origWidthNum: 1280,
  },
  //{
  //  id: 'map-3',
  //  url: '/hamfest-parking-map-20260101.jpg',
  //  order: 3,
  //},
  //{
  //  id: 'map-4',
  //  name: 'Hamfest Layout',
  //  url: '/hamfest-layout-2026.png',
  //  order: 4,
  //},
  //{
  //  id: 'map-5',
  //  name: 'Hamcation Site',
  //  url: '/hamcation-map-2026.png',
  //  order: 5,
  //},
  {
    id: 'map-6',
    name: 'Forums',
    url: '/pacificon-forums-2025.jpg',
    //floor: '2',
    order: 6,
    origHeightNum: 256,
    origWidthNum: 582,
  },
];

