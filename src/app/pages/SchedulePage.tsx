import { ScheduleView } from "@/app/components/ScheduleView";
import { useConference } from "@/app/contexts/ConferenceContext";
import { useBookmarks } from "@/app/hooks/useBookmarks";

export function SchedulePage() {
  const { activeConference } = useConference();
  const [bookmarkedSessions, handleToggleBookmark] = useBookmarks(
    activeConference.id,
  );

  return (
    <div>
      <ScheduleView
        bookmarkedSessions={bookmarkedSessions}
        onToggleBookmark={handleToggleBookmark}
      />
    </div>
  );
}
