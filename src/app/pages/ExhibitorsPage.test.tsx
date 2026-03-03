import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ConferenceProvider } from "@/app/contexts/ConferenceContext";
import { MapImage, Booth, Exhibitor } from "@/types/conference";

// ── Mock useMdarcDeveloper so it doesn't pull in Firebase ─────────────────────
vi.mock("@/app/hooks/useMdarcDeveloper", () => ({
  useMdarcDeveloper: () => false,
}));

// ── Mock Leaflet ─────────────────────────────────────────────────────────────
const mockLeafletMap = {
  on: vi.fn(),
  fitBounds: vi.fn(),
  remove: vi.fn(),
  invalidateSize: vi.fn(),
};
const mockPolygon = {
  addTo: vi.fn().mockReturnThis(),
  bindPopup: vi.fn().mockReturnThis(),
  on: vi.fn().mockReturnThis(),
  setStyle: vi.fn(),
  openPopup: vi.fn(),
  getBounds: vi.fn(() => ({})),
};
vi.mock("leaflet", () => ({
  default: {
    map: vi.fn(() => mockLeafletMap),
    CRS: { Simple: {} },
    imageOverlay: vi.fn(() => ({ addTo: vi.fn() })),
    polygon: vi.fn(() => mockPolygon),
  },
}));

// ── Mock ExhibitorView ────────────────────────────────────────────────────────
vi.mock("@/app/components/ExhibitorView", () => ({
  ExhibitorView: () => <div data-testid="exhibitor-view" />,
}));

// Static import — vi.mock calls above are hoisted before this by Vitest
import { ExhibitorsPage } from "@/app/pages/ExhibitorsPage";

// ── Helpers ──────────────────────────────────────────────────────────────────
function renderExhibitorsPage() {
  return render(
    <ConferenceProvider>
      <ExhibitorsPage />
    </ConferenceProvider>,
  );
}

// ── Tests ────────────────────────────────────────────────────────────────────
describe("ExhibitorsPage", () => {
  it("renders without crashing", () => {
    expect(() => renderExhibitorsPage()).not.toThrow();
  });

  it("renders the map container div", () => {
    renderExhibitorsPage();
    const container = document.querySelector(".block");
    expect(container).not.toBeNull();
  });

  it("renders ExhibitorView", () => {
    renderExhibitorsPage();
    expect(screen.getByTestId("exhibitor-view")).toBeInTheDocument();
  });
});

// ── exhibitorsMap selection logic ─────────────────────────────────────────────
describe("exhibitorsMap selection", () => {
  const exhibitorsMap: MapImage = {
    id: "map-exhibitors",
    name: "Exhibitors",
    url: "/assets/maps/pacificon-exhibitors-2025.png",
    order: 2,
    origHeightNum: 256,
    origWidthNum: 582,
  };

  const hotelMap: MapImage = {
    id: "map-hotel",
    name: "Hotel",
    url: "/assets/maps/pacificon-hotel-2025.jpg",
    order: 1,
    origHeightNum: 1201,
    origWidthNum: 983,
  };

  const boothEntry: [string, Booth[]] = [
    "/assets/maps/pacificon-exhibitors-2025.png",
    [
      {
        id: 101,
        coords: [
          [0, 0],
          [10, 0],
          [10, 10],
          [0, 10],
        ],
        locationZone: "A",
      },
    ],
  ];

  it("selects the map whose URL matches the boothEntry URL", () => {
    const maps: MapImage[] = [hotelMap, exhibitorsMap];
    const [boothUrl] = boothEntry;
    const selected = maps.find((m) => m.url === boothUrl);
    expect(selected?.id).toBe("map-exhibitors");
  });

  it("returns undefined when no conferenceMaps entry matches the URL", () => {
    const maps: MapImage[] = [hotelMap]; // exhibitorsMap is absent
    const [boothUrl] = boothEntry;
    const selected = maps.find((m) => m.url === boothUrl);
    expect(selected).toBeUndefined();
  });

  it("returns undefined when conferenceMaps is empty", () => {
    const maps: MapImage[] = [];
    const [boothUrl] = boothEntry;
    const selected = maps.find((m) => m.url === boothUrl);
    expect(selected).toBeUndefined();
  });
});

