import { ProfileView } from "@/app/components/ProfileView";
import { ProfileHeaderCard } from "@/app/components/ProfileHeaderCard";
import { AccountCard } from "@/app/components/AccountCard";
import { SettingsCard } from "@/app/components/SettingsCard";
import { NotificationsCard } from "@/app/components/NotificationsCard";
import { RaffleTicketsCard } from "@/app/components/RaffleTicketsCard";
import { BookmarkListCard } from "@/app/components/BookmarkListCard";
import { AdminCard } from "@/app/components/AdminCard";
import { useAuth } from "@/app/contexts/AuthContext";
import { useTheme } from "@/app/contexts/ThemeContext";
import { useConference } from "@/app/contexts/ConferenceContext";
import { useNavigate } from "react-router-dom";
import { usePrizesAdmin } from "@/app/hooks/usePrizesAdmin";
import { useBookmarks } from "@/app/hooks/useBookmarks";
import { useRaffleTickets } from "@/app/hooks/useRaffleTickets";
import { SESSION_DATA } from "@/lib/sessionData";
import { useState } from "react";
import {
  getAuth,
  sendEmailVerification,
  sendPasswordResetEmail,
} from "firebase/auth";
import { Toaster, toast } from "sonner";

export function ProfilePage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { activeConference, allConferencesList, setActiveConference } =
    useConference();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const isPrizesAdmin = usePrizesAdmin();
  const [bookmarkedSessions, toggleBookmark, prevBookmarkedSessions] = useBookmarks(activeConference.id);
  const [error, setError] = useState<string>("");
  const [raffleTickets, addRaffleTicket, removeRaffleTicket, addRaffleTicketRange] = useRaffleTickets(activeConference.id);

  if (!user) {
    //return <div>Loading...</div>;
    return <ProfileView />; //  not logged in
  }

  const auth = getAuth();
  const authCurrentUser = auth.currentUser;

  if (!authCurrentUser) {
    return <ProfileView />;
  }

  const authUserEmail = authCurrentUser.email;

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/profile");
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  const handleEmailVerification = async () => {
    try {
      setError("");
      if (authCurrentUser != null) {
        await sendEmailVerification(authCurrentUser);
        toast("Email Verification Sent");
      } else {
        toast("No Email To Verify");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to sendEmailVerification";
      setError(message);
    }
  };

  const handlePasswordReset = async () => {
    try {
      setError("");
      if (authUserEmail != null) {
        await sendPasswordResetEmail(auth, authUserEmail);
        toast("Password Reset Email Sent");
      } else {
        toast("No Email To Send Password Reset");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to sendPasswordResetEmail";
      setError(message);
    }
  };

  const initials = user.displayName
    ? user.displayName
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : (user.email?.[0] ?? "?").toUpperCase();

  return (
    <div className="max-w-lg space-y-4">
      <Toaster />

      <ProfileHeaderCard user={user} initials={initials} onLogout={handleLogout} />

      <AccountCard
        user={user}
        onEmailVerification={handleEmailVerification}
        onPasswordReset={handlePasswordReset}
      />

      <SettingsCard theme={theme} onThemeChange={setTheme} />

      <NotificationsCard />

      <RaffleTicketsCard
        raffleTickets={raffleTickets}
        onAddTicket={addRaffleTicket}
        onRemoveTicket={removeRaffleTicket}
        onAddTicketRange={addRaffleTicketRange}
      />

      {/* Activity card */}
      <BookmarkListCard
        sessions={SESSION_DATA[activeConference.id] ?? []}
        bookmarkedIds={bookmarkedSessions}
        prevBookmarkedIds={prevBookmarkedSessions}
        onToggleBookmark={toggleBookmark}
      />

      {/* Admin card */}
      {isPrizesAdmin && <AdminCard />}

      {error && (
        <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>
      )}
    </div>
  );
}
