import { useRef, useEffect, useState } from "react";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Textarea } from "@/app/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import { Bookmark, MapPin, Star, StickyNote } from "lucide-react";
import { Exhibitor } from "@/types/conference";
//import { EventInput } from "@fullcalendar/core";
import { useConference } from "@/app/contexts/ConferenceContext";
import { blendWithWhite, contrastingColor } from "@/lib/colorUtils";
import { EXHIBITOR_DATA } from "@/lib/sessionData";
import { sanitizeExhibitorUrl } from "@/lib/urlUtils";

interface ExhibitorViewProps {
  bookmarkedExhibitors?: string[];
  onToggleBookmark?: (exhibitorId: string) => void;
  highlightExhibitorId?: string;
  onLocationClick?: (exhibitorId: string) => void;
  /** Aggregate bookmark counts keyed by exhibitor id. */
  exhibitorBookmarkCounts?: Record<string, number>;
  /** Exhibitors the current user has voted for. */
  votedExhibitors?: string[];
  onToggleVote?: (exhibitorId: string) => void;
  /** Aggregate vote counts keyed by exhibitor id. */
  exhibitorVoteCounts?: Record<string, number>;
  /** Notes for exhibitors keyed by exhibitor id. */
  exhibitorNotes?: Record<string, string>;
  onSaveExhibitorNote?: (exhibitorId: string, text: string) => void;
}

// NEW: Separate component for individual exhibitor
interface ExhibitorCardProps {
  exhibitor: Exhibitor;
  isBookmarked: boolean;
  isHighlighted: boolean;
  onToggleBookmark?: (exhibitorId: string) => void;
  onLocationClick?: (exhibitorId: string) => void;
  bookmarkCount?: number;
  isVoted?: boolean;
  onToggleVote?: (exhibitorId: string) => void;
  voteCount?: number;
  note?: string;
  onSaveNote?: (exhibitorId: string, text: string) => void;
}

