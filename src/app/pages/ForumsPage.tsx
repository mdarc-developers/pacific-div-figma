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
  const roomEntry = ROOM_DATA[activeConference.id] ?? []; // url and Room[]
  //const roomArray = roomEntry ? roomEntry[1] : []; // Room[]
  const numSRurls = activeConference.mapSessionRooms?.length ?? 0; // num Session Room urls

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
      {numSRurls === 1 && (
        <ForumsMapView
          key={roomEntry[0]?.[0]}
          forumMap={conferenceMaps.find(
              (m) => m.url === roomEntry[0]?.[0]
          )}
          forumRooms={roomEntry[0]?.[1] ?? []}
          highlightForumRoomName={highlightForumRoomName}
        />
      )}
      {numSRurls > 1 &&
        roomEntry.map(([roomUrl, mapRoomArray]) => {
          const mapImg = conferenceMaps.find((m) => m.url === roomUrl);
          //console.log("mapRoomArray: %s", JSON.stringify(mapRoomArray));
          return (
            <ForumsMapView
              key={roomUrl}
              forumMap={mapImg}
              forumRooms={mapRoomArray}
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
