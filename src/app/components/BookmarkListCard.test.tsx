import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BookmarkListCard } from "@/app/components/BookmarkListCard";
import { Session } from "@/types/conference";

const makeSessions = (): Session[] => [
  {
    id: "s1",
    title: "Intro to Ham Radio",
    description: "Beginner session",
    speaker: ["Alice"],
    location: "Room A",
    startTime: "2026-10-16T09:00:00",
    endTime: "2026-10-16T10:00:00",
    category: "Beginner",
  },
  {
    id: "s2",
    title: "Advanced Antennas",
    description: "Expert session",
    speaker: ["Bob"],
    location: "Room B",
    startTime: "2026-10-16T11:00:00",
    endTime: "2026-10-16T12:00:00",
    category: "Advanced",
  },
  {
    id: "s3",
    title: "Digital Modes",
    description: "Digital session",
    speaker: ["Carol"],
    location: "Room C",
    startTime: "2026-10-16T13:00:00",
    endTime: "2026-10-16T14:00:00",
    category: "Digital",
  },
];

describe("BookmarkListCard", () => {
  it("renders without crashing", () => {
    expect(() =>
      render(
        <BookmarkListCard
          sessions={[]}
          bookmarkedIds={[]}
          prevBookmarkedIds={[]}
          onToggleBookmark={vi.fn()}
        />,
      ),
    ).not.toThrow();
  });

  it("shows 'None yet' for bookmarks when no bookmarks exist", () => {
    render(
      <BookmarkListCard
        sessions={makeSessions()}
        bookmarkedIds={[]}
        prevBookmarkedIds={[]}
        onToggleBookmark={vi.fn()}
      />,
    );
    // Both "Bookmarks" and "Prizes won" show "None yet"; verify the bookmark count badge is absent
    expect(screen.getAllByText(/none yet/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByTestId("bookmark-list")).not.toBeInTheDocument();
  });

  it("shows bookmarked session titles with filled bookmark button", () => {
    render(
      <BookmarkListCard
        sessions={makeSessions()}
        bookmarkedIds={["s1", "s2"]}
        prevBookmarkedIds={[]}
        onToggleBookmark={vi.fn()}
      />,
    );
    expect(screen.getByText("Intro to Ham Radio")).toBeInTheDocument();
    expect(screen.getByText("Advanced Antennas")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /remove bookmark for intro to ham radio/i }),
    ).toBeInTheDocument();
  });

  it("shows the bookmark count badge", () => {
    render(
      <BookmarkListCard
        sessions={makeSessions()}
        bookmarkedIds={["s1", "s2"]}
        prevBookmarkedIds={[]}
        onToggleBookmark={vi.fn()}
      />,
    );
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("shows previously-bookmarked sessions greyed out with re-bookmark button", () => {
    render(
      <BookmarkListCard
        sessions={makeSessions()}
        bookmarkedIds={[]}
        prevBookmarkedIds={["s3"]}
        onToggleBookmark={vi.fn()}
      />,
    );
    expect(screen.getByText("Digital Modes")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /re-bookmark digital modes/i }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("prev-bookmark-item")).toBeInTheDocument();
  });

  it("shows 'Previously bookmarked' label when previous items exist", () => {
    render(
      <BookmarkListCard
        sessions={makeSessions()}
        bookmarkedIds={["s1"]}
        prevBookmarkedIds={["s3"]}
        onToggleBookmark={vi.fn()}
      />,
    );
    expect(screen.getByText(/previously bookmarked/i)).toBeInTheDocument();
  });

  it("calls onToggleBookmark when unbookmark button is clicked", () => {
    const toggle = vi.fn();
    render(
      <BookmarkListCard
        sessions={makeSessions()}
        bookmarkedIds={["s1"]}
        prevBookmarkedIds={[]}
        onToggleBookmark={toggle}
      />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: /remove bookmark for intro to ham radio/i }),
    );
    expect(toggle).toHaveBeenCalledWith("s1");
  });

  it("calls onToggleBookmark when re-bookmark button is clicked", () => {
    const toggle = vi.fn();
    render(
      <BookmarkListCard
        sessions={makeSessions()}
        bookmarkedIds={[]}
        prevBookmarkedIds={["s3"]}
        onToggleBookmark={toggle}
      />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: /re-bookmark digital modes/i }),
    );
    expect(toggle).toHaveBeenCalledWith("s3");
  });

  it("does not render a list when session IDs have no matching session data", () => {
    render(
      <BookmarkListCard
        sessions={[]}
        bookmarkedIds={["unknown-id"]}
        prevBookmarkedIds={[]}
        onToggleBookmark={vi.fn()}
      />,
    );
    expect(screen.queryByTestId("bookmark-list")).not.toBeInTheDocument();
  });
});
