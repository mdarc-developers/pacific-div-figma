import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ConferenceProvider } from "@/app/contexts/ConferenceContext";
import { Session, Exhibitor } from "@/types/conference";
import { SearchResult, ExhibitorSearchResult } from "@/services/searchService";

// ── Mock supplementalData so tests run without the full generated dataset ──────────
vi.mock("@/lib/supplementalData", () => ({
  SESSION_DATA: {},
  EXHIBITOR_DATA: {},
}));

// ── Hoisted mocks (accessible inside vi.mock factories) ───────────────────────
const {
  mockBuildIndex,
  mockBuildExhibitorIndex,
  mockSearch,
  mockSearchExhibitors,
  mockNavigate,
} = vi.hoisted(() => ({
  mockBuildIndex: vi.fn(),
  mockBuildExhibitorIndex: vi.fn(),
  mockSearch: vi.fn<() => SearchResult[]>(() => []),
  mockSearchExhibitors: vi.fn<() => ExhibitorSearchResult[]>(() => []),
  mockNavigate: vi.fn(),
}));

// ── Mock searchService to control search results ──────────────────────────────
vi.mock("@/services/searchService", () => ({
  searchService: {
    buildIndex: mockBuildIndex,
    buildExhibitorIndex: mockBuildExhibitorIndex,
    search: mockSearch,
    searchExhibitors: mockSearchExhibitors,
  },
}));

// ── Mock useNavigate so navigation can be asserted ────────────────────────────
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return { ...actual, useNavigate: () => mockNavigate };
});

// ── Static import after vi.mock hoisting ──────────────────────────────────────
import { SearchBar } from "@/app/components/SearchBar";

// ── Fixtures ──────────────────────────────────────────────────────────────────
const makeSession = (overrides: Partial<Session> = {}): Session => ({
  id: "s1",
  title: "Intro to Ham Radio",
  description: "A beginner session",
  speaker: ["Alice"],
  location: "Room A",
  startTime: "2026-10-16T09:00:00",
  endTime: "2026-10-16T10:00:00",
  category: "Beginner",
  ...overrides,
});

const makeExhibitor = (overrides: Partial<Exhibitor> = {}): Exhibitor => ({
  id: "e1",
  name: "Radio World",
  type: "Vendor",
  description: "Ham radio equipment",
  boothName: "e1",
  location: [55],
  ...overrides,
});

// ── Render helper ─────────────────────────────────────────────────────────────
function renderSearchBar(props: React.ComponentProps<typeof SearchBar> = {}) {
  return render(
    <MemoryRouter>
      <ConferenceProvider>
        <SearchBar {...props} />
      </ConferenceProvider>
    </MemoryRouter>,
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("SearchBar — rendering", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      vi.runAllTimers();
    });
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("renders without crashing", () => {
    expect(() => renderSearchBar()).not.toThrow();
  });

  it("renders the search input", () => {
    renderSearchBar();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("uses the default placeholder text", () => {
    renderSearchBar();
    expect(
      screen.getByPlaceholderText("Search schedule, forums, exhibitors..."),
    ).toBeInTheDocument();
  });

  it("accepts a custom placeholder via placeholderProp", () => {
    renderSearchBar({ placeholderProp: "Find something..." });
    expect(
      screen.getByPlaceholderText("Find something..."),
    ).toBeInTheDocument();
  });

  it("does not show the clear button when the input is empty", () => {
    renderSearchBar();
    expect(
      screen.queryByRole("button", { name: /clear search/i }),
    ).not.toBeInTheDocument();
  });

  it("does not show results dropdown on initial render", () => {
    renderSearchBar();
    expect(screen.queryByText(/no results found/i)).not.toBeInTheDocument();
  });
});

describe("SearchBar — clear button", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      vi.runAllTimers();
    });
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("shows the clear button after typing into the input", () => {
    renderSearchBar();
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "radio" },
    });
    expect(
      screen.getByRole("button", { name: /clear search/i }),
    ).toBeInTheDocument();
  });

  it("clears the input and hides the clear button when clicked", () => {
    renderSearchBar();
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "radio" } });

    fireEvent.click(screen.getByRole("button", { name: /clear search/i }));

    expect((input as HTMLInputElement).value).toBe("");
    expect(
      screen.queryByRole("button", { name: /clear search/i }),
    ).not.toBeInTheDocument();
  });

  it("calls onSearch with an empty array when the input is cleared", () => {
    const onSearch = vi.fn();
    renderSearchBar({ onSearch });
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "radio" } });

    fireEvent.click(screen.getByRole("button", { name: /clear search/i }));

    // Advance timer so the debounced search for "" fires
    act(() => {
      vi.runAllTimers();
    });
    expect(onSearch).toHaveBeenCalledWith([]);
  });
});

