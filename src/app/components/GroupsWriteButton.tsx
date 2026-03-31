import { useState } from "react";
import { Users } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { toast } from "sonner";
import {
  ALL_USER_PROFILES,
  ALL_USER_PROFILE_GROUPS,
  KNOWN_GROUPS,
} from "@/lib/userProfileData";
import { loadFromStorage, saveToStorage } from "@/lib/localStorage";

// ── localStorage key ──────────────────────────────────────────────────────────
const LOG_STORAGE_KEY = "groups-write-log";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface GroupsWriteLogEntry {
  /** ISO-8601 UTC timestamp of the write operation */
  timestamp: string;
  /** Records written during this run */
  written: { uid: string; email: string; group: string }[];
  /** Records already present (not written) */
  skipped: { uid: string; email: string; group: string }[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Build a map of groupName → Set<uid> from the local data sources
 * (`ALL_USER_PROFILES` for groups stored on full profiles, and
 * `ALL_USER_PROFILE_GROUPS` for uid-only lightweight entries).
 * Only KNOWN_GROUPS are included; unrecognised group names are ignored.
 */
export function buildGroupMembersMap(): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();
  for (const group of KNOWN_GROUPS) {
    map.set(group, new Set<string>());
  }

  // From full UserProfile entries
  for (const profile of ALL_USER_PROFILES) {
    if (!profile.uid || !profile.groups) continue;
    for (const group of profile.groups) {
      if (map.has(group)) {
        map.get(group)!.add(profile.uid);
      }
    }
  }

  // From lightweight UserProfileGroups entries
  for (const entry of ALL_USER_PROFILE_GROUPS) {
    if (!entry.uid || !entry.groups) continue;
    for (const group of entry.groups) {
      if (map.has(group)) {
        map.get(group)!.add(entry.uid);
      }
    }
  }

  return map;
}

/**
 * Look up the email for a given uid by scanning ALL_USER_PROFILES.
 * Returns an empty string when the uid is not found.
 */
export function emailForUid(uid: string): string {
  return ALL_USER_PROFILES.find((p) => p.uid === uid)?.email ?? "";
}

// ── Component ─────────────────────────────────────────────────────────────────

export function GroupsWriteButton() {
  const [writing, setWriting] = useState(false);
  const [log, setLog] = useState<GroupsWriteLogEntry[]>(() =>
    loadFromStorage<GroupsWriteLogEntry[]>(LOG_STORAGE_KEY, []),
  );

  const handleClearLog = () => {
    saveToStorage<GroupsWriteLogEntry[]>(LOG_STORAGE_KEY, []);
    setLog([]);
  };

  const handleWriteGroups = async () => {
    setWriting(true);

    try {
      const timestamp = new Date().toISOString();
      const groupMembers = buildGroupMembersMap();
      const written: { uid: string; email: string; group: string }[] = [];
      const skipped: { uid: string; email: string; group: string }[] = [];

      for (const [group, uids] of groupMembers) {
        if (uids.size === 0) continue;

        // Read the existing Firestore document for this group.
        const groupDocRef = doc(db, "groups", group);
        const snap = await getDoc(groupDocRef);
        const existing: Record<string, boolean> = snap.exists()
          ? ((snap.data()?.members ?? {}) as Record<string, boolean>)
          : {};

        // Determine which UIDs are missing.
        const toWrite: Record<string, boolean> = {};
        for (const uid of uids) {
          const email = emailForUid(uid);
          if (existing[uid] === true) {
            skipped.push({ uid, email, group });
          } else {
            toWrite[uid] = true;
            written.push({ uid, email, group });
          }
        }

        if (Object.keys(toWrite).length > 0) {
          await setDoc(
            groupDocRef,
            { members: toWrite },
            { merge: true },
          );
        }
      }

      // Persist log entry to localStorage (append).
      const entry: GroupsWriteLogEntry = { timestamp, written, skipped };
      const updated = [
        ...loadFromStorage<GroupsWriteLogEntry[]>(LOG_STORAGE_KEY, []),
        entry,
      ];
      saveToStorage(LOG_STORAGE_KEY, updated);
      setLog(updated);

      // Show toast summary.
      if (written.length === 0) {
        toast(`[${timestamp}] No new group members to write — all UIDs already present.`);
      } else {
        const lines = written.map(
          ({ uid, email, group }) =>
            `  ${group}: ${uid}${email ? ` (${email})` : ""}`,
        );
        toast(
          `[${timestamp}] Wrote ${written.length} group member(s):\n${lines.join("\n")}`,
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Groups write failed: ${msg}`);
    } finally {
      setWriting(false);
    }
  };

  return (
    <div className="mt-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            Write Group Memberships to Firestore
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Click the button below to sync group memberships from the local data
            files to Firestore. Only <strong>missing</strong> entries are
            written; existing <code>true</code> values are left unchanged.
          </p>

          <Button
            onClick={() => void handleWriteGroups()}
            disabled={writing}
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            {writing ? "Writing…" : "Write Groups to Firestore"}
          </Button>

          {/* Instruction block */}
          <div className="rounded-md border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950 p-3 text-sm text-amber-800 dark:text-amber-200">
            <p className="font-medium mb-1">
              To remove a user from a group:
            </p>
            <ol className="list-decimal list-inside space-y-1">
              <li>
                Remove the group entry from the corresponding{" "}
                <code>*-20??.ts</code> data file (or its supplemental file).
              </li>
              <li>
                In{" "}
                <a
                  href="https://console.firebase.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  console.firebase.google.com
                </a>
                , open{" "}
                <strong>
                  Firestore → groups → &lt;group-name&gt; → members
                </strong>{" "}
                and either:
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                  <li>
                    <strong>(preferred)</strong> Change the UID&apos;s value
                    from <code>true</code> to <code>false</code>.
                  </li>
                  <li>Delete the UID key/value pair entirely.</li>
                </ul>
              </li>
            </ol>
          </div>

          {/* Log display */}
          {log.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Write Log</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearLog}
                  className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-[0_0_0_2px_rgba(220,38,38,0.5)]"
                >
                  Clear Log
                </Button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {[...log].reverse().map((entry, idx) => (
                  <div
                    key={idx}
                    className="text-xs border rounded-md p-2 bg-gray-50 dark:bg-gray-900"
                  >
                    <p className="font-mono font-medium text-gray-500 dark:text-gray-400 mb-1">
                      {entry.timestamp}
                    </p>
                    {entry.written.length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400">
                        No new entries written.
                      </p>
                    ) : (
                      <>
                        <p className="font-medium text-green-700 dark:text-green-400 mb-0.5">
                          Written ({entry.written.length}):
                        </p>
                        <ul className="list-disc list-inside space-y-0.5 text-gray-700 dark:text-gray-300">
                          {entry.written.map(({ uid, email, group }, i) => (
                            <li key={i}>
                              <span className="font-mono">{uid}</span>
                              {email && (
                                <span className="text-gray-500 dark:text-gray-400">
                                  {" "}
                                  ({email})
                                </span>
                              )}{" "}
                              → <span className="font-medium">{group}</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                    {entry.skipped.length > 0 && (
                      <>
                        <p className="font-medium text-gray-500 dark:text-gray-400 mt-1 mb-0.5">
                          Already present ({entry.skipped.length}):
                        </p>
                        <ul className="list-disc list-inside space-y-0.5 text-gray-500 dark:text-gray-400">
                          {entry.skipped.map(({ uid, email, group }, i) => (
                            <li key={i}>
                              <span className="font-mono">{uid}</span>
                              {email && <span> ({email})</span>} →{" "}
                              <span className="font-medium">{group}</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
