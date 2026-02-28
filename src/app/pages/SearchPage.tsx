import { useEffect, useRef } from "react";
import { ScheduleView } from "@/app/components/ScheduleView";
import { useConference } from "@/app/contexts/ConferenceContext";
import { useBookmarks } from "@/app/hooks/useBookmarks";
import { useSearchParams } from "react-router-dom";

export function SearchPage() {
  const { activeConference } = useConference();
  const [bookmarkedSessions, handleToggleBookmark] = useBookmarks(
    activeConference.id,
  );
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
        bookmarkedSessions={bookmarkedSessions}
        onToggleBookmark={handleToggleBookmark}
        highlightSessionId={highlightSessionId || undefined}
      />
    </div>
  );
}
