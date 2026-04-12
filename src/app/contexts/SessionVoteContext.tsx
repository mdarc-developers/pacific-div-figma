import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useConference } from "@/app/contexts/ConferenceContext";
import { castVote, MAX_VOTES } from "@/lib/vote";

const STORAGE_KEY_PREFIX = "session_votes_";

function loadFromLS(key: string): string[] {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as unknown;
    if (!Array.isArray(parsed)) return [];
    // Sanitize: keep only string items and cap at MAX_VOTES to prevent
    // localStorage manipulation inflating the local vote count.
    const sanitized = (parsed as unknown[])
      .filter((v): v is string => typeof v === "string")
      .slice(0, MAX_VOTES);
    if (sanitized.length !== parsed.length) {
      // Write the corrected value back so subsequent loads are clean.
      try {
        localStorage.setItem(key, JSON.stringify(sanitized));
      } catch {
        // ignore
      }
    }
    return sanitized;
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

interface SessionVoteContextType {
  votedSessions: string[];
  toggleSessionVote: (sessionId: string) => void;
  /** Used by FirebaseSessionVoteSync to apply values loaded from Firestore. */
  overrideSessionVotes: (items: string[]) => void;
}

const SessionVoteContext = createContext<SessionVoteContextType | undefined>(
  undefined,
);

export function useSessionVoteContext(): SessionVoteContextType {
  const ctx = useContext(SessionVoteContext);
  if (!ctx) {
    throw new Error(
      "useSessionVoteContext must be used within a SessionVoteProvider",
    );
  }
  return ctx;
}

export function SessionVoteProvider({
  children,
}: {
  children: React.ReactNode;
}) {
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
        const next = castVote(prev, sessionId, "session");
        saveToLS(voteKey, next);
        return next;
      });
    },
    [voteKey],
  );

  /**
   * Replaces the in-memory vote state and persists to localStorage.
   * Called by FirebaseSessionVoteSync after loading from Firestore so that
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
    <SessionVoteContext.Provider
      value={{ votedSessions, toggleSessionVote, overrideSessionVotes }}
    >
      {children}
    </SessionVoteContext.Provider>
  );
}
