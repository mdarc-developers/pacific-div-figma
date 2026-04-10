import { useState } from "react";
import { ScheduleView } from "@/app/components/ScheduleView";
import { ForumsMapView } from "@/app/components/ForumsMapView";
import { useConference } from "@/app/contexts/ConferenceContext";
import { useSearch } from "@/app/contexts/SearchContext";
import { useBookmarkContext } from "@/app/contexts/BookmarkContext";
import { useBookmarkCountsContext } from "@/app/contexts/BookmarkCountsContext";
import { useNotesContext } from "@/app/contexts/NotesContext";
import { useSessionVoteContext } from "@/app/contexts/SessionVoteContext";
import { useVoteCountsContext } from "@/app/contexts/VoteCountsContext";
import { useMdarcDeveloper } from "@/app/hooks/useMdarcDeveloper";
import { MAP_DATA, ROOM_DATA, SESSION_DATA } from "@/lib/supplementalData";

export function ForumsPage() {
  const isMdarcDeveloper = useMdarcDeveloper();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { activeConference, allConferencesList, setActiveConference } =
    useConference();
  const { highlightForumRoomName } = useSearch();
  const { bookmarkedItems, toggleBookmark } = useBookmarkContext();
  const { sessionCounts } = useBookmarkCountsContext();
  const { notes, setNote } = useNotesContext();
  const { votedSessions, toggleSessionVote } = useSessionVoteContext();
  const { sessionVoteCounts } = useVoteCountsContext();
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const conferenceMaps = MAP_DATA[activeConference.id] || [];
  const roomEntry = ROOM_DATA[activeConference.id] ?? []; // url and Room[]
  //const roomArray = roomEntry ? roomEntry[1] : []; // Room[]
  const numSRurls = activeConference.mapSessionRooms?.length ?? 0; // num Session Room urls

  // Collect unique track values from forum sessions for category filtering
  const forumTracks = [
    ...new Set(
      (SESSION_DATA[activeConference.id] || [])
        .filter((s) => s.category?.toLowerCase() === "forums")
        .flatMap((s) => s.track ?? []),
    ),
  ].sort();

  return (
    <div className="block">
      {isMdarcDeveloper && activeConference.mapSessionRooms && (
        <div className="mb-4 p-3 rounded border border-yellow-400 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-600 text-xs font-mono text-yellow-900 dark:text-yellow-200">
          <p className="font-semibold mb-1">
            Developer: mapSessionRooms length{" "}
            {activeConference.mapSessionRooms.length}
          </p>
          {activeConference.mapSessionRooms.map((entry, index) => {
            const mapImg = conferenceMaps.find((m) => m.url === entry[0]);
            return (
              <div key={entry[0]}>
                <p>
                  #{index + 1} URL: {entry[0]}
                </p>
                <p>Sessions loaded: {String(entry[1])}</p>
                <p>Rooms loaded: {String(entry[2])}</p>
                <p>Categories: {JSON.stringify(mapImg?.category)}</p>
              </div>
            );
          })}
        </div>
      )}
      {numSRurls === 1 && (
        <ForumsMapView
          key={roomEntry[0]?.[0]}
          forumMap={conferenceMaps.find((m) => m.url === roomEntry[0]?.[0])}
          forumRooms={roomEntry[0]?.[1] ?? []}
          highlightForumRoomName={highlightForumRoomName}
        />
      )}
      {numSRurls > 1 &&
        roomEntry.flatMap(([roomUrl, mapRoomArray]) => {
          const mapImg = conferenceMaps.find((m) => m.url === roomUrl);
          //console.log("mapRoomArray: %s", JSON.stringify(mapRoomArray));
          if (!mapImg?.category?.includes("Forums")) return [];
          return [
            <ForumsMapView
              key={roomUrl}
              forumMap={mapImg}
              forumRooms={mapRoomArray}
              highlightForumRoomName={highlightForumRoomName}
            />,
          ];
        })}
      {forumTracks.length > 0 && (
        <div className="mb-4 p-3 rounded border border-blue-400 bg-blue-50 dark:bg-blue-950 dark:border-blue-600 text-xs text-blue-900 dark:text-blue-200">
          <p className="font-semibold mb-2">Filter by category:</p>
          <div className="flex flex-wrap gap-2">
            <button
              className={`px-2 py-1 rounded border text-xs font-medium transition-colors ${selectedTrack === null ? "bg-blue-600 text-white border-blue-600" : "bg-white dark:bg-blue-900 border-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800"}`}
              onClick={() => setSelectedTrack(null)}
            >
              All
            </button>
            {forumTracks.map((track) => (
              <button
                key={track}
                className={`px-2 py-1 rounded border text-xs font-medium transition-colors ${selectedTrack === track ? "bg-blue-600 text-white border-blue-600" : "bg-white dark:bg-blue-900 border-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800"}`}
                onClick={() =>
                  setSelectedTrack(selectedTrack === track ? null : track)
                }
              >
                {track}
              </button>
            ))}
          </div>
        </div>
      )}
      <ScheduleView
        bookmarkedSessions={bookmarkedItems}
        onToggleBookmark={toggleBookmark}
        categoryFilter="forums"
        trackFilter={selectedTrack ?? undefined}
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
