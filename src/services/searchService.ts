import Fuse from "fuse.js";
import { Session } from "@/types/conference";

export interface SearchResult {
  session: Session;
  score: number;
  highlights?: {
    title?: string;
    speaker?: string;
    description?: string;
  };
}

export interface SearchFilters {
  category?: string;
  room?: string;
  startTime?: string;
  endTime?: string;
  track?: string;
  bookmarkedOnly?: boolean;
  bookmarkedSessions?: string[];
}

class SearchService {
  private searchIndex: SearchIndex = {
    fuse: null,
    sessions: [],
  };
  //private fuse: Fuse<Session> | null = null;
  //private sessions: Session[] = [];

  /**
   * Build the search index from sessions
   */
  buildIndex(sessions: Session[]): void {
    if (!sessions || sessions.length === 0) {
      console.warn("SearchService: No sessions provided to buildIndex");
      this.searchIndex = { fuse: null, sessions: [] };
      return;
    }

    //buildIndex(sessions: Session[]): void {
    //  this.sessions = sessions;
    const options: Fuse.IFuseOptions<Session> = {
      keys: [
        { name: "title", weight: 0.4 },
        { name: "speaker", weight: 0.3 },
        { name: "description", weight: 0.2 },
        { name: "category", weight: 0.1 },
        { name: "location", weight: 0.1 },
        { name: "track", weight: 0.1 },
      ],
      threshold: 0.4,
      includeScore: true,
      minMatchCharLength: 2,
    };
    this.searchIndex = {
      fuse: new Fuse(sessions, options),
      sessions,
    };
    this.fuse = new Fuse(sessions, options);
  }

  /**
   * Search for sessions
   */
  search(
    query: string,
    filters?: SearchFilters,
    limit: number = 10,
  ): SearchResult[] {
    // Guard: Check if index is built
    if (!this.searchIndex.fuse || !query.trim()) {
      //if (!this.fuse || !query.trim()) {
      return [];
    }
    const results = this.fuse
      .search(query)
      .slice(0, limit)
      .map((result) => ({ session: result.item, score: result.score || 1 }));
    if (filters) {
      return this.applyFilters(results, filters);
    }
    return results;
  }

  private applyFilters(
    results: SearchResult[],
    filters: SearchFilters,
  ): SearchResult[] {
    return results.filter((result) => {
      const { session } = result;
      if (filters.category && session.category !== filters.category) {
        return false;
      }
      if (filters.room && session.room !== filters.room) {
        return false;
      }
      if (filters.track && session.track !== filters.track) {
        return false;
      }
      if (filters.startTime && session.startTime < filters.startTime) {
        return false;
      }
      if (filters.endTime && session.endTime > filters.endTime) {
        return false;
      }
      if (
        filters.bookmarkedOnly &&
        filters.bookmarkedSessions &&
        !filters.bookmarkedSessions.includes(session.id)
      ) {
        return false;
      }
      return true;
    });
    //};

    try {
      const results = this.searchIndex.fuse.search(query, { limit });
      // Map Fuse results to SearchResult format
      return results.map((result) => ({
        session: result.item,
        score: result.score || 0,
        matches: result.matches || [],
      }));
    } catch (error) {
      console.error("SearchService: Error during search", error);
      return [];
    }
  }

  /**
   * Get all sessions
   */
  getAllSessions(): Session[] {
    return this.searchIndex.sessions;
  }

  getCategories(): string[] {
    return [...new Set(this.sessions.map((s) => s.category))];
  }

  getRooms(): string[] {
    return [...new Set(this.sessions.map((s) => s.room).filter(Boolean))];
  }

  getTracks(): string[] {
    return [...new Set(this.sessions.map((s) => s.track).filter(Boolean))];
  }

  /**
   * Clear the index
   */
  clearIndex(): void {
    this.searchIndex = { fuse: null, sessions: [] };
  }
}

export const searchService = new SearchService();
export type { SearchResult, SearchFilters };
