import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { defineSecret } from "firebase-functions/params";
import { logger } from "firebase-functions";
import * as admin from "firebase-admin";
import twilio from "twilio";
import { google } from "googleapis";
import { JWT } from "google-auth-library";
import { buildRawMessage } from "./welcomeEmail";

// ---------------------------------------------------------------------------
// Secrets
// ---------------------------------------------------------------------------

const twilioAccountSid = defineSecret("TWILIO_ACCOUNT_SID");
const twilioAuthToken = defineSecret("TWILIO_AUTH_TOKEN");
const twilioPhoneNumber = defineSecret("TWILIO_PHONE_NUMBER");
const gmailServiceAccountJson = defineSecret("GMAIL_SERVICE_ACCOUNT_JSON");
const gmailSenderEmail = defineSecret("GMAIL_SENDER_EMAIL");

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PrizeWinnerData {
  winningTicket: string;
  conferenceId?: string;
  prizeId?: string[];
  winnerName?: string;
  winnerCallsign?: string;
  notifiedAt?: string;
}

interface UserData {
  smsNotifications?: boolean;
  phoneNumber?: string;
  email?: string;
  emailNotifications?: boolean;
  cloudNotifications?: boolean;
  fcmTokens?: string[];
  raffleTickets?: Record<string, string[]>;
  displayName?: string;
  callsign?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Sends an SMS notification to the winner via Twilio.
 */
async function sendSmsNotification(
  toPhone: string,
  winningTicket: string,
  prizeName: string,
  accountSid: string,
  authToken: string,
  fromPhone: string,
): Promise<void> {
  const client = twilio(accountSid, authToken);
  const body =
    `🎉 Congratulations! Your raffle ticket #${winningTicket} is a winner! ` +
    `Prize: ${prizeName}. Please visit the prize table to claim your award. ` +
    `Good luck, 73!`;
  await client.messages.create({
    body,
    from: fromPhone,
    to: toPhone,
  });
}

/**
 * Sends an email notification to the winner via Gmail API.
 */
async function sendEmailNotification(
  toEmail: string,
  winningTicket: string,
  prizeName: string,
  senderEmail: string,
  serviceAccountJson: string,
): Promise<void> {
  let serviceAccountCredentials: Record<string, unknown>;
  try {
    serviceAccountCredentials = JSON.parse(serviceAccountJson) as Record<
      string,
      unknown
    >;
  } catch {
    logger.error(
      "notifyPrizeWinner: failed to parse GMAIL_SERVICE_ACCOUNT_JSON",
    );
    return;
  }

  const authClient = new JWT({
    email: serviceAccountCredentials.client_email as string,
    key: serviceAccountCredentials.private_key as string,
    scopes: ["https://www.googleapis.com/auth/gmail.send"],
    subject: senderEmail,
  });

  const gmail = google.gmail({ version: "v1", auth: authClient });
  const subject = `🎉 You won a prize! Ticket #${winningTicket}`;
  const htmlBody = buildPrizeWinnerEmailHtml(toEmail, winningTicket, prizeName);
  const raw = buildRawMessage(senderEmail, toEmail, subject, htmlBody);

  await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw },
  });
}

/**
 * Builds the HTML body for a prize winner notification email.
 * Exported for testing.
 */
