import { useState } from "react";
import { ShieldAlert, ShieldCheck, Search, Send, User, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/app/contexts/AuthContext";
import { useUserAdmin } from "@/app/hooks/useUserAdmin";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import firebaseApp from "@/lib/firebase";
import { db } from "@/lib/firebase";
import { getFunctions, httpsCallable } from "firebase/functions";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { Toaster, toast } from "sonner";

interface LookupResult {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
  creationTime: string | null;
}

interface AuditEntry {
  id: string;
  action: string;
  timestamp: { toDate?: () => Date } | null;
  metadata?: Record<string, unknown>;
}

/**
 * Converts a Firebase Functions callable error into a user-friendly message.
 * Firebase "internal" errors do not expose their server-side message to the
 * client, so error codes are mapped to descriptive strings here.
 */
export function parseFunctionsError(err: unknown, action = "operation"): string {
  if (err && typeof err === "object" && "code" in err) {
    const code = String((err as { code: unknown }).code);
    switch (code) {
      case "functions/permission-denied":
        return (
          "Permission denied. Your UID may not be listed in the " +
          "groups/user-admin Firestore document. Contact an mdarc-developer to add you."
        );
      case "functions/not-found":
        return "No user found with that email address.";
      case "functions/invalid-argument":
        return "Invalid request. Please enter a valid email address.";
      case "functions/unauthenticated":
        return "Authentication required. Please sign out and sign back in.";
      case "functions/internal":
        return (
          "An internal server error occurred. The groups/user-admin " +
          "Firestore document may not exist yet — contact an mdarc-developer to set it up."
        );
      default: {
        const detail = err instanceof Error ? err.message : String(err);
        return `Failed to ${action}: ${detail}`;
      }
    }
  }
  const detail = err instanceof Error ? err.message : String(err);
  return `Failed to ${action}: ${detail}`;
}

export function UserAdminSearch() {
  const { user, loading } = useAuth();
  const isUserAdmin = useUserAdmin();
  const [searchEmail, setSearchEmail] = useState("");
  const [lookupResult, setLookupResult] = useState<LookupResult | null>(null);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [searching, setSearching] = useState(false);
  const [resending, setResending] = useState(false);
  const [searchError, setSearchError] = useState("");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500">
        Loading…
      </div>
    );
  }

  // Not signed in
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <ShieldAlert className="h-12 w-12 text-gray-400" />
        <p className="text-lg font-medium">Sign in required</p>
        <p className="text-sm text-gray-500">
          Please{" "}
          <Button asChild variant="link" className="px-0 h-auto text-sm">
            <Link to="/login">sign in</Link>
          </Button>{" "}
          to access user management.
        </p>
      </div>
    );
  }

  // Signed in but not in the user-admin group
  if (!isUserAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <ShieldAlert className="h-12 w-12 text-red-400" />
        <p className="text-lg font-medium">Access Denied</p>
        <p className="text-sm text-gray-500">
          Your account does not have user-admin group membership.
        </p>
      </div>
    );
  }

  const handleSearch = async () => {
    if (!searchEmail.trim()) return;
    setSearching(true);
    setSearchError("");
    setLookupResult(null);
    setAuditLog([]);

    try {
      const functions = getFunctions(firebaseApp);
      const lookup = httpsCallable<{ targetEmail: string }, LookupResult>(
        functions,
        "adminLookupUser",
      );
      const result = await lookup({ targetEmail: searchEmail.trim() });
      setLookupResult(result.data);

      // Fetch audit log from Firestore
      const logRef = collection(db, "users", result.data.uid, "auditLog");
      const logQuery = query(logRef, orderBy("timestamp", "desc"), limit(50));
      const snapshot = await getDocs(logQuery);
      const entries: AuditEntry[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<AuditEntry, "id">),
      }));
      setAuditLog(entries);
    } catch (err: unknown) {
      setSearchError(parseFunctionsError(err, "look up user"));
    } finally {
      setSearching(false);
    }
  };

  const handleResendVerification = async () => {
    if (!lookupResult) return;
    setResending(true);
    try {
      const functions = getFunctions(firebaseApp);
      const resend = httpsCallable(functions, "adminResendVerificationEmail");
      await resend({ targetUid: lookupResult.uid });
      toast(`Verification email sent to ${lookupResult.email ?? lookupResult.uid}`);
    } catch (err: unknown) {
      toast.error(parseFunctionsError(err, "send verification email"));
    } finally {
      setResending(false);
    }
  };

  const projectId =
    import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined;

  /** Build a Cloud Logging URL pre-filtered for a given UID. */
  const cloudLoggingUrl = (uid: string): string => {
    // Encode the UID within the log filter so any unusual characters don't
    // break the query syntax (Firebase UIDs are alphanumeric but we encode
    // defensively).
    const encodedUid = encodeURIComponent(uid);
    const query = encodeURIComponent(
      `resource.type="cloud_run_revision"\n("${encodedUid}")`,
    );
    const base = "https://console.cloud.google.com/logs/query";
    return projectId
      ? `${base};query=${query}?project=${projectId}`
      : `${base};query=${query}`;
  };

  /** Firebase Console Auth users URL (project-scoped when possible). */
  const authUsersUrl = projectId
    ? `https://console.firebase.google.com/project/${projectId}/authentication/users`
    : "https://console.firebase.google.com";

  /** Firestore groups collection URL. */
  const firestoreGroupsUrl = projectId
    ? `https://console.firebase.google.com/project/${projectId}/firestore/databases/-default-/data/~2Fgroups`
    : "https://console.firebase.google.com";

  /** Cloud Functions dashboard URL. */
  const functionsUrl = projectId
    ? `https://console.firebase.google.com/project/${projectId}/functions`
    : "https://console.firebase.google.com";

  const formatTimestamp = (ts: AuditEntry["timestamp"]): string => {
    if (!ts) return "—";
    if (ts.toDate) {
      return ts.toDate().toLocaleString();
    }
    return String(ts);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Toaster />
      <div className="flex items-center gap-2 mb-6">
        <ShieldCheck className="h-5 w-5 text-green-600" />
        <h1 className="text-2xl font-bold">User Management</h1>
      </div>

      {/* Search */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Search className="h-4 w-4" />
            Look Up User
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            Enter the user&apos;s email address to look up their account details and
            activity log.
          </p>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="user@example.com"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleSearch();
              }}
              className="flex-1"
            />
            <Button onClick={() => void handleSearch()} disabled={searching}>
              {searching ? "Searching…" : "Search"}
            </Button>
          </div>
          {searchError && (
            <p className="text-red-500 dark:text-red-400 text-sm mt-2">
              {searchError}
            </p>
          )}
        </CardContent>
      </Card>

      {/* User info */}
      {lookupResult && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              User Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm mb-4">
              <dt className="font-medium text-gray-600 dark:text-gray-400">
                UID
              </dt>
              <dd className="font-mono text-xs break-all">{lookupResult.uid}</dd>
              <dt className="font-medium text-gray-600 dark:text-gray-400">
                Email
              </dt>
              <dd>{lookupResult.email ?? "—"}</dd>
              <dt className="font-medium text-gray-600 dark:text-gray-400">
                Display name
              </dt>
              <dd>{lookupResult.displayName ?? "—"}</dd>
              <dt className="font-medium text-gray-600 dark:text-gray-400">
                Email verified
              </dt>
              <dd>
                {lookupResult.emailVerified ? (
                  <span className="text-green-600 font-medium">Yes</span>
                ) : (
                  <span className="text-red-500 font-medium">No</span>
                )}
              </dd>
              {lookupResult.creationTime && (
                <>
                  <dt className="font-medium text-gray-600 dark:text-gray-400">
                    Created
                  </dt>
                  <dd>{lookupResult.creationTime}</dd>
                </>
              )}
            </dl>

            {!lookupResult.emailVerified && (
              <Button
                onClick={() => void handleResendVerification()}
                disabled={resending}
                size="sm"
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                {resending ? "Sending…" : "Resend Verification Email"}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Console Resources */}
      {lookupResult && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Console Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Quick links to investigate this user in Firebase and Google Cloud
              consoles. Paste the UID above into the Firebase Auth search box to
              locate this account directly.
            </p>
            <ul className="text-sm space-y-2">
              <li>
                <a
                  href={authUsersUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                >
                  Firebase Auth → Users
                  <ExternalLink className="h-3 w-3" />
                </a>
                <span className="text-gray-500 dark:text-gray-400 ml-1">
                  — verify email status, disable, reset password
                </span>
              </li>
              <li>
                <a
                  href={firestoreGroupsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                >
                  Firestore → groups collection
                  <ExternalLink className="h-3 w-3" />
                </a>
                <span className="text-gray-500 dark:text-gray-400 ml-1">
                  — add/remove mdarc-developers, user-admin, prize-admin
                  membership
                </span>
              </li>
              <li>
                <a
                  href={cloudLoggingUrl(lookupResult.uid)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                >
                  Cloud Logging — events for this user
                  <ExternalLink className="h-3 w-3" />
                </a>
                <span className="text-gray-500 dark:text-gray-400 ml-1">
                  — pre-filtered by UID across all Cloud Functions
                </span>
              </li>
              <li>
                <a
                  href={functionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                >
                  Cloud Functions dashboard
                  <ExternalLink className="h-3 w-3" />
                </a>
                <span className="text-gray-500 dark:text-gray-400 ml-1">
                  — check deployment status and recent errors
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Audit log */}
      {lookupResult && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Activity Log</CardTitle>
          </CardHeader>
          <CardContent>
            {auditLog.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No audit log entries found for this user.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-gray-600 dark:text-gray-400">
                      <th className="pb-2 pr-4 font-medium">Timestamp</th>
                      <th className="pb-2 pr-4 font-medium">Action</th>
                      <th className="pb-2 font-medium">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLog.map((entry) => (
                      <tr
                        key={entry.id}
                        className="border-b last:border-0 align-top"
                      >
                        <td className="py-2 pr-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                          {formatTimestamp(entry.timestamp)}
                        </td>
                        <td className="py-2 pr-4 font-medium">{entry.action}</td>
                        <td className="py-2 text-gray-600 dark:text-gray-400">
                          {entry.metadata
                            ? JSON.stringify(entry.metadata)
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
