import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

/** All per-conference data fields keyed by conferenceId in the users document. */
const CONFERENCE_KEYED_FIELDS = [
  "bookmarks",
  "prevBookmarks",
  "exhibitorBookmarks",
  "prevExhibitorBookmarks",
  "notes",
  "exhibitorNotes",
  "sessionVotes",
  "exhibitorVotes",
] as const;

/** Shape of the raw Firestore user document (minus subcollections). */
export interface UserFirestoreData {
  email?: string;
  displayName?: string | null;
  theme?: string;
  activeConferenceId?: string;
  profileVisible?: boolean;
  headerCollapsed?: boolean;
  smsNotifications?: boolean;
  phoneNumber?: string;
  minutesBefore?: number;
  activitySections?: Record<string, boolean>;
  bookmarks?: Record<string, string[]>;
  prevBookmarks?: Record<string, string[]>;
  exhibitorBookmarks?: Record<string, string[]>;
  prevExhibitorBookmarks?: Record<string, string[]>;
  notes?: Record<string, Record<string, string>>;
  exhibitorNotes?: Record<string, Record<string, string>>;
  sessionVotes?: Record<string, string[]>;
  exhibitorVotes?: Record<string, string[]>;
  createdAt?: unknown;
}

/** The full export payload: Firestore data + localStorage data. */
export interface UserExportData {
  exportedAt: string;
  uid: string;
  profile: UserFirestoreData;
  /** Raffle tickets keyed by conferenceId — sourced from localStorage. */
  raffleTickets: Record<string, string[]>;
}

/**
 * Fetches the user's Firestore document.
 * Returns an empty object if the document doesn't exist.
 */
export async function getUserFirestoreData(
  uid: string,
): Promise<UserFirestoreData> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return {};
  return snap.data() as UserFirestoreData;
}

/** Reads all raffle-ticket entries from localStorage for the given user. */
export function getRaffleTicketsFromStorage(): Record<string, string[]> {
  const STORAGE_KEY_PREFIX = "raffle_tickets_";
  const result: Record<string, string[]> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(STORAGE_KEY_PREFIX)) {
      const conferenceId = key.slice(STORAGE_KEY_PREFIX.length);
      try {
        const value = localStorage.getItem(key);
        if (value) {
          const parsed = JSON.parse(value) as unknown;
          if (Array.isArray(parsed)) {
            result[conferenceId] = parsed as string[];
          }
        }
      } catch {
        // Ignore malformed localStorage entries
      }
    }
  }
  return result;
}

/**
 * Assembles the complete export payload for a user.
 */
export async function buildUserExportData(
  uid: string,
): Promise<UserExportData> {
  const profile = await getUserFirestoreData(uid);
  const raffleTickets = getRaffleTicketsFromStorage();
  return {
    exportedAt: new Date().toISOString(),
    uid,
    profile,
    raffleTickets,
  };
}

/** Serialises the export payload to a pretty-printed JSON string. */
export function formatAsJson(data: UserExportData): string {
  return JSON.stringify(data, null, 2);
}

/**
 * Serialises the export payload to a flat CSV string.
 *
 * Each row represents a single atomic value. Nested objects / arrays are
 * expanded to one row per leaf with a dot-notation key path.
 */
export function formatAsCsv(data: UserExportData): string {
  const rows: [string, string][] = [];

  function flatten(obj: unknown, prefix: string): void {
    if (obj === null || obj === undefined) {
      rows.push([prefix, ""]);
    } else if (Array.isArray(obj)) {
      if (obj.length === 0) {
        rows.push([prefix, ""]);
      } else {
        obj.forEach((item, idx) => flatten(item, `${prefix}[${idx}]`));
      }
    } else if (typeof obj === "object") {
      const entries = Object.entries(obj as Record<string, unknown>);
      if (entries.length === 0) {
        rows.push([prefix, ""]);
      } else {
        entries.forEach(([k, v]) =>
          flatten(v, prefix ? `${prefix}.${k}` : k),
        );
      }
    } else {
      rows.push([prefix, String(obj)]);
    }
  }

  flatten(data, "");

  const escape = (val: string) =>
    val.includes(",") || val.includes('"') || val.includes("\n")
      ? `"${val.replace(/"/g, '""')}"`
      : val;

  const header = "key,value";
  const body = rows.map(([k, v]) => `${escape(k)},${escape(v)}`).join("\n");
  return `${header}\n${body}`;
}

/**
 * Triggers a browser file download with the given content.
 */
export function triggerDownload(
  content: string,
  filename: string,
  mimeType: string,
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Audit log event types.
 */
export type AuditAction = "data_export" | "account_deletion" | "attendee_list_read";

/**
 * Writes an audit log entry to `users/{uid}/auditLog`.
 * Failures are non-fatal and are logged to the console only.
 */
export async function writeAuditLog(
  uid: string,
  action: AuditAction,
  metadata?: Record<string, unknown>,
): Promise<void> {
  try {
    const logRef = collection(db, "users", uid, "auditLog");
    await addDoc(logRef, {
      action,
      timestamp: serverTimestamp(),
      ...(metadata ? { metadata } : {}),
    });
  } catch (err) {
    console.error("writeAuditLog: failed to write audit log entry", err);
  }
}

/**
 * High-level helper: builds the export payload, formats it, triggers a
 * download, and writes an audit log entry.
 */
export async function exportAndDownloadUserData(
  uid: string,
  format: "json" | "csv",
): Promise<void> {
  const data = await buildUserExportData(uid);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  if (format === "json") {
    const content = formatAsJson(data);
    triggerDownload(
      content,
      `user-data-${timestamp}.json`,
      "application/json",
    );
  } else {
    const content = formatAsCsv(data);
    triggerDownload(content, `user-data-${timestamp}.csv`, "text/csv");
  }

  await writeAuditLog(uid, "data_export", { format });
}

/** Retention period in milliseconds: 90 days */
const RETENTION_MS = 90 * 24 * 60 * 60 * 1000;

/**
 * Returns the list of conferenceIds whose retention window has passed
 * (endDate + RETENTION_MS < nowMs).
 */
export function getExpiredConferenceIds(
  conferenceEndDates: Record<string, string>,
  nowMs: number = Date.now(),
): string[] {
  return Object.entries(conferenceEndDates)
    .filter(([, endDate]) => {
      const endMs = new Date(endDate).getTime();
      return endMs + RETENTION_MS < nowMs;
    })
    .map(([id]) => id);
}

/**
 * Strips expired conference keys from a user Firestore document snapshot.
 * Returns the fields that should be removed (for use with Firestore updates).
 */
export function buildExpiredFieldRemovals(
  userData: UserFirestoreData,
  expiredConferenceIds: string[],
): Record<string, unknown> {
  if (expiredConferenceIds.length === 0) return {};
  const removals: Record<string, unknown> = {};

  for (const field of CONFERENCE_KEYED_FIELDS) {
    const value = userData[field] as
      | Record<string, unknown>
      | undefined;
    if (!value) continue;
    for (const conferenceId of expiredConferenceIds) {
      if (conferenceId in value) {
        // Firestore FieldValue.delete() is used by the caller; here we just
        // mark the key so callers know which paths need deletion.
        removals[`${field}.${conferenceId}`] = null;
      }
    }
  }

  return removals;
}
