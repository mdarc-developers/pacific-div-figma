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
  sessionBookmarkCounts = {},
  exhibitorBookmarkCounts = {},
  votedSessionIds = [],
  onToggleSessionVote,
  sessionVoteCounts = {},
  votedExhibitorIds = [],
  onToggleExhibitorVote,
  exhibitorVoteCounts = {},
}: BookmarkListCardProps) {
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

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Bookmarked Sessions section */}
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium">Bookmarked Sessions</p>
          {bookmarked.length > 0 ? (
            <Badge variant="secondary">{bookmarked.length}</Badge>
          ) : (
            <span className="text-xs text-muted-foreground">None yet</span>
          )}
        </div>

        {(bookmarked.length > 0 || previous.length > 0) && (
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
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium">Bookmarked Exhibitors</p>
          {bookmarkedExhibitorList.length > 0 ? (
            <Badge variant="secondary">{bookmarkedExhibitorList.length}</Badge>
          ) : (
            <span className="text-xs text-muted-foreground">None yet</span>
          )}
        </div>

        {(bookmarkedExhibitorList.length > 0 ||
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
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium">Voted Sessions</p>
          {votedSessionIds.length > 0 ? (
            <Badge variant="secondary">{votedSessionIds.length}</Badge>
          ) : (
            <span className="text-xs text-muted-foreground">None yet</span>
          )}
        </div>

        {votedSessionIds.length > 0 && (
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
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium">Voted Exhibitors</p>
          {votedExhibitorIds.length > 0 ? (
            <Badge variant="secondary">{votedExhibitorIds.length}</Badge>
          ) : (
            <span className="text-xs text-muted-foreground">None yet</span>
          )}
        </div>

        {votedExhibitorIds.length > 0 && (
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

        {/* My Notes section */}
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium">My Notes</p>
          {notedSessions.length > 0 ? (
            <Badge variant="secondary">{notedSessions.length}</Badge>
          ) : (
            <span className="text-xs text-muted-foreground">None yet</span>
          )}
        </div>

        {notedSessions.length > 0 && (
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
      </CardContent>
    </Card>
  );
}
