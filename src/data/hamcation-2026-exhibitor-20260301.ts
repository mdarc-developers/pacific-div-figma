import { Exhibitor } from "@/types/conference";

export const mapExhibitors: [string, Exhibitor[]] = [
  "/assets/maps/hamcation-2026-north.png",
  [
    {
      id: "arrl",
      name: "ARRL",
      description: "American Radio Relay League",
      boothName: "4  5",
      location: [4, 5],
      type: "vendor-booth",
      color: "#77cff4",
      url: "https://www.arrl.org",
    },
    {
      id: "exhibitor-unitrend",
      name: "Uni-Trend Technology US Inc",
      description:
        "worlds most renowned test and measurement solutions providers",
      boothName: "1  2  3",
      location: [1, 2, 3],
      type: "vendor-booth",
      color: "#77cff4",
      url: "https://www.uni-trendus.com",
    },
    {
      id: "exhibitor-platinum",
      name: "Platinum Coast Amateur Radio Society",
      description: "Cables, Connectors, LEDs and Adapters",
      boothName: "4",
      location: [4],
      color: "#77cff4",
      type: "vendor",
      url: "https://www.pcards.org",
    },
    {
      id: "exhibitor-w5yi",
      name: "W5YI Licensing Services Inc",
      description: "licensing",
      boothName: "5  6",
      location: [5, 6],
      type: "nonprofit",
      color: "#77cff4",
      url: "https://www.w5yi-vec.org",
    },
  ],
];
