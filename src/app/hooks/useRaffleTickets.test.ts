import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useRaffleTickets } from "@/app/hooks/useRaffleTickets";

const CONF_ID = "test-conf-2026";
const STORAGE_KEY = `raffle_tickets_${CONF_ID}`;

beforeEach(() => localStorage.clear());
afterEach(() => localStorage.clear());

describe("useRaffleTickets", () => {
  it("starts with an empty list when localStorage is empty", () => {
    const { result } = renderHook(() => useRaffleTickets(CONF_ID));
    expect(result.current[0]).toEqual([]);
  });

  it("loads persisted tickets from localStorage on mount", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(["1001", "1002"]));
    const { result } = renderHook(() => useRaffleTickets(CONF_ID));
    expect(result.current[0]).toEqual(["1001", "1002"]);
  });

  it("addTicket persists the ticket to localStorage", () => {
    const { result } = renderHook(() => useRaffleTickets(CONF_ID));
    act(() => { result.current[1]("5555"); });
    expect(result.current[0]).toEqual(["5555"]);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual(["5555"]);
  });

  it("addTicket trims whitespace before storing", () => {
    const { result } = renderHook(() => useRaffleTickets(CONF_ID));
    act(() => { result.current[1]("  42  "); });
    expect(result.current[0]).toEqual(["42"]);
  });

  it("addTicket ignores empty/whitespace-only input", () => {
    const { result } = renderHook(() => useRaffleTickets(CONF_ID));
    act(() => { result.current[1]("   "); });
    expect(result.current[0]).toEqual([]);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("addTicket does not add a duplicate ticket", () => {
    const { result } = renderHook(() => useRaffleTickets(CONF_ID));
    act(() => { result.current[1]("999"); });
    act(() => { result.current[1]("999"); });
    expect(result.current[0]).toEqual(["999"]);
  });

  it("removeTicket removes the ticket and updates localStorage", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(["1001", "1002"]));
    const { result } = renderHook(() => useRaffleTickets(CONF_ID));
    act(() => { result.current[2]("1001"); });
    expect(result.current[0]).toEqual(["1002"]);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual(["1002"]);
  });

  it("reloads tickets when conferenceId changes", () => {
    const CONF_ID_B = "other-conf-2026";
    localStorage.setItem(STORAGE_KEY, JSON.stringify(["A"]));
    localStorage.setItem(`raffle_tickets_${CONF_ID_B}`, JSON.stringify(["B"]));

    const { result, rerender } = renderHook(
      ({ id }: { id: string }) => useRaffleTickets(id),
      { initialProps: { id: CONF_ID } },
    );
    expect(result.current[0]).toEqual(["A"]);
    rerender({ id: CONF_ID_B });
    expect(result.current[0]).toEqual(["B"]);
  });
});
