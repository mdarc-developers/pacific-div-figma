import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { AdminStatsBar } from "@/app/components/AdminStatsBar";

// ── mock useAdminStats ──────────────────────────────────────────────────────
vi.mock("@/app/hooks/useAdminStats", () => ({
  useAdminStats: vi.fn(),
}));

import { useAdminStats } from "@/app/hooks/useAdminStats";

const mockUseAdminStats = useAdminStats as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("AdminStatsBar", () => {
  it("renders the banner element", () => {
    mockUseAdminStats.mockReturnValue({
      userProfileCount: 42,
      loading: false,
      error: null,
    });
    render(<AdminStatsBar />);
    expect(screen.getByTestId("admin-stats-bar")).toBeInTheDocument();
  });

  it("shows 'loading…' while data is being fetched", () => {
    mockUseAdminStats.mockReturnValue({
      userProfileCount: null,
      loading: true,
      error: null,
    });
    render(<AdminStatsBar />);
    expect(screen.getByTestId("admin-stats-loading")).toBeInTheDocument();
  });

  it("shows the user profile count when loaded", () => {
    mockUseAdminStats.mockReturnValue({
      userProfileCount: 7,
      loading: false,
      error: null,
    });
    render(<AdminStatsBar />);
    expect(screen.getByTestId("admin-stats-count")).toHaveTextContent("7");
  });

  it("shows 0 when userProfileCount is null after loading", () => {
    mockUseAdminStats.mockReturnValue({
      userProfileCount: null,
      loading: false,
      error: null,
    });
    render(<AdminStatsBar />);
    expect(screen.getByTestId("admin-stats-count")).toHaveTextContent("0");
  });

  it("shows error indicator on fetch failure", () => {
    mockUseAdminStats.mockReturnValue({
      userProfileCount: null,
      loading: false,
      error: "Permission denied",
    });
    render(<AdminStatsBar />);
    expect(screen.getByTestId("admin-stats-error")).toBeInTheDocument();
  });
});
