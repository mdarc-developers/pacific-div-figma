import { Room } from "@/types/conference";

export const mapRooms: [string, Room[]] = [
  "/assets/maps/huntsville-embassysuites.png",
  [
    {
      name: "Embassy BigSpringD",
      coords: [
        [13, 283],
        [197, 283],
        [197, 373],
        [13, 373],
      ],
      color: "#457B9D", // steel blue
    },
    {
      name: "Embassy Madison",
      coords: [
        [74, 437],
        [136, 437],
        [136, 507],
        [74, 507],
      ],
      color: "#F4A261", // Orange
    },
    {
      name: "Embassy Redstone",
      coords: [
        [14, 437],
        [74, 437],
        [74, 506],
        [14, 506],
      ],
      color: "#E9C46A", // yellow
    },
    {
      name: "Embassy 4", // ??? Monte Santo Boardroom instead
      coords: [
        [135, 437],
        [196, 437],
        [196, 506],
        [135, 506],
      ],
      color: "#6A4C93", // Purple
    },
  ],
];
