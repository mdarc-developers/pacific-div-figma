import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { type Theme } from "@/app/contexts/ThemeContext";
import { type ActivitySections } from "@/app/contexts/ActivitySectionsContext";
import { type AlertHistoryItem } from "@/types/conference";

export async function getUserTheme(uid: string): Promise<Theme | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  const sdTheme = snap.data()?.theme;
  if (sdTheme === "light" || sdTheme === "dark" || sdTheme === "system")
    return sdTheme;
  return null;
}

export async function setUserTheme(uid: string, theme: Theme): Promise<void> {
  await setDoc(doc(db, "users", uid), { theme }, { merge: true });
}

export async function getUserActiveConferenceId(
  uid: string,
): Promise<string | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  const id = snap.data()?.activeConferenceId;
  return typeof id === "string" && id.length > 0 ? id : null;
}

export async function setUserActiveConferenceId(
  uid: string,
  conferenceId: string,
): Promise<void> {
  await setDoc(
    doc(db, "users", uid),
    { activeConferenceId: conferenceId },
    { merge: true },
  );
}

export async function getUserBookmarks(
  uid: string,
  conferenceId: string,
): Promise<{ bookmarks: string[]; prevBookmarks: string[] }> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return { bookmarks: [], prevBookmarks: [] };
  const data = snap.data();
  const bookmarks = Array.isArray(data?.bookmarks?.[conferenceId])
    ? (data.bookmarks[conferenceId] as string[])
    : [];
  const prevBookmarks = Array.isArray(data?.prevBookmarks?.[conferenceId])
    ? (data.prevBookmarks[conferenceId] as string[])
    : [];
  return { bookmarks, prevBookmarks };
}

export async function setUserBookmarks(
  uid: string,
  conferenceId: string,
  bookmarks: string[],
  prevBookmarks: string[],
): Promise<void> {
  await setDoc(
    doc(db, "users", uid),
    {
      bookmarks: { [conferenceId]: bookmarks },
      prevBookmarks: { [conferenceId]: prevBookmarks },
    },
    { merge: true },
  );
}

export async function getUserExhibitorBookmarks(
  uid: string,
  conferenceId: string,
): Promise<{ bookmarks: string[]; prevBookmarks: string[] }> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return { bookmarks: [], prevBookmarks: [] };
  const data = snap.data();
  const bookmarks = Array.isArray(data?.exhibitorBookmarks?.[conferenceId])
    ? (data.exhibitorBookmarks[conferenceId] as string[])
    : [];
  const prevBookmarks = Array.isArray(
    data?.prevExhibitorBookmarks?.[conferenceId],
  )
    ? (data.prevExhibitorBookmarks[conferenceId] as string[])
    : [];
  return { bookmarks, prevBookmarks };
}

export async function setUserExhibitorBookmarks(
  uid: string,
  conferenceId: string,
  bookmarks: string[],
  prevBookmarks: string[],
): Promise<void> {
  await setDoc(
    doc(db, "users", uid),
    {
      exhibitorBookmarks: { [conferenceId]: bookmarks },
      prevExhibitorBookmarks: { [conferenceId]: prevBookmarks },
    },
    { merge: true },
  );
}

export async function getUserNotes(
  uid: string,
  conferenceId: string,
): Promise<Record<string, string>> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return {};
  const data = snap.data();
  const notes = data?.notes?.[conferenceId];
  if (notes && typeof notes === "object" && !Array.isArray(notes)) {
    return notes as Record<string, string>;
  }
  return {};
}

export async function setUserNotes(
  uid: string,
  conferenceId: string,
  notes: Record<string, string>,
): Promise<void> {
  await setDoc(
    doc(db, "users", uid),
    { notes: { [conferenceId]: notes } },
    { merge: true },
  );
}

export async function getUserExhibitorNotes(
  uid: string,
  conferenceId: string,
): Promise<Record<string, string>> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return {};
  const data = snap.data();
  const notes = data?.exhibitorNotes?.[conferenceId];
  if (notes && typeof notes === "object" && !Array.isArray(notes)) {
    return notes as Record<string, string>;
  }
  return {};
}

export async function setUserExhibitorNotes(
  uid: string,
  conferenceId: string,
  notes: Record<string, string>,
): Promise<void> {
  await setDoc(
    doc(db, "users", uid),
    { exhibitorNotes: { [conferenceId]: notes } },
    { merge: true },
  );
}

export async function getUserSessionVotes(
  uid: string,
  conferenceId: string,
): Promise<string[]> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return [];
  const data = snap.data();
  return Array.isArray(data?.sessionVotes?.[conferenceId])
    ? (data.sessionVotes[conferenceId] as string[])
    : [];
}

export async function setUserSessionVotes(
  uid: string,
  conferenceId: string,
  votes: string[],
): Promise<void> {
  await setDoc(
    doc(db, "users", uid),
    { sessionVotes: { [conferenceId]: votes } },
    { merge: true },
  );
}

export async function getUserExhibitorVotes(
  uid: string,
  conferenceId: string,
): Promise<string[]> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return [];
  const data = snap.data();
  return Array.isArray(data?.exhibitorVotes?.[conferenceId])
    ? (data.exhibitorVotes[conferenceId] as string[])
    : [];
}

export async function setUserExhibitorVotes(
  uid: string,
  conferenceId: string,
  votes: string[],
): Promise<void> {
  await setDoc(
    doc(db, "users", uid),
    { exhibitorVotes: { [conferenceId]: votes } },
    { merge: true },
  );
}

export interface NotificationSettings {
  smsEnabled: boolean;
  phoneNumber: string;
  minutesBefore: number;
  emailEnabled: boolean;
  cloudAlertsEnabled: boolean;
}

