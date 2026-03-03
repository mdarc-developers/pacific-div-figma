import { ScheduleView } from "@/app/components/ScheduleView";
import { ForumsMapView } from "@/app/components/ForumsMapView";
import { useConference } from "@/app/contexts/ConferenceContext";
import { useSearch } from "@/app/contexts/SearchContext";
import { useBookmarks } from "@/app/hooks/useBookmarks";
import { useMdarcDeveloper } from "@/app/hooks/useMdarcDeveloper";
import { MAP_DATA, ROOM_DATA } from "@/lib/sessionData";

export function ForumsPage() {
  const isMdarcDeveloper = useMdarcDeveloper();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { activeConference, allConferencesList, setActiveConference } =
    useConference();
  const { highlightForumRoomName } = useSearch();
  const [bookmarkedSessions, handleToggleBookmark] = useBookmarks(
    activeConference.id,
  );
  const conferenceMaps = MAP_DATA[activeConference.id] || [];
  const roomEntries = ROOM_DATA[activeConference.id] ?? [];
  const numRmaps = activeConference.mapSessionRooms?.length ?? 0;

  return (
    <div className="block">
      {isMdarcDeveloper && activeConference.mapSessionRooms && (
        <div className="mb-4 p-3 rounded border border-yellow-400 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-600 text-xs font-mono text-yellow-900 dark:text-yellow-200">
          <p className="font-semibold mb-1">
            Developer: mapSessionRooms length{" "}
            {activeConference.mapSessionRooms.length}
          </p>
          {activeConference.mapSessionRooms.map((entry) => (
            <div key={entry[0]}>
              <p>URL: {entry[0]}</p>
              <p>Sessions loaded: {String(entry[1])}</p>
              <p>Rooms loaded: {String(entry[2])}</p>
            </div>
          ))}
        </div>
      )}
      {numRmaps === 1 && (
        <ForumsMapView
          forumMap={conferenceMaps.find((m) => m.url === roomEntries[0]?.[0])}
          forumRooms={roomEntries[0]?.[1] ?? []}
          highlightForumRoomName={highlightForumRoomName}
        />
      )}
      {numRmaps > 1 &&
        roomEntries.map(([roomUrl, mapRoomList]) => {
          const mapImg = conferenceMaps.find((m) => m.url === roomUrl);
          return (
            <ForumsMapView
              key={roomUrl}
              forumMap={mapImg}
              forumRooms={mapRoomList}
              highlightForumRoomName={highlightForumRoomName}
            />
          );
        })}
      <ScheduleView
        bookmarkedSessions={bookmarkedSessions}
        onToggleBookmark={handleToggleBookmark}
      />
    </div>
  );
}
