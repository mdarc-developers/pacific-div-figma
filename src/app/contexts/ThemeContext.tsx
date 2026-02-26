import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const THEME_STORAGE_KEY = "theme";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (nextTheme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getSystemPrefersDark(): boolean {
  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
}

function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === "system") return getSystemPrefersDark() ? "dark" : "light";
  return theme;
}

function applyResolvedTheme(nextResolved: ResolvedTheme) {
  document.documentElement.classList.toggle("dark", nextResolved === "dark");
  document.documentElement.style.colorScheme = nextResolved;
}

function readStoredTheme(): Theme {
  const raw = localStorage.getItem(THEME_STORAGE_KEY);
  if (raw === "light" || raw === "dark" || raw === "system") return raw;
  return "system";
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // Initialize from localStorage (client-side; Vite SPA)
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      return readStoredTheme();
    } catch {
      return "system";
    }
  });

  const resolvedTheme = useMemo(() => {
    // Guard in case this runs somewhere without window (tests)
    if (typeof window === "undefined") return "light";
    return resolveTheme(theme);
  }, [theme]);

  // Apply whenever resolved theme changes
  useEffect(() => {
    applyResolvedTheme(resolvedTheme);
  }, [resolvedTheme]);

  // Persist stored theme
  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  // If in system mode, react to OS theme changes
  useEffect(() => {
    if (theme !== "system") return;

    const mql = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!mql) return;

    const handler = () => {
      applyResolvedTheme(resolveTheme("system"));
    };

    // Safari fallback
    if ("addEventListener" in mql) {
      mql.addEventListener("change", handler);
      return () => mql.removeEventListener("change", handler);
    } else {
      // @ts-expect-error older API
      mql.addListener(handler);
      // @ts-expect-error older API
      return () => mql.removeListener(handler);
    }
  }, [theme]);

  // Sync across tabs/windows
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== THEME_STORAGE_KEY) return;
      const next = e.newValue;
      if (next === "light" || next === "dark" || next === "system") {
        setThemeState(next);
      } else if (next === null) {
        setThemeState("system");
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setTheme = (nextTheme: Theme) => {
    setThemeState(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