export function buildPrizeWinnerEmailHtml(
  email: string,
  winningTicket: string,
  prizeName: string,
): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You Won a Prize!</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="background-color:#1a3a5c;padding:32px 40px;text-align:center;">
              <h1 style="color:#ffffff;margin:0;font-size:24px;letter-spacing:1px;">
                🎉 You Won a Prize!
              </h1>
              <p style="color:#a8c4e0;margin:8px 0 0;font-size:14px;">
                AttendeeApp — Amateur Radio Conference
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <h2 style="color:#1a3a5c;margin:0 0 16px;">Congratulations!</h2>
              <p style="color:#444444;font-size:15px;line-height:1.6;margin:0 0 16px;">
                Your raffle ticket <strong>#${winningTicket}</strong> has been drawn as a winner!
              </p>
              <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;background-color:#f0f4f8;border-radius:8px;padding:16px;width:100%;">
                <tr>
                  <td>
                    <p style="color:#1a3a5c;font-size:16px;font-weight:bold;margin:0 0 8px;">Prize: ${prizeName}</p>
                    <p style="color:#444444;font-size:14px;margin:0;">Winning Ticket: #${winningTicket}</p>
                  </td>
                </tr>
              </table>
              <p style="color:#444444;font-size:15px;line-height:1.6;margin:0 0 16px;">
                Please visit the prize table at the conference to claim your award.
                Bring this email or your ticket number as proof.
              </p>
              <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
                <tr>
                  <td style="background-color:#1a3a5c;border-radius:6px;padding:14px 28px;">
                    <a href="https://pacific-div.web.app/prizes" style="color:#ffffff;text-decoration:none;font-size:15px;font-weight:bold;">
                      View Prizes
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color:#666666;font-size:13px;line-height:1.6;margin:0;">
                73 from your conference organizers,<br />
                <a href="mailto:pacific-div@mdarc.org" style="color:#1a3a5c;">pacific-div@mdarc.org</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f0f4f8;padding:20px 40px;text-align:center;">
              <p style="color:#999999;font-size:12px;margin:0;">
                You received this notification because your ticket #${winningTicket} matched a prize drawing.
                Manage your notification preferences at
                <a href="https://pacific-div.web.app/profile" style="color:#1a3a5c;">pacific-div.web.app/profile</a>.
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
 * Sends an FCM push notification to a list of registration tokens via
 * Firebase Admin SDK's Messaging service.
 */
async function sendFcmNotifications(
  tokens: string[],
  winningTicket: string,
  prizeName: string,
): Promise<void> {
  if (tokens.length === 0) return;

  const message = {
    notification: {
      title: "🎉 Prize Winner!",
      body:
        `Your raffle ticket #${winningTicket} won: ${prizeName}. ` +
        "Visit the app to claim your prize!",
    },
    tokens,
  };

  const response = await admin.messaging().sendEachForMulticast(message);
  response.responses.forEach(
    (resp: admin.messaging.SendResponse, idx: number) => {
      if (resp.success) {
        logger.info("notifyPrizeWinner: FCM sent", { token: tokens[idx] });
      } else {
        logger.warn("notifyPrizeWinner: FCM failed", {
          token: tokens[idx],
          error: resp.error?.message,
        });
      }
    },
  );
}

/**
 * Triggers whenever a new prize winner document is created in the
 * `prizeWinners/{winnerId}` Firestore collection.
 *
 * For each new winner:
 * 1. Reads the winning ticket number and conferenceId from the winner document.
 * 2. Queries all user documents to find attendees whose
 *    `raffleTickets.{conferenceId}` array contains the winning ticket.
 * 3. For each matching user:
 *    - Sends an SMS if `smsNotifications` is true and `phoneNumber` is set.
 *    - Sends an email if `emailNotifications` is not false and email is available and Gmail secrets are configured.
 * 4. Updates the winner document with a `notifiedAt` timestamp.
 *
 * Required Firebase Secrets:
 *   TWILIO_ACCOUNT_SID    — Twilio account SID for SMS delivery
 *   TWILIO_AUTH_TOKEN     — Twilio auth token
 *   TWILIO_PHONE_NUMBER   — Twilio "From" phone number (E.164 format)
 *   GMAIL_SERVICE_ACCOUNT_JSON — JSON key for Gmail API (optional for email)
 *   GMAIL_SENDER_EMAIL         — From address for prize winner emails (optional)
 */
