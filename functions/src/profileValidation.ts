/**
 * Server-side profile validation utilities.
 *
 * Pure functions with no Firebase dependencies so they can be unit-tested
 * without mocking the admin SDK.  Cloud Functions in index.ts use these
 * helpers to require a "real profile" (at minimum a non-empty displayName)
 * before allowing protected operations such as voting.
 *
 * Compiled output lands in functions/lib/profileValidation.js.
 */

/**
 * Validates that a user document contains a "real profile".
 *
 * A real profile requires a non-empty `displayName`.  The `callsign` field
 * is optional and is not checked here.
 *
 * @param userData - Raw data from the `users/{uid}` Firestore document.
 * @returns `null` when the profile is valid, or an error-reason string:
 *   - `"missing-display-name"` — the user has not set a display name.
 */
export function validateRealProfile(
  userData: Record<string, unknown>,
): string | null {
  const displayName = userData["displayName"];
  if (
    !displayName ||
    typeof displayName !== "string" ||
    displayName.trim() === ""
  ) {
    return "missing-display-name";
  }
  return null;
}
