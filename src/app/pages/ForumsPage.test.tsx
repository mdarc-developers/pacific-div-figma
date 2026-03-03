import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ConferenceProvider } from "@/app/contexts/ConferenceContext";
import { SearchProvider } from "@/app/contexts/SearchContext";
import { MapImage, Room } from "@/types/conference";

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

// ── Mock ScheduleView ─────────────────────────────────────────────────────────
vi.mock("@/app/components/ScheduleView", () => ({
  ScheduleView: () => <div data-testid="schedule-view" />,
}));

// Static import — vi.mock calls above are hoisted before this by Vitest
import { ForumsPage } from "@/app/pages/ForumsPage";

// ── Helpers ──────────────────────────────────────────────────────────────────
function renderForumsPage() {
  return render(
    <ConferenceProvider>
      <SearchProvider>
        <ForumsPage />
      </SearchProvider>
    </ConferenceProvider>,
  );
}

// ── Tests ────────────────────────────────────────────────────────────────────
describe("ForumsPage", () => {
  it("renders without crashing", () => {
    expect(() => renderForumsPage()).not.toThrow();
  });

  it("renders the map container div", () => {
    renderForumsPage();
    const container = document.querySelector(".block");
    expect(container).not.toBeNull();
  });

  it("renders ScheduleView", () => {
    renderForumsPage();
    expect(screen.getByTestId("schedule-view")).toBeInTheDocument();
  });
});

// ── forumMap selection logic ──────────────────────────────────────────────────
describe("forumMap selection", () => {
  const forumsMap: MapImage = {
    id: "map-forum",
    name: "Forums",
    url: "/assets/maps/pacificon-forums-2025.jpg",
    order: 3,
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

  const roomEntry: [string, Room[]] = [
    "/assets/maps/pacificon-forums-2025.jpg",
    [
      {
        name: "Salon E",
        coords: [
          [0, 0],
          [10, 0],
          [10, 10],
          [0, 10],
        ],
        color: "#3B82F6",
      },
    ],
  ];

  it("selects the map whose URL matches the mapRooms URL", () => {
    const maps: MapImage[] = [hotelMap, forumsMap];
    const [roomUrl] = roomEntry;
    const selected = maps.find((m) => m.url === roomUrl);
    expect(selected?.id).toBe("map-forum");
  });

  it("returns undefined when no conferenceMaps entry matches the URL", () => {
    const maps: MapImage[] = [hotelMap]; // forumsMap is absent
    const [roomUrl] = roomEntry;
    const selected = maps.find((m) => m.url === roomUrl);
    expect(selected).toBeUndefined();
  });

  it("returns undefined when conferenceMaps is empty", () => {
    const maps: MapImage[] = [];
    const [roomUrl] = roomEntry;
    const selected = maps.find((m) => m.url === roomUrl);
    expect(selected).toBeUndefined();
  });
});

// ── multi-map roomEntries iteration ──────────────────────────────────────────
describe("multi-map roomEntries iteration", () => {
  const forumsMap: MapImage = {
    id: "map-forum",
    name: "Forums",
    url: "/assets/maps/pacificon-forums-2025.jpg",
    order: 3,
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

  const forumsRooms: Room[] = [
    {
      name: "Salon E",
      coords: [
        [55, 310],
        [215, 310],
        [215, 413],
        [55, 413],
      ],
      color: "#3B82F6",
    },
  ];

  const hotelRooms: Room[] = [
    {
      name: "Registration",
      coords: [
        [1, 3],
        [57, 3],
        [57, 90],
        [1, 90],
      ],
      color: "#10B981",
    },
  ];

  const roomEntries: [string, Room[]][] = [
    [forumsMap.url, forumsRooms],
    [hotelMap.url, hotelRooms],
  ];

  const maps: MapImage[] = [forumsMap, hotelMap];

  it("each roomUrl resolves to its own distinct mapRoomList", () => {
    roomEntries.forEach(([roomUrl, mapRoomList]) => {
      const mapImg = maps.find((m) => m.url === roomUrl);
      expect(mapImg).toBeDefined();
      if (roomUrl === forumsMap.url) {
        expect(mapImg?.id).toBe("map-forum");
        expect(mapRoomList).toBe(forumsRooms);
      } else {
        expect(mapImg?.id).toBe("map-hotel");
        expect(mapRoomList).toBe(hotelRooms);
      }
    });
  });

  it("forums roomUrl does not receive hotel rooms", () => {
    const [forumsUrl, forumsMapRoomList] = roomEntries[0];
    expect(forumsUrl).toBe(forumsMap.url);
    expect(forumsMapRoomList).not.toBe(hotelRooms);
    expect(forumsMapRoomList[0].name).toBe("Salon E");
  });

  it("hotel roomUrl does not receive forums rooms", () => {
    const [hotelUrl, hotelMapRoomList] = roomEntries[1];
    expect(hotelUrl).toBe(hotelMap.url);
    expect(hotelMapRoomList).not.toBe(forumsRooms);
    expect(hotelMapRoomList[0].name).toBe("Registration");
  });
});
