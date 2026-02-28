/**
 * Format a supplemental-file timestamp token for brief display.
 *
 * Handles date-only tokens ("YYYYMMDD") and full datetime tokens
 * ("YYYYMMDDTHHmmss"), which are the string after the last "-" in the
 * supplemental override filename.  Note: the first session override file was
 * named with a triple-s typo ("sesssion") — the glob and regex in ScheduleView
 * intentionally match both spellings.
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
