import { useState } from "react";
import { ProfileView } from "@/app/components/ProfileView";
import { useAuth } from "@/app/contexts/AuthContext";
import { useTheme, type Theme } from "@/app/contexts/ThemeContext";
import { useConference } from "@/app/contexts/ConferenceContext";
import { useNavigate, Link } from "react-router-dom";
import { usePrizesAdmin } from "@/app/hooks/usePrizesAdmin";
import {
  getAuth,
  sendEmailVerification,
  sendPasswordResetEmail,
} from "firebase/auth";
import { Toaster, toast } from "sonner";
import {
  BadgeCheck,
  Bookmark,
  Bell,
  KeyRound,
  LogOut,
  MonitorCog,
  Moon,
  Plus,
  ShieldCheck,
  Sun,
  Ticket,
  Trash2,
  User,
} from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/app/components/ui/toggle-group";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";

function isTheme(value: string): value is Theme {
  return value === "light" || value === "dark" || value === "system";
}

interface ProfilePageProps {
  bookmarkedSessions?: string[];
  onToggleBookmark?: (sessionId: string) => void;
}

export function ProfilePage({ bookmarkedSessions = [] }: ProfilePageProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { activeConference, allConferencesList, setActiveConference } =
    useConference();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const isPrizesAdmin = usePrizesAdmin();
  const [error, setError] = useState<string>("");
  const [raffleTickets, setRaffleTickets] = useState<string[]>([]);
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
    if (!trimmed || raffleTickets.includes(trimmed)) return;
    setRaffleTickets([...raffleTickets, trimmed]);
    setNewTicket("");
  };

  const handleRemoveTicket = (ticket: string) => {
    setRaffleTickets(raffleTickets.filter((t) => t !== ticket));
  };

  const initials = user.displayName
    ? user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : (user.email?.[0] ?? "?").toUpperCase();

  return (
    <div className="max-w-lg space-y-4">
      <Toaster />

      {/* Profile header card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
          <div className="relative flex size-16 shrink-0 overflow-hidden rounded-full bg-muted items-center justify-center">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Profile picture" className="aspect-square size-full object-cover" />
              ) : (
                <span className="text-xl font-semibold text-muted-foreground">{initials}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              {user.displayName && (
                <p className="text-lg font-semibold leading-tight truncate">
                  {user.displayName}
                </p>
              )}
              <p className="text-sm text-muted-foreground truncate">
                {user.email}
              </p>
              <div className="mt-1">
                {user.emailVerified ? (
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <BadgeCheck className="h-3 w-3 text-green-600" />
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs text-amber-600 border-amber-400">
                    Not verified
                  </Badge>
                )}
              </div>
            </div>
            {isPrizesAdmin && (
              <ShieldCheck className="h-5 w-5 text-green-600 flex-shrink-0" title="Admin" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Account info card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" />
            Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-start text-sm">
            <span className="text-muted-foreground">Last sign in</span>
            <span className="text-right text-xs">{user.metadata.lastSignInTime}</span>
          </div>
          <div className="h-px bg-border" />
          <div className="flex justify-between items-start text-sm">
            <span className="text-muted-foreground">Account created</span>
            <span className="text-right text-xs">{user.metadata.creationTime}</span>
          </div>
          <div className="h-px bg-border" />
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Email verified</span>
            {user.emailVerified ? (
              <span className="text-green-600 dark:text-green-400 text-xs font-medium">Yes</span>
            ) : (
              <button
                type="button"
                onClick={handleEmailVerification}
                className="text-blue-600 dark:text-blue-400 hover:underline text-xs"
              >
                Send verification
              </button>
            )}
          </div>
          <div className="h-px bg-border" />
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <KeyRound className="h-3.5 w-3.5" />
              Password
            </span>
            <button
              type="button"
              onClick={handlePasswordReset}
              className="text-blue-600 dark:text-blue-400 hover:underline text-xs"
            >
              Send reset email
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Appearance card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Sun className="h-4 w-4" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Theme</span>
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

      {/* Bookmarks card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Bookmark className="h-4 w-4" />
            Bookmarks
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {bookmarkedSessions.length > 0 ? (
            <ul className="space-y-1">
              {bookmarkedSessions.map((id) => (
                <li key={id} className="truncate">{id}</li>
              ))}
            </ul>
          ) : (
            <p>No bookmarked sessions yet.</p>
          )}
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

      {/* Notifications card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Email alerts</span>
            <span className="text-muted-foreground text-xs italic">Coming soon</span>
          </div>
          <div className="h-px bg-border" />
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">SMS number</span>
            <span className="text-muted-foreground text-xs italic">Coming soon</span>
          </div>
          <div className="h-px bg-border" />
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">SMS alerts</span>
            <span className="text-muted-foreground text-xs italic">Coming soon</span>
          </div>
          <div className="h-px bg-border" />
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Messages</span>
            <span className="text-muted-foreground text-xs italic">Coming soon</span>
          </div>
          <div className="h-px bg-border" />
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Prizes won</span>
            <span className="text-muted-foreground text-xs italic">Coming soon</span>
          </div>
        </CardContent>
      </Card>

      {/* Admin card */}
      {isPrizesAdmin && (
        <Card className="border-green-200 dark:border-green-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-green-600" />
              Admin
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <Link
              to="/admin/prizes"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Prizes Management →
            </Link>
          </CardContent>
        </Card>
      )}

      <Button
        variant="destructive"
        onClick={handleLogout}
        className="w-full"
      >
        <LogOut className="h-4 w-4" />
        Log Out
      </Button>

      {error && (
        <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>
      )}
    </div>
  );
}
