/**
 * Feedback email Cloud Function.
 *
 * Handles the App Feedback form submission: sends the user's message to the
 * configured recipient (pacific-div@mdarc.org) via the Gmail API and
 * optionally CCs the submitter.
 */

import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { logger } from "firebase-functions";
import { google } from "googleapis";
import { JWT } from "google-auth-library";
import {
  FEEDBACK_RECIPIENT,
  buildFeedbackEmailHtml,
} from "./feedbackEmailContent";

export { buildFeedbackEmailHtml } from "./feedbackEmailContent";

const gmailServiceAccountJson = defineSecret("GMAIL_SERVICE_ACCOUNT_JSON");
const gmailSenderEmail = defineSecret("GMAIL_SENDER_EMAIL");

interface FeedbackRequest {
  email?: string;
  pageUrl: string;
  message: string;
  ccSender: boolean;
}

/**
 * Encodes a raw RFC 2822 email message as base64url for the Gmail API,
 * with an optional Cc header.
 */
function buildRawMessageWithCc(
  from: string,
  to: string,
  subject: string,
  htmlBody: string,
  cc?: string,
): string {
  const messageParts = [
    `From: ${from}`,
    `To: ${to}`,
    ...(cc ? [`Cc: ${cc}`] : []),
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
 * Firebase HTTPS Callable Function — sendFeedbackEmail
 *
 * Accepts a feedback form submission and sends it to the app team via the
 * Gmail API.  Optionally CCs the submitter when `ccSender` is true and a
 * valid sender email address is provided.
 *
 * Required Firebase Secrets:
 *   GMAIL_SERVICE_ACCOUNT_JSON  — JSON key file for the Gmail delegation SA
 *   GMAIL_SENDER_EMAIL          — The "From" address (attendeeapp@mdarc.org)
 *
 * Request body fields:
 *   email    {string?} — submitter's email (for CC or reply-to identification)
 *   pageUrl  {string}  — the app page where feedback was submitted (required)
 *   message  {string}  — the feedback text (required)
 *   ccSender {boolean} — whether to CC the submitter
 */
export const sendFeedbackEmail = onCall(
  {
    secrets: [gmailServiceAccountJson, gmailSenderEmail],
  },
  async (request) => {
    const data = request.data as FeedbackRequest;
    const { email, pageUrl, message, ccSender } = data;

    if (!pageUrl || typeof pageUrl !== "string") {
      throw new HttpsError("invalid-argument", "pageUrl is required");
    }
    if (typeof message !== "string" || message.trim() === "") {
      throw new HttpsError("invalid-argument", "message is required");
    }

    const serviceAccountJson = gmailServiceAccountJson.value();
    const senderEmail = gmailSenderEmail.value();

    if (!serviceAccountJson || !senderEmail) {
      logger.error(
        "sendFeedbackEmail: GMAIL_SERVICE_ACCOUNT_JSON and GMAIL_SENDER_EMAIL secrets must be set.",
      );
      throw new HttpsError("internal", "Email service not configured");
    }

    let credentials: Record<string, unknown>;
    try {
      credentials = JSON.parse(serviceAccountJson) as Record<string, unknown>;
    } catch (err) {
      logger.error(
        "sendFeedbackEmail: failed to parse GMAIL_SERVICE_ACCOUNT_JSON",
        err,
      );
      throw new HttpsError("internal", "Email service configuration error");
    }

    const authClient = new JWT({
      email: credentials.client_email as string,
      key: credentials.private_key as string,
      scopes: ["https://www.googleapis.com/auth/gmail.send"],
      subject: senderEmail,
    });

    const gmail = google.gmail({ version: "v1", auth: authClient });
    const subject = "App Feedback";
    const htmlBody = buildFeedbackEmailHtml(pageUrl, message, email);
    const ccEmail = ccSender && email?.trim() ? email.trim() : undefined;
    const raw = buildRawMessageWithCc(
      senderEmail,
      FEEDBACK_RECIPIENT,
      subject,
      htmlBody,
      ccEmail,
    );

    try {
      await gmail.users.messages.send({
        userId: "me",
        requestBody: { raw },
      });
      logger.info("sendFeedbackEmail: feedback email sent", {
        pageUrl,
        email: email ?? "(anonymous)",
        ccSender,
      });
    } catch (err) {
      logger.error("sendFeedbackEmail: failed to send feedback email", { err });
      throw new HttpsError("internal", "Failed to send email");
    }

    return { success: true };
  },
);
