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
