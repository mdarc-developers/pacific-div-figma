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
      signupCount: 50,
      loading: false,
      error: null,
    });
    render(<AdminStatsBar />);
    expect(screen.getByTestId("admin-stats-bar")).toBeInTheDocument();
  });

  it("shows 'loading…' while data is being fetched", () => {
    mockUseAdminStats.mockReturnValue({
      userProfileCount: null,
      signupCount: null,
      loading: true,
      error: null,
    });
    render(<AdminStatsBar />);
    expect(screen.getByTestId("admin-stats-loading")).toBeInTheDocument();
  });

  it("shows the user profile count when loaded", () => {
    mockUseAdminStats.mockReturnValue({
      userProfileCount: 7,
      signupCount: 10,
      loading: false,
      error: null,
    });
    render(<AdminStatsBar />);
    expect(screen.getByTestId("admin-stats-count")).toHaveTextContent("7");
  });

  it("shows 0 when userProfileCount is null after loading", () => {
    mockUseAdminStats.mockReturnValue({
      userProfileCount: null,
      signupCount: null,
      loading: false,
      error: null,
    });
    render(<AdminStatsBar />);
    expect(screen.getByTestId("admin-stats-count")).toHaveTextContent("0");
  });

  it("shows error indicator on fetch failure", () => {
    mockUseAdminStats.mockReturnValue({
      userProfileCount: null,
      signupCount: null,
      loading: false,
      error: "Permission denied",
    });
    render(<AdminStatsBar />);
    expect(screen.getByTestId("admin-stats-error")).toBeInTheDocument();
    expect(screen.getByTestId("admin-stats-error")).toHaveTextContent(
      "Permission denied",
    );
    expect(screen.getByTestId("admin-stats-error")).toHaveAttribute(
      "title",
      "Permission denied",
    );
  });

  it("shows the signup count from the cloud function counter", () => {
    mockUseAdminStats.mockReturnValue({
      userProfileCount: 7,
      signupCount: 15,
      loading: false,
      error: null,
    });
    render(<AdminStatsBar />);
    expect(screen.getByTestId("admin-stats-signup-count")).toHaveTextContent(
      "15",
    );
  });

  it("shows 0 for signup count when signupCount is null after loading", () => {
    mockUseAdminStats.mockReturnValue({
      userProfileCount: 3,
      signupCount: null,
      loading: false,
      error: null,
    });
    render(<AdminStatsBar />);
    expect(screen.getByTestId("admin-stats-signup-count")).toHaveTextContent(
      "0",
    );
  });

  it("hides signup count while loading", () => {
    mockUseAdminStats.mockReturnValue({
      userProfileCount: null,
      signupCount: null,
      loading: true,
      error: null,
    });
    render(<AdminStatsBar />);
    expect(
      screen.queryByTestId("admin-stats-signup-count"),
    ).not.toBeInTheDocument();
  });

  it("renders a link to the Firebase Console", () => {
    mockUseAdminStats.mockReturnValue({
      userProfileCount: 5,
      signupCount: 10,
      loading: false,
      error: null,
    });
    render(<AdminStatsBar />);
    const link = screen.getByTestId("admin-firebase-console-link");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      "href",
      "https://console.firebase.google.com/project/pacific-div/overview",
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders a link to Google Cloud Logs", () => {
    mockUseAdminStats.mockReturnValue({
      userProfileCount: 5,
      signupCount: 10,
      loading: false,
      error: null,
    });
    render(<AdminStatsBar />);
    const link = screen.getByTestId("admin-cloud-logs-link");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      "href",
      "https://console.cloud.google.com/logs?project=pacific-div",
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
