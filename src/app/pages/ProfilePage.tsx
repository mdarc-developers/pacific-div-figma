import { useState } from "react";
import { ProfileView } from "@/app/components/ProfileView";
import { BookmarkListCard } from "@/app/components/BookmarkListCard";
import { useAuth } from "@/app/contexts/AuthContext";
import { useTheme, type Theme } from "@/app/contexts/ThemeContext";
import { useConference } from "@/app/contexts/ConferenceContext";
import { useNavigate, Link } from "react-router-dom";
import { usePrizesAdmin } from "@/app/hooks/usePrizesAdmin";
import { useBookmarks } from "@/app/hooks/useBookmarks";
import { useRaffleTickets } from "@/app/hooks/useRaffleTickets";
import { SESSION_DATA } from "@/lib/sessionData";
import {
  getAuth,
  sendEmailVerification,
  sendPasswordResetEmail,
} from "firebase/auth";
import { Toaster, toast } from "sonner";
import {
  AlertCircle,
  Bell,
  CheckCircle,
  KeyRound,
  LogOut,
  MonitorCog,
  Moon,
  Plus,
  ShieldCheck,
  Sun,
  Ticket,
  Trash2,
} from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/app/components/ui/toggle-group";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/components/ui/avatar";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Separator } from "@/app/components/ui/separator";

function isTheme(value: string): value is Theme {
  return value === "light" || value === "dark" || value === "system";
}

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
  const [raffleTickets, addRaffleTicket, removeRaffleTicket] = useRaffleTickets(activeConference.id);
  const [newTicket, setNewTicket] = useState<string>("");

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

  const handleAddTicket = () => {
    const trimmed = newTicket.trim();
    if (!trimmed) return;
    addRaffleTicket(trimmed);
    setNewTicket("");
  };

  const handleRemoveTicket = (ticket: string) => {
    removeRaffleTicket(ticket);
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

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="max-w-lg space-y-4">
      <Toaster />

      {/* Profile header card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 text-2xl shrink-0">
              {user.photoURL && (
                <AvatarImage src={user.photoURL} alt="Profile picture" />
              )}
              <AvatarFallback className="text-xl font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              {user.displayName && (
                <p className="text-lg font-semibold truncate">
                  {user.displayName}
                </p>
              )}
              <p className="text-sm text-muted-foreground truncate">
                {user.email}
              </p>
              <div className="mt-1.5">
                {user.emailVerified ? (
                  <Badge
                    variant="outline"
                    className="gap-1 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700"
                  >
                    <CheckCircle className="h-3 w-3" />
                    Verified
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="gap-1 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700"
                  >
                    <AlertCircle className="h-3 w-3" />
                    Not verified
                  </Badge>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="logout-button border-2 border-solid shadow-md"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
            {!user.emailVerified && (
              <Button
                variant="link"
                size="sm"
                onClick={handleEmailVerification}
                className="shrink-0 text-amber-600 dark:text-amber-400 px-0"
              >
                Send verification
              </Button>
            )}
          </div>
          <Separator />
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">Password</p>
            <Button
              variant="link"
              size="sm"
              onClick={handlePasswordReset}
              className="shrink-0 px-0 gap-1"
            >
              <KeyRound className="h-3.5 w-3.5" />
              Reset password
            </Button>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Last sign in</p>
              <p className="text-xs mt-0.5">
                {formatDate(user.metadata.lastSignInTime)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Member since</p>
              <p className="text-xs mt-0.5">
                {formatDate(user.metadata.creationTime)}
              </p>
            </div>
          </div>
          <Separator />
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">User ID</p>
            <p className="text-xs font-mono text-muted-foreground break-all">
              {user.uid}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Settings card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-medium">Theme</p>
              <p className="text-xs text-muted-foreground">
                Appearance preference
              </p>
            </div>
            <ToggleGroup
              type="single"
              value={theme}
              onValueChange={(value) => {
                if (!value || !isTheme(value)) return;
                setTheme(value);
              }}
              variant="outline"
              size="sm"
              aria-label="Theme"
            >
              <ToggleGroupItem
                value="light"
                aria-label="Light theme"
                title="Light theme"
              >
                <Sun className="h-4 w-4" /> Light
              </ToggleGroupItem>
              <ToggleGroupItem
                value="system"
                aria-label="System theme"
                title="System theme"
              >
                <MonitorCog className="h-4 w-4" /> System
              </ToggleGroupItem>
              <ToggleGroupItem
                value="dark"
                aria-label="Dark theme"
                title="Dark theme"
              >
                <Moon className="h-4 w-4" /> Dark
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </CardContent>
      </Card>

      {/* Notifications card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">Email alerts</p>
            <Badge variant="secondary" className="text-xs">
              Coming soon
            </Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">SMS alerts</p>
            <Badge variant="secondary" className="text-xs">
              Coming soon
            </Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">Messages</p>
            <Badge variant="secondary" className="text-xs">
              Coming soon
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Raffle Tickets card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Ticket className="h-4 w-4" />
            Raffle Tickets
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {raffleTickets.length > 0 && (
            <ul className="space-y-2">
              {raffleTickets.map((ticket) => (
                <li key={ticket} className="flex items-center justify-between text-sm">
                  <span className="font-mono">{ticket}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTicket(ticket)}
                    aria-label={`Remove ticket ${ticket}`}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex gap-2">
            <Input
              placeholder="Enter ticket number"
              value={newTicket}
              onChange={(e) => setNewTicket(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleAddTicket(); }}
              className="h-8 text-sm"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddTicket}
              disabled={!newTicket.trim()}
              aria-label="Add ticket"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Activity card */}
      <BookmarkListCard
        sessions={SESSION_DATA[activeConference.id] ?? []}
        bookmarkedIds={bookmarkedSessions}
        prevBookmarkedIds={prevBookmarkedSessions}
        onToggleBookmark={toggleBookmark}
      />

      {/* Admin card */}
      {isPrizesAdmin && (
        <Card className="border-green-300 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-green-600" />
                <p className="text-sm font-medium">Administrator</p>
              </div>
              <Link
                to="/admin/prizes"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Prizes Management →
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>
      )}
    </div>
  );
}
