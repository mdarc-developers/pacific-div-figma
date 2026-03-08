import { ScheduleView } from "@/app/components/ScheduleView";
import { useBookmarkContext } from "@/app/contexts/BookmarkContext";
import { useNotesContext } from "@/app/contexts/NotesContext";
import { useBookmarkCountsContext } from "@/app/contexts/BookmarkCountsContext";
import { useVoteContext } from "@/app/contexts/VoteContext";
import { useVoteCountsContext } from "@/app/contexts/VoteCountsContext";
import { useSearchParams } from "react-router-dom";

export function SchedulePage() {
  const { bookmarkedItems, toggleBookmark } = useBookmarkContext();
  const { notes, setNote } = useNotesContext();
  const { sessionCounts } = useBookmarkCountsContext();
  const { votedSessions, toggleSessionVote } = useVoteContext();
  const { sessionVoteCounts } = useVoteCountsContext();
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
        sessionBookmarkCounts={sessionCounts}
        votedSessions={votedSessions}
        onToggleSessionVote={toggleSessionVote}
        sessionVoteCounts={sessionVoteCounts}
      />
    </div>
  );
}
