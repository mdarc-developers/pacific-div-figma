import {
  getMessaging,
  getToken,
  deleteToken,
  isSupported,
} from "firebase/messaging";
import app from "@/lib/firebase";

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY as string | undefined;

/**
 * Requests browser notification permission and returns an FCM registration
 * token for this device.  Returns `null` if:
 *  - `VITE_FIREBASE_VAPID_KEY` is not set
 *  - Firebase Messaging is not supported in this browser
 *  - The user denies the notification permission prompt
 */
export async function requestFcmToken(): Promise<string | null> {
  if (!VAPID_KEY) {
    console.warn(
      "messaging: VITE_FIREBASE_VAPID_KEY is not configured. " +
        "Set it in .env to enable Prize cloud alerts.",
    );
    return null;
  }

  if (!(await isSupported())) {
    console.warn(
      "messaging: Firebase Messaging is not supported in this browser.",
    );
    return null;
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  const messaging = getMessaging(app);
  return getToken(messaging, { vapidKey: VAPID_KEY });
}

/**
 * Retrieves the current FCM token for this device without prompting the user.
 * Returns `null` if no token exists or messaging is unsupported.
 */
export async function getCurrentFcmToken(): Promise<string | null> {
  if (!VAPID_KEY || !(await isSupported())) return null;
  try {
    const messaging = getMessaging(app);
    return await getToken(messaging, { vapidKey: VAPID_KEY });
  } catch (err) {
    console.warn("messaging: failed to get current FCM token", err);
    return null;
  }
}

/**
 * Deletes the FCM registration token for this device.
 * Returns the token that was deleted (so callers can remove it from Firestore),
 * or `null` if there was no token to delete.
 */
export async function deleteFcmToken(): Promise<string | null> {
  if (!VAPID_KEY || !(await isSupported())) return null;
  try {
    const messaging = getMessaging(app);
    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    await deleteToken(messaging);
    return token;
  } catch (err) {
    console.warn("messaging: failed to delete FCM token", err);
    return null;
  }
}
