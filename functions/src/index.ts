import { beforeUserCreated } from "firebase-functions/v2/identity";
import {
  onDocumentCreated,
  onDocumentDeleted,
  onDocumentWritten,
} from "firebase-functions/v2/firestore";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as functionsV1 from "firebase-functions/v1";
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
import {
  VERIFICATION_EMAIL_SUBJECT,
  buildVerificationEmailHtml,
} from "./verificationEmail";
export { purgeExpiredUserData } from "./dataRetention";
export { notifyPrizeWinner } from "./prizeNotification";
export { sendFeedbackEmail } from "./feedbackEmail";
import {
  MAX_VOTES,
  sanitizeVotes,
  validateAddVote,
  validateRemoveVote,
} from "./voteValidation";
import { validateRealProfile } from "./profileValidation";

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
 * Increments the attendeeCounter field on conferences/{conferenceId} whenever
 * a new attendee document is created at conferences/{conferenceId}/attendees/{uid}.
 *
 * The counter lives at:
 *   Firestore → conferences → {conferenceId} → { attendeeCounter: <number> }
 *
 * Using FieldValue.increment with merge:true is self-initializing: on the
 * first attendee the field is created with value 1; subsequent writes
 * atomically increment the existing value.  No manual Firestore initialization
 * is required before deployment.
 */
export const incrementAttendeeCounter = onDocumentCreated(
  "conferences/{conferenceId}/attendees/{uid}",
  async (event) => {
    const { conferenceId, uid } = event.params;
    const conferenceRef = admin
      .firestore()
      .collection("conferences")
      .doc(conferenceId);

    try {
      await conferenceRef.set(
        { attendeeCounter: admin.firestore.FieldValue.increment(1) },
        { merge: true },
      );
      logger.info("incrementAttendeeCounter: counter incremented", {
        conferenceId,
        uid,
      });
    } catch (err) {
      logger.error("incrementAttendeeCounter: failed to increment counter", {
        conferenceId,
        uid,
        err,
      });
    }
  },
);

/**
 * Decrements the attendeeCounter field on conferences/{conferenceId} whenever
 * an attendee document is deleted at conferences/{conferenceId}/attendees/{uid}.
 *
 * The counter is decremented by 1, keeping it in sync with the actual number
 * of attendees who have marked themselves as attending.
 */
