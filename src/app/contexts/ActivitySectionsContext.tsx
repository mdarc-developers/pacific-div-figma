import React, { createContext, useContext, useState } from "react";

/** The collapsible sections in the Activity card and Prizes card on the Profile page. */
/** The seven collapsible sections in the Activity card on the Profile page. */
export interface ActivitySections {
  bookmarkedSessions: boolean;
  bookmarkedExhibitors: boolean;
  votedSessions: boolean;
  votedExhibitors: boolean;
  myNotes: boolean;
  raffleTickets: boolean;
  myExhibitorNotes: boolean;
}

const STORAGE_KEY = "activity-sections";

const DEFAULT_SECTIONS: ActivitySections = {
  bookmarkedSessions: true,
  bookmarkedExhibitors: true,
  votedSessions: true,
  votedExhibitors: true,
  myNotes: true,
  raffleTickets: true,
  myExhibitorNotes: true,
};

function parseSections(raw: unknown): ActivitySections {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return DEFAULT_SECTIONS;
  }
  const s = raw as Record<string, unknown>;
  return {
    bookmarkedSessions:
      typeof s.bookmarkedSessions === "boolean"
        ? s.bookmarkedSessions
        : DEFAULT_SECTIONS.bookmarkedSessions,
    bookmarkedExhibitors:
      typeof s.bookmarkedExhibitors === "boolean"
        ? s.bookmarkedExhibitors
        : DEFAULT_SECTIONS.bookmarkedExhibitors,
    votedSessions:
      typeof s.votedSessions === "boolean"
        ? s.votedSessions
        : DEFAULT_SECTIONS.votedSessions,
    votedExhibitors:
      typeof s.votedExhibitors === "boolean"
        ? s.votedExhibitors
        : DEFAULT_SECTIONS.votedExhibitors,
    myNotes:
      typeof s.myNotes === "boolean" ? s.myNotes : DEFAULT_SECTIONS.myNotes,
    raffleTickets:
      typeof s.raffleTickets === "boolean"
        ? s.raffleTickets
        : DEFAULT_SECTIONS.raffleTickets,
    myExhibitorNotes:
      typeof s.myExhibitorNotes === "boolean"
        ? s.myExhibitorNotes
        : DEFAULT_SECTIONS.myExhibitorNotes,
  };
}

function readStoredSections(): ActivitySections {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SECTIONS;
    return parseSections(JSON.parse(raw));
  } catch {
    return DEFAULT_SECTIONS;
  }
}

interface ActivitySectionsContextType {
  sections: ActivitySections;
  toggleSection: (key: keyof ActivitySections) => void;
  /** Replaces all section states at once (used by the Firestore sync). */
  overrideSections: (next: ActivitySections) => void;
}

const ActivitySectionsContext = createContext<
  ActivitySectionsContextType | undefined
>(undefined);

export const useActivitySections = () => {
  const ctx = useContext(ActivitySectionsContext);
  if (!ctx) {
    throw new Error(
      "useActivitySections must be used within ActivitySectionsProvider",
    );
  }
  return ctx;
};

export const ActivitySectionsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [sections, setSections] = useState<ActivitySections>(() => {
    try {
      return readStoredSections();
    } catch {
      return DEFAULT_SECTIONS;
    }
  });

  const toggleSection = (key: keyof ActivitySections) => {
    setSections((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore storage errors */
      }
      return next;
    });
  };

  const overrideSections = (next: ActivitySections) => {
    const parsed = parseSections(next);
    setSections(parsed);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    } catch {
      /* ignore storage errors */
    }
  };

  return (
    <ActivitySectionsContext.Provider
      value={{ sections, toggleSection, overrideSections }}
    >
      {children}
    </ActivitySectionsContext.Provider>
  );
};
