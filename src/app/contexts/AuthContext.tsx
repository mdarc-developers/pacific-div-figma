import { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
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
    // Use signInWithPopup so the OAuth flow opens in a separate window on the
    // project's firebaseapp.com auth domain. That domain is outside the PWA's
    // registered scope, so Chrome will not intercept the popup as a PWA
    // navigation. signInWithRedirect is avoided because it depends on
    // cross-site cookies that modern browsers increasingly block.
    const credential = await signInWithPopup(auth, provider);
    // Create a Firestore user document for new Google sign-ins. Errors here
    // are non-fatal — the user is already authenticated via Google OAuth.
    getDoc(doc(db, "users", credential.user.uid))
      .then((userSnap) => {
        if (!userSnap.exists()) {
          return setDoc(doc(db, "users", credential.user.uid), {
            email: credential.user.email ?? "",
            displayName: credential.user.displayName ?? null,
            createdAt: serverTimestamp(),
          });
        }
      })
      .catch(console.error);
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
