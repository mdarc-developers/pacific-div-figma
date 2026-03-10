import { onSchedule } from "firebase-functions/v2/scheduler";
import { logger } from "firebase-functions";
import * as admin from "firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

/**
 * Conference-keyed fields in the users Firestore document.
 * Any key inside these fields represents a conferenceId.
 */
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

/** Retention period in milliseconds: 90 days */
const RETENTION_MS = 90 * 24 * 60 * 60 * 1000;

interface ConferenceDoc {
  endDate?: string;
}

/**
 * Returns the list of conferenceIds whose retention window has passed
 * (endDate + 90 days < nowMs).
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
 * Reads the `conferences` Firestore collection and returns a map of
 * conferenceId → endDate for all conferences that have an `endDate` field.
 */
export async function loadConferenceEndDates(): Promise<
  Record<string, string>
> {
  const snapshot = await admin.firestore().collection("conferences").get();
  const result: Record<string, string> = {};
  for (const docSnap of snapshot.docs) {
    const data = docSnap.data() as ConferenceDoc;
    if (typeof data.endDate === "string" && data.endDate.length > 0) {
      result[docSnap.id] = data.endDate;
    }
  }
  return result;
}

/**
 * Builds the Firestore update payload that deletes expired conference keys
 * from all per-conference user document fields.
 */
export function buildExpiredFieldRemovals(
  userData: Record<string, unknown>,
  expiredConferenceIds: string[],
): Record<string, unknown> {
  if (expiredConferenceIds.length === 0) return {};
  const removals: Record<string, unknown> = {};

  for (const field of CONFERENCE_KEYED_FIELDS) {
    const value = userData[field] as Record<string, unknown> | undefined;
    if (!value || typeof value !== "object") continue;
    for (const conferenceId of expiredConferenceIds) {
      if (conferenceId in value) {
        removals[`${field}.${conferenceId}`] = FieldValue.delete();
      }
    }
  }

  return removals;
}

/**
 * Scheduled Cloud Function — runs daily at 03:00 UTC.
 *
 * For every user document in Firestore:
 *   1. Checks each per-conference data field.
 *   2. Identifies conferences whose retention window (endDate + 90 days)
 *      has passed.
 *   3. Removes the expired conference keys and writes an audit log entry.
 *
 * Requires the `conferences` Firestore collection to have documents with an
 * `endDate` field (ISO 8601 date string, e.g. "2026-10-19").
 */
export const purgeExpiredUserData = onSchedule(
  { schedule: "every day 03:00", timeZone: "UTC" },
  async () => {
    const firestore = admin.firestore();

    // 1. Load conference end dates from Firestore.
    let conferenceEndDates: Record<string, string>;
    try {
      conferenceEndDates = await loadConferenceEndDates();
    } catch (err) {
      logger.error(
        "purgeExpiredUserData: failed to load conference end dates",
        err,
      );
      return;
    }

    const expiredIds = getExpiredConferenceIds(conferenceEndDates);
    if (expiredIds.length === 0) {
      logger.info(
        "purgeExpiredUserData: no expired conferences found, nothing to do",
      );
      return;
    }

    logger.info("purgeExpiredUserData: expired conference ids", { expiredIds });

    // 2. Process each user document in batches.
    const usersRef = firestore.collection("users");
    let lastDoc: admin.firestore.QueryDocumentSnapshot | null = null;
    let totalPurged = 0;
    const BATCH_SIZE = 100;
    let hasMore = true;

    while (hasMore) {
      let query = usersRef.limit(BATCH_SIZE);
      if (lastDoc) query = query.startAfter(lastDoc);

      const snapshot = await query.get();
      if (snapshot.empty) break;

      const writeBatch = firestore.batch();
      let batchHasWrites = false;

      for (const userDoc of snapshot.docs) {
        const userData = userDoc.data() as Record<string, unknown>;
        const removals = buildExpiredFieldRemovals(userData, expiredIds);

        if (Object.keys(removals).length === 0) continue;

        // Apply removals to the user document.
        writeBatch.update(userDoc.ref, removals);

        // Write an audit log entry in the subcollection.
        const auditRef = userDoc.ref.collection("auditLog").doc();
        writeBatch.set(auditRef, {
          action: "data_retention_purge",
          timestamp: FieldValue.serverTimestamp(),
          metadata: {
            purgedConferenceIds: expiredIds.filter((id) =>
              Object.keys(removals).some((k) => k.includes(id)),
            ),
          },
        });

        batchHasWrites = true;
        totalPurged++;
      }

      if (batchHasWrites) {
        try {
          await writeBatch.commit();
        } catch (err) {
          logger.error("purgeExpiredUserData: batch commit failed", err);
        }
      }

      if (snapshot.docs.length < BATCH_SIZE) {
        hasMore = false;
      } else {
        lastDoc = snapshot.docs[snapshot.docs.length - 1];
      }
    }

    logger.info("purgeExpiredUserData: complete", {
      expiredConferenceIds: expiredIds,
      usersAffected: totalPurged,
    });
  },
);
