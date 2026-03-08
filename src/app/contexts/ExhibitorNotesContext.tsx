import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useConference } from "@/app/contexts/ConferenceContext";

const STORAGE_KEY_PREFIX = "exhibitor_notes_";

function loadFromLS(key: string): Record<string, string> {
  try {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function saveToLS(key: string, notes: Record<string, string>): void {
  try {
    localStorage.setItem(key, JSON.stringify(notes));
  } catch {
    // silently ignore storage errors (e.g. private browsing quota)
  }
}

interface ExhibitorNotesContextType {
  /** All notes for the active conference, keyed by exhibitor ID. */
  notes: Record<string, string>;
  /** Save or update a note for an exhibitor. Passing empty string removes the note. */
  setNote: (exhibitorId: string, text: string) => void;
  /** Remove a note for an exhibitor. */
  deleteNote: (exhibitorId: string) => void;
  /** Used by FirebaseExhibitorNotesSync to apply values loaded from Firestore. */
  overrideNotes: (notes: Record<string, string>) => void;
}

const ExhibitorNotesContext = createContext<
  ExhibitorNotesContextType | undefined
>(undefined);

export function useExhibitorNotesContext(): ExhibitorNotesContextType {
  const ctx = useContext(ExhibitorNotesContext);
  if (!ctx) {
    throw new Error(
      "useExhibitorNotesContext must be used within an ExhibitorNotesProvider",
    );
  }
  return ctx;
}

export function ExhibitorNotesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { activeConference } = useConference();
  const conferenceId = activeConference.id;
  const storageKey = STORAGE_KEY_PREFIX + conferenceId;

  const [notes, setNotes] = useState<Record<string, string>>(() =>
    loadFromLS(storageKey),
  );

  // Reload from localStorage whenever the active conference changes.
  useEffect(() => {
    setNotes(loadFromLS(storageKey));
  }, [storageKey]);

  const setNote = useCallback(
    (exhibitorId: string, text: string) => {
      setNotes((prev) => {
        let next: Record<string, string>;
        if (text.trim()) {
          next = { ...prev, [exhibitorId]: text };
        } else {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [exhibitorId]: _removed, ...rest } = prev;
          next = rest;
        }
        saveToLS(storageKey, next);
        return next;
      });
    },
    [storageKey],
  );

  const deleteNote = useCallback(
    (exhibitorId: string) => {
      setNotes((prev) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [exhibitorId]: _removed, ...rest } = prev;
        saveToLS(storageKey, rest);
        return rest;
      });
    },
    [storageKey],
  );

  /**
   * Replaces the in-memory notes state and persists to localStorage.
   * Called by FirebaseExhibitorNotesSync after loading from Firestore so that
   * the Firestore values win over any stale localStorage data.
   */
  const overrideNotes = useCallback(
    (newNotes: Record<string, string>) => {
      setNotes(newNotes);
      saveToLS(storageKey, newNotes);
    },
    [storageKey],
  );

  return (
    <ExhibitorNotesContext.Provider
      value={{ notes, setNote, deleteNote, overrideNotes }}
    >
      {children}
    </ExhibitorNotesContext.Provider>
  );
}
