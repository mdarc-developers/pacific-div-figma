import { ScheduleView } from "@/app/components/ScheduleView";
import { useBookmarkContext } from "@/app/contexts/BookmarkContext";

export function SchedulePage() {
  const { bookmarkedItems, toggleBookmark } = useBookmarkContext();

  return (
    <div>
      <ScheduleView
        bookmarkedSessions={bookmarkedItems}
        onToggleBookmark={toggleBookmark}
      />
    </div>
  );
}
