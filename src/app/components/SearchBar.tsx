import React, { useState, useCallback, useRef, useEffect } from "react";
import { Search, X, Building2 } from "lucide-react";
import {
  searchService,
  SearchResult,
  ExhibitorSearchResult,
} from "@/services/searchService";
import { Session, Exhibitor } from "@/types/conference";
import { Button } from "@/app/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useConference } from "@/app/contexts/ConferenceContext";
import { SESSION_DATA, EXHIBITOR_DATA } from "@/lib/supplementalData";

/** Minimum dropdown height in pixels — prevents the list from becoming unusably short. */
const MIN_DROPDOWN_HEIGHT = 200;
/** Default / fallback dropdown max-height in pixels (matches Tailwind's max-h-96). */
const DEFAULT_DROPDOWN_HEIGHT = 384;
/** Approximate gap between the bottom of the input and the top of the dropdown (Tailwind mt-2). */
const DROPDOWN_TOP_OFFSET = 8;
/** Bottom margin kept clear between the dropdown and the viewport edge. */
const DROPDOWN_BOTTOM_MARGIN = 16;

type CombinedResult =
  | { kind: "session"; result: SearchResult }
  | { kind: "exhibitor"; result: ExhibitorSearchResult }
  | { kind: "merged"; forumResult: SearchResult; eventResult: SearchResult };

interface SearchBarProps {
  onSelectSession?: (session: Session) => void;
  onSelectExhibitor?: (exhibitor: Exhibitor) => void;
  onSearch?: (results: SearchResult[]) => void;
  placeholderProp?: string;
  classNameProp?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSelectSession,
  onSelectExhibitor,
  onSearch,
  placeholderProp = "Search schedule, forums, exhibitors...",
  //placeholder="Search speakers, forums, events..."
  classNameProp = "",
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CombinedResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [dropdownMaxHeight, setDropdownMaxHeight] = useState<number>(
    DEFAULT_DROPDOWN_HEIGHT,
  );
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { activeConference, allConferencesList, setActiveConference } =
    useConference();

  const indexSessions = SESSION_DATA[activeConference.id] || [];
  const indexExhibitors = EXHIBITOR_DATA[activeConference.id]?.[1] || [];

