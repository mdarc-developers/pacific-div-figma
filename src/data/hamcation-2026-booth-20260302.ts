import { Booth } from "@/types/conference";

export const mapBooths: [string, Booth[]] = [
  "/assets/maps/hamcation-2026-eastwest.png",
  [
    {
      id: 101,
      coords: [
        [296, 8],
        [328, 8],
        [328, 39],
        [296, 39],
      ],
      locationZone: "eastwest",
    },
    {
      id: 102,
      coords: [
        [295, 41],
        [328, 41],
        [328, 73],
        [295, 73],
      ],
      locationZone: "eastwest",
    },
    {
      id: 103,
      coords: [
        [295, 74],
        [328, 74],
        [328, 106],
        [295, 106],
      ],
      locationZone: "eastwest",
    },
  ],
];