describe("SearchBar — search results", () => {
  const session = makeSession();
  const exhibitor = makeExhibitor();
  const sessionResult: SearchResult = { session, score: 0.1 };
  const exhibitorResult: ExhibitorSearchResult = { exhibitor, score: 0.1 };

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      vi.runAllTimers();
    });
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("shows session result titles after debounce", () => {
    mockSearch.mockReturnValue([sessionResult]);
    mockSearchExhibitors.mockReturnValue([]);
    renderSearchBar();

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "radio" },
    });
    act(() => {
      vi.runAllTimers();
    });

    expect(screen.getByText("Intro to Ham Radio")).toBeInTheDocument();
  });

  it("shows exhibitor result names after debounce", () => {
    mockSearch.mockReturnValue([]);
    mockSearchExhibitors.mockReturnValue([exhibitorResult]);
    renderSearchBar();

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "radio" },
    });
    act(() => {
      vi.runAllTimers();
    });

    expect(screen.getByText("Radio World")).toBeInTheDocument();
  });

  it("does not show a results dropdown when there are no matches", () => {
    mockSearch.mockReturnValue([]);
    mockSearchExhibitors.mockReturnValue([]);
    renderSearchBar();

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "zzznomatch" },
    });
    act(() => {
      vi.runAllTimers();
    });

    // The dropdown is only opened when results exist, so no results panel appears
    expect(screen.queryByText(/no results found for/i)).not.toBeInTheDocument();
  });

  it("calls onSearch with session results after debounce", () => {
    const onSearch = vi.fn();
    mockSearch.mockReturnValue([sessionResult]);
    mockSearchExhibitors.mockReturnValue([]);
    renderSearchBar({ onSearch });

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "radio" },
    });
    act(() => {
      vi.runAllTimers();
    });

    expect(onSearch).toHaveBeenCalledWith([sessionResult]);
  });

  it("hides the dropdown after clearing the input", () => {
    mockSearch.mockReturnValue([sessionResult]);
    mockSearchExhibitors.mockReturnValue([]);
    renderSearchBar();

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "radio" },
    });
    act(() => {
      vi.runAllTimers();
    });
    expect(screen.getByText("Intro to Ham Radio")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /clear search/i }));
    expect(screen.queryByText("Intro to Ham Radio")).not.toBeInTheDocument();
  });
});

describe("SearchBar — result selection", () => {
  const session = makeSession();
  const exhibitor = makeExhibitor();
  const sessionResult: SearchResult = { session, score: 0.1 };
  const exhibitorResult: ExhibitorSearchResult = { exhibitor, score: 0.1 };

  beforeEach(() => {
    vi.useFakeTimers();
    mockNavigate.mockReset();
  });

  afterEach(() => {
    act(() => {
      vi.runAllTimers();
    });
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("calls onSelectSession and navigates when a session result is clicked", () => {
    const onSelectSession = vi.fn();
    mockSearch.mockReturnValue([sessionResult]);
    mockSearchExhibitors.mockReturnValue([]);
    renderSearchBar({ onSelectSession });

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "radio" },
    });
    act(() => {
      vi.runAllTimers();
    });

    fireEvent.click(screen.getByText("Intro to Ham Radio"));
    expect(onSelectSession).toHaveBeenCalledWith(session);
    expect(mockNavigate).toHaveBeenCalledWith("/search?highlight=s1");
  });

  it("clears the input after selecting a session result", () => {
    mockSearch.mockReturnValue([sessionResult]);
    mockSearchExhibitors.mockReturnValue([]);
    renderSearchBar();

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "radio" } });
    act(() => {
      vi.runAllTimers();
    });

    fireEvent.click(screen.getByText("Intro to Ham Radio"));
    expect((input as HTMLInputElement).value).toBe("");
  });

  it("calls onSelectExhibitor and navigates when an exhibitor result is clicked", () => {
    const onSelectExhibitor = vi.fn();
    mockSearch.mockReturnValue([]);
    mockSearchExhibitors.mockReturnValue([exhibitorResult]);
    renderSearchBar({ onSelectExhibitor });

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "radio" },
    });
    act(() => {
      vi.runAllTimers();
    });

    fireEvent.click(screen.getByText("Radio World"));
    expect(onSelectExhibitor).toHaveBeenCalledWith(exhibitor);
    expect(mockNavigate).toHaveBeenCalledWith("/exhibitors?highlight=e1");
  });
});

