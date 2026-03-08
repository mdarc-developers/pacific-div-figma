import React, {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

const STORAGE_KEY = "attendance";

function loadFromLS(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as string[]) : [];
  } catch {
    return [];
  }
}

function saveToLS(items: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // silently ignore storage errors (e.g. private browsing quota)
  }
}

interface AttendanceContextType {
  /** Conference IDs the user is attending. */
  attendance: string[];
  addConference: (conferenceId: string) => void;
  removeConference: (conferenceId: string) => void;
  /** Used by FirebaseAttendanceSync to apply values loaded from Firestore. */
  overrideAttendance: (items: string[]) => void;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(
  undefined,
);

export function useAttendanceContext(): AttendanceContextType {
  const ctx = useContext(AttendanceContext);
  if (!ctx) {
    throw new Error(
      "useAttendanceContext must be used within an AttendanceProvider",
    );
  }
  return ctx;
}

export function AttendanceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [attendance, setAttendance] = useState<string[]>(() => loadFromLS());

  const addConference = useCallback((conferenceId: string) => {
    setAttendance((prev) => {
      if (prev.includes(conferenceId)) return prev;
      const next = [...prev, conferenceId];
      saveToLS(next);
      return next;
    });
  }, []);

  const removeConference = useCallback((conferenceId: string) => {
    setAttendance((prev) => {
      const next = prev.filter((id) => id !== conferenceId);
      saveToLS(next);
      return next;
    });
  }, []);

  /**
   * Replaces the in-memory attendance state and persists to localStorage.
   * Called by FirebaseAttendanceSync after loading from Firestore so that
   * the Firestore values win over any stale localStorage data.
   */
  const overrideAttendance = useCallback((items: string[]) => {
    setAttendance(items);
    saveToLS(items);
  }, []);

  return (
    <AttendanceContext.Provider
      value={{ attendance, addConference, removeConference, overrideAttendance }}
    >
      {children}
    </AttendanceContext.Provider>
  );
}