export const decrementAttendeeCounter = onDocumentDeleted(
  "conferences/{conferenceId}/attendees/{uid}",
  async (event) => {
    const { conferenceId, uid } = event.params;
    const conferenceRef = admin
      .firestore()
      .collection("conferences")
      .doc(conferenceId);

    try {
      await conferenceRef.set(
        { attendeeCounter: admin.firestore.FieldValue.increment(-1) },
        { merge: true },
      );
      logger.info("decrementAttendeeCounter: counter decremented", {
        conferenceId,
        uid,
      });
    } catch (err) {
      logger.error("decrementAttendeeCounter: failed to decrement counter", {
        conferenceId,
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
 * - If `profileVisible` is `true` the non-sensitive display fields
 *   (displayName, callsign, displayProfile, exhibitors) are copied to
 *   `publicProfiles/{uid}`.
 * - If `profileVisible` is falsy, or the user document is deleted, any
 *   existing `publicProfiles/{uid}` entry is removed.
 *
 * Fields intentionally excluded from publicProfiles:
 *   email, groups, sessions, exhibitors, prizesDonated.
 *
 * The `publicProfiles` collection is readable only by authenticated users
 * with a verified email address (enforced by Firestore security rules).
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

    // Build the safe-to-share subset of the user document.
    // displayName, callsign, displayProfile, exhibitors, and speakerSessions
    // are included. email, groups, and prizesDonated are intentionally
    // excluded to minimise exposure of attendee data.
    const publicData: Record<string, unknown> = { uid };
    const allowedStringFields = [
      "displayName",
      "callsign",
      "displayProfile",
    ] as const;
    for (const field of allowedStringFields) {
      if (typeof data[field] === "string" && data[field]) {
        publicData[field] = data[field];
      }
    }
    // Include exhibitors array if present and non-empty.
    // This lets the /exhibitors page show staff profiles for each exhibitor.
    if (
      Array.isArray(data["exhibitors"]) &&
      (data["exhibitors"] as unknown[]).length > 0
    ) {
      publicData["exhibitors"] = data["exhibitors"];
    }
    // Include speakerSessions map if present and non-empty.
    // This lets /schedule and /forums show self-registered presenters per session.
    const speakerSessions = data["speakerSessions"];
    if (
      speakerSessions !== null &&
      typeof speakerSessions === "object" &&
      !Array.isArray(speakerSessions) &&
      Object.keys(speakerSessions as object).length > 0
    ) {
      publicData["speakerSessions"] = speakerSessions;
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

// ─── Email-verification helpers ──────────────────────────────────────────────

/** The Firebase app URL used as the post-verification redirect target. */
const APP_URL = "https://pacific-div.web.app";

/**
 * Builds a Gmail API client authenticated via the service-account credentials
 * stored in the GMAIL_SERVICE_ACCOUNT_JSON secret.
 */
function buildGmailClient(serviceAccountJson: string, senderEmail: string) {
  const credentials = JSON.parse(serviceAccountJson) as Record<string, unknown>;
  const authClient = new JWT({
    email: credentials.client_email as string,
    key: credentials.private_key as string,
    scopes: ["https://www.googleapis.com/auth/gmail.send"],
    subject: senderEmail,
  });
  return google.gmail({ version: "v1", auth: authClient });
}

/**
 * Generates a Firebase email-verification link for `email` and sends it to
 * the user via the Gmail API so that delivery goes through the same trusted
 * channel as the welcome email.
 *
 * Returns `true` on success, `false` on any non-fatal error.
 */
async function sendVerificationLinkViaGmail(
  email: string,
  displayName: string | undefined,
  serviceAccountJson: string,
  senderEmail: string,
  uid: string,
): Promise<boolean> {
  let verificationLink: string;
  try {
    verificationLink = await admin.auth().generateEmailVerificationLink(email, {
      url: APP_URL,
    });
  } catch (err) {
    logger.error(
      "sendVerificationLinkViaGmail: failed to generate verification link",
      { uid, email, err },
    );
    return false;
  }

  let gmail: ReturnType<typeof google.gmail>;
  try {
    gmail = buildGmailClient(serviceAccountJson, senderEmail);
  } catch (err) {
    logger.error("sendVerificationLinkViaGmail: failed to build Gmail client", {
      uid,
      err,
    });
    return false;
  }

  const htmlBody = buildVerificationEmailHtml(
    displayName,
    email,
    verificationLink,
  );
  const raw = buildRawMessage(
    senderEmail,
    email,
    VERIFICATION_EMAIL_SUBJECT,
    htmlBody,
  );

  try {
    await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw },
    });
    logger.info("sendVerificationLinkViaGmail: verification email sent", {
      uid,
      email,
    });
    return true;
  } catch (err) {
    logger.error(
      "sendVerificationLinkViaGmail: failed to send verification email",
      { uid, email, err },
    );
    return false;
  }
}

/**
 * Sends a Firebase email-verification link to a newly registered user via the
 * Gmail API.
 *
 * This function is intentionally separate from `sendWelcomeEmail` so that the
 * verification link is generated AFTER the Firebase Auth user record exists
 * (which is required by `admin.auth().generateEmailVerificationLink()`).
 *
 * `sendWelcomeEmail` is a `beforeUserCreated` blocking function and therefore
 * cannot generate verification links because the Auth record does not yet
 * exist at that point.
 *
 * Required Firebase Secrets:
 *   GMAIL_SERVICE_ACCOUNT_JSON  — JSON key file for the service account
 *   GMAIL_SENDER_EMAIL          — The "From" address (must match the delegated user)
 */
export const sendVerificationEmailOnCreate = functionsV1
  .runWith({
    secrets: ["GMAIL_SERVICE_ACCOUNT_JSON", "GMAIL_SENDER_EMAIL"],
  })
  .auth.user()
  .onCreate(async (user) => {
    const { uid, email, displayName } = user;

    if (!email) {
      logger.info(
        "sendVerificationEmailOnCreate: user has no email, skipping",
        { uid },
      );
      return;
    }

    // Skip Google sign-in users — their email is already verified by Google.
    if (user.emailVerified) {
      logger.info(
        "sendVerificationEmailOnCreate: email already verified, skipping",
        { uid },
      );
      return;
    }

    // process.env is used here (not gmailServiceAccountJson.value()) because
    // this is a Firebase Functions v1 trigger.  Secrets for v1 functions are
    // injected via runWith({ secrets: [...] }) and exposed as environment
    // variables, whereas .value() is the v2 params API.
    const serviceAccountJson = process.env.GMAIL_SERVICE_ACCOUNT_JSON ?? "";
    const senderEmail = process.env.GMAIL_SENDER_EMAIL ?? "";

    if (!serviceAccountJson || !senderEmail) {
      logger.error(
        "sendVerificationEmailOnCreate: GMAIL_SERVICE_ACCOUNT_JSON and " +
          "GMAIL_SENDER_EMAIL secrets must be set.",
      );
      return;
    }

    await sendVerificationLinkViaGmail(
      email,
      displayName,
      serviceAccountJson,
      senderEmail,
      uid,
    );
  });

/**
 * HTTPS Callable — resendVerificationEmail
 *
 * Called from the client-side "Send verification" button on the Profile page.
 * Generates a fresh Firebase email-verification link and delivers it via the
 * Gmail API.
 *
 * The caller must be authenticated.  Sending to any address other than the
 * caller's own verified email is not permitted.
 *
 * Required Firebase Secrets:
 *   GMAIL_SERVICE_ACCOUNT_JSON  — JSON key file for the service account
 *   GMAIL_SENDER_EMAIL          — The "From" address (must match the delegated user)
 */
export const resendVerificationEmail = onCall(
  {
    secrets: [gmailServiceAccountJson, gmailSenderEmail],
  },
  async (request) => {
    const uid = request.auth?.uid;
    const email = request.auth?.token?.email as string | undefined;

    if (!uid || !email) {
      throw new HttpsError(
        "unauthenticated",
        "You must be signed in to request email verification.",
      );
    }

    if (request.auth?.token?.email_verified) {
      throw new HttpsError(
        "failed-precondition",
        "Your email address is already verified.",
      );
    }

    const serviceAccountJson = gmailServiceAccountJson.value();
    const senderEmail = gmailSenderEmail.value();

    if (!serviceAccountJson || !senderEmail) {
      logger.error(
        "resendVerificationEmail: GMAIL_SERVICE_ACCOUNT_JSON and " +
          "GMAIL_SENDER_EMAIL secrets must be set.",
      );
      throw new HttpsError("internal", "Email service not configured.");
    }

    const displayName = request.auth?.token?.name as string | undefined;

    const ok = await sendVerificationLinkViaGmail(
      email,
      displayName,
      serviceAccountJson,
      senderEmail,
      uid,
    );

    if (!ok) {
      throw new HttpsError("internal", "Failed to send verification email.");
    }

    return { success: true };
  },
);

/**
 * HTTPS Callable — adminLookupUser
 *
 * Called from the UserAdminPage to look up a Firebase Auth user by email.
 * Returns the user's uid, displayName, emailVerified status, and creation
 * time.
 *
 * The caller must be authenticated and a member of the `user-admin` group
 * (checked via the `groups/user-admin` Firestore document).
 */
export const adminLookupUser = onCall(async (request) => {
  const callerUid = request.auth?.uid;
  if (!callerUid) {
    throw new HttpsError(
      "unauthenticated",
      "You must be signed in to use this function.",
    );
  }

  // Verify caller is in the user-admin group
  const groupDoc = await admin.firestore().doc("groups/user-admin").get();
  const isMember =
    groupDoc.exists && groupDoc.data()?.members?.[callerUid] === true;
  if (!isMember) {
    throw new HttpsError(
      "permission-denied",
      "Your account does not have user-admin group membership.",
    );
  }

  const { targetEmail } = request.data as { targetEmail?: string };
  if (!targetEmail || typeof targetEmail !== "string") {
    throw new HttpsError("invalid-argument", "targetEmail is required.");
  }

  let userRecord: admin.auth.UserRecord;
  try {
    userRecord = await admin.auth().getUserByEmail(targetEmail);
  } catch (err: unknown) {
    const code = (err as { code?: string }).code;
    if (code === "auth/user-not-found") {
      throw new HttpsError(
        "not-found",
        "No user found with that email address.",
      );
    }
    logger.error("adminLookupUser: error fetching user", { targetEmail, err });
    throw new HttpsError("internal", "Failed to look up user.");
  }

  return {
    uid: userRecord.uid,
    email: userRecord.email ?? null,
    displayName: userRecord.displayName ?? null,
    emailVerified: userRecord.emailVerified,
    creationTime: userRecord.metadata.creationTime ?? null,
  };
});

/**
 * HTTPS Callable — adminResendVerificationEmail
 *
 * Called from the UserAdminPage to resend an email-verification link to a
 * specific user on their behalf.  The caller must be authenticated and a
 * member of the `user-admin` group.
 *
 * Required Firebase Secrets:
 *   GMAIL_SERVICE_ACCOUNT_JSON  — JSON key file for the service account
 *   GMAIL_SENDER_EMAIL          — The "From" address (must match the delegated user)
 */
export const adminResendVerificationEmail = onCall(
  {
    secrets: [gmailServiceAccountJson, gmailSenderEmail],
  },
  async (request) => {
    const callerUid = request.auth?.uid;
    if (!callerUid) {
      throw new HttpsError(
        "unauthenticated",
        "You must be signed in to use this function.",
      );
    }

    // Verify caller is in the user-admin group
    const groupDoc = await admin.firestore().doc("groups/user-admin").get();
    const isMember =
      groupDoc.exists && groupDoc.data()?.members?.[callerUid] === true;
    if (!isMember) {
      throw new HttpsError(
        "permission-denied",
        "Your account does not have user-admin group membership.",
      );
    }

    const { targetUid } = request.data as { targetUid?: string };
    if (!targetUid || typeof targetUid !== "string") {
      throw new HttpsError("invalid-argument", "targetUid is required.");
    }

    let userRecord: admin.auth.UserRecord;
    try {
      userRecord = await admin.auth().getUser(targetUid);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === "auth/user-not-found") {
        throw new HttpsError("not-found", "Target user not found.");
      }
      logger.error("adminResendVerificationEmail: error fetching user", {
        targetUid,
        err,
      });
      throw new HttpsError("internal", "Failed to look up target user.");
    }

    if (!userRecord.email) {
      throw new HttpsError(
        "failed-precondition",
        "Target user has no email address.",
      );
    }

    if (userRecord.emailVerified) {
      throw new HttpsError(
        "failed-precondition",
        "Target user's email address is already verified.",
      );
    }

    const serviceAccountJson = gmailServiceAccountJson.value();
    const senderEmail = gmailSenderEmail.value();

    if (!serviceAccountJson || !senderEmail) {
      logger.error(
        "adminResendVerificationEmail: GMAIL_SERVICE_ACCOUNT_JSON and GMAIL_SENDER_EMAIL secrets must be set.",
      );
      throw new HttpsError("internal", "Email service not configured.");
    }

    const ok = await sendVerificationLinkViaGmail(
      userRecord.email,
      userRecord.displayName,
      serviceAccountJson,
      senderEmail,
      targetUid,
    );

    if (!ok) {
      throw new HttpsError("internal", "Failed to send verification email.");
    }

    logger.info("adminResendVerificationEmail: sent by admin", {
      callerUid,
      targetUid,
      targetEmail: userRecord.email,
    });

    return { success: true };
  },
);

// ── castVote — HTTPS Callable ─────────────────────────────────────────────────

/**
 * Input schema for the castVote callable.
 */
interface CastVoteInput {
  conferenceId: string;
  voteType: "session" | "exhibitor";
  itemId: string;
  action: "add" | "remove";
}

/**
 * Return value of the castVote callable.
 */
interface CastVoteOutput {
  votes: string[];
}

/**
 * HTTPS Callable — castVote
 *
 * Server-side vote enforcement for session and exhibitor votes.
 * Replaces the previous pattern of direct client writes to
 * `voteCounts/{conferenceId}` and provides the following guarantees:
 *
 *  1. The caller must be authenticated (throws `unauthenticated`).
 *  2. A user document must exist for the caller (throws `not-found`).
 *  3. The caller's profile must be complete — a callsign is required
 *     (throws `failed-precondition` when the callsign is absent or blank).
 *  4. The per-conference per-category vote limit (MAX_VOTES = 1) is enforced
 *     (throws `already-exists` when the same item is voted twice, or
 *     `resource-exhausted` when the limit is already reached).
 *  5. The user's vote array in `users/{uid}` and the aggregate count in
 *     `voteCounts/{conferenceId}` are updated atomically inside a Firestore
 *     transaction.
 *
 * The `voteCounts/{conferenceId}` Firestore document is write-protected by
 * security rules so that only this function (running as the Cloud Functions
 * service account, which bypasses rules) can modify it.
 */
export const castVote = onCall<CastVoteInput, Promise<CastVoteOutput>>(
  async (request) => {
    // 1. Require authentication.
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "You must be signed in to vote.",
      );
    }

    const { conferenceId, voteType, itemId, action } = request.data;

    // 2. Validate input fields.
    if (
      !conferenceId ||
      typeof conferenceId !== "string" ||
      !voteType ||
      !itemId ||
      typeof itemId !== "string" ||
      !action
    ) {
      throw new HttpsError(
        "invalid-argument",
        "conferenceId, voteType, itemId, and action are required.",
      );
    }
    if (voteType !== "session" && voteType !== "exhibitor") {
      throw new HttpsError(
        "invalid-argument",
        "voteType must be 'session' or 'exhibitor'.",
      );
    }
    if (action !== "add" && action !== "remove") {
      throw new HttpsError(
        "invalid-argument",
        "action must be 'add' or 'remove'.",
      );
    }

    const uid = request.auth.uid;
    const db = admin.firestore();
    const userRef = db.doc(`users/${uid}`);
    const voteCountsRef = db.doc(`voteCounts/${conferenceId}`);
    const votesField =
      voteType === "session" ? "sessionVotes" : "exhibitorVotes";
    const countField = voteType === "session" ? "sessions" : "exhibitors";

    // 3. Run a Firestore transaction: read → validate → write.
    const updatedVotes = await db.runTransaction(async (transaction) => {
      const userSnap = await transaction.get(userRef);

      if (!userSnap.exists) {
        throw new HttpsError("not-found", "User profile not found.");
      }

      const userData = userSnap.data() as Record<string, unknown>;

      // 4. Require a completed profile (callsign must be set).
      const profileErr = validateRealProfile(userData);
      if (profileErr === "missing-callsign") {
        throw new HttpsError(
          "failed-precondition",
          "You must set a callsign in your profile before voting.",
        );
      }

      const currentVotes = sanitizeVotes(
        (userData[votesField] as Record<string, unknown> | undefined)?.[
          conferenceId
        ],
      );

      let nextVotes: string[];
      let delta: 1 | -1;

      if (action === "add") {
        const err = validateAddVote(currentVotes, itemId);
        if (err === "already-voted") {
          throw new HttpsError(
            "already-exists",
            "You have already voted for this item.",
          );
        }
        if (err === "vote-limit-reached") {
          throw new HttpsError(
            "resource-exhausted",
            `You can only vote for ${MAX_VOTES} ${voteType}${MAX_VOTES !== 1 ? "s" : ""} per conference. Remove your current vote first.`,
          );
        }
        nextVotes = [...currentVotes, itemId];
        delta = 1;
      } else {
        const err = validateRemoveVote(currentVotes, itemId);
        if (err === "not-voted") {
          throw new HttpsError(
            "not-found",
            "You have not voted for this item.",
          );
        }
        nextVotes = currentVotes.filter((v) => v !== itemId);
        delta = -1;
      }

      // Atomically update the user's vote list.
      transaction.set(
        userRef,
        { [votesField]: { [conferenceId]: nextVotes } },
        { merge: true },
      );

      // Atomically update the aggregate count.
      transaction.set(
        voteCountsRef,
        {
          [countField]: {
            [itemId]: admin.firestore.FieldValue.increment(delta),
          },
        },
        { merge: true },
      );

      return nextVotes;
    });

    logger.info("castVote: vote recorded", {
      uid,
      conferenceId,
      voteType,
      itemId,
      action,
    });

    return { votes: updatedVotes };
  },
);
