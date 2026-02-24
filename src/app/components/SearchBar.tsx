import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { searchService, SearchResult } from '@/services/searchService';
import { Session } from '@/types/conference';
import { Button } from '@/app/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useConference } from '@/app/contexts/ConferenceContext';

interface SessionModule {
  mapSessions?: [string, Session[]];
  [key: string]: unknown;
}

// Import all session data files at once using Vite's glob import
// This imports all files matching the pattern eagerly (at build time)
const sessionModules = import.meta.glob('../../data/*-2026.ts', { eager: true });

// Process the modules into a lookup object
const SESSION_DATA: Record<string, Session[]> = {};
Object.entries(sessionModules).forEach(([path, module]) => {
  // Extract the conference ID from the file path
  // e.g., "../../data/pacificon-2026.ts" -> "pacificon-2026"
  const conferenceId = path.split('/').pop()?.replace('.ts', '') || '';
  const typedModule = module as SessionModule;
  if (typedModule.mapSessions) {
    SESSION_DATA[conferenceId] = typedModule.mapSessions;
  }
});

interface SearchBarProps {
  onSelectSession?: (session: Session) => void;
  onSearch?: (results: SearchResult[]) => void;
  placeholderProp?: string;
  classNameProp?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSelectSession,
  onSearch,
  placeholderProp = 'Search forums...',
  //placeholder="Search speakers, forums, events, exhibitors..."
  classNameProp = '',
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { activeConference, allConferencesList, setActiveConference } = useConference();

  const indexSessions = SESSION_DATA[activeConference.id] || [];

  // Initialize search index on mount
  useEffect(() => {
    searchService.buildIndex(indexSessions[1]);
  }, [indexSessions[1]]);

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

        const searchResults = searchService.search(searchQuery, undefined, 10);
        setResults(searchResults);
        setIsOpen(searchResults.length > 0);
        setIsLoading(false);

        if (onSearch) {
          onSearch(searchResults);
        }
        //if (onSearch) onSearch(searchQuery);
      }, 300);
    },
    [onSearch]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    handleSearch(value);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const handleSelectResult = (session: Session) => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    if (onSelectSession) {
      onSelectSession(session);
    }
    navigate(`/search?highlight=${session.id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelectResult(results[selectedIndex].session);
        }
        break;
      case 'Escape':
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

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    //<div className="gap-2 p-1 rounded-lg mb-2">
    <div className={`relative w-full ${classNameProp} gap-2 p-1 rounded-lg mb-2`}>
      <form onSubmit={(e) => e.preventDefault()} className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
          <input
            id='searchBarInput'
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
            className="absolute top-full left-0 right-0 z-50 mt-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 shadow-lg max-h-96 overflow-y-auto"
          >
            {results.map((result, index) => (
              <button
                key={result.session.id}
                onClick={() => handleSelectResult(result.session)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`w-full px-4 py-3 text-left border-b border-gray-200 dark:border-gray-700 last:border-b-0 transition-colors ${index === selectedIndex
                  ? 'bg-blue-50 dark:bg-gray-700 text-gray-900 dark:text-white'
                  : 'hover:bg-blue-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100'
                  }`}
              >
                <div className="flex flex-col gap-1">
                  {/* Session Title */}
                  <p className="font-semibold text-sm">{result.session.title}</p>

                  {/* Speaker and Badges */}
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    {result.session.speaker && (
                      <span>by {result.session.speaker}</span>
                    )}
                    {result.session.category && (
                      <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs">
                        {result.session.category}
                      </span>
                    )}
                    {result.session.location && (
                      <span className="text-xs">{result.session.location}</span>
                    )}
                  </div>

                  {/* Time */}
                  {result.session.startTime && (
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {new Date(result.session.startTime).toLocaleTimeString(
                        'en-US',
                        {
                          hour: '2-digit',
                          minute: '2-digit',
                        }
                      )}
                    </p>
                  )}
                </div>

                {/* Relevance Indicator */}
                {result.score !== undefined && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                    {Math.round((1 - result.score) * 100)}%
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* No Results Message */}
        {isOpen && !isLoading && query && results.length === 0 && (
          <div className="absolute top-full left-0 right-0 z-50 mt-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 shadow-lg p-4 text-center text-sm text-gray-500 dark:text-gray-400">
            No sessions found for &quot;{query}&quot;
          </div>
        )}
      </form>
    </div>
  );
};
