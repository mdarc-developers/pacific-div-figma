import { useState, useCallback, useEffect } from "react";
import { loadFromStorage, saveToStorage } from "@/lib/localStorage";

const STORAGE_KEY_PREFIX = "raffle_tickets_";

export function useRaffleTickets(
  conferenceId: string,
): [string[], (ticket: string) => void, (ticket: string) => void] {
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

  return [tickets, addTicket, removeTicket];
}
