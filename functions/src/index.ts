import * as functionsV1 from "firebase-functions/v1";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { google } from "googleapis";
import { JWT } from "google-auth-library";

admin.initializeApp();

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
  const message = messageParts.join("\n");
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
  <title>Welcome to the ARRL Pacific Division Conference App</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="background-color:#1a3a5c;padding:32px 40px;text-align:center;">
              <h1 style="color:#ffffff;margin:0;font-size:24px;letter-spacing:1px;">
                ARRL Pacific Division
              </h1>
              <p style="color:#a8c4e0;margin:8px 0 0;font-size:14px;">
                Conference Attendee App
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <h2 style="color:#1a3a5c;margin:0 0 16px;">Welcome, ${name}!</h2>
              <p style="color:#444444;font-size:15px;line-height:1.6;margin:0 0 16px;">
                Thank you for registering for the ARRL Pacific Division Conference App.
                We're excited to have you on board!
              </p>
              <p style="color:#444444;font-size:15px;line-height:1.6;margin:0 0 16px;">
                With your account you can:
              </p>
              <ul style="color:#444444;font-size:15px;line-height:1.8;margin:0 0 24px;padding-left:20px;">
                <li>Browse and bookmark conference sessions</li>
                <li>View interactive venue maps</li>
                <li>Receive prize winner notifications</li>
                <li>Stay up-to-date with conference alerts</li>
                <li>Connect with fellow amateur radio operators</li>
              </ul>
              <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
                <tr>
                  <td style="background-color:#1a3a5c;border-radius:6px;padding:14px 28px;">
                    <a href="https://pacific-div.web.app" style="color:#ffffff;text-decoration:none;font-size:15px;font-weight:bold;">
                      Open the Conference App
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color:#666666;font-size:13px;line-height:1.6;margin:0;">
                73 de ARRL Pacific Division<br />
                <a href="mailto:webmaster@pacificon.org" style="color:#1a3a5c;">webmaster@pacificon.org</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f0f4f8;padding:20px 40px;text-align:center;">
              <p style="color:#999999;font-size:12px;margin:0;">
                You are receiving this email because you created an account at
                <a href="https://pacific-div.web.app" style="color:#1a3a5c;">pacific-div.web.app</a>.
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

/**
 * Sends a welcome email to a newly registered user via the Gmail API,
 * authenticated with a service account using google-auth-library.
 *
 * Required Firebase Secrets (set with firebase functions:secrets:set):
 *   GMAIL_SERVICE_ACCOUNT_JSON  — JSON key file for the service account
 *   GMAIL_SENDER_EMAIL          — The "From" address (must match the delegated user)
 *
 * The service account must have domain-wide delegation enabled and the
 * scope https://www.googleapis.com/auth/gmail.send granted.
 */
export const sendWelcomeEmail = functionsV1
  .runWith({ secrets: ["GMAIL_SERVICE_ACCOUNT_JSON", "GMAIL_SENDER_EMAIL"] })
  .auth.user()
  .onCreate(async (user) => {
    const { email, displayName } = user;

    if (!email) {
      functions.logger.info("sendWelcomeEmail: user has no email, skipping", {
        uid: user.uid,
      });
      return;
    }

    const serviceAccountJson = process.env.GMAIL_SERVICE_ACCOUNT_JSON;
    const senderEmail = process.env.GMAIL_SENDER_EMAIL;

    if (!serviceAccountJson || !senderEmail) {
      functions.logger.error(
        "sendWelcomeEmail: GMAIL_SERVICE_ACCOUNT_JSON and GMAIL_SENDER_EMAIL secrets must be set. " +
          "Run: firebase functions:secrets:set GMAIL_SERVICE_ACCOUNT_JSON and GMAIL_SENDER_EMAIL",
      );
      return;
    }

    let credentials: Record<string, unknown>;
    try {
      credentials = JSON.parse(serviceAccountJson) as Record<string, unknown>;
    } catch (err) {
      functions.logger.error(
        "sendWelcomeEmail: failed to parse GMAIL_SERVICE_ACCOUNT_JSON",
        err,
      );
      return;
    }

    // Authenticate using a JWT (service account) via google-auth-library.
    // The service account must have domain-wide delegation for the sender address.
    const authClient = new JWT({
      email: credentials.client_email as string,
      key: credentials.private_key as string,
      scopes: ["https://www.googleapis.com/auth/gmail.send"],
      subject: senderEmail,
    });

    const gmail = google.gmail({ version: "v1", auth: authClient });

    const subject = "Welcome to the ARRL Pacific Division Conference App!";
    const htmlBody = buildWelcomeEmailHtml(displayName, email);
    const raw = buildRawMessage(senderEmail, email, subject, htmlBody);

    try {
      await gmail.users.messages.send({
        userId: "me",
        requestBody: { raw },
      });
      functions.logger.info("sendWelcomeEmail: welcome email sent", {
        uid: user.uid,
        email,
      });
    } catch (err) {
      functions.logger.error(
        "sendWelcomeEmail: failed to send welcome email",
        { uid: user.uid, email, err },
      );
    }
  });
