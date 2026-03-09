import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  AlertHistoryProvider,
  useAlertHistoryContext,
  MAX_ALERT_HISTORY,
} from "@/app/contexts/AlertHistoryContext";
import type { AlertHistoryItem } from "@/types/conference";

// ── Mock localStorage ─────────────────────────────────────────────────────────
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

// ── Wrapper ───────────────────────────────────────────────────────────────────
function wrapper({ children }: { children: React.ReactNode }) {
  return <AlertHistoryProvider>{children}</AlertHistoryProvider>;
}

function makeAlert(id: string, timestamp = Date.now()): AlertHistoryItem {
  return { id, title: `Title ${id}`, body: `Body ${id}`, timestamp };
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("AlertHistoryContext", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it("throws when used outside AlertHistoryProvider", () => {
    expect(() => renderHook(() => useAlertHistoryContext())).toThrow(
      "useAlertHistoryContext must be used within an AlertHistoryProvider",
    );
  });

  it("initialises with an empty history", () => {
    const { result } = renderHook(() => useAlertHistoryContext(), { wrapper });
    expect(result.current.alertHistory).toEqual([]);
  });

  it("addAlert stores an alert in history", () => {
    const { result } = renderHook(() => useAlertHistoryContext(), { wrapper });
    act(() => result.current.addAlert(makeAlert("a1")));
    expect(result.current.alertHistory).toHaveLength(1);
    expect(result.current.alertHistory[0].id).toBe("a1");
  });

  it("addAlert deduplicates by id", () => {
    const { result } = renderHook(() => useAlertHistoryContext(), { wrapper });
    const alert = makeAlert("a1");
    act(() => result.current.addAlert(alert));
    act(() => result.current.addAlert(alert));
    expect(result.current.alertHistory).toHaveLength(1);
  });

  it("addAlert prepends so newest alert is first", () => {
    const { result } = renderHook(() => useAlertHistoryContext(), { wrapper });
    act(() => result.current.addAlert(makeAlert("a1", 1000)));
    act(() => result.current.addAlert(makeAlert("a2", 2000)));
    expect(result.current.alertHistory[0].id).toBe("a2");
  });

  it("clearHistory removes all alerts", () => {
    const { result } = renderHook(() => useAlertHistoryContext(), { wrapper });
    act(() => result.current.addAlert(makeAlert("a1")));
    act(() => result.current.clearHistory());
    expect(result.current.alertHistory).toEqual([]);
  });

  it("overrideAlertHistory replaces history", () => {
    const { result } = renderHook(() => useAlertHistoryContext(), { wrapper });
    act(() => result.current.addAlert(makeAlert("old")));
    act(() =>
      result.current.overrideAlertHistory([makeAlert("new1"), makeAlert("new2")]),
    );
    expect(result.current.alertHistory).toHaveLength(2);
    expect(result.current.alertHistory[0].id).toBe("new1");
  });

  it(`caps history at MAX_ALERT_HISTORY (${MAX_ALERT_HISTORY}) items`, () => {
    const { result } = renderHook(() => useAlertHistoryContext(), { wrapper });
    for (let i = 0; i < MAX_ALERT_HISTORY + 5; i++) {
      act(() => result.current.addAlert(makeAlert(`a${i}`, i)));
    }
    expect(result.current.alertHistory).toHaveLength(MAX_ALERT_HISTORY);
  });

  it("persists alerts to localStorage", () => {
    const { result } = renderHook(() => useAlertHistoryContext(), { wrapper });
    act(() => result.current.addAlert(makeAlert("ls1")));
    const stored = JSON.parse(
      localStorageMock.getItem("alert_history") ?? "[]",
    ) as AlertHistoryItem[];
    expect(stored.some((a) => a.id === "ls1")).toBe(true);
  });

  it("clears localStorage on clearHistory", () => {
    const { result } = renderHook(() => useAlertHistoryContext(), { wrapper });
    act(() => result.current.addAlert(makeAlert("ls2")));
    act(() => result.current.clearHistory());
    const stored = JSON.parse(
      localStorageMock.getItem("alert_history") ?? "[]",
    ) as AlertHistoryItem[];
    expect(stored).toHaveLength(0);
  });
});
