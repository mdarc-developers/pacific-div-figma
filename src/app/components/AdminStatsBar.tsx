import { Users, UserPlus, ExternalLink } from "lucide-react";
import { useAdminStats } from "@/app/hooks/useAdminStats";

/**
 * A narrow banner displayed above the ConferenceHeader for users in the
 * mdarc-developers group.  Shows aggregate counts from Firestore so
 * developers can quickly see live data metrics, plus quick-access links
 * to Firebase Console and Google Cloud Logging.
 */
export function AdminStatsBar() {
  const { userProfileCount, signupCount, loading, error, permissionDenied } =
    useAdminStats();

  // If the Firestore queries were rejected due to missing permissions or the
  // user not being authenticated, hide the bar entirely — it should only be
  // visible when the user genuinely has access.
  if (permissionDenied) return null;

  return (
    <div
      data-testid="admin-stats-bar"
      className="flex flex-wrap items-center gap-3 px-3 py-1.5 mb-2 rounded-md bg-amber-50 dark:bg-amber-950 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 text-xs font-medium"
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
          <span
            data-testid="admin-stats-error"
            className="text-red-600 dark:text-red-400"
            title={error}
          >
            {error}
          </span>
        )}
        {!loading && !error && (
          <span data-testid="admin-stats-count" className="font-bold">
            {userProfileCount ?? 0}
          </span>
        )}
      </span>
      {!loading && !error && (
        <span
          className="flex items-center gap-1.5"
          title="Cumulative signup count maintained by cloud function"
        >
          <UserPlus className="h-3.5 w-3.5" aria-hidden="true" />
          Signups:&nbsp;
          <span data-testid="admin-stats-signup-count" className="font-bold">
            {signupCount ?? 0}
          </span>
        </span>
      )}
      <span className="flex items-center gap-2 ml-auto">
        <a
          data-testid="admin-cloud-monitoring-link"
          href="https://console.cloud.google.com/monitoring?project=pacific-div"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 underline hover:text-amber-600 dark:hover:text-amber-400"
          title="console.cloud.google.com/monitoring"
        >
          cloud
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </a>
        <a
          data-testid="admin-cloud-logs-link"
          href="https://console.cloud.google.com/logs?project=pacific-div"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 underline hover:text-amber-600 dark:hover:text-amber-400"
          title="console.cloud.google.com/logs"
        >
          cloud logs
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </a>
        <a
          data-testid="admin-firebase-console-link"
          href="https://console.firebase.google.com/project/pacific-div/overview"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 underline hover:text-amber-600 dark:hover:text-amber-400"
          title="console.firebase.google.com"
        >
          firebase
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </a>
        <a
          data-testid="admin-firebase-users-link"
          href="https://console.firebase.google.com/u/3/project/pacific-div/authentication/users"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 underline hover:text-amber-600 dark:hover:text-amber-400"
          title="console.firebase.google.com/authentication/users"
        >
          firebase_users
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </a>
        <a
          data-testid="admin-twilio-console-link"
          href="https://console.twilio.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 underline hover:text-amber-600 dark:hover:text-amber-400"
          title="console.twilio.com"
        >
          twilio
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </a>
      </span>
    </div>
  );
}
