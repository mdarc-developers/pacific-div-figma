/**
 * Validates and normalizes an exhibitor URL.
 * Returns null if the URL is empty, incomplete, or otherwise invalid,
 * so that no anchor tag is rendered and clicking the title does not
 * accidentally navigate the user away.
 */
export function sanitizeExhibitorUrl(url: string): string | null {
  if (!url || url.trim() === "") {
    return null;
  }
  const trimmed = url.trim();
  // Prepend https:// if the URL has no protocol
  const normalized =
    trimmed.startsWith("http://") || trimmed.startsWith("https://")
      ? trimmed
      : `https://${trimmed}`;
  try {
    const parsed = new URL(normalized);
    const hostname = parsed.hostname;
    // Reject incomplete hostnames such as "www." with nothing after the dot
    if (!hostname || hostname.endsWith(".") || !hostname.includes(".")) {
      return null;
    }
    return normalized;
  } catch {
    return null;
  }
}