export async function getUserNotificationSettings(
  uid: string,
): Promise<NotificationSettings | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    smsEnabled:
      typeof data?.smsNotifications === "boolean"
        ? data.smsNotifications
        : false,
    phoneNumber: typeof data?.phoneNumber === "string" ? data.phoneNumber : "",
    minutesBefore:
      typeof data?.minutesBefore === "number" ? data.minutesBefore : 10,
    emailEnabled:
      typeof data?.emailNotifications === "boolean"
        ? data.emailNotifications
        : true,
    cloudAlertsEnabled:
      typeof data?.cloudNotifications === "boolean"
        ? data.cloudNotifications
        : false,
  };
}

export async function getUserHeaderCollapsed(
  uid: string,
): Promise<boolean | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  const val = snap.data()?.headerCollapsed;
  if (typeof val === "boolean") return val;
  return null;
}

export async function setUserHeaderCollapsed(
  uid: string,
  collapsed: boolean,
): Promise<void> {
  await setDoc(doc(db, "users", uid), { headerCollapsed: collapsed }, { merge: true });
}

export async function setUserNotificationSettings(
  uid: string,
  settings: NotificationSettings,
): Promise<void> {
  await setDoc(
    doc(db, "users", uid),
    {
      smsNotifications: settings.smsEnabled,
      phoneNumber: settings.phoneNumber,
      minutesBefore: settings.minutesBefore,
      emailNotifications: settings.emailEnabled,
      cloudNotifications: settings.cloudAlertsEnabled,
    },
    { merge: true },
  );
}

export async function getUserActivitySections(
  uid: string,
): Promise<ActivitySections | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  const s = snap.data()?.activitySections;
  if (!s || typeof s !== "object" || Array.isArray(s)) return null;
  return {
    bookmarkedSessions:
      typeof s.bookmarkedSessions === "boolean" ? s.bookmarkedSessions : true,
    bookmarkedExhibitors:
      typeof s.bookmarkedExhibitors === "boolean"
        ? s.bookmarkedExhibitors
        : true,
    votedSessions:
      typeof s.votedSessions === "boolean" ? s.votedSessions : true,
    votedExhibitors:
      typeof s.votedExhibitors === "boolean" ? s.votedExhibitors : true,
    myNotes: typeof s.myNotes === "boolean" ? s.myNotes : true,
    raffleTickets: typeof s.raffleTickets === "boolean" ? s.raffleTickets : true,
    myExhibitorNotes:
      typeof s.myExhibitorNotes === "boolean" ? s.myExhibitorNotes : true,
  };
}

export async function getUserProfileVisible(
  uid: string,
): Promise<boolean | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  const val = snap.data()?.profileVisible;
  if (typeof val === "boolean") return val;
  return null;
}

export async function setUserProfileVisible(
  uid: string,
  profileVisible: boolean,
): Promise<void> {
  await setDoc(
    doc(db, "users", uid),
    { profileVisible },
    { merge: true },
  );
}

export async function setUserActivitySections(
  uid: string,
  sections: ActivitySections,
): Promise<void> {
  await setDoc(
    doc(db, "users", uid),
    { activitySections: sections },
    { merge: true },
  );
}

export interface UserProfileFields {
  callsign: string;
  displayName: string;
  displayProfile: string;
}

export async function getUserProfileFields(
  uid: string,
): Promise<UserProfileFields | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    callsign: typeof data?.callsign === "string" ? data.callsign : "",
    displayName: typeof data?.displayName === "string" ? data.displayName : "",
    displayProfile:
      typeof data?.displayProfile === "string" ? data.displayProfile : "",
  };
}

export async function setUserProfileFields(
  uid: string,
  fields: Partial<UserProfileFields>,
): Promise<void> {
  await setDoc(doc(db, "users", uid), fields, { merge: true });
}

export async function getUserRaffleTickets(
  uid: string,
  conferenceId: string,
): Promise<string[]> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return [];
  const data = snap.data();
  return Array.isArray(data?.raffleTickets?.[conferenceId])
    ? (data.raffleTickets[conferenceId] as string[])
    : [];
}

export async function setUserRaffleTickets(
  uid: string,
  conferenceId: string,
  tickets: string[],
): Promise<void> {
  await setDoc(
    doc(db, "users", uid),
    { raffleTickets: { [conferenceId]: tickets } },
    { merge: true },
  );
}

/**
 * Adds an FCM registration token to the user's `fcmTokens` array in Firestore.
 * Using arrayUnion ensures the same token is never duplicated.
 */
export async function addUserFcmToken(
  uid: string,
  token: string,
): Promise<void> {
  await setDoc(
    doc(db, "users", uid),
    { fcmTokens: arrayUnion(token) },
    { merge: true },
  );
}

/**
 * Removes an FCM registration token from the user's `fcmTokens` array in
 * Firestore (e.g. when the user disables cloud alerts or logs out).
 */
export async function removeUserFcmToken(
  uid: string,
  token: string,
): Promise<void> {
  await setDoc(
    doc(db, "users", uid),
    { fcmTokens: arrayRemove(token) },
    { merge: true },
  );
}

/**
 * Loads the user's alert history from Firestore.
 * Returns an empty array if no history is stored yet.
 */
export async function getUserAlertHistory(
  uid: string,
): Promise<AlertHistoryItem[]> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return [];
  const data = snap.data();
  return Array.isArray(data?.alertHistory)
    ? (data.alertHistory as AlertHistoryItem[])
    : [];
}

/**
 * Persists the user's alert history to Firestore.
 */
export async function setUserAlertHistory(
  uid: string,
  history: AlertHistoryItem[],
): Promise<void> {
  await setDoc(
    doc(db, "users", uid),
    { alertHistory: history },
    { merge: true },
  );
}
