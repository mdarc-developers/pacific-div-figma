import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { type Theme } from '@/app/contexts/ThemeContext';

export async function getUserTheme(uid: string): Promise<Theme | null> {
  const snap = await getDoc(doc(db, 'userSettings', uid));
  if (!snap.exists()) return null;
  const sdTheme = snap.data()?.theme;
  if (sdTheme === 'light' || sdTheme === 'dark' || sdTheme === 'system') return sdTheme;
  return null;
}

export async function setUserTheme(uid: string, theme: Theme): Promise<void> {
  await setDoc(doc(db, 'userSettings', uid), { theme }, { merge: true });
}
