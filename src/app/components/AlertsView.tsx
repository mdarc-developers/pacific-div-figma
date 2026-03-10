import { useEffect, useState } from "react";
import { Bell, LogIn, UserPlus, Trash2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Separator } from "@/app/components/ui/separator";
import { Link } from "react-router-dom";
import { useAuth } from "@/app/contexts/AuthContext";
import type { AlertHistoryItem } from "@/types/conference";

// ── Unauthenticated state ─────────────────────────────────────────────────────

export function AlertsView() {
  const { signInWithGoogle, googleSignInError } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Surface any error returned after the Google redirect flow completes.
  useEffect(() => {
    if (googleSignInError) {
      setError(googleSignInError);
    }
  }, [googleSignInError]);

  const handleGoogleSignIn = async () => {
    try {
      setError("");
      setLoading(true);
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in with Google");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-lg mx-auto">
      <CardContent className="pt-6 pb-6 flex flex-col items-center text-center gap-4">
        <Bell className="h-16 w-16 text-muted-foreground" />
        <div>
          <h3 className="text-xl font-semibold">Prize Notifications</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Sign in to receive notifications when you win prizes
          </p>
        </div>

        <ul className="text-left w-full max-w-xs space-y-2 text-sm text-muted-foreground">
          <li>• In-app prize winner notifications</li>
          <li>• Email notifications</li>
          <li>• SMS notifications</li>
          <li>• Alert history</li>
        </ul>

        <div className="w-full max-w-xs flex flex-col gap-3 mt-2">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button asChild size="lg" className="w-full">
            <Link to="/login">
              <LogIn className="h-4 w-4" />
              Sign In
            </Link>
          </Button>

          <Button
            type="button"
            size="lg"
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full"
          >
            <svg
              viewBox="0 0 24 24"
              className="size-4 shrink-0"
              aria-hidden="true"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Sign in with Google
          </Button>

          <Separator className="my-1" />

          <p className="text-sm text-muted-foreground">New to the app?</p>
          <Button asChild size="lg" variant="outline" className="w-full">
            <Link to="/signup">
              <UserPlus className="h-4 w-4" />
              Sign Up Now
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
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

