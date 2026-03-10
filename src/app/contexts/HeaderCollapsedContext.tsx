import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const HEADER_COLLAPSED_KEY = "conferenceHeaderCollapsed";

function readStoredCollapsed(): boolean {
  try {
    return localStorage.getItem(HEADER_COLLAPSED_KEY) === "true";
  } catch {
    return false;
  }
}

interface HeaderCollapsedContextType {
  isHeaderCollapsed: boolean;
  setIsHeaderCollapsed: (collapsed: boolean) => void;
  /** Used by FirebaseHeaderCollapsedSync to apply the value loaded from Firestore. */
  overrideHeaderCollapsed: (collapsed: boolean) => void;
}

const HeaderCollapsedContext = createContext<
  HeaderCollapsedContextType | undefined
>(undefined);

export function useHeaderCollapsed(): HeaderCollapsedContextType {
  const ctx = useContext(HeaderCollapsedContext);
  if (!ctx) {
    throw new Error(
      "useHeaderCollapsed must be used within a HeaderCollapsedProvider",
    );
  }
  return ctx;
}

export function HeaderCollapsedProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isHeaderCollapsed, setIsHeaderCollapsedState] = useState<boolean>(
    () => {
      try {
        return readStoredCollapsed();
      } catch {
        return false;
      }
    },
  );

  // Persist to localStorage whenever the value changes.
  useEffect(() => {
    try {
      localStorage.setItem(HEADER_COLLAPSED_KEY, String(isHeaderCollapsed));
    } catch {
      // ignore
    }
  }, [isHeaderCollapsed]);

  const setIsHeaderCollapsed = (collapsed: boolean) => {
    setIsHeaderCollapsedState(collapsed);
  };

  /**
   * Replaces the in-memory state and persists to localStorage.
   * Called by FirebaseHeaderCollapsedSync after loading from Firestore so that
   * the Firestore value wins over any stale localStorage data.
   */
  const overrideHeaderCollapsed = useCallback((collapsed: boolean) => {
    setIsHeaderCollapsedState(collapsed);
    try {
      localStorage.setItem(HEADER_COLLAPSED_KEY, String(collapsed));
    } catch {
      // ignore
    }
  }, []);

  return (
    <HeaderCollapsedContext.Provider
      value={{
        isHeaderCollapsed,
        setIsHeaderCollapsed,
        overrideHeaderCollapsed,
      }}
    >
      {children}
    </HeaderCollapsedContext.Provider>
  );
}
