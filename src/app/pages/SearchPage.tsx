import { useEffect, useRef } from "react";
import { ScheduleView } from "@/app/components/ScheduleView";
import { useBookmarkContext } from "@/app/contexts/BookmarkContext";
import { useSearchParams } from "react-router-dom";

export function SearchPage() {
  const { bookmarkedItems, toggleBookmark } = useBookmarkContext();
  const [searchParams] = useSearchParams();
  const highlightSessionId = searchParams.get("highlight");
  const scrollToRef = useRef<HTMLDivElement>(null);

  // Scroll to highlighted session when it changes
  useEffect(() => {
    if (highlightSessionId) {
      const timer = setTimeout(() => {
        const element = document.getElementById(
          `session-${highlightSessionId}`,
        );
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          element.focus();
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [highlightSessionId]);

  return (
    <div ref={scrollToRef}>
      <ScheduleView
        bookmarkedSessions={bookmarkedItems}
        onToggleBookmark={toggleBookmark}
        highlightSessionId={highlightSessionId || undefined}
      />
    </div>
  );
}
