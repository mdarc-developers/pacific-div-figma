import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useConference } from "@/app/contexts/ConferenceContext";

const STORAGE_KEY_PREFIX = "session_votes_";

function loadFromLS(key: string): string[] {
  try {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as string[]) : [];
  } catch {
    return [];
  }
}

function saveToLS(key: string, items: string[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch {
    // silently ignore storage errors (e.g. private browsing quota)
  }
}

interface VoteContextType {
  votedSessions: string[];
  toggleSessionVote: (sessionId: string) => void;
  /** Used by FirebaseVoteSync to apply values loaded from Firestore. */
  overrideSessionVotes: (items: string[]) => void;
}

const VoteContext = createContext<VoteContextType | undefined>(undefined);

export function useVoteContext(): VoteContextType {
  const ctx = useContext(VoteContext);
  if (!ctx) {
    throw new Error("useVoteContext must be used within a VoteProvider");
  }
  return ctx;
}

export function VoteProvider({ children }: { children: React.ReactNode }) {
  const { activeConference } = useConference();
  const conferenceId = activeConference.id;

  const voteKey = STORAGE_KEY_PREFIX + conferenceId;

  const [votedSessions, setVotedSessions] = useState<string[]>(() =>
    loadFromLS(voteKey),
  );

  // Reload from localStorage whenever the active conference changes.
  useEffect(() => {
    setVotedSessions(loadFromLS(voteKey));
  }, [voteKey]);

  const toggleSessionVote = useCallback(
    (sessionId: string) => {
      setVotedSessions((prev) => {
        const next = prev.includes(sessionId)
          ? prev.filter((id) => id !== sessionId)
          : [...prev, sessionId];
        saveToLS(voteKey, next);
        return next;
      });
    },
    [voteKey],
  );

  /**
   * Replaces the in-memory vote state and persists to localStorage.
   * Called by FirebaseVoteSync after loading from Firestore so that
   * the Firestore values win over any stale localStorage data.
   */
  const overrideSessionVotes = useCallback(
    (items: string[]) => {
      setVotedSessions(items);
      saveToLS(voteKey, items);
    },
    [voteKey],
  );

  return (
    <VoteContext.Provider
      value={{ votedSessions, toggleSessionVote, overrideSessionVotes }}
    >
      {children}
    </VoteContext.Provider>
  );
}
