import { beforeUserCreated } from "firebase-functions/v2/identity";
import {
  onDocumentCreated,
  onDocumentWritten,
} from "firebase-functions/v2/firestore";
import { logger } from "firebase-functions";
//import { onRequest } from "firebase-functions/https";
import { defineSecret, defineString } from "firebase-functions/params";
import * as admin from "firebase-admin";
import { google } from "googleapis";
import { JWT } from "google-auth-library";
import {
  WELCOME_EMAIL_SUBJECT,
  buildRawMessage,
  buildWelcomeEmailHtml,
} from "./welcomeEmail";
export { purgeExpiredUserData } from "./dataRetention";

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

    const subject = WELCOME_EMAIL_SUBJECT;
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

/**
 * Synchronises the `publicProfiles` collection whenever a `users/{uid}`
 * document is written.
 *
 * - If `profileVisible` is `true` the public fields (displayName, callsign,
 *   displayProfile, email, groups, sessions, exhibitors, prizesDonated) are
 *   copied to `publicProfiles/{uid}`.
 * - If `profileVisible` is falsy, or the user document is deleted, any
 *   existing `publicProfiles/{uid}` entry is removed.
 *
 * This function keeps the publicly-readable `publicProfiles` collection in
 * sync without requiring the client to hold the sensitive data in the `users`
 * document or requiring mdarc-developer privileges to list users.
 */
export const syncPublicProfile = onDocumentWritten(
  "users/{uid}",
  async (event) => {
    const uid = event.params.uid;
    const publicProfileRef = admin
      .firestore()
      .collection("publicProfiles")
      .doc(uid);

    const after = event.data?.after;

    if (!after?.exists) {
      // Document deleted — remove public profile entry
      try {
        await publicProfileRef.delete();
        logger.info("syncPublicProfile: removed public profile on delete", {
          uid,
        });
      } catch (err) {
        logger.error("syncPublicProfile: failed to remove public profile", {
          uid,
          err,
        });
      }
      return;
    }

    const data = after.data() as Record<string, unknown> | undefined;

    if (!data?.profileVisible) {
      // User has opted out — remove any existing public profile entry
      try {
        await publicProfileRef.delete();
        logger.info("syncPublicProfile: removed public profile (not visible)", {
          uid,
        });
      } catch (err) {
        logger.error("syncPublicProfile: failed to remove public profile", {
          uid,
          err,
        });
      }
      return;
    }

    // Build the public-safe subset of the user document
    const publicData: Record<string, unknown> = { uid };
    const stringFields = [
      "displayName",
      "callsign",
      "displayProfile",
      "email",
    ] as const;
    for (const field of stringFields) {
      if (typeof data[field] === "string" && data[field]) {
        publicData[field] = data[field];
      }
    }
    const arrayFields = [
      "groups",
      "sessions",
      "exhibitors",
      "prizesDonated",
    ] as const;
    for (const field of arrayFields) {
      if (Array.isArray(data[field])) {
        publicData[field] = data[field];
      }
    }

    try {
      await publicProfileRef.set(publicData);
      logger.info("syncPublicProfile: public profile synced", { uid });
    } catch (err) {
      logger.error("syncPublicProfile: failed to write public profile", {
        uid,
        err,
      });
    }
  },
);
