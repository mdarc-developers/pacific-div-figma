/**
 * Welcome email content for new user registrations.
 *
 * Edit this file to change the subject line or the HTML body of the welcome
 * email that is sent automatically when a new account is created.
 */

/** Subject line for the new-user welcome email. */
export const WELCOME_EMAIL_SUBJECT = "Welcome to the Conference AttendeeApp!";

/**
 * Encodes a raw email message as a base64url string for the Gmail API.
 */
export function buildRawMessage(
  from: string,
  to: string,
  subject: string,
  htmlBody: string,
): string {
  const messageParts = [
    `From: ${from}`,
    `To: ${to}`,
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=utf-8",
    `Subject: ${subject}`,
    "",
    htmlBody,
  ];
  const message = messageParts.join("\r\n");
  return Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Builds a welcome email HTML body for a new user.
 */
export function buildWelcomeEmailHtml(
  displayName: string | undefined,
  email: string,
): string {
  const name = displayName ?? email;
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to the Conference Companion Attendee App</title>
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
              <h2 style="color:#1a3a5c;margin:0 0 16px;">Welcome, ${name}!</h2>
              <p style="color:#444444;font-size:15px;line-height:1.6;margin:0 0 16px;">
                Thank you for registering your profile.
                We're looking forward to seeing you at an amateur radio conference soon!
              </p>
              <p style="color:#444444;font-size:15px;line-height:1.6;margin:0 0 16px;">
                With your account you can:
              </p>
              <ul style="color:#444444;font-size:15px;line-height:1.8;margin:0 0 24px;padding-left:20px;">
                <li>Browse and bookmark conference sessions and forums</li>
                <li>Browse and bookmark interactive exhibitor maps</li>
                <li>Connect with fellow amateur radio operators</li>
                <li>Receive prize winner notifications</li>
                <li>Stay up-to-date with conference alerts</li>
              </ul>
              <p style="color:#444444;font-size:15px;line-height:1.6;margin:0 0 16px;">
                Whether you attending for the first time or have attended before you will want to address a number of related concerns to make your trip enjoyable:
              </p>
              <ul style="color:#444444;font-size:15px;line-height:1.8;margin:0 0 24px;padding-left:20px;">
                <li>Please click the link in the separate email verification message</a></li>
                <li>Complete your attendee registration</li>
                <li>Arrange your travel and accomodations</li>
                <li>If you have attended before, consider helping the volunteers that make our conferences happen and providing feedback to the busy team</li>
              </ul>
              <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
                <tr>
                  <td style="background-color:#1a3a5c;border-radius:6px;padding:14px 28px;">
                    <a href="https://pacific-div.web.app" style="color:#ffffff;text-decoration:none;font-size:15px;font-weight:bold;">
                      Open pacific-div.web.app
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color:#666666;font-size:13px;line-height:1.6;margin:0;">
                73 from your conference organizers & app creators,<br />
                <a href="mailto:pacific-div@mdarc.org" style="color:#1a3a5c;">pacific-div@mdarc.org</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f0f4f8;padding:20px 40px;text-align:center;">
              <p style="color:#999999;font-size:12px;margin:0;">
                You were sent this email because you created an account at
                <a href="https://pacific-div.web.app" style="color:#1a3a5c;">pacific-div.web.app</a>.
                If you do not verify the email the account will be deleted in 30 days.
                If you did not create an account please help us fight spam by letting us know at <a href="mailto:pacific-div@mdarc.org" style="color:#1a3a5c;">pacific-div@mdarc.org</a>.
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
