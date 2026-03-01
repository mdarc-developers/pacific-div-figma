import { useState, useCallback, useEffect } from "react";
import { loadFromStorage, saveToStorage } from "@/lib/localStorage";

const STORAGE_KEY_PREFIX = "raffle_tickets_";

/** Maximum number of tickets that can be added in a single range operation. */
export const MAX_RANGE_SIZE = 100;

export function useRaffleTickets(
  conferenceId: string,
): [
  tickets: string[],
  addTicket: (ticket: string) => void,
  removeTicket: (ticket: string) => void,
  addTicketRange: (start: number, end: number) => void,
] {
  const key = STORAGE_KEY_PREFIX + conferenceId;

  const [tickets, setTickets] = useState<string[]>(() =>
    loadFromStorage<string[]>(key, []),
  );

  // Reload when the active conference changes
  useEffect(() => {
    setTickets(loadFromStorage<string[]>(key, []));
  }, [key]);

  const addTicket = useCallback(
    (ticket: string) => {
      const trimmed = ticket.trim();
      if (!trimmed) return;
      setTickets((prev) => {
        if (prev.includes(trimmed)) return prev;
        const next = [...prev, trimmed];
        saveToStorage(key, next);
        return next;
      });
    },
    [key],
  );

  const removeTicket = useCallback(
    (ticket: string) => {
      setTickets((prev) => {
        const next = prev.filter((t) => t !== ticket);
        saveToStorage(key, next);
        return next;
      });
    },
    [key],
  );

  /**
   * Add all ticket numbers from `start` to `end` (inclusive).
   * Silently skips duplicates. Capped at MAX_RANGE_SIZE tickets.
   */
  const addTicketRange = useCallback(
    (start: number, end: number) => {
      const lo = Math.min(start, end);
      const hi = Math.min(lo + MAX_RANGE_SIZE - 1, Math.max(start, end));
      setTickets((prev) => {
        const prevSet = new Set(prev);
        const toAdd: string[] = [];
        for (let n = lo; n <= hi; n++) {
          const s = String(n);
          if (!prevSet.has(s)) toAdd.push(s);
        }
        if (toAdd.length === 0) return prev;
        const next = [...prev, ...toAdd];
        saveToStorage(key, next);
        return next;
      });
    },
    [key],
  );

  return [tickets, addTicket, removeTicket, addTicketRange];
}
