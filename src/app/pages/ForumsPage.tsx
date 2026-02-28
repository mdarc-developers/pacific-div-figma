import { ScheduleView } from "@/app/components/ScheduleView";
import { ForumsMapView } from "@/app/components/ForumsMapView";
import { useConference } from "@/app/contexts/ConferenceContext";
import { useSearch } from "@/app/contexts/SearchContext";
import { MapImage, Room } from "@/types/conference";
import { useBookmarks } from "@/app/hooks/useBookmarks";

interface MapsModule {
  conferenceMaps?: MapImage[];
  [key: string]: unknown;
}

interface RoomModule {
  mapRooms?: [string, Room[]];
  [key: string]: unknown;
}

// Import all session data files at once using Vite's glob import
// This imports all files matching the pattern eagerly (at build time)
const conferenceModules = import.meta.glob("../../data/*-20[0-9][0-9].ts", {
  eager: true,
});

// Process the modules into a lookup object
const MAP_DATA: Record<string, MapImage[]> = {};
const ROOM_DATA: Record<string, [string, Room[]]> = {};
Object.entries(conferenceModules).forEach(([path, module]) => {
  // Extract the conference ID from the file path
  // e.g., "../../data/pacificon-2026.ts" -> "pacificon-2026"
  const conferenceId = path.split("/").pop()?.replace(".ts", "") || "";
  const typedMapModule = module as MapsModule;
  const typedRoomModule = module as RoomModule;
  if (typedMapModule.conferenceMaps) {
    MAP_DATA[conferenceId] = typedMapModule.conferenceMaps;
  }
  if (typedRoomModule.mapRooms) {
    ROOM_DATA[conferenceId] = typedRoomModule.mapRooms;
  }
});

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
