import { Bell, Trash2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Link } from "react-router-dom";
import type { AlertHistoryItem } from "@/types/conference";

// ── Unauthenticated state ─────────────────────────────────────────────────────

export function AlertsView() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
      <Bell className="h-16 w-16 mx-auto mb-4 text-gray-400" />
      <h3 className="text-xl font-semibold mb-2">Prize Notifications</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        <Button asChild variant="link" className="p-0 h-auto">
          <Link to="/login">Sign in</Link>
        </Button>{" "}
        to receive notifications when you win prizes!
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-500">
        In-app, email, and SMS notifications available
      </p>
    </div>
  );
}

// ── Authenticated alert-history view ─────────────────────────────────────────

interface AlertHistoryViewProps {
  alertHistory: AlertHistoryItem[];
  onClear: () => void;
}

export function AlertHistoryView({
  alertHistory,
  onClear,
}: AlertHistoryViewProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Alert History
        </h2>
        {alertHistory.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-muted-foreground"
            aria-label="Clear alert history"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      {alertHistory.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
          <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 dark:text-gray-400">
            No alerts yet. You&apos;ll see prize notifications here when they arrive.
          </p>
        </div>
      ) : (
        <ul className="space-y-2" aria-label="Alert history">
          {alertHistory.map((item) => (
            <li
              key={item.id}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-start gap-3">
                <Bell className="h-4 w-4 mt-0.5 text-blue-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{item.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                    {item.body}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {new Date(item.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

