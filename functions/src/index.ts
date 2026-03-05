import { beforeUserCreated } from "firebase-functions/v2/identity";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { logger } from "firebase-functions";
import { defineSecret, defineString } from "firebase-functions/params";
import * as admin from "firebase-admin";
import { google } from "googleapis";
import { JWT } from "google-auth-library";

admin.initializeApp();

// Declare secrets using firebase-functions/params (replaces the deprecated
// functions.config() / Cloud Runtime Config approach).
// Values are stored in Firebase Secret Manager and injected at runtime.
// To provision: firebase functions:secrets:set GMAIL_SERVICE_ACCOUNT_JSON
//               firebase functions:secrets:set GMAIL_SENDER_EMAIL
const gmailServiceAccountJson = defineSecret("GMAIL_SERVICE_ACCOUNT_JSON");
const gmailSenderEmail = defineSecret("GMAIL_SENDER_EMAIL");

// The runtime service account for this v2 Cloud Function.
// Firebase CLI defaults to the legacy App Engine SA (project-id@appspot.gserviceaccount.com)
// when granting Secret Manager access for blocking functions, but that SA no longer exists.
// Explicitly set FUNCTION_SERVICE_ACCOUNT to the Compute Engine default SA:
//   {project-number}-compute@developer.gserviceaccount.com
// Find your project number at: https://console.cloud.google.com/iam-admin/settings
// Set in functions/.env:  FUNCTION_SERVICE_ACCOUNT=…-compute@developer.gserviceaccount.com
const functionServiceAccount = defineString("FUNCTION_SERVICE_ACCOUNT", {
  description:
    "Runtime service account for the sendWelcomeEmail Cloud Function v2. " +
    "Use the Compute Engine default SA: {project-number}-compute@developer.gserviceaccount.com. " +
    "Find your project number at https://console.cloud.google.com/iam-admin/settings",
  input: {
    text: {
      validationRegex: "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$",
      validationErrorMessage:
        "Must be a valid service account email, e.g. 123456789-compute@developer.gserviceaccount.com",
    },
  },
});

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
 * This is a Cloud Functions v2 blocking function that fires before the user
 * record is written to Firebase Auth. It never throws, so user registration
 * always succeeds even if email delivery fails.
 *
 * Required Firebase Secrets (set with firebase functions:secrets:set):
 *   GMAIL_SERVICE_ACCOUNT_JSON  — JSON key file for the service account
 *   GMAIL_SENDER_EMAIL          — The "From" address (must match the delegated user)
 *
 * The service account must have domain-wide delegation enabled and the
 * scope https://www.googleapis.com/auth/gmail.send granted.
 */
export const sendWelcomeEmail = beforeUserCreated(
  {
    secrets: [gmailServiceAccountJson, gmailSenderEmail],
    serviceAccount: functionServiceAccount,
  },
  async (event) => {
    const email = event.data?.email;
    const displayName = event.data?.displayName;
    const uid = event.data?.uid;

    if (!email) {
      logger.info("sendWelcomeEmail: user has no email, skipping", { uid });
      return;
    }

    const serviceAccountJson = gmailServiceAccountJson.value();
    const senderEmail = gmailSenderEmail.value();

    if (!serviceAccountJson || !senderEmail) {
      logger.error(
        "sendWelcomeEmail: GMAIL_SERVICE_ACCOUNT_JSON and GMAIL_SENDER_EMAIL secrets must be set. " +
          "Run: firebase functions:secrets:set GMAIL_SERVICE_ACCOUNT_JSON and GMAIL_SENDER_EMAIL",
      );
      return;
    }

    let credentials: Record<string, unknown>;
    try {
      credentials = JSON.parse(serviceAccountJson) as Record<string, unknown>;
    } catch (err) {
      logger.error(
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
      logger.info("sendWelcomeEmail: welcome email sent", { uid, email });
    } catch (err) {
      logger.error("sendWelcomeEmail: failed to send welcome email", {
        uid,
        email,
        err,
      });
    }
  },
);

/**
 * Increments the signup counter in `stats/signupCounter` whenever a new
 * document is written to the `users/{uid}` collection.
 *
 * The counter document lives at:
 *   Firestore → stats → signupCounter → { count: <number> }
 *
 * Using FieldValue.increment with merge:true is self-initializing: on the
 * very first signup the document is created with count:1; subsequent writes
 * atomically increment the existing value.  No manual Firestore initialization
 * is required before deployment.
 */
export const incrementSignupCounter = onDocumentCreated(
  "users/{uid}",
  async (event) => {
    const uid = event.params.uid;
    const counterRef = admin
      .firestore()
      .collection("stats")
      .doc("signupCounter");

    try {
      await counterRef.set(
        { count: admin.firestore.FieldValue.increment(1) },
        { merge: true },
      );
      logger.info("incrementSignupCounter: counter incremented", { uid });
    } catch (err) {
      logger.error("incrementSignupCounter: failed to increment counter", {
        uid,
        err,
      });
    }
  },
);
