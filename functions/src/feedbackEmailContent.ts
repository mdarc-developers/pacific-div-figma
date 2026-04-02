/**
 * Feedback email content helpers.
 *
 * Pure functions for building the feedback notification email.  Kept separate
 * from the Cloud Function entry-point so they can be unit-tested without a
 * firebase-functions runtime context.
 */

/** The feedback recipient address. */
export const FEEDBACK_RECIPIENT = "pacific-div@mdarc.org";

/** Escapes HTML special characters in a plain-text string. */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Builds the HTML body for a feedback notification email.
 *
 * @param pageUrl    - The app page where the feedback was submitted.
 * @param message    - The user's feedback message.
 * @param senderEmail - Optional submitter email address to show in the body.
 * @param userAgent  - Optional browser user-agent string submitted with the form.
 */
export function buildFeedbackEmailHtml(
  pageUrl: string,
  message: string,
  senderEmail?: string,
  userAgent?: string,
): string {
  const escapedMessage = escapeHtml(message).replace(/\n/g, "<br />");
  const senderLine = senderEmail
    ? `<p style="color:#444444;font-size:15px;line-height:1.6;margin:0 0 8px;"><strong>From:</strong> ${senderEmail}</p>`
    : "";
  const escapedUserAgent = userAgent ? escapeHtml(userAgent) : "";
  const userAgentLine = escapedUserAgent
    ? `<p style="color:#444444;font-size:15px;line-height:1.6;margin:0 0 8px;"><strong>User-Agent:</strong> <span style="font-family:monospace;font-size:13px;">${escapedUserAgent}</span></p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>App Feedback</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="background-color:#1a3a5c;padding:32px 40px;text-align:center;">
              <h1 style="color:#ffffff;margin:0;font-size:24px;letter-spacing:1px;">App Feedback</h1>
              <p style="color:#a8c4e0;margin:8px 0 0;font-size:14px;">AttendeeApp — Amateur Radio Conference</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              ${senderLine}
              ${userAgentLine}
              <p style="color:#444444;font-size:15px;line-height:1.6;margin:0 0 8px;"><strong>Page:</strong> <a href="${pageUrl}" style="color:#1a3a5c;">${pageUrl}</a></p>
              <p style="color:#444444;font-size:15px;line-height:1.6;margin:16px 0 8px;"><strong>Message:</strong></p>
              <p style="color:#444444;font-size:15px;line-height:1.6;margin:0 0 24px;">${escapedMessage}</p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f0f4f8;padding:20px 40px;text-align:center;">
              <p style="color:#999999;font-size:12px;margin:0;">
                Sent via the AttendeeApp feedback form at
                <a href="https://pacific-div.web.app" style="color:#1a3a5c;">pacific-div.web.app</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
