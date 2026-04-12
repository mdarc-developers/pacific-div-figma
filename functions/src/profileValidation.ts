/**
 * Server-side profile validation utilities.
 *
 * Pure functions with no Firebase dependencies so they can be unit-tested
 * without mocking the admin SDK.  Used by Cloud Functions to enforce that
 * callers have completed their profile before using protected operations.
 *
 * A "real profile" requires at minimum a non-empty `callsign` field, which
 * identifies the user as a licensed amateur radio operator.
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
 *   - `"missing-callsign"` — the callsign field is absent or blank.
 */
export function validateRealProfile(
  userData: Record<string, unknown>,
): string | null {
  const callsign =
    typeof userData.callsign === "string" ? userData.callsign.trim() : "";
  if (!callsign) return "missing-callsign";
  return null;
}
