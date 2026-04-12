/**
 * Server-side profile validation utilities.
 *
 * Pure functions with no Firebase dependencies so they can be unit-tested
 * without mocking the admin SDK.  Used by Cloud Functions to enforce that
 * callers have completed their profile before using protected operations.
 *
 * A "real profile" requires at minimum a non-empty `displayName` field.
 * This applies to all attendees — both licensed amateur radio operators
 * (who may also have a callsign) and any other registered attendees.
 *
 * Compiled output lands in functions/lib/profileValidation.js.
 */

/**
 * Validates that the given Firestore user document data represents a
 * completed ("real") profile.
 *
 * @param userData Raw Firestore document data for the user.
 * @returns `null` when the profile is valid, or an error-reason string when
 *   it is not:
 *   - `"missing-display-name"` — the displayName field is absent or blank.
 */
export function validateRealProfile(
  userData: Record<string, unknown>,
): string | null {
  const displayName =
    typeof userData.displayName === "string" ? userData.displayName.trim() : "";
  if (!displayName) return "missing-display-name";
  return null;
}
