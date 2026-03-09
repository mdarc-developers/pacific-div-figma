import React, {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import { loadFromStorage, saveToStorage } from "@/lib/localStorage";
import type { AlertHistoryItem } from "@/types/conference";

const STORAGE_KEY = "alert_history";

/** Maximum number of alerts retained in history. Oldest are dropped first. */
export const MAX_ALERT_HISTORY = 50;

interface AlertHistoryContextType {
  /** Alerts the user has seen, newest first. */
  alertHistory: AlertHistoryItem[];
  /** Record a newly-seen alert. Deduplicates by id. */
  addAlert: (item: AlertHistoryItem) => void;
  /** Remove all alerts from history. */
  clearHistory: () => void;
  /** Used by FirebaseAlertHistorySync to apply values loaded from Firestore. */
  overrideAlertHistory: (items: AlertHistoryItem[]) => void;
}

const AlertHistoryContext = createContext<AlertHistoryContextType | undefined>(
  undefined,
);

export function useAlertHistoryContext(): AlertHistoryContextType {
  const ctx = useContext(AlertHistoryContext);
  if (!ctx) {
    throw new Error(
      "useAlertHistoryContext must be used within an AlertHistoryProvider",
    );
  }
  return ctx;
}

export function AlertHistoryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [alertHistory, setAlertHistory] = useState<AlertHistoryItem[]>(() =>
    loadFromStorage<AlertHistoryItem[]>(STORAGE_KEY, []),
  );

  const addAlert = useCallback((item: AlertHistoryItem) => {
    setAlertHistory((prev) => {
      if (prev.some((a) => a.id === item.id)) return prev;
      // Newest first; trim to the max allowed history size.
      const next = [item, ...prev].slice(0, MAX_ALERT_HISTORY);
      saveToStorage(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setAlertHistory([]);
    saveToStorage(STORAGE_KEY, []);
  }, []);

  const overrideAlertHistory = useCallback((items: AlertHistoryItem[]) => {
    setAlertHistory(items);
    saveToStorage(STORAGE_KEY, items);
  }, []);

  return (
    <AlertHistoryContext.Provider
      value={{ alertHistory, addAlert, clearHistory, overrideAlertHistory }}
    >
      {children}
    </AlertHistoryContext.Provider>
  );
}
