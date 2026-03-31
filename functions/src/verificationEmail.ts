/**
 * Verification email content sent to newly registered users and on resend.
 *
 * The email delivers the Firebase-generated one-time verification link via the
 * Gmail API (the same pathway used for welcome emails) so that delivery is
 * reliable even for email domains whose servers filter messages from
 * noreply@*.firebaseapp.com.
 *
 * Edit this file to change the subject line or the HTML body of the
 * email-verification message.
 */

/** Subject line for the email-verification message. */
export const VERIFICATION_EMAIL_SUBJECT =
  "Verify your Conference AttendeeApp email address";

/**
 * Builds the HTML body for the email-verification message.
 *
 * @param displayName - The user's display name (falls back to `email`).
 * @param email       - The user's email address.
 * @param link        - The Firebase one-time email-verification link.
 */
export function buildVerificationEmailHtml(
  displayName: string | undefined,
  email: string,
  link: string,
): string {
  const name = displayName ?? email;
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify your email address</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="background-color:#1a3a5c;padding:32px 40px;text-align:center;">
              <h1 style="color:#ffffff;margin:0;font-size:24px;letter-spacing:1px;">
                AttendeeApp
              </h1>
              <p style="color:#a8c4e0;margin:8px 0 0;font-size:14px;">
                an amateur radio companion for conventioneers
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <h2 style="color:#1a3a5c;margin:0 0 16px;">Verify your email, ${name}</h2>
              <p style="color:#444444;font-size:15px;line-height:1.6;margin:0 0 16px;">
                Please confirm that <strong>${email}</strong> is your email address by
                clicking the button below. This link expires after 24 hours.
              </p>
              <table cellpadding="0" cellspacing="0" style="margin:24px 0 32px;">
                <tr>
                  <td style="background-color:#1a3a5c;border-radius:6px;padding:14px 28px;">
                    <a href="${link}" style="color:#ffffff;text-decoration:none;font-size:15px;font-weight:bold;">
                      Verify Email Address
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color:#666666;font-size:13px;line-height:1.6;margin:0 0 8px;">
                If the button above does not work, copy and paste this link into your browser:
              </p>
              <p style="color:#1a3a5c;font-size:12px;line-height:1.6;margin:0 0 24px;word-break:break-all;">
                ${link}
              </p>
              <p style="color:#666666;font-size:13px;line-height:1.6;margin:0;">
                If you did not create an account, please let us know at
                <a href="mailto:pacific-div@mdarc.org" style="color:#1a3a5c;">pacific-div@mdarc.org</a>.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f0f4f8;padding:20px 40px;text-align:center;">
              <p style="color:#999999;font-size:12px;margin:0;">
                You received this email because an account was created at
                <a href="https://pacific-div.web.app" style="color:#1a3a5c;">pacific-div.web.app</a>.
                Unverified accounts are deleted after 30 days.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
