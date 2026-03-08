import { type ReactNode } from "react";
import { Bookmark, StickyNote, Star, Trash2 } from "lucide-react";
import { Badge } from "@/app/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Separator } from "@/app/components/ui/separator";
import { Session, Exhibitor } from "@/types/conference";
import { useActivitySections } from "@/app/contexts/ActivitySectionsContext";

/** Section header with a vertical-bar + chevron collapse toggle on the left. */
function SectionHeader({
  title,
  count,
  isOpen,
  onToggle,
  badgeLabel,
  icon,
}: {
  title: string;
  count: number;
  isOpen: boolean;
  onToggle: () => void;
  badgeLabel?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      {/* Collapse toggle: vertical bar + chevron (mirrors ConferenceHeader style) */}
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors self-stretch"
        aria-label={isOpen ? `Collapse ${title}` : `Expand ${title}`}
        title="Collapse / Expand"
      >
        <div className="w-0.5 self-stretch rounded-full bg-current opacity-40" />
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "" : "-rotate-90"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Title and count badge */}
      <div className="flex flex-1 items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-sm font-medium">
          {icon}
          {title}
        </p>
        {count > 0 ? (
          <Badge variant="secondary">{badgeLabel ?? count}</Badge>
        ) : (
          <span className="text-xs text-muted-foreground">None yet</span>
        )}
      </div>
    </div>
  );
}

interface BookmarkListCardProps {
  sessions: Session[];
  bookmarkedIds: string[];
  prevBookmarkedIds: string[];
  onToggleBookmark: (sessionId: string) => void;
  onRemovePrevBookmark?: (sessionId: string) => void;
  exhibitors?: Exhibitor[];
  bookmarkedExhibitorIds?: string[];
  prevBookmarkedExhibitorIds?: string[];
  onToggleExhibitorBookmark?: (exhibitorId: string) => void;
  onRemovePrevExhibitorBookmark?: (exhibitorId: string) => void;
  notes?: Record<string, string>;
  onNoteSessionClick?: (sessionId: string) => void;
  exhibitorNotes?: Record<string, string>;
  onNoteExhibitorClick?: (exhibitorId: string) => void;
  /** Aggregate bookmark counts keyed by session id. */
  sessionBookmarkCounts?: Record<string, number>;
  /** Aggregate bookmark counts keyed by exhibitor id. */
  exhibitorBookmarkCounts?: Record<string, number>;
  /** Session IDs the user has voted for. */
  votedSessionIds?: string[];
  onToggleSessionVote?: (sessionId: string) => void;
  /** Aggregate vote counts keyed by session id. */
  sessionVoteCounts?: Record<string, number>;
  /** Exhibitor IDs the user has voted for. */
  votedExhibitorIds?: string[];
  onToggleExhibitorVote?: (exhibitorId: string) => void;
  /** Aggregate vote counts keyed by exhibitor id. */
  exhibitorVoteCounts?: Record<string, number>;
}

