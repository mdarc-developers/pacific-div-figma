/**
 * The canonical set of group names that the application explicitly handles.
 * Groups assigned to a user that are NOT in this set are considered
 * "unrecognised" — they are still displayed on the profile page (in grey)
 * and emitted as a console.warn via warnUnknownGroups() so developers are
 * alerted during testing and at module load time.
 */
export const KNOWN_GROUPS: ReadonlySet<string> = new Set([
  "prize-admin",
  "user-admin",
  "session-admin",
  "exhibitor-admin",
  "mdarc-developers",
  "forums-admin",
]);
