import { ScheduleView } from "@/app/components/ScheduleView";
import { useBookmarkContext } from "@/app/contexts/BookmarkContext";
import { useNotesContext } from "@/app/contexts/NotesContext";
import { useSearchParams } from "react-router-dom";

export function SchedulePage() {
  const { bookmarkedItems, toggleBookmark } = useBookmarkContext();
  const { notes, setNote } = useNotesContext();
  const [searchParams] = useSearchParams();
  const highlightSessionId = searchParams.get("highlight") ?? undefined;

  return (
    <div>
      <ScheduleView
        bookmarkedSessions={bookmarkedItems}
        onToggleBookmark={toggleBookmark}
        highlightSessionId={highlightSessionId}
        notes={notes}
        onSaveNote={setNote}
      />
    </div>
  );
}