export function BookmarkListCard({
  sessions,
  bookmarkedIds,
  prevBookmarkedIds,
  onToggleBookmark,
  onRemovePrevBookmark,
  exhibitors = [],
  bookmarkedExhibitorIds = [],
  prevBookmarkedExhibitorIds = [],
  onToggleExhibitorBookmark,
  onRemovePrevExhibitorBookmark,
  notes = {},
  onNoteSessionClick,
  exhibitorNotes = {},
  onNoteExhibitorClick,
  sessionBookmarkCounts = {},
  exhibitorBookmarkCounts = {},
  votedSessionIds = [],
  onToggleSessionVote,
  sessionVoteCounts = {},
  votedExhibitorIds = [],
  onToggleExhibitorVote,
  exhibitorVoteCounts = {},
}: BookmarkListCardProps) {
  const { sections, toggleSection } = useActivitySections();

  const sessionMap = new Map(sessions.map((s) => [s.id, s]));

  const bookmarked = bookmarkedIds
    .map((id) => sessionMap.get(id))
    .filter((s): s is Session => s !== undefined);

  const previous = prevBookmarkedIds
    .map((id) => sessionMap.get(id))
    .filter((s): s is Session => s !== undefined);

  const exhibitorMap = new Map(exhibitors.map((e) => [e.id, e]));

  const bookmarkedExhibitorList = bookmarkedExhibitorIds
    .map((id) => exhibitorMap.get(id))
    .filter((e): e is Exhibitor => e !== undefined);

  const previousExhibitorList = prevBookmarkedExhibitorIds
    .map((id) => exhibitorMap.get(id))
    .filter((e): e is Exhibitor => e !== undefined);

  // Build the list of sessions that have notes, preserving note text
  const notedSessions = Object.entries(notes)
    .filter(([, text]) => text.trim().length > 0)
    .map(([sessionId, text]) => ({ session: sessionMap.get(sessionId), text }))
    .filter((entry): entry is { session: Session; text: string } =>
      entry.session !== undefined,
    );

  // Build the list of exhibitors that have notes, preserving note text
  const notedExhibitors = Object.entries(exhibitorNotes)
    .filter(([, text]) => text.trim().length > 0)
    .map(([exhibitorId, text]) => ({
      exhibitor: exhibitorMap.get(exhibitorId),
      text,
    }))
    .filter((entry): entry is { exhibitor: Exhibitor; text: string } =>
      entry.exhibitor !== undefined,
    );

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Bookmarked Sessions section */}
        <SectionHeader
          title="Bookmarked Sessions"
          count={bookmarked.length}
          isOpen={sections.bookmarkedSessions}
          onToggle={() => toggleSection("bookmarkedSessions")}
          icon={<Bookmark className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
        />

        {sections.bookmarkedSessions && (bookmarked.length > 0 || previous.length > 0) && (
          <ul className="space-y-2 mt-1" data-testid="bookmark-list">
            {bookmarked.map((session) => (
              <li
                key={session.id}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <span className="flex-1 truncate">{session.title}</span>
                <div className="flex items-center gap-1 shrink-0">
                  {sessionBookmarkCounts[session.id] !== undefined &&
                    sessionBookmarkCounts[session.id] >= 0 && (
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {sessionBookmarkCounts[session.id]}
                      </span>
                    )}
                  <button
                    type="button"
                    onClick={() => onToggleBookmark(session.id)}
                    aria-label={`Remove bookmark for ${session.title}`}
                    className="text-blue-600 dark:text-blue-400 hover:text-muted-foreground"
                  >
                    <Bookmark className="h-4 w-4 fill-current" />
                  </button>
                </div>
              </li>
            ))}

            {previous.length > 0 && (
              <>
                {bookmarked.length > 0 && <Separator />}
                <p className="text-xs text-muted-foreground">
                  Previously bookmarked
                </p>
                {previous.map((session) => (
                  <li
                    key={session.id}
                    className="flex items-center justify-between gap-2 text-sm text-muted-foreground"
                    data-testid="prev-bookmark-item"
                  >
                    <span className="flex-1 truncate line-through">
                      {session.title}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      {sessionBookmarkCounts[session.id] !== undefined &&
                        sessionBookmarkCounts[session.id] >= 0 && (
                          <span className="text-xs tabular-nums">
                            {sessionBookmarkCounts[session.id]}
                          </span>
                        )}
                      <button
                        type="button"
                        onClick={() => onToggleBookmark(session.id)}
                        aria-label={`Re-bookmark ${session.title}`}
                        className="hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        <Bookmark className="h-4 w-4" />
                      </button>
                      {onRemovePrevBookmark && (
                        <button
                          type="button"
                          onClick={() => onRemovePrevBookmark(session.id)}
                          aria-label={`Remove ${session.title} from history`}
                          className="hover:text-red-600 dark:hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </>
            )}
          </ul>
        )}

        <Separator />

        {/* Exhibitor Bookmarks section */}
        <SectionHeader
          title="Bookmarked Exhibitors"
          count={bookmarkedExhibitorList.length}
          isOpen={sections.bookmarkedExhibitors}
          onToggle={() => toggleSection("bookmarkedExhibitors")}
          icon={<Bookmark className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
        />

        {sections.bookmarkedExhibitors && (bookmarkedExhibitorList.length > 0 ||
          previousExhibitorList.length > 0) && (
          <ul className="space-y-2 mt-1" data-testid="exhibitor-bookmark-list">
            {bookmarkedExhibitorList.map((exhibitor) => (
              <li
                key={exhibitor.id}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <span className="flex-1 truncate">{exhibitor.name}</span>
                {onToggleExhibitorBookmark && (
                  <div className="flex items-center gap-1 shrink-0">
                    {exhibitorBookmarkCounts[exhibitor.id] !== undefined &&
                      exhibitorBookmarkCounts[exhibitor.id] >= 0 && (
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {exhibitorBookmarkCounts[exhibitor.id]}
                        </span>
                      )}
                    <button
                      type="button"
                      onClick={() => onToggleExhibitorBookmark(exhibitor.id)}
                      aria-label={`Remove bookmark for ${exhibitor.name}`}
                      className="text-blue-600 dark:text-blue-400 hover:text-muted-foreground"
                    >
                      <Bookmark className="h-4 w-4 fill-current" />
                    </button>
                  </div>
                )}
              </li>
            ))}

            {previousExhibitorList.length > 0 && (
              <>
                {bookmarkedExhibitorList.length > 0 && <Separator />}
                <p className="text-xs text-muted-foreground">
                  Previously bookmarked
                </p>
                {previousExhibitorList.map((exhibitor) => (
                  <li
                    key={exhibitor.id}
                    className="flex items-center justify-between gap-2 text-sm text-muted-foreground"
                    data-testid="prev-exhibitor-bookmark-item"
                  >
                    <span className="flex-1 truncate line-through">
                      {exhibitor.name}
                    </span>
                    {onToggleExhibitorBookmark && (
                      <div className="flex items-center gap-1 shrink-0">
                        {exhibitorBookmarkCounts[exhibitor.id] !== undefined &&
                          exhibitorBookmarkCounts[exhibitor.id] >= 0 && (
                            <span className="text-xs tabular-nums">
                              {exhibitorBookmarkCounts[exhibitor.id]}
                            </span>
                          )}
                        <button
                          type="button"
                          onClick={() =>
                            onToggleExhibitorBookmark(exhibitor.id)
                          }
                          aria-label={`Re-bookmark ${exhibitor.name}`}
                          className="hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          <Bookmark className="h-4 w-4" />
                        </button>
                        {onRemovePrevExhibitorBookmark && (
                          <button
                            type="button"
                            onClick={() =>
                              onRemovePrevExhibitorBookmark(exhibitor.id)
                            }
                            aria-label={`Remove ${exhibitor.name} from history`}
                            className="hover:text-red-600 dark:hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </>
            )}
          </ul>
        )}

        <Separator />

        {/* Voted Sessions section */}
        <SectionHeader
          title="Voted Sessions"
          count={votedSessionIds.length}
          isOpen={sections.votedSessions}
          onToggle={() => toggleSection("votedSessions")}
          icon={<Star className="h-4 w-4 text-yellow-500" />}
        />

        {sections.votedSessions && votedSessionIds.length > 0 && (
          <ul className="space-y-2 mt-1" data-testid="voted-sessions-list">
            {votedSessionIds
              .map((id) => sessionMap.get(id))
              .filter((s): s is Session => s !== undefined)
              .map((session) => (
                <li
                  key={session.id}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <span className="flex-1 truncate">{session.title}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    {sessionVoteCounts[session.id] !== undefined &&
                      sessionVoteCounts[session.id] >= 0 && (
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {sessionVoteCounts[session.id]}
                        </span>
                      )}
                    {onToggleSessionVote && (
                      <button
                        type="button"
                        onClick={() => onToggleSessionVote(session.id)}
                        aria-label={`Remove vote for ${session.title}`}
                        className="text-yellow-500 hover:text-muted-foreground"
                      >
                        <Star className="h-4 w-4 fill-current" />
                      </button>
                    )}
                  </div>
                </li>
              ))}
          </ul>
        )}

        <Separator />

        {/* Voted Exhibitors section */}
        <SectionHeader
          title="Voted Exhibitors"
          count={votedExhibitorIds.length}
          isOpen={sections.votedExhibitors}
          onToggle={() => toggleSection("votedExhibitors")}
          icon={<Star className="h-4 w-4 text-yellow-500" />}
        />

        {sections.votedExhibitors && votedExhibitorIds.length > 0 && (
          <ul className="space-y-2 mt-1" data-testid="voted-exhibitors-list">
            {votedExhibitorIds
              .map((id) => exhibitorMap.get(id))
              .filter((e): e is Exhibitor => e !== undefined)
              .map((exhibitor) => (
                <li
                  key={exhibitor.id}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <span className="flex-1 truncate">{exhibitor.name}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    {exhibitorVoteCounts[exhibitor.id] !== undefined &&
                      exhibitorVoteCounts[exhibitor.id] >= 0 && (
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {exhibitorVoteCounts[exhibitor.id]}
                        </span>
                      )}
                    {onToggleExhibitorVote && (
                      <button
                        type="button"
                        onClick={() => onToggleExhibitorVote(exhibitor.id)}
                        aria-label={`Remove vote for ${exhibitor.name}`}
                        className="text-yellow-500 hover:text-muted-foreground"
                      >
                        <Star className="h-4 w-4 fill-current" />
                      </button>
                    )}
                  </div>
                </li>
              ))}
          </ul>
        )}

        <Separator />

        {/* Noted Sessions section */}
        <SectionHeader
          title="Noted Sessions"
          count={notedSessions.length}
          isOpen={sections.myNotes}
          onToggle={() => toggleSection("myNotes")}
          icon={<StickyNote className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />}
        />

        {sections.myNotes && notedSessions.length > 0 && (
          <ul
            className="space-y-2 mt-1"
            data-testid="notes-list"
          >
            {notedSessions.map(({ session, text }) => (
              <li key={session.id} className="text-sm">
                {onNoteSessionClick ? (
                  <button
                    type="button"
                    className="w-full text-left group"
                    onClick={() => onNoteSessionClick(session.id)}
                    aria-label={`View note for ${session.title}`}
                  >
                    <span className="flex items-center gap-1 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                      <StickyNote className="h-3.5 w-3.5 shrink-0 text-yellow-600 dark:text-yellow-400" />
                      {session.title}
                    </span>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 pl-5">
                      {text}
                    </p>
                  </button>
                ) : (
                  <div>
                    <span className="flex items-center gap-1 font-medium truncate">
                      <StickyNote className="h-3.5 w-3.5 shrink-0 text-yellow-600 dark:text-yellow-400" />
                      {session.title}
                    </span>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 pl-5">
                      {text}
                    </p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        <Separator />

        {/* Noted Exhibitors section */}
        <SectionHeader
          title="Noted Exhibitors"
          count={notedExhibitors.length}
          isOpen={sections.myExhibitorNotes}
          onToggle={() => toggleSection("myExhibitorNotes")}
          icon={<StickyNote className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />}
        />

        {sections.myExhibitorNotes && notedExhibitors.length > 0 && (
          <ul
            className="space-y-2 mt-1"
            data-testid="exhibitor-notes-list"
          >
            {notedExhibitors.map(({ exhibitor, text }) => (
              <li key={exhibitor.id} className="text-sm">
                {onNoteExhibitorClick ? (
                  <button
                    type="button"
                    className="w-full text-left group"
                    onClick={() => onNoteExhibitorClick(exhibitor.id)}
                    aria-label={`View note for ${exhibitor.name}`}
                  >
                    <span className="flex items-center gap-1 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                      <StickyNote className="h-3.5 w-3.5 shrink-0 text-yellow-600 dark:text-yellow-400" />
                      {exhibitor.name}
                    </span>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 pl-5">
                      {text}
                    </p>
                  </button>
                ) : (
                  <div>
                    <span className="flex items-center gap-1 font-medium truncate">
                      <StickyNote className="h-3.5 w-3.5 shrink-0 text-yellow-600 dark:text-yellow-400" />
                      {exhibitor.name}
                    </span>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 pl-5">
                      {text}
                    </p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
