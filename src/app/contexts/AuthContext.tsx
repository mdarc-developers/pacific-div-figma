import { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  deleteUser,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import { writeAuditLog } from "@/services/exportDataService";

// Firebase Auth error codes that indicate the popup was blocked or failed to
// open. Common on iOS Safari in standalone PWA mode. When detected, the sign-in
// flow falls back to signInWithRedirect.
const POPUP_BLOCKED_CODES = new Set([
  "auth/popup-blocked",
  "auth/popup-failed-to-open",
]);

// Creates the Firestore users/{uid} document for a new Google sign-in if one
// does not already exist. Non-fatal — the user is already authenticated.
async function ensureUserDoc(user: User): Promise<void> {
  const userSnap = await getDoc(doc(db, "users", user.uid));
  if (!userSnap.exists()) {
    await setDoc(doc(db, "users", user.uid), {
      email: user.email ?? "",
      displayName: user.displayName ?? null,
      createdAt: serverTimestamp(),
    });
  }
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Process any pending redirect result from a prior signInWithRedirect call.
    // This is a no-op when no redirect was in progress (resolves with null).
    // Auth-state changes triggered by the result are handled by the
    // onAuthStateChanged listener above; here we only ensure the Firestore
    // user document exists for first-time Google sign-ins via redirect.
    let cancelled = false;
    getRedirectResult(auth)
      .then((result) => {
        if (!cancelled && result?.user) {
          ensureUserDoc(result.user).catch(console.error);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          // Redirect errors (e.g. auth/invalid-credential) must not crash the
          // app — log them and leave the UI in the unauthenticated state.
          console.error("Redirect sign-in error:", err);
        }
      });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string) => {
    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    setDoc(doc(db, "users", credential.user.uid), {
      email,
      displayName: credential.user.displayName ?? null,
      createdAt: serverTimestamp(),
    }).catch(console.error);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      // Prefer popup-based sign-in. The OAuth flow opens in a separate window
      // on the project's firebaseapp.com auth domain, which is outside the
      // PWA's registered scope, so Chrome will not intercept it as a PWA
      // navigation.
      const credential = await signInWithPopup(auth, provider);
      // Create the Firestore user document for new Google sign-ins. Errors
      // here are non-fatal — the user is already authenticated via Google OAuth.
      ensureUserDoc(credential.user).catch(console.error);
    } catch (err) {
      // Fall back to redirect-based sign-in when the popup was blocked or
      // failed to open. Common on iOS Safari in standalone PWA mode. The auth
      // result will be processed by getRedirectResult() on the next app load.
      const code =
        err && typeof err === "object" && "code" in err
          ? (err as { code: string }).code
          : "";
      if (POPUP_BLOCKED_CODES.has(code)) {
        await signInWithRedirect(auth, provider);
        return;
      }
      throw err;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const deleteAccount = async () => {
    if (!auth.currentUser) throw new Error("No authenticated user");
    const uid = auth.currentUser.uid;
    // Write audit log entry before deleting the document so the entry lands
    // in the subcollection while the user's Firestore document still exists.
    await writeAuditLog(uid, "account_deletion");
    // Remove the Firestore user document first, best-effort
    await deleteDoc(doc(db, "users", uid)).catch(console.error);
    await deleteUser(auth.currentUser);
  };

  const authValue = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
    deleteAccount,
  };

  return (
    <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
  );
};
