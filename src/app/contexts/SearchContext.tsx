import React, { createContext, useContext, useState } from 'react';

interface SearchContextType {
  highlightSessionId: string | null;
  setHighlightSessionId: (sessionId: string | null) => void;
  highlightExhibitorId: string | null;
  setHighlightExhibitorId: (sessionId: string | null) => void;
  highlightForumRoomName: string | null;
  setHighlightForumRoomName: (roomName: string | null) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within SearchProvider');
  }
  return context;
};

export const SearchProvider = ({ children }: { children: React.ReactNode }) => {
  const [highlightSessionId, setHighlightSessionId] = useState<string | null>(null);
  const [highlightExhibitorId, setHighlightExhibitorId] = useState<string | null>(null);
  const [highlightForumRoomName, setHighlightForumRoomName] = useState<string | null>(null);

  return (
    <SearchContext.Provider value={{ highlightSessionId, setHighlightSessionId, highlightExhibitorId, setHighlightExhibitorId, highlightForumRoomName, setHighlightForumRoomName }}>
      {children}
    </SearchContext.Provider>
  );
};

