import { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  deleteUser,
} from "firebase/auth";
import { doc, setDoc, getDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import { writeAuditLog } from "@/services/exportDataService";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  googleSignInError: string | null;
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
  const [googleSignInError, setGoogleSignInError] = useState<string | null>(null);

  useEffect(() => {
    // Process any pending Google redirect result (fires once on app startup
    // after the user is returned from the Google OAuth page).
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          const userRef = doc(db, "users", result.user.uid);
          getDoc(userRef)
            .then((userSnap) => {
              if (!userSnap.exists()) {
                return setDoc(userRef, {
                  email: result.user.email ?? "",
                  displayName: result.user.displayName ?? null,
                  createdAt: serverTimestamp(),
                });
              }
            })
            .catch(console.error);
        }
      })
      .catch((err: unknown) => {
        setGoogleSignInError(
          err instanceof Error ? err.message : "Failed to sign in with Google",
        );
      });

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
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
    // Use signInWithRedirect instead of signInWithPopup to avoid Chrome
    // intercepting the OAuth popup as a PWA navigation on installed PWA sites.
    await signInWithRedirect(auth, provider);
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
    googleSignInError,
  };

  return (
    <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
  );
};
