import { Bookmark } from "lucide-react";
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
  exhibitors?: Exhibitor[];
  bookmarkedExhibitorIds?: string[];
  prevBookmarkedExhibitorIds?: string[];
  onToggleExhibitorBookmark?: (exhibitorId: string) => void;
}

export function BookmarkListCard({
  sessions,
  bookmarkedIds,
  prevBookmarkedIds,
  onToggleBookmark,
  exhibitors = [],
  bookmarkedExhibitorIds = [],
  prevBookmarkedExhibitorIds = [],
  onToggleExhibitorBookmark,
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
                <button
                  type="button"
                  onClick={() => onToggleBookmark(session.id)}
                  aria-label={`Remove bookmark for ${session.title}`}
                  className="shrink-0 text-blue-600 dark:text-blue-400 hover:text-muted-foreground"
                >
                  <Bookmark className="h-4 w-4 fill-current" />
                </button>
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
                    <button
                      type="button"
                      onClick={() => onToggleBookmark(session.id)}
                      aria-label={`Re-bookmark ${session.title}`}
                      className="shrink-0 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      <Bookmark className="h-4 w-4" />
                    </button>
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
          <ul
            className="space-y-2 mt-1"
            data-testid="exhibitor-bookmark-list"
          >
            {bookmarkedExhibitorList.map((exhibitor) => (
              <li
                key={exhibitor.id}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <span className="flex-1 truncate">{exhibitor.name}</span>
                {onToggleExhibitorBookmark && (
                  <button
                    type="button"
                    onClick={() => onToggleExhibitorBookmark(exhibitor.id)}
                    aria-label={`Remove bookmark for ${exhibitor.name}`}
                    className="shrink-0 text-blue-600 dark:text-blue-400 hover:text-muted-foreground"
                  >
                    <Bookmark className="h-4 w-4 fill-current" />
                  </button>
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
                      <button
                        type="button"
                        onClick={() => onToggleExhibitorBookmark(exhibitor.id)}
                        aria-label={`Re-bookmark ${exhibitor.name}`}
                        className="shrink-0 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        <Bookmark className="h-4 w-4" />
                      </button>
                    )}
                  </li>
                ))}
              </>
            )}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