export const notifyPrizeWinner = onDocumentCreated(
  {
    document: "prizeWinners/{winnerId}",
    secrets: [
      twilioAccountSid,
      twilioAuthToken,
      twilioPhoneNumber,
      gmailServiceAccountJson,
      gmailSenderEmail,
    ],
  },
  async (event) => {
    const winnerId = event.params.winnerId;
    const data = event.data?.data() as PrizeWinnerData | undefined;

    if (!data) {
      logger.warn("notifyPrizeWinner: no data found for winner", { winnerId });
      return;
    }

    const { winningTicket, conferenceId, prizeId } = data;

    if (!winningTicket) {
      logger.warn("notifyPrizeWinner: winner has no ticket number", {
        winnerId,
      });
      return;
    }

    logger.info("notifyPrizeWinner: processing winner", {
      winnerId,
      winningTicket,
      conferenceId,
    });

    // Resolve prize name for the notification message
    let prizeName = "a prize";
    if (prizeId?.[0]) {
      try {
        const prizeSnap = await admin
          .firestore()
          .collection("prizes")
          .doc(prizeId[0])
          .get();
        const prizeData = prizeSnap.data();
        if (prizeData?.name) {
          prizeName = prizeData.name as string;
        }
      } catch (err) {
        logger.warn("notifyPrizeWinner: could not fetch prize name", {
          prizeId: prizeId?.[0],
          err,
        });
      }
    }

    // Query all users to find those whose raffle tickets match
    const usersRef = admin.firestore().collection("users");
    const usersSnap = await usersRef.get();

    const accountSid = twilioAccountSid.value();
    const authToken = twilioAuthToken.value();
    const fromPhone = twilioPhoneNumber.value();
    const serviceAccountJson = gmailServiceAccountJson.value();
    const senderEmail = gmailSenderEmail.value();

    const notificationPromises: Promise<void>[] = [];
    let matchCount = 0;

    for (const userDoc of usersSnap.docs) {
      const userData = userDoc.data() as UserData;
      const uid = userDoc.id;

      // Check if this user holds the winning ticket
      let hasTicket = false;
      if (conferenceId) {
        const conferenceTickets = userData.raffleTickets?.[conferenceId];
        hasTicket =
          Array.isArray(conferenceTickets) &&
          conferenceTickets.includes(winningTicket);
      } else {
        // No conferenceId — search all conferences
        const allTickets = userData.raffleTickets ?? {};
        hasTicket = Object.values(allTickets).some(
          (tickets) =>
            Array.isArray(tickets) && tickets.includes(winningTicket),
        );
      }

      if (!hasTicket) continue;

      matchCount++;
      logger.info("notifyPrizeWinner: found matching user", {
        uid,
        winningTicket,
      });

      // Send SMS if enabled
      if (userData.smsNotifications && userData.phoneNumber) {
        if (accountSid && authToken && fromPhone) {
          notificationPromises.push(
            sendSmsNotification(
              userData.phoneNumber,
              winningTicket,
              prizeName,
              accountSid,
              authToken,
              fromPhone,
            )
              .then(() => {
                logger.info("notifyPrizeWinner: SMS sent", {
                  uid,
                  winningTicket,
                });
              })
              .catch((err: unknown) => {
                logger.error("notifyPrizeWinner: SMS failed", {
                  uid,
                  winningTicket,
                  err,
                });
              }),
          );
        } else {
          logger.warn(
            "notifyPrizeWinner: SMS secrets not configured, skipping SMS",
            { uid },
          );
        }
      }

      // Send email if enabled and available
      if (userData.emailNotifications !== false && userData.email) {
        if (serviceAccountJson && senderEmail) {
          notificationPromises.push(
            sendEmailNotification(
              userData.email,
              winningTicket,
              prizeName,
              senderEmail,
              serviceAccountJson,
            )
              .then(() => {
                logger.info("notifyPrizeWinner: email sent", {
                  uid,
                  winningTicket,
                });
              })
              .catch((err: unknown) => {
                logger.error("notifyPrizeWinner: email failed", {
                  uid,
                  winningTicket,
                  err,
                });
              }),
          );
        } else {
          logger.warn(
            "notifyPrizeWinner: email secrets not configured, skipping email",
            { uid },
          );
        }
      }

      // Send FCM push notification if the user has cloud alerts enabled
      if (
        userData.cloudNotifications === true &&
        Array.isArray(userData.fcmTokens) &&
        userData.fcmTokens.length > 0
      ) {
        notificationPromises.push(
          sendFcmNotifications(userData.fcmTokens, winningTicket, prizeName)
            .then(() => {
              logger.info("notifyPrizeWinner: FCM notifications dispatched", {
                uid,
                winningTicket,
                tokenCount: userData.fcmTokens!.length,
              });
            })
            .catch((err: unknown) => {
              logger.error("notifyPrizeWinner: FCM notifications failed", {
                uid,
                winningTicket,
                err,
              });
            }),
        );
      }
    }

    await Promise.all(notificationPromises);

    // Update the winner document with notifiedAt timestamp
    if (matchCount > 0) {
      try {
        await event.data?.ref.set(
          { notifiedAt: new Date().toISOString() },
          { merge: true },
        );
        logger.info(
          "notifyPrizeWinner: notifications sent and notifiedAt set",
          {
            winnerId,
            matchCount,
          },
        );
      } catch (err) {
        logger.error("notifyPrizeWinner: failed to set notifiedAt", {
          winnerId,
          err,
        });
      }
    } else {
      logger.info("notifyPrizeWinner: no matching users found for ticket", {
        winnerId,
        winningTicket,
        conferenceId,
      });
    }
  },
);
