import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { type Theme } from "@/app/contexts/ThemeContext";

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

export interface NotificationSettings {
  smsEnabled: boolean;
  phoneNumber: string;
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
  };
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
    },
    { merge: true },
  );
}
