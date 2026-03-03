import { useState } from "react";
import { ExhibitorView } from "@/app/components/ExhibitorView";
import { ExhibitorsMapView } from "@/app/components/ExhibitorsMapView";
import { useConference } from "@/app/contexts/ConferenceContext";
import { useBookmarks } from "@/app/hooks/useBookmarks";
import { useMdarcDeveloper } from "@/app/hooks/useMdarcDeveloper";
import { MAP_DATA, BOOTH_DATA, EXHIBITOR_DATA } from "@/lib/sessionData";

export function ExhibitorsPage() {
  const isMdarcDeveloper = useMdarcDeveloper();
  const [highlightedExhibitorId, setHighlightedExhibitorId] = useState<
    string | undefined
  >(undefined);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { activeConference, allConferencesList, setActiveConference } =
    useConference();
  const [bookmarkedExhibitors, handleToggleBookmark] = useBookmarks(
    activeConference.id,
    "exhibitor_bookmarks_",
  );
  const conferenceMaps = MAP_DATA[activeConference.id] || [];
  const boothEntries = BOOTH_DATA[activeConference.id] ?? [];
  const exhibitorEntry = EXHIBITOR_DATA[activeConference.id];
  const mapExhibitors = exhibitorEntry ? exhibitorEntry[1] : [];
  const numEmaps = activeConference.mapExhibitorBooths?.length ?? 0;

  const handleLocationClick = (exhibitorId: string) => {
    setHighlightedExhibitorId(exhibitorId);
  };

  return (
    <div className="block">
      {isMdarcDeveloper && activeConference.mapExhibitorBooths && (
        <div className="mb-4 p-3 rounded border border-yellow-400 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-600 text-xs font-mono text-yellow-900 dark:text-yellow-200">
          <p className="font-semibold mb-1">
            Developer: mapExhibitorBooths length{" "}
            {activeConference.mapExhibitorBooths.length}
          </p>
          {activeConference.mapExhibitorBooths.map((entry) => (
            <div key={entry[0]}>
              <p>URL: {entry[0]}</p>
              <p>Exhibitors loaded: {String(entry[1])}</p>
              <p>Booths loaded: {String(entry[2])}</p>
            </div>
          ))}
        </div>
      )}
      {numEmaps === 1 && (
        <ExhibitorsMapView
          exhibitorsMap={conferenceMaps.find(
            (m) => m.url === boothEntries[0]?.[0],
          )}
          exhibitorBooths={boothEntries[0]?.[1] ?? []}
          mapExhibitors={mapExhibitors}
          highlightedExhibitorId={highlightedExhibitorId}
          onHighlightChange={setHighlightedExhibitorId}
        />
      )}
      {numEmaps > 1 &&
        boothEntries.map(([boothUrl, booths]) => {
          const mapImg = conferenceMaps.find((m) => m.url === boothUrl);
          // EXHIBITOR_DATA holds at most one [url, Exhibitor[]] tuple per conference.
          // Primary match: exhibitors whose declared URL matches this booth map URL.
          // Fallback: if the URL doesn't match (e.g. a supplemental exhibitor file whose
          // mapExhibitors URL was not updated after a booth reassignment), include any
          // exhibitor whose location IDs are present in this booth map and warn so data
          // editors know to fix the mismatch.
          const exhibitors = (() => {
            if (exhibitorEntry?.[0] === boothUrl) return exhibitorEntry[1];
            if (!exhibitorEntry) return [];
            const boothIds = new Set(booths.map((b) => b.id));
            const fallback = exhibitorEntry[1].filter((ex) =>
              ex.location.some((loc) => boothIds.has(loc)),
            );
            if (fallback.length > 0) {
              console.warn(
                `[ExhibitorsPage] ${fallback.length} exhibitor(s) have locations in booth map "${boothUrl}" ` +
                  `but mapExhibitors URL is "${exhibitorEntry[0]}". ` +
                  `Update the mapExhibitors URL (or booth assignments) to fix this mismatch.`,
              );
            }
            return fallback;
          })();
          return (
            <ExhibitorsMapView
              key={boothUrl}
              exhibitorsMap={mapImg}
              exhibitorBooths={booths}
              mapExhibitors={exhibitors}
              highlightedExhibitorId={highlightedExhibitorId}
              onHighlightChange={setHighlightedExhibitorId}
            />
          );
        })}
      <ExhibitorView
        bookmarkedExhibitors={bookmarkedExhibitors}
        onToggleBookmark={handleToggleBookmark}
        highlightExhibitorId={highlightedExhibitorId}
        onLocationClick={handleLocationClick}
      />
    </div>
  );
}