// ── multi-map boothEntries iteration ─────────────────────────────────────────
describe("multi-map boothEntries iteration", () => {
  const exhibitorsMap: MapImage = {
    id: "map-exhibitors",
    name: "Exhibitors",
    url: "/assets/maps/pacificon-exhibitors-2025.png",
    order: 2,
    origHeightNum: 256,
    origWidthNum: 582,
  };

  const outdoorMap: MapImage = {
    id: "map-outdoor",
    name: "Outdoor",
    url: "/assets/maps/pacificon-outdoor-2025.png",
    order: 3,
    origHeightNum: 400,
    origWidthNum: 600,
  };

  const indoorBooths: Booth[] = [
    {
      id: 101,
      coords: [
        [0, 0],
        [10, 0],
        [10, 10],
        [0, 10],
      ],
      locationZone: "A",
    },
  ];

  const outdoorBooths: Booth[] = [
    {
      id: 201,
      coords: [
        [5, 5],
        [15, 5],
        [15, 15],
        [5, 15],
      ],
      locationZone: "B",
    },
  ];

  const boothEntries: [string, Booth[]][] = [
    [exhibitorsMap.url, indoorBooths],
    [outdoorMap.url, outdoorBooths],
  ];

  const maps: MapImage[] = [exhibitorsMap, outdoorMap];

  it("each boothUrl resolves to its own distinct booth list", () => {
    boothEntries.forEach(([boothUrl, boothList]) => {
      const mapImg = maps.find((m) => m.url === boothUrl);
      expect(mapImg).toBeDefined();
      if (boothUrl === exhibitorsMap.url) {
        expect(mapImg?.id).toBe("map-exhibitors");
        expect(boothList).toBe(indoorBooths);
      } else {
        expect(mapImg?.id).toBe("map-outdoor");
        expect(boothList).toBe(outdoorBooths);
      }
    });
  });

  it("indoor boothUrl does not receive outdoor booths", () => {
    const [indoorUrl, indoorBoothList] = boothEntries[0];
    expect(indoorUrl).toBe(exhibitorsMap.url);
    expect(indoorBoothList).not.toBe(outdoorBooths);
    expect(indoorBoothList[0].id).toBe(101);
  });

  it("outdoor boothUrl does not receive indoor booths", () => {
    const [outdoorUrl, outdoorBoothList] = boothEntries[1];
    expect(outdoorUrl).toBe(outdoorMap.url);
    expect(outdoorBoothList).not.toBe(indoorBooths);
    expect(outdoorBoothList[0].id).toBe(201);
  });
});

// ── exhibitor fallback matching logic ────────────────────────────────────────
describe("exhibitor fallback matching logic", () => {
  const boothUrl = "/assets/maps/pacificon-exhibitors-2025.png";
  const otherUrl = "/assets/maps/pacificon-outdoor-2025.png";

  const booths: Booth[] = [
    { id: 101, coords: [[0, 0]], locationZone: "A" },
    { id: 102, coords: [[0, 0]], locationZone: "A" },
  ];

  const exhibitorOnThisMap: Exhibitor = {
    id: "ex-1",
    name: "ARRL",
    description: "National organization",
    boothName: "101",
    location: [101],
  };

  const exhibitorOnOtherMap: Exhibitor = {
    id: "ex-2",
    name: "Other Vendor",
    description: "Outdoor vendor",
    boothName: "201",
    location: [201],
  };

  it("returns exhibitors matching the declared URL directly", () => {
    const exhibitorEntry: [string, Exhibitor[]] = [
      boothUrl,
      [exhibitorOnThisMap, exhibitorOnOtherMap],
    ];
    const result =
      exhibitorEntry[0] === boothUrl ? exhibitorEntry[1] : undefined;
    expect(result).toContain(exhibitorOnThisMap);
  });

  it("falls back to booth-ID match when exhibitor URL differs", () => {
    const exhibitorEntry: [string, Exhibitor[]] = [
      otherUrl,
      [exhibitorOnThisMap, exhibitorOnOtherMap],
    ];
    const boothIds = new Set(booths.map((b) => b.id));
    const fallback = exhibitorEntry[1].filter((ex) =>
      ex.location.some((loc) => boothIds.has(loc)),
    );
    expect(fallback).toContain(exhibitorOnThisMap);
    expect(fallback).not.toContain(exhibitorOnOtherMap);
  });

  it("returns empty array when exhibitorEntry is absent", () => {
    const exhibitorEntry: [string, Exhibitor[]] | undefined = undefined;
    const result = exhibitorEntry ? exhibitorEntry[1] : [];
    expect(result).toHaveLength(0);
  });
});