function ExhibitorCard({
  exhibitor,
  isBookmarked,
  isHighlighted,
  onToggleBookmark,
  onLocationClick,
  bookmarkCount,
  isVoted,
  onToggleVote,
  voteCount,
  note,
  onSaveNote,
}: ExhibitorCardProps) {
  const exhibitorRef = useRef<HTMLDivElement>(null);
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [draftNote, setDraftNote] = useState(note ?? "");

  // Keep draft in sync if the saved note changes externally (e.g. Firestore load),
  // but only when the editor is not currently open to avoid discarding in-progress edits.
  useEffect(() => {
    if (!showNoteEditor) {
      setDraftNote(note ?? "");
    }
  }, [note, showNoteEditor]);

  useEffect(() => {
    if (isHighlighted && exhibitorRef.current) {
      exhibitorRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [isHighlighted]);

  const handleSaveNote = () => {
    onSaveNote?.(exhibitor.id, draftNote);
    setShowNoteEditor(false);
  };

  const handleCancelNote = () => {
    setDraftNote(note ?? "");
    setShowNoteEditor(false);
  };

  const safeUrl = sanitizeExhibitorUrl(exhibitor.url);

  return (
    <div
      ref={exhibitorRef}
      id={`${exhibitor.id}`}
      className={`mb-4 transition-all ${
        isHighlighted ? "ring-2 ring-blue-500 shadow-lg scale-105" : ""
      }`}
    >
      <Card
        className={`transition-all ${isHighlighted ? "ring-2 ring-blue-500 shadow-lg scale-105" : ""}`}
      >
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              {safeUrl ? (
                <a href={safeUrl} rel="noopener noreferrer" target="_blank">
                  <CardTitle className="text-lg mb-2">{exhibitor.name}</CardTitle>
                </a>
              ) : (
                <CardTitle className="text-lg mb-2">{exhibitor.name}</CardTitle>
              )}
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge variant="secondary">{exhibitor.type}</Badge>
              </div>
            </div>
            {onToggleBookmark && (
              <div className="flex items-center gap-1 ml-2 shrink-0">
                {bookmarkCount !== undefined && bookmarkCount >= 0 && (
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {bookmarkCount}
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onToggleBookmark(exhibitor.id)}
                >
                  <Bookmark
                    className={`h-5 w-5 ${
                      isBookmarked ? "fill-current text-blue-600" : ""
                    }`}
                  />
                </Button>
              </div>
            )}
            {onToggleVote && (
              <div className="flex items-center gap-1 ml-1 shrink-0">
                <span className="text-xs text-muted-foreground tabular-nums">
                  {voteCount ?? 0}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onToggleVote(exhibitor.id)}
                  aria-label={
                    isVoted ? "Remove vote" : "Vote for this exhibitor"
                  }
                >
                  <Star
                    className={`h-5 w-5 ${
                      isVoted ? "fill-current text-yellow-500" : ""
                    }`}
                  />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {exhibitor.description}
          </p>
          <div className="space-y-2 text-sm">
            <div
              className={`flex items-center gap-2 text-gray-700 dark:text-gray-300 ${
                onLocationClick
                  ? "cursor-pointer hover:text-amber-500 transition-colors"
                  : ""
              }`}
              onClick={
                onLocationClick
                  ? () => onLocationClick(exhibitor.id)
                  : undefined
              }
              onKeyDown={
                onLocationClick
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onLocationClick(exhibitor.id);
                      }
                    }
                  : undefined
              }
              role={onLocationClick ? "button" : undefined}
              tabIndex={onLocationClick ? 0 : undefined}
              aria-label={
                onLocationClick
                  ? `Highlight booth for ${exhibitor.name}`
                  : undefined
              }
            >
              <MapPin className="h-4 w-4" />
              <span>{exhibitor.boothName}</span>
            </div>
          </div>
          {/* Notes section — only shown when the parent provides a save handler */}
          {onSaveNote && (
            <div className="mt-3">
              {note && !showNoteEditor && (
                <div
                  className="text-xs text-muted-foreground bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded p-2 mb-2 cursor-pointer hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
                  onClick={() => setShowNoteEditor(true)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) =>
                    e.key === "Enter" && setShowNoteEditor(true)
                  }
                  aria-label="Edit note"
                >
                  <div className="flex items-center gap-1 mb-1">
                    <StickyNote className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />
                    <span className="font-medium text-yellow-700 dark:text-yellow-400 text-xs">
                      My Note
                    </span>
                  </div>
                  <p className="line-clamp-3 whitespace-pre-wrap">{note}</p>
                </div>
              )}
              {showNoteEditor ? (
                <div className="space-y-2">
                  <Textarea
                    value={draftNote}
                    onChange={(e) => setDraftNote(e.target.value)}
                    placeholder="Type your notes here…"
                    className="text-sm min-h-[80px]"
                    autoFocus
                    aria-label="Exhibitor note"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveNote}>
                      Save Note
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelNote}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNoteEditor(true)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-0"
                >
                  <StickyNote className="h-3.5 w-3.5" />
                  {note ? "Edit Note" : "Add Note"}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function ExhibitorView({
  bookmarkedExhibitors = [],
  onToggleBookmark,
  highlightExhibitorId,
  onLocationClick,
  exhibitorBookmarkCounts = {},
  votedExhibitors = [],
  onToggleVote,
  exhibitorVoteCounts = {},
  exhibitorNotes = {},
  onSaveExhibitorNote,
}: ExhibitorViewProps) {
  const [selectedType, setSelectedType] = useState<string>("all");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { activeConference, allConferencesList, setActiveConference } =
    useConference();
  const exhibitorEntry = EXHIBITOR_DATA[activeConference.id];
  const exhibitors: Exhibitor[] = exhibitorEntry ? exhibitorEntry[1] : [];

  // Group exhibitors by type
  const groupExhibitorsByType = (exhibitors: Exhibitor[]) => {
    const grouped: Record<string, Exhibitor[]> = {};
    exhibitors.forEach((exhibitor) => {
      const type = exhibitor.type ?? "other";
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(exhibitor);
    });
    return grouped;
  };

  const groupedExhibitors = groupExhibitorsByType(exhibitors);
  const typeKeys = Object.keys(groupedExhibitors).sort();
  const tabBg = blendWithWhite(activeConference.primaryColor);
  const tabText = contrastingColor(tabBg);

  return (
    <div className="w-full">
      <Tabs
        value={selectedType}
        onValueChange={setSelectedType}
        className="w-full"
      >
        <div
          className="rounded-lg p-2 mb-6 w-full"
          style={{ backgroundColor: tabBg, color: tabText }}
        >
          <TabsList className="w-full flex-wrap h-auto bg-transparent">
            <TabsTrigger value="all">All Types</TabsTrigger>
            {typeKeys.map((type) => (
              <TabsTrigger key={type} value={type}>
                {type}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="all">
          {typeKeys.map((type) => (
            <div key={type} className="mb-8">
              <h3 className="text-xl font-semibold mb-4">{type}</h3>
              {groupedExhibitors[type]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((exhibitor) => (
                  <ExhibitorCard
                    key={exhibitor.id}
                    exhibitor={exhibitor}
                    isBookmarked={bookmarkedExhibitors.includes(exhibitor.id)}
                    isHighlighted={highlightExhibitorId === exhibitor.id}
                    onToggleBookmark={onToggleBookmark}
                    onLocationClick={onLocationClick}
                    bookmarkCount={exhibitorBookmarkCounts[exhibitor.id]}
                    isVoted={votedExhibitors.includes(exhibitor.id)}
                    onToggleVote={onToggleVote}
                    voteCount={exhibitorVoteCounts[exhibitor.id]}
                    note={exhibitorNotes[exhibitor.id]}
                    onSaveNote={onSaveExhibitorNote}
                  />
                ))}
            </div>
          ))}
        </TabsContent>

        {typeKeys.map((type) => (
          <TabsContent key={type} value={type}>
            {groupedExhibitors[type]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((exhibitor) => (
                <ExhibitorCard
                  key={exhibitor.id}
                  exhibitor={exhibitor}
                  isBookmarked={bookmarkedExhibitors.includes(exhibitor.id)}
                  isHighlighted={highlightExhibitorId === exhibitor.id}
                  onToggleBookmark={onToggleBookmark}
                  onLocationClick={onLocationClick}
                  bookmarkCount={exhibitorBookmarkCounts[exhibitor.id]}
                  isVoted={votedExhibitors.includes(exhibitor.id)}
                  onToggleVote={onToggleVote}
                  voteCount={exhibitorVoteCounts[exhibitor.id]}
                  note={exhibitorNotes[exhibitor.id]}
                  onSaveNote={onSaveExhibitorNote}
                />
              ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