describe("SearchBar — keyboard navigation", () => {
  const session1 = makeSession({ id: "s1", title: "Session One" });
  const session2 = makeSession({ id: "s2", title: "Session Two" });
  const sessionResult1: SearchResult = { session: session1, score: 0.1 };
  const sessionResult2: SearchResult = { session: session2, score: 0.2 };

  beforeEach(() => {
    vi.useFakeTimers();
    mockNavigate.mockReset();
    mockSearch.mockReturnValue([sessionResult1, sessionResult2]);
    mockSearchExhibitors.mockReturnValue([]);
  });

  afterEach(() => {
    act(() => {
      vi.runAllTimers();
    });
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  function openDropdown() {
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "session" },
    });
    act(() => {
      vi.runAllTimers();
    });
  }

  it("closes the dropdown on Escape", () => {
    renderSearchBar();
    openDropdown();
    expect(screen.getByText("Session One")).toBeInTheDocument();

    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Escape" });
    expect(screen.queryByText("Session One")).not.toBeInTheDocument();
  });

  it("selects the first result with ArrowDown and confirms with Enter", () => {
    const onSelectSession = vi.fn();
    renderSearchBar({ onSelectSession });
    openDropdown();

    fireEvent.keyDown(screen.getByRole("textbox"), { key: "ArrowDown" });
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });

    expect(onSelectSession).toHaveBeenCalledWith(session1);
    expect(mockNavigate).toHaveBeenCalledWith("/search?highlight=s1");
  });

  it("moves selection down and up with arrow keys", () => {
    const onSelectSession = vi.fn();
    renderSearchBar({ onSelectSession });
    openDropdown();

    const input = screen.getByRole("textbox");
    fireEvent.keyDown(input, { key: "ArrowDown" }); // index 0
    fireEvent.keyDown(input, { key: "ArrowDown" }); // index 1
    fireEvent.keyDown(input, { key: "ArrowUp" }); // back to index 0
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onSelectSession).toHaveBeenCalledWith(session1);
  });

  it("does not navigate past the last result with ArrowDown", () => {
    const onSelectSession = vi.fn();
    renderSearchBar({ onSelectSession });
    openDropdown();

    const input = screen.getByRole("textbox");
    fireEvent.keyDown(input, { key: "ArrowDown" }); // index 0
    fireEvent.keyDown(input, { key: "ArrowDown" }); // index 1
    fireEvent.keyDown(input, { key: "ArrowDown" }); // still index 1 (clamped)
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onSelectSession).toHaveBeenCalledWith(session2);
  });

  it("does not trigger selection when Enter is pressed with no selection", () => {
    const onSelectSession = vi.fn();
    renderSearchBar({ onSelectSession });
    openDropdown();

    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
    expect(onSelectSession).not.toHaveBeenCalled();
  });
});

describe("SearchBar — buildIndex called on mount", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("calls searchService.buildIndex on mount", () => {
    renderSearchBar();
    expect(mockBuildIndex).toHaveBeenCalled();
  });

  it("calls searchService.buildExhibitorIndex on mount", () => {
    renderSearchBar();
    expect(mockBuildExhibitorIndex).toHaveBeenCalled();
  });
});
