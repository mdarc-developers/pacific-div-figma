import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useRaffleTickets, MAX_RANGE_SIZE } from "@/app/hooks/useRaffleTickets";

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
    act(() => {
      result.current[1]("5555");
    });
    expect(result.current[0]).toEqual(["5555"]);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual(["5555"]);
  });

  it("addTicket trims whitespace before storing", () => {
    const { result } = renderHook(() => useRaffleTickets(CONF_ID));
    act(() => {
      result.current[1]("  42  ");
    });
    expect(result.current[0]).toEqual(["42"]);
  });

  it("addTicket ignores empty/whitespace-only input", () => {
    const { result } = renderHook(() => useRaffleTickets(CONF_ID));
    act(() => {
      result.current[1]("   ");
    });
    expect(result.current[0]).toEqual([]);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("addTicket does not add a duplicate ticket", () => {
    const { result } = renderHook(() => useRaffleTickets(CONF_ID));
    act(() => {
      result.current[1]("999");
    });
    act(() => {
      result.current[1]("999");
    });
    expect(result.current[0]).toEqual(["999"]);
  });

  it("removeTicket removes the ticket and updates localStorage", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(["1001", "1002"]));
    const { result } = renderHook(() => useRaffleTickets(CONF_ID));
    act(() => {
      result.current[2]("1001");
    });
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

  describe("addTicketRange", () => {
    it("adds a consecutive range of tickets", () => {
      const { result } = renderHook(() => useRaffleTickets(CONF_ID));
      act(() => {
        result.current[3](1001, 1005);
      });
      expect(result.current[0]).toEqual([
        "1001",
        "1002",
        "1003",
        "1004",
        "1005",
      ]);
      expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual([
        "1001",
        "1002",
        "1003",
        "1004",
        "1005",
      ]);
    });

    it("adds a single-ticket range (start === end)", () => {
      const { result } = renderHook(() => useRaffleTickets(CONF_ID));
      act(() => {
        result.current[3](42, 42);
      });
      expect(result.current[0]).toEqual(["42"]);
    });

    it("skips duplicate tickets within the range", () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(["1003"]));
      const { result } = renderHook(() => useRaffleTickets(CONF_ID));
      act(() => {
        result.current[3](1001, 1005);
      });
      expect(result.current[0]).toEqual([
        "1003",
        "1001",
        "1002",
        "1004",
        "1005",
      ]);
    });

    it("caps the range at MAX_RANGE_SIZE tickets", () => {
      const { result } = renderHook(() => useRaffleTickets(CONF_ID));
      act(() => {
        result.current[3](1, 1000);
      });
      expect(result.current[0]).toHaveLength(MAX_RANGE_SIZE);
      expect(result.current[0][0]).toBe("1");
      expect(result.current[0][MAX_RANGE_SIZE - 1]).toBe(
        String(MAX_RANGE_SIZE),
      );
    });

    it("handles reversed (start > end) by swapping internally", () => {
      const { result } = renderHook(() => useRaffleTickets(CONF_ID));
      act(() => {
        result.current[3](1005, 1001);
      });
      expect(result.current[0]).toEqual([
        "1001",
        "1002",
        "1003",
        "1004",
        "1005",
      ]);
    });
  });
});