  // Initialize search index on mount
  useEffect(() => {
    searchService.buildIndex(indexSessions);
    searchService.buildExhibitorIndex(indexExhibitors);
  }, [indexSessions, indexExhibitors]);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback(
    (searchQuery: string) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      setIsLoading(true);
      setSelectedIndex(-1);

      debounceTimerRef.current = setTimeout(() => {
        if (!searchQuery.trim()) {
          setResults([]);
          setIsOpen(false);
          setIsLoading(false);
          if (onSearch) onSearch([]);
          return;
        }

        const sessionResults = searchService.search(searchQuery, undefined, 7);
        const exhibitorResults = searchService.searchExhibitors(searchQuery, 5);

        // Merge session pairs that share a startTime where one is "Forums" and one is "Events"
        // Pass 1: group sessions by startTime
        const forumsByTime = new Map<string, SearchResult>();
        const eventsByTime = new Map<string, SearchResult>();
        for (const r of sessionResults) {
          if (
            r.session.category === "Forums" &&
            !forumsByTime.has(r.session.startTime)
          ) {
            forumsByTime.set(r.session.startTime, r);
          } else if (
            r.session.category === "Events" &&
            !eventsByTime.has(r.session.startTime)
          ) {
            eventsByTime.set(r.session.startTime, r);
          }
        }
        // Pass 2: build merged and standalone results preserving Fuse relevance order
        const mergedIds = new Set<string>();
        const mergedSessions: CombinedResult[] = [];
        for (const r of sessionResults) {
          if (mergedIds.has(r.session.id)) continue;
          const forumAtTime = forumsByTime.get(r.session.startTime);
          const eventAtTime = eventsByTime.get(r.session.startTime);
          if (
            forumAtTime &&
            eventAtTime &&
            !mergedIds.has(forumAtTime.session.id) &&
            !mergedIds.has(eventAtTime.session.id)
          ) {
            mergedSessions.push({
              kind: "merged",
              forumResult: forumAtTime,
              eventResult: eventAtTime,
            });
            mergedIds.add(forumAtTime.session.id);
            mergedIds.add(eventAtTime.session.id);
          } else {
            mergedSessions.push({ kind: "session", result: r });
            mergedIds.add(r.session.id);
          }
        }

        const combined: CombinedResult[] = [
          ...mergedSessions,
          ...exhibitorResults.map(
            (r): CombinedResult => ({ kind: "exhibitor", result: r }),
          ),
        ];
        setResults(combined);
        setIsOpen(combined.length > 0);
        setIsLoading(false);

        if (onSearch) {
          onSearch(sessionResults);
        }
        //if (onSearch) onSearch(searchQuery);
      }, 300);
    },
    [onSearch],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    handleSearch(value);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const handleSelectResult = (item: CombinedResult) => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    if (item.kind === "session") {
      if (onSelectSession) {
        onSelectSession(item.result.session);
      }
      navigate(`/search?highlight=${item.result.session.id}`);
    } else if (item.kind === "merged") {
      if (onSelectSession) {
        onSelectSession(item.forumResult.session);
      }
      navigate(`/search?highlight=${item.forumResult.session.id}`);
    } else {
      if (onSelectExhibitor) {
        onSelectExhibitor(item.result.exhibitor);
      }
      navigate(`/exhibitors?highlight=${item.result.exhibitor.id}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelectResult(results[selectedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Dynamically size the dropdown to fill available viewport space below the input.
  // While open, recalculate on scroll and only ever increase the height so that
  // scrolling back up does not shrink the already-expanded dropdown.
  const updateDropdownHeight = useCallback(() => {
    if (!inputRef.current) return;
    const inputRect = inputRef.current.getBoundingClientRect();
    const dropdownTop = inputRect.bottom + DROPDOWN_TOP_OFFSET;
    const available = window.innerHeight - dropdownTop - DROPDOWN_BOTTOM_MARGIN;
    setDropdownMaxHeight((prev) =>
      Math.max(prev, Math.max(available, MIN_DROPDOWN_HEIGHT)),
    );
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setDropdownMaxHeight(DEFAULT_DROPDOWN_HEIGHT); // reset when closed so next open recalculates
      return;
    }
    updateDropdownHeight();
    // Debounce the scroll handler to avoid excessive recalculations.
    let scrollTimer: ReturnType<typeof setTimeout> | null = null;
    const handleScroll = () => {
      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(updateDropdownHeight, 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimer) clearTimeout(scrollTimer);
    };
  }, [isOpen, updateDropdownHeight]);

  return (
    //<div className="gap-2 p-1 rounded-lg mb-2">
    <div
      className={`relative z-10 w-full ${classNameProp} gap-2 p-1 rounded-lg mb-2`}
    >
      <form onSubmit={(e) => e.preventDefault()} className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
          <input
            id="searchBarInput"
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => query && results.length > 0 && setIsOpen(true)}
            placeholder={placeholderProp}
            className="w-full px-4 py-2 pl-10 pr-10 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Clear Button */}
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="absolute right-2 h-6 w-6 p-0"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="absolute right-2 h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          )}
        </div>

        {/* Results Dropdown */}
        {isOpen && results.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 z-50 mt-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 shadow-lg overflow-y-auto"
            style={{ maxHeight: `${dropdownMaxHeight}px` }}
          >
            {results.map((item, index) => (
              <button
                key={
                  item.kind === "session"
                    ? `session-${item.result.session.id}`
                    : item.kind === "merged"
                      ? `merged-${item.forumResult.session.id}-${item.eventResult.session.id}`
                      : `exhibitor-${item.result.exhibitor.id}`
                }
                onClick={() => handleSelectResult(item)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`w-full px-4 py-3 text-left border-b border-gray-200 dark:border-gray-700 last:border-b-0 transition-colors ${
                  index === selectedIndex
                    ? "bg-blue-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    : "hover:bg-blue-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
                }`}
              >
                {item.kind === "merged" ? (
                  <div className="flex flex-col gap-1">
                    {/* Forum session title (primary) */}
                    <p className="font-semibold text-sm">
                      {item.forumResult.session.title}
                    </p>

                    {/* Speaker and side-by-side category badges */}
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      {item.forumResult.session.speaker && (
                        <span>by {item.forumResult.session.speaker}</span>
                      )}
                      <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs">
                        {item.forumResult.session.category}
                      </span>
                      <span className="inline-block px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded text-xs">
                        {item.eventResult.session.category}
                      </span>
                      {item.forumResult.session.location && (
                        <span className="text-xs">
                          {item.forumResult.session.location}
                        </span>
                      )}
                    </div>

                    {/* Time */}
                    {item.forumResult.session.startTime && (
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {new Date(
                          item.forumResult.session.startTime +
                            activeConference.timezoneNumeric,
                        ).toLocaleTimeString("en-US", {
                          timeZone: activeConference.timezone,
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                  </div>
                ) : item.kind === "session" ? (
                  <div className="flex flex-col gap-1">
                    {/* Session Title */}
                    <p className="font-semibold text-sm">
                      {item.result.session.title}
                    </p>

                    {/* Speaker and Badges */}
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      {item.result.session.speaker && (
                        <span>by {item.result.session.speaker}</span>
                      )}
                      {item.result.session.category && (
                        <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs">
                          {item.result.session.category}
                        </span>
                      )}
                      {item.result.session.location && (
                        <span className="text-xs">
                          {item.result.session.location}
                        </span>
                      )}
                    </div>

                    {/* Time */}
                    {item.result.session.startTime && (
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {new Date(
                          item.result.session.startTime +
                            activeConference.timezoneNumeric,
                        ).toLocaleTimeString("en-US", {
                          timeZone: activeConference.timezone,
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    {/* Exhibitor Name */}
                    <div className="flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                      <p className="font-semibold text-sm">
                        {item.result.exhibitor.name}
                      </p>
                    </div>

                    {/* Type and Description */}
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <span className="inline-block px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs">
                        Exhibitor
                      </span>
                      {item.result.exhibitor.type && (
                        <span>{item.result.exhibitor.type}</span>
                      )}
                      {item.result.exhibitor.description && (
                        <span className="truncate max-w-[200px]">
                          {item.result.exhibitor.description}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* No Results Message */}
        {isOpen && !isLoading && query && results.length === 0 && (
          <div className="absolute top-full left-0 right-0 z-50 mt-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 shadow-lg p-4 text-center text-sm text-gray-500 dark:text-gray-400">
            No results found for &quot;{query}&quot;
          </div>
        )}
      </form>
    </div>
  );
};
