import { Users } from "lucide-react";
import { useAdminStats } from "@/app/hooks/useAdminStats";

/**
 * A narrow banner displayed above the ConferenceHeader for users in the
 * mdarc-developers group.  Shows aggregate counts from Firestore so
 * developers can quickly see live data metrics.
 */
export function AdminStatsBar() {
  const { userProfileCount, loading, error } = useAdminStats();

  return (
    <div
      data-testid="admin-stats-bar"
      className="flex items-center gap-3 px-3 py-1.5 mb-2 rounded-md bg-amber-50 dark:bg-amber-950 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 text-xs font-medium"
    >
      <span className="flex items-center gap-1.5">
        <Users className="h-3.5 w-3.5" aria-hidden="true" />
        Firebase profiles:&nbsp;
        {loading && (
          <span data-testid="admin-stats-loading" className="italic">
            loading…
          </span>
        )}
        {!loading && error && (
          <span data-testid="admin-stats-error" className="text-red-600 dark:text-red-400">
            error
          </span>
        )}
        {!loading && !error && (
          <span data-testid="admin-stats-count" className="font-bold">
            {userProfileCount ?? 0}
          </span>
        )}
      </span>
    </div>
  );
}
