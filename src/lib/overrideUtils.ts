import { Conference, Session } from "@/types/conference";
import { KNOWN_GROUPS } from "@/lib/groupsData";

/**
 * Format a supplemental-file timestamp token for brief display.
 *
 * Handles date-only tokens ("YYYYMMDD") and full datetime tokens
 * ("YYYYMMDDTHHmmss"), which are the string after the last "-" in the
 * supplemental override filename.  The glob and regex in ScheduleView
 * match both "session" and "sesssion" spellings for backwards compatibility.
 *
 * Examples:
 *   "20260227T132422"  →  "02/27 @ 13:24"
 *   "20260227"         →  "02/27"
 */
export function formatUpdateToken(token: string): string {
  const month = token.slice(4, 6);
  const day = token.slice(6, 8);
  if (token.length <= 8) {
    return `${month}/${day}`;
  }
  const hour = token.slice(9, 11);
  const minute = token.slice(11, 13);
  return `${month}/${day} @ ${hour}:${minute}`;
}

/**
 * Return a valid endTime string for a session.
 *
 * If `endTime` is a non-empty valid ISO datetime string it is returned
 * unchanged.  Otherwise (empty string, non-ISO garbage, etc.) the function
 * returns a string that is exactly one hour after `startTime`.  If
 * `startTime` is itself unparseable the original (invalid) `endTime` is
 * returned so the caller can still render the session.
 *
 * Both `startTime` and `endTime` are expected to be local-time ISO strings
 * without a timezone suffix (e.g. "2027-01-18T09:00:00").
 *
 * Examples:
 *   ("2027-01-18T09:00:00", "2027-01-18T10:30:00") → "2027-01-18T10:30:00"
 *   ("2027-01-18T09:00:00", "")                     → "2027-01-18T10:00:00"
 *   ("2027-01-18T09:00:00", "INVALID")              → "2027-01-18T10:00:00"
 *   ("NOT-A-DATE",          "")                     → ""
 */
export function resolveSessionEndTime(
  startTime: string,
  endTime: string,
): string {
  if (endTime && !isNaN(new Date(endTime).getTime())) {
    return endTime;
  }
  // Append "Z" so the string is always parsed as UTC, making the +1 h
  // arithmetic timezone-independent in all JS environments.
  const startMs = new Date(startTime + "Z").getTime();
  if (isNaN(startMs)) {
    return endTime;
  }
  return new Date(startMs + 60 * 60 * 1000).toISOString().slice(0, 19);
}

/**
 * Returns true if a session's start and end dates both fall within the
 * inclusive date range of the given conference.
 *
 * Only the date portion ("YYYY-MM-DD") of `startTime` and `endTime` is
 * compared against `conference.startDate` / `conference.endDate`.  When
 * `endTime` is empty or not a valid ISO datetime the start-date is used as
 * a proxy for the end-date (best effort).
 *
 * Examples (conference 2027-01-17 – 2027-01-23):
 *   startTime "2027-01-18T09:00:00", endTime "2027-01-18T10:00:00" → true
 *   startTime "2026-01-18T09:00:00", endTime "2026-01-18T10:00:00" → false
 *   startTime "2027-01-23T20:00:00", endTime "2027-01-24T00:00:00" → false
 */
export function isSessionWithinConference(
  session: Session,
  conference: Conference,
): boolean {
  const sessionStartDate = session.startTime.split("T")[0];
  const sessionEndDate =
    session.endTime && !isNaN(new Date(session.endTime).getTime())
      ? session.endTime.split("T")[0]
      : sessionStartDate;
  return (
    sessionStartDate >= conference.startDate &&
    sessionEndDate <= conference.endDate
  );
}

/**
 * Emit a console warning for every session whose start or end date falls
 * outside the inclusive date range of the given conference.
 *
 * This is intentionally non-fatal — the warning is informational and does
 * not prevent the session from being displayed.
 */
export function warnOutOfRangeSessions(
  conferenceId: string,
  sessions: Session[],
  conference: Conference,
): void {
  sessions.forEach((session) => {
    if (!isSessionWithinConference(session, conference)) {
      console.warn(
        `[supplementalData] Session "${session.id}" in "${conferenceId}" is outside conference dates` +
          ` (${conference.startDate}–${conference.endDate}):` +
          ` startTime=${session.startTime}`,
      );
    }
  });
}

/**
 * Emit a console warning when a map data array is empty for a given URL.
 *
 * This is intentionally non-fatal — the warning is informational and does
 * not prevent the conference from being displayed.
 *
 * Examples:
 *   warnEmptyMapData("seapac-2026", "mapSessions", "/assets/maps/seapac-forums.png", [])
 *   → console.warn('[supplementalData] "seapac-2026" mapSessions has an empty array for URL "/assets/maps/seapac-forums.png"')
 */
export function warnEmptyMapData(
  conferenceId: string,
  type: "mapSessions" | "mapRooms" | "mapBooths" | "mapExhibitors",
  url: string,
  items: unknown[],
): void {
  if (items.length === 0) {
    console.warn(
      `[supplementalData] "${conferenceId}" ${type} has an empty array for URL "${url}"`,
    );
  }
}

/**
 * Return a human-readable full detail string for a supplemental-file timestamp
 * token, suitable for use in a tooltip.
 *
 * Examples:
 *   "20260227T132422"  →  "2026-02-27 13:24:22"
 *   "20260227"         →  "2026-02-27"
 */
export function formatUpdateTokenDetail(token: string): string {
  const year = token.slice(0, 4);
  const month = token.slice(4, 6);
  const day = token.slice(6, 8);
  if (token.length <= 8) {
    return `${year}-${month}-${day}`;
  }
  const hour = token.slice(9, 11);
  const minute = token.slice(11, 13);
  const sec = token.slice(13, 15);
  return `${year}-${month}-${day} ${hour}:${minute}:${sec}`;
}

/**
 * Emit a console warning for every group name that is not in the KNOWN_GROUPS
 * set.  This is intentionally non-fatal — the warning is informational and
 * does not prevent the group from being displayed on the profile page.
 *
 * Examples:
 *   warnUnknownGroups("loomis-2026", "user@example.com", ["prize-admin", "more-admin"])
 *   → console.warn('[userProfile] "loomis-2026" user "user@example.com" has unrecognised group "more-admin"')
 */
export function warnUnknownGroups(
  conferenceId: string,
  userEmail: string,
  groups: string[],
): void {
  groups.forEach((group) => {
    if (!KNOWN_GROUPS.has(group)) {
      console.warn(
        `[userProfile] "${conferenceId}" user "${userEmail}" has unrecognised group "${group}"`,
      );
    }
  });
}
