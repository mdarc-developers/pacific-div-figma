import { ScheduleView } from "@/app/components/ScheduleView";
import { ForumsMapView } from "@/app/components/ForumsMapView";
import { useConference } from "@/app/contexts/ConferenceContext";
import { useSearch } from "@/app/contexts/SearchContext";
import { MapImage } from "@/types/conference";
import { useBookmarks } from "@/app/hooks/useBookmarks";
import { MAP_DATA, ROOM_DATA } from "@/lib/sessionData";

export function ForumsPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { activeConference, allConferencesList, setActiveConference } =
    useConference();
  const { highlightForumRoomName } = useSearch();
  const [bookmarkedSessions, handleToggleBookmark] = useBookmarks(
    activeConference.id,
  );
  const forumMapUrl = ROOM_DATA[activeConference.id]?.[0];
  const forumRooms = ROOM_DATA[activeConference.id]?.[1] || [];
  const conferenceMaps = MAP_DATA[activeConference.id] || [];

  const forumMap: MapImage = conferenceMaps.find(
    (m) => m.url === forumMapUrl,
  ) || {
    // when using origHeightNum assume origWidthNum is set as well
    // this is a backup default image
    id: "map-0",
    conferenceId: "pacificon-2026",
    name: "noForumMapFound",
    url: "/assets/maps/pacificon-forums-2025.jpg",
    order: 6,
    origHeightNum: 256,
    origWidthNum: 582,
  };

  return (
    <div className="block">
      <ForumsMapView
        forumMap={forumMap}
        forumRooms={forumRooms}
        highlightForumRoomName={highlightForumRoomName}
      />
      <ScheduleView
        bookmarkedSessions={bookmarkedSessions}
        onToggleBookmark={handleToggleBookmark}
      />
    </div>
  );
}
