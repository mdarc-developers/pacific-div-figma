import { ProfileView } from "@/app/components/ProfileView";
import { ProfileHeaderCard } from "@/app/components/ProfileHeaderCard";
import { AccountCard } from "@/app/components/AccountCard";
import { SettingsCard } from "@/app/components/SettingsCard";
import { NotificationsCard } from "@/app/components/NotificationsCard";
import { PrizesCard } from "@/app/components/PrizesCard";
import { BookmarkListCard } from "@/app/components/BookmarkListCard";
import { AdminCard } from "@/app/components/AdminCard";
import { DeleteAccountCard } from "@/app/components/DeleteAccountCard";
import { useAuth } from "@/app/contexts/AuthContext";
import { useTheme } from "@/app/contexts/ThemeContext";
import { useConference } from "@/app/contexts/ConferenceContext";
import { useNavigate } from "react-router-dom";
import { usePrizesAdmin } from "@/app/hooks/usePrizesAdmin";
import { useUserGroups } from "@/app/hooks/useUserGroups";
import { useBookmarkContext } from "@/app/contexts/BookmarkContext";
import { useExhibitorBookmarkContext } from "@/app/contexts/ExhibitorBookmarkContext";
import { useBookmarkCountsContext } from "@/app/contexts/BookmarkCountsContext";
import { useNotesContext } from "@/app/contexts/NotesContext";
import { useRaffleTickets } from "@/app/hooks/useRaffleTickets";
import { useNotificationSettings } from "@/app/hooks/useNotificationSettings";
import { SESSION_DATA, EXHIBITOR_DATA } from "@/lib/sessionData";
import { PRIZE_DATA, PRIZE_WINNER_DATA } from "@/lib/prizesData";
import { useState } from "react";
import {
  sendEmailVerification,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Toaster, toast } from "sonner";

export function ProfilePage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { activeConference, allConferencesList, setActiveConference } =
    useConference();
  const { user, logout, deleteAccount } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const isPrizesAdmin = usePrizesAdmin();
  const userGroups = useUserGroups();
  const {
    bookmarkedItems: bookmarkedSessions,
    toggleBookmark,
    prevBookmarkedItems: prevBookmarkedSessions,
  } = useBookmarkContext();
  const {
    bookmarkedExhibitors,
    prevBookmarkedExhibitors,
    toggleExhibitorBookmark,
  } = useExhibitorBookmarkContext();
  const { sessionCounts, exhibitorCounts } = useBookmarkCountsContext();
  const { notes } = useNotesContext();
  const [error, setError] = useState<string>("");
  const [
    raffleTickets,
    addRaffleTicket,
    removeRaffleTicket,
    addRaffleTicketRange,
  ] = useRaffleTickets(activeConference.id);
  const { smsEnabled, setSmsEnabled, phoneNumber, setPhoneNumber } =
    useNotificationSettings();

  if (!user) {
    //return <div>Loading...</div>;
    return <ProfileView />; //  not logged in
  }

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/profile");
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  const handleNoteSessionClick = (sessionId: string) => {
    navigate(`/schedule?highlight=${sessionId}`);
  };

  const handleEmailVerification = async () => {
    try {
      setError("");
      if (user != null) {
        await sendEmailVerification(user);
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
      if (user?.email != null) {
        await sendPasswordResetEmail(auth, user.email);
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

  const handleDeleteAccount = async () => {
    try {
      setError("");
      await deleteAccount();
      navigate("/");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to delete account";
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
    <div className="max-w-lg mx-auto space-y-4">
      <Toaster />

      <ProfileHeaderCard
        user={user}
        initials={initials}
        onLogout={handleLogout}
      />

      <AccountCard
        user={user}
        groups={userGroups}
        onEmailVerification={handleEmailVerification}
        onPasswordReset={handlePasswordReset}
      />

      <SettingsCard theme={theme} onThemeChange={setTheme} />

      <NotificationsCard
        smsEnabled={smsEnabled}
        phoneNumber={phoneNumber}
        onSmsEnabledChange={setSmsEnabled}
        onPhoneNumberChange={setPhoneNumber}
      />

      <PrizesCard
        raffleTickets={raffleTickets}
        onAddTicket={addRaffleTicket}
        onRemoveTicket={removeRaffleTicket}
        onAddTicketRange={addRaffleTicketRange}
        prizes={PRIZE_DATA[activeConference.id] ?? []}
        prizeWinners={PRIZE_WINNER_DATA[activeConference.id] ?? []}
      />

      {/* Activity card */}
      <BookmarkListCard
        sessions={SESSION_DATA[activeConference.id] ?? []}
        bookmarkedIds={bookmarkedSessions}
        prevBookmarkedIds={prevBookmarkedSessions}
        onToggleBookmark={toggleBookmark}
        exhibitors={
          // EXHIBITOR_DATA[id] is a [url, Exhibitor[]] tuple; index [1] is the array
          EXHIBITOR_DATA[activeConference.id]?.[1] ?? []
        }
        bookmarkedExhibitorIds={bookmarkedExhibitors}
        prevBookmarkedExhibitorIds={prevBookmarkedExhibitors}
        onToggleExhibitorBookmark={toggleExhibitorBookmark}
        notes={notes}
        onNoteSessionClick={handleNoteSessionClick}
        sessionBookmarkCounts={sessionCounts}
        exhibitorBookmarkCounts={exhibitorCounts}
      />

      {/* Admin card */}
      {isPrizesAdmin && <AdminCard />}

      <DeleteAccountCard onDeleteAccount={handleDeleteAccount} />

      {error && (
        <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>
      )}
    </div>
  );
}
