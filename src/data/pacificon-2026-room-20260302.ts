import {
  Room,
} from "@/types/conference";

export const mapRooms: [string, Room[]] = [
  "/assets/maps/pacificon-hotel-2025.jpg",
  // must match mapSessions URL
  //origHeightNum: 1201,
  //origWidthNum: 983,
  [
    {
      name: "Registration",
      coords: [
        [1, 3],
        [57, 3],
        [57, 90],
        [1, 90],
      ], // Bottom Left
      color: "#10B981",
    },
    {
      name: "Prize Booth",
      coords: [
        [1, 3],
        [57, 3],
        [57, 90],
        [1, 90],
      ], // Bottom Left
      color: "#10B981",
    },
    {
      name: "W1AW/6",
      coords: [
        [1, 3],
        [57, 3],
        [57, 90],
        [1, 90],
      ], // Bottom Left
      color: "#10B981",
    },
    {
      name: "Expo",
      coords: [
        [1, 3],
        [57, 3],
        [57, 90],
        [1, 90],
      ], // Bottom Left
      color: "#10B981",
    },
    {
      name: "Salon 2 (75)",
      coords: [
        [1, 3],
        [57, 3],
        [57, 90],
        [1, 90],
      ], // Bottom Left
      color: "#10B981",
    },
    {
      name: "Salon E",
      coords: [
        [55, 310],
        [215, 310],
        [215, 413],
        [55, 413],
      ], // Center-Right Large
      color: "#3B82F6",
    },
    {
      name: "Salon H",
      coords: [
        [169, 414],
        [215, 414],
        [215, 487],
        [169, 487],
      ], // Top Right Stack
      color: "#F59E0B",
    },
    {
      name: "Salon G",
      coords: [
        [109, 414],
        [168, 414],
        [168, 487],
        [109, 487],
      ], // Mid Right Stack
      color: "#F59E0B",
    },
    {
      name: "Grand Ballroom, E, F, G & H Combined",
      coords: [
        [57, 311],
        [214, 311],
        [214, 488],
        [57, 488],
      ],
      color: "#F59E0B",
    },
    {
      name: "Salon F",
      coords: [
        [55, 414],
        [108, 414],
        [108, 485],
        [55, 485],
      ], // Bottom Right Stack
      color: "#F59E0B",
    },
    {
      name: "Pleasanton",
      coords: [
        [193, 518],
        [255, 518],
        [255, 581],
        [193, 581],
      ], // Far Right Top
      color: "#8B5CF6",
    },
    {
      name: "Danville",
      coords: [
        [135, 518],
        [192, 518],
        [192, 581],
        [135, 581],
      ], // Far Right Mid
      color: "#8B5CF6",
    },
    {
      name: "San Ramon Boardroom",
      coords: [
        [58, 518],
        [134, 518],
        [134, 581],
        [58, 581],
      ], // Far Right Bottom
      color: "#8B5CF6",
    },
    {
      name: "Restrooms-Bishop-Hallway",
      coords: [
        [8, 488],
        [34, 488],
        [34, 531],
        [8, 531],
      ],
      color: "#005CF6",
    },
    {
      name: "Restrooms-Bar",
      coords: [
        [8, 488],
        [34, 488],
        [34, 531],
        [8, 531],
      ],
      color: "#005CF6",
    },
  ],
];

