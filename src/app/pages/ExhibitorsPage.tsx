import { useState } from "react";
import { ExhibitorView } from "@/app/components/ExhibitorView";
import { ExhibitorsMapView } from "@/app/components/ExhibitorsMapView";
import { useConference } from "@/app/contexts/ConferenceContext";
import { useExhibitorBookmarkContext } from "@/app/contexts/ExhibitorBookmarkContext";
import { useBookmarkCountsContext } from "@/app/contexts/BookmarkCountsContext";
import { useExhibitorVoteContext } from "@/app/contexts/ExhibitorVoteContext";
import { useVoteCountsContext } from "@/app/contexts/VoteCountsContext";
import { useExhibitorNotesContext } from "@/app/contexts/ExhibitorNotesContext";
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
  const { bookmarkedExhibitors, toggleExhibitorBookmark } =
    useExhibitorBookmarkContext();
  const { exhibitorCounts } = useBookmarkCountsContext();
  const { votedExhibitors, toggleExhibitorVote } = useExhibitorVoteContext();
  const { exhibitorVoteCounts } = useVoteCountsContext();
  const { notes: exhibitorNotes, setNote: setExhibitorNote } =
    useExhibitorNotesContext();
  const conferenceMaps = MAP_DATA[activeConference.id] || [];
  const boothEntry = BOOTH_DATA[activeConference.id] ?? []; // url and Booth[]
  const exhibitorEntry = EXHIBITOR_DATA[activeConference.id]; // url and Exhibitor[]
  const exhibitorArray = exhibitorEntry ? exhibitorEntry[1] : []; // Exhibitor[]
  const numEBurls = activeConference.mapExhibitorBooths?.length ?? 0; // num of Exhibitor Booth image urls

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
      {numEBurls === 1 && (
        <ExhibitorsMapView
          exhibitorsMap={conferenceMaps.find(
            (m) => m.url === boothEntry[0]?.[0],
          )}
          exhibitorBooths={boothEntry[0]?.[1] ?? []}
          mapExhibitors={exhibitorArray}
          highlightedExhibitorId={highlightedExhibitorId}
          onHighlightChange={setHighlightedExhibitorId}
        />
      )}
      {numEBurls > 1 &&
        boothEntry.map(([boothUrl, booths]) => {
          const mapImg = conferenceMaps.find((m) => m.url === boothUrl);
          // EXHIBITOR_DATA holds possibly multiple [url, Exhibitor[]] tuple per conference.
          // Primary match: exhibitors whose declared URL matches this booth map URL.
          // Fallback: if the URL doesn't match (e.g. a supplemental exhibitor file whose
          //   mapExhibitors URL was not updated after a booth reassignment), include any
          //   exhibitor whose location IDs are present in this booth map and warn so data
          //   editors know to fix the mismatch.
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
        onToggleBookmark={toggleExhibitorBookmark}
        highlightExhibitorId={highlightedExhibitorId}
        onLocationClick={handleLocationClick}
        exhibitorBookmarkCounts={exhibitorCounts}
        votedExhibitors={votedExhibitors}
        onToggleVote={toggleExhibitorVote}
        exhibitorVoteCounts={exhibitorVoteCounts}
        exhibitorNotes={exhibitorNotes}
        onSaveExhibitorNote={setExhibitorNote}
      />
    </div>
  );
}
