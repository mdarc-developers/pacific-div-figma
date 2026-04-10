import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConferenceProvider } from "@/app/contexts/ConferenceContext";
import { SearchProvider } from "@/app/contexts/SearchContext";
import { MapImage, Room } from "@/types/conference";

// ── Mock Firebase so BookmarkCountsContext initialises without credentials ────
vi.mock("@/lib/firebase", () => ({
  auth: {
    onAuthStateChanged: vi.fn((_a: unknown, cb: (u: null) => void) => {
      cb(null);
      return () => {};
    }),
  },
  db: {},
  storage: {},
}));

vi.mock("firebase/firestore", async (importOriginal) => {
  const actual = await importOriginal<typeof import("firebase/firestore")>();
  return {
    ...actual,
    getDoc: vi.fn().mockResolvedValue({ exists: () => false }),
    setDoc: vi.fn().mockResolvedValue(undefined),
    doc: vi.fn(),
    increment: vi.fn((n: number) => n),
  };
});

// ── Mock useMdarcDeveloper so it doesn't pull in Firebase ─────────────────────
const mockUseMdarcDeveloper = vi.fn(() => false);
vi.mock("@/app/hooks/useMdarcDeveloper", () => ({
  useMdarcDeveloper: () => mockUseMdarcDeveloper(),
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
let capturedCategoryFilter: string | undefined;
let capturedTrackFilter: string | undefined;
let capturedNotes: Record<string, string> | undefined;
let capturedOnSaveNote: ((id: string, text: string) => void) | undefined;
vi.mock("@/app/components/ScheduleView", () => ({
  ScheduleView: ({
    categoryFilter,
    trackFilter,
    notes,
    onSaveNote,
  }: {
    categoryFilter?: string;
    trackFilter?: string;
    notes?: Record<string, string>;
    onSaveNote?: (id: string, text: string) => void;
  }) => {
    capturedCategoryFilter = categoryFilter;
    capturedTrackFilter = trackFilter;
    capturedNotes = notes;
    capturedOnSaveNote = onSaveNote;
    return <div data-testid="schedule-view" />;
  },
}));

// ── Mock SESSION_DATA so category filter tests are deterministic ──────────────
vi.mock("@/lib/supplementalData", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("@/lib/supplementalData")>();
  return {
    ...original,
    // Add category to the hamvention forums map so developer panel tests can
    // verify that JSON.stringify(mapImg?.category) is rendered correctly.
    MAP_DATA: {
      ...original.MAP_DATA,
      "hamvention-2026": (original.MAP_DATA["hamvention-2026"] ?? []).map(
        (m) =>
          m.url === "/assets/maps/hamvention-forums-2026-2.png"
            ? { ...m, category: ["Forums"] }
            : m,
      ),
    },
    SESSION_DATA: {
      ...original.SESSION_DATA,
      // Override hamvention-2026 (default conference) with tracked forum sessions
      // so isMdarcDeveloper category filter tests are deterministic.
      "hamvention-2026": [
        {
          id: "test-s1",
          title: "Test Forum Digital",
          description: "",
          speaker: [],
          location: "Room A",
          startTime: "2026-05-15T09:00:00",
          endTime: "2026-05-15T10:00:00",
          category: "Forums",
          track: ["Digital"],
        },
        {
          id: "test-s2",
          title: "Test Forum QRP",
          description: "",
          speaker: [],
          location: "Room A",
          startTime: "2026-05-15T09:00:00",
          endTime: "2026-05-15T10:00:00",
          category: "Forums",
          track: ["QRP"],
        },
        {
          id: "test-s3",
          title: "Test Forum AI",
          description: "",
          speaker: [],
          location: "Room B",
          startTime: "2026-05-16T09:00:00",
          endTime: "2026-05-16T10:00:00",
          category: "Forums",
          track: ["Digital", "AI"],
        },
        {
          id: "test-s4",
          title: "Test Event",
          description: "",
          speaker: [],
          location: "Room C",
          startTime: "2026-05-15T09:00:00",
          endTime: "2026-05-15T10:00:00",
          category: "Events",
          track: [],
        },
      ],
    },
  };
});

// Static import — vi.mock calls above are hoisted before this by Vitest
import { ForumsPage } from "@/app/pages/ForumsPage";
import { BookmarkProvider } from "@/app/contexts/BookmarkContext";
import { BookmarkCountsProvider } from "@/app/contexts/BookmarkCountsContext";
import { NotesProvider } from "@/app/contexts/NotesContext";
import { SessionVoteProvider } from "@/app/contexts/SessionVoteContext";
import { VoteCountsProvider } from "@/app/contexts/VoteCountsContext";

// ── Pin the active conference to hamvention-2026 for all tests in this file ───
// The mock for SESSION_DATA and MAP_DATA targets hamvention-2026, and the
// developer-panel tests require the mapSessionRooms that hamvention-2026 carries
// from its supplemental session file.  Without this, ConferenceProvider would
// default to the first conference in allConferences (loomis-2026), which has no
// sessions or maps, causing all category-filter and developer-panel tests to fail.
beforeEach(() => {
  localStorage.setItem("activeConference", "hamvention-2026");
});

afterEach(() => {
  localStorage.removeItem("activeConference");
});

// ── Helpers ──────────────────────────────────────────────────────────────────
function renderForumsPage() {
  return render(
    <ConferenceProvider>
      <BookmarkProvider>
        <BookmarkCountsProvider>
          <SessionVoteProvider>
            <VoteCountsProvider>
              <NotesProvider>
                <SearchProvider>
                  <ForumsPage />
                </SearchProvider>
              </NotesProvider>
            </VoteCountsProvider>
          </SessionVoteProvider>
        </BookmarkCountsProvider>
      </BookmarkProvider>
    </ConferenceProvider>,
  );
}

// ── Tests ────────────────────────────────────────────────────────────────────
describe("ForumsPage", () => {
  beforeEach(() => {
    mockUseMdarcDeveloper.mockReturnValue(false);
  });

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

  it("passes categoryFilter='forums' to ScheduleView", () => {
    capturedCategoryFilter = undefined;
    renderForumsPage();
    expect(capturedCategoryFilter).toBe("forums");
  });

  it("does not pass trackFilter to ScheduleView when no track is selected", () => {
    capturedTrackFilter = undefined;
    renderForumsPage();
    expect(capturedTrackFilter).toBeUndefined();
  });

  it("renders category filter panel for all users when forumTracks exist", () => {
    renderForumsPage();
    expect(screen.getByText("Filter by category:")).toBeInTheDocument();
  });

  it("passes notes to ScheduleView", () => {
    capturedNotes = undefined;
    renderForumsPage();
    expect(capturedNotes).toBeDefined();
  });

  it("passes onSaveNote to ScheduleView", () => {
    capturedOnSaveNote = undefined;
    renderForumsPage();
    expect(capturedOnSaveNote).toBeInstanceOf(Function);
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

// ── multi-map Forums category filter ─────────────────────────────────────────
describe("multi-map Forums category filter (numSRurls > 1)", () => {
  const forumsMap: MapImage = {
    id: "map-forum",
    name: "Forums",
    url: "/assets/maps/pacificon-forums-2025.jpg",
    order: 3,
    origHeightNum: 256,
    origWidthNum: 582,
    category: ["Forums"],
  };

  const hotelMap: MapImage = {
    id: "map-hotel",
    name: "Hotel",
    url: "/assets/maps/pacificon-hotel-2025.jpg",
    order: 1,
    origHeightNum: 1201,
    origWidthNum: 983,
    category: ["Hotel"],
  };

  const noCategoryMap: MapImage = {
    id: "map-nocategory",
    name: "Uncategorised",
    url: "/assets/maps/pacificon-other-2025.jpg",
    order: 2,
    origHeightNum: 500,
    origWidthNum: 500,
  };

  const maps: MapImage[] = [forumsMap, hotelMap, noCategoryMap];

  const roomEntries: [string, Room[]][] = [
    [forumsMap.url, []],
    [hotelMap.url, []],
    [noCategoryMap.url, []],
  ];

  it("only includes entries whose MapImage has category 'Forums'", () => {
    const filtered = roomEntries.filter(([roomUrl]) => {
      const mapImg = maps.find((m) => m.url === roomUrl);
      return mapImg?.category?.includes("Forums");
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0][0]).toBe(forumsMap.url);
  });

  it("excludes entries whose MapImage category does not include 'Forums'", () => {
    const filtered = roomEntries.filter(([roomUrl]) => {
      const mapImg = maps.find((m) => m.url === roomUrl);
      return mapImg?.category?.includes("Forums");
    });
    const urls = filtered.map(([url]) => url);
    expect(urls).not.toContain(hotelMap.url);
    expect(urls).not.toContain(noCategoryMap.url);
  });

  it("excludes entries whose MapImage has no category array", () => {
    const filtered = roomEntries.filter(([roomUrl]) => {
      const mapImg = maps.find((m) => m.url === roomUrl);
      return mapImg?.category?.includes("Forums");
    });
    const urls = filtered.map(([url]) => url);
    expect(urls).not.toContain(noCategoryMap.url);
  });

  it("returns empty when no MapImage has category 'Forums'", () => {
    const nonForumsMaps: MapImage[] = [hotelMap, noCategoryMap];
    const filtered = roomEntries.filter(([roomUrl]) => {
      const mapImg = nonForumsMaps.find((m) => m.url === roomUrl);
      return mapImg?.category?.includes("Forums");
    });
    expect(filtered).toHaveLength(0);
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

// ── isMdarcDeveloper category filter panel ───────────────────────────────────
describe("isMdarcDeveloper category filter panel", () => {
  beforeEach(() => {
    mockUseMdarcDeveloper.mockReturnValue(true);
  });

  afterEach(() => {
    mockUseMdarcDeveloper.mockReturnValue(false);
  });

  it("renders category filter panel when isMdarcDeveloper is true and tracks exist", () => {
    renderForumsPage();
    expect(screen.queryByText("Filter by category:")).not.toBeNull();
  });

  it("renders an 'All' button in the category filter panel", () => {
    renderForumsPage();
    expect(screen.getByRole("button", { name: "All" })).toBeInTheDocument();
  });

  it("does not pass trackFilter when 'All' is selected (default)", () => {
    capturedTrackFilter = "something";
    renderForumsPage();
    expect(capturedTrackFilter).toBeUndefined();
  });

  it("passes trackFilter to ScheduleView when a track button is clicked", () => {
    renderForumsPage();
    const digitalBtn = screen.getByRole("button", { name: "Digital" });
    fireEvent.click(digitalBtn);
    expect(capturedTrackFilter).toBe("Digital");
  });

  it("clears trackFilter when the active track is clicked again", () => {
    renderForumsPage();
    const digitalBtn = screen.getByRole("button", { name: "Digital" });
    fireEvent.click(digitalBtn);
    expect(capturedTrackFilter).toBe("Digital");
    fireEvent.click(digitalBtn);
    expect(capturedTrackFilter).toBeUndefined();
  });

  it("changes trackFilter when a different track is selected", () => {
    renderForumsPage();
    fireEvent.click(screen.getByRole("button", { name: "Digital" }));
    expect(capturedTrackFilter).toBe("Digital");
    fireEvent.click(screen.getByRole("button", { name: "QRP" }));
    expect(capturedTrackFilter).toBe("QRP");
  });

  it("clicking 'All' clears the trackFilter", () => {
    renderForumsPage();
    fireEvent.click(screen.getByRole("button", { name: "Digital" }));
    expect(capturedTrackFilter).toBe("Digital");
    fireEvent.click(screen.getByRole("button", { name: "All" }));
    expect(capturedTrackFilter).toBeUndefined();
  });
});

// ── isMdarcDeveloper developer panel counter and categories ───────────────────
describe("isMdarcDeveloper developer panel counter and categories", () => {
  beforeEach(() => {
    mockUseMdarcDeveloper.mockReturnValue(true);
  });

  afterEach(() => {
    mockUseMdarcDeveloper.mockReturnValue(false);
  });

  it("renders a counter starting at #1 before the URL", () => {
    renderForumsPage();
    expect(screen.getByText(/#1 URL:/)).toBeInTheDocument();
  });

  it("renders JSON-stringified category from the matching MapImage", () => {
    renderForumsPage();
    expect(screen.getByText(/Categories:.*\["Forums"\]/)).toBeInTheDocument();
  });
});
