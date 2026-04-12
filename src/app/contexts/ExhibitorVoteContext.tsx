import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useConference } from "@/app/contexts/ConferenceContext";
import { castVote, MAX_VOTES } from "@/lib/vote";

const STORAGE_KEY_PREFIX = "exhibitor_votes_";

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

interface ExhibitorVoteContextType {
  votedExhibitors: string[];
  toggleExhibitorVote: (exhibitorId: string) => void;
  /** Used by FirebaseExhibitorVoteSync to apply values loaded from Firestore. */
  overrideExhibitorVotes: (items: string[]) => void;
}

const ExhibitorVoteContext = createContext<
  ExhibitorVoteContextType | undefined
>(undefined);

export function useExhibitorVoteContext(): ExhibitorVoteContextType {
  const ctx = useContext(ExhibitorVoteContext);
  if (!ctx) {
    throw new Error(
      "useExhibitorVoteContext must be used within an ExhibitorVoteProvider",
    );
  }
  return ctx;
}

export function ExhibitorVoteProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { activeConference } = useConference();
  const conferenceId = activeConference.id;

  const voteKey = STORAGE_KEY_PREFIX + conferenceId;

  const [votedExhibitors, setVotedExhibitors] = useState<string[]>(() =>
    loadFromLS(voteKey),
  );

  // Reload from localStorage whenever the active conference changes.
  useEffect(() => {
    setVotedExhibitors(loadFromLS(voteKey));
  }, [voteKey]);

  const toggleExhibitorVote = useCallback(
    (exhibitorId: string) => {
      setVotedExhibitors((prev) => {
        const next = castVote(prev, exhibitorId, "exhibitor");
        saveToLS(voteKey, next);
        return next;
      });
    },
    [voteKey],
  );

  /**
   * Replaces the in-memory vote state and persists to localStorage.
   * Called by FirebaseExhibitorVoteSync after loading from Firestore so that
   * the Firestore values win over any stale localStorage data.
   */
  const overrideExhibitorVotes = useCallback(
    (items: string[]) => {
      setVotedExhibitors(items);
      saveToLS(voteKey, items);
    },
    [voteKey],
  );

  return (
    <ExhibitorVoteContext.Provider
      value={{ votedExhibitors, toggleExhibitorVote, overrideExhibitorVotes }}
    >
      {children}
    </ExhibitorVoteContext.Provider>
  );
}
