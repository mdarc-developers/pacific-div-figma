/**
 * Server-side profile validation utilities.
 *
 * Pure functions with no Firebase dependencies so they can be unit-tested
 * without mocking the admin SDK.  Cloud Functions in index.ts use these
 * helpers to require a "real profile" (verified email or Google sign-in)
 * before allowing protected operations such as voting.
 *
 * Compiled output lands in functions/lib/profileValidation.js.
 */

/** Minimum shape of Firebase auth-token claims required by validateRealProfile. */
export interface ProfileAuthToken {
  email_verified?: boolean;
  firebase?: { sign_in_provider?: string };
}

/**
 * Validates that a user has a "real profile".
 *
 * A real profile requires either a verified email address or a Google
 * sign-in (which Google always treats as verified).  The `displayName` and
 * `callsign` fields are not checked here.
 *
 * @param authToken - Firebase auth-token claims from `request.auth.token`.
 * @returns `null` when the profile is valid, or an error-reason string:
 *   - `"unverified-email"` — the user has not verified their email address.
 */
export function validateRealProfile(authToken: ProfileAuthToken): string | null {
  if (authToken.email_verified === true) {
    return null;
  }
  if (authToken.firebase?.sign_in_provider === "google.com") {
    return null;
  }
  return "unverified-email";
}
