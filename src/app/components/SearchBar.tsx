import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { searchService, SearchResult, SearchFilters } from '@/services/searchService';
import { Session } from '@/types/conference';
import { Button } from '@/app/components/ui/button';

interface SearchBarProps {
  sessions: Session[];
  onSelectSession?: (session: Session) => void;
  onSearch?: (results: SearchResult[]) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  sessions,
  onSelectSession,
  onSearch,
  placeholder = 'Search forums...',
  //placeholder="Search speakers, forums, events, exhibitors..."
  className = '',
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    searchService.buildIndex(sessions);
  }, [sessions]);

  const debounceTimerRef = useRef<NodeJS.Timeout>();

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
          return;
        }

        const searchResults = searchService.search(searchQuery, undefined, 10);
        setResults(searchResults);
        setIsOpen(searchResults.length > 0);
        setIsLoading(false);

        if (onSearch) {
          onSearch(searchResults);
        }
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
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
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
    <div className={`relative w-full ${className}`}> 
      <div className="relative flex items-center"> 
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground" /> 
        <input 
          ref={inputRef} 
          type="text" 
          value={query} 
          onChange={handleInputChange} 
          onKeyDown={handleKeyDown} 
          onFocus={() => query && results.length > 0 && setIsOpen(true)} 
          placeholder={placeholder} 
          className="w-full pl-10 pr-10 py-2 border border-input rounded-md bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" 
        /> 
        {query && ( 
          <Button variant="ghost" size="sm" onClick={handleClear} className="absolute right-2 h-6 w-6 p-0" aria-label="Clear search"> 
            <X className="h-4 w-4" /> 
          </Button> 
        )} 
        {isLoading && ( 
          <div className="absolute right-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" /> 
        )} 
      </div> 
      {isOpen && results.length > 0 && ( 
        <div ref={dropdownRef} className="absolute top-full left-0 right-0 z-50 mt-2 border border-border rounded-md bg-popover shadow-md max-h-96 overflow-y-auto"> 
          {results.map((result, index) => ( 
            <button key={result.session.id} onClick={() => handleSelectResult(result.session)} onMouseEnter={() => setSelectedIndex(index)} className={`w-full px-4 py-3 text-left border-b border-border last:border-b-0 transition-colors ${ index === selectedIndex ? 'bg-accent text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground' }`}> 
              <div className="flex flex-col gap-1"> 
                <p className="font-semibold text-sm">{result.session.title}</p> 
                <div className="flex items-center gap-2 text-xs text-muted-foreground"> 
                  {result.session.speaker && ( 
                    <span>by {result.session.speaker}</span> 
                  )} 
                  {result.session.category && ( 
                    <span className="inline-block px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs"> 
                      {result.session.category} 
                    </span> 
                  )} 
                  {result.session.room && ( 
                    <span className="text-xs">{result.session.room}</span> 
                  )} 
                </div> 
                {result.session.startTime && ( 
                  <p className="text-xs text-muted-foreground"> 
                    {new Date(result.session.startTime).toLocaleTimeString( 'en-US', { hour: '2-digit', minute: '2-digit', } )} 
                  </p> 
                )} 
              </div> 
              {result.score !== undefined && ( 
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground"> 
                  {Math.round((1 - result.score) * 100)}% 
                </div> 
              )} 
            </button> 
          ))} 
        </div> 
      )} 
      {isOpen && !isLoading && query && results.length === 0 && ( 
        <div className="absolute top-full left-0 right-0 z-50 mt-2 border border-border rounded-md bg-popover shadow-md p-4 text-center text-sm text-muted-foreground"> 
          No sessions found for "{query}" 
        </div> 
      )} 
    </div> 
  );
};

