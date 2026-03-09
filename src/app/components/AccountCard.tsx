import { useState, useEffect } from "react";
import { KeyRound, MailCheck, Save } from "lucide-react";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Separator } from "@/app/components/ui/separator";
import { Textarea } from "@/app/components/ui/textarea";
import type { User } from "firebase/auth";

interface AccountCardProps {
  user: User;
  groups?: string[];
  profileVisible: boolean;
  onProfileVisibleChange: (value: boolean) => void;
  onEmailVerification: () => void;
  onPasswordReset: () => void;
  callsign: string;
  onCallsignChange: (value: string) => void;
  displayName: string;
  onDisplayNameChange: (value: string) => void;
  displayProfile: string;
  onDisplayProfileChange: (value: string) => void;
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function AccountCard({
  user,
  groups,
  profileVisible,
  onProfileVisibleChange,
  onEmailVerification,
  onPasswordReset,
  callsign,
  onCallsignChange,
  displayName,
  onDisplayNameChange,
  displayProfile,
  onDisplayProfileChange,
}: AccountCardProps) {
  const [pendingCallsign, setPendingCallsign] = useState(callsign);
  const [pendingDisplayName, setPendingDisplayName] = useState(displayName);
  const [pendingDisplayProfile, setPendingDisplayProfile] = useState(displayProfile);

  // Sync local inputs when values load from Firestore
  useEffect(() => {
    setPendingCallsign(callsign);
    setPendingDisplayName(displayName);
    setPendingDisplayProfile(displayProfile);
  }, [callsign, displayName, displayProfile]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base">Account</CardTitle>
          <div className="flex items-center gap-2">
            <Label htmlFor="profile-visible" className="text-sm font-medium cursor-pointer">
              Make Profile Visible in /attendees
            </Label>
            <Checkbox
              id="profile-visible"
              checked={profileVisible}
              onCheckedChange={(checked) =>
                onProfileVisibleChange(checked === true)
              }
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="callsign" className="text-sm font-medium">
            Callsign
          </Label>
          <div className="flex gap-2">
            <Input
              id="callsign"
              placeholder="e.g. W6AKB"
              value={pendingCallsign}
              onChange={(e) => setPendingCallsign(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); onCallsignChange(pendingCallsign.trim()); }
              }}
              className="text-sm"
              aria-label="Amateur radio callsign"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onCallsignChange(pendingCallsign.trim())}
              aria-label="Save callsign"
            >
              <Save className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Separator />
        <div className="space-y-1">
          <Label htmlFor="display-name" className="text-sm font-medium">
            Display Name
          </Label>
          <div className="flex gap-2">
            <Input
              id="display-name"
              placeholder="e.g. Jane Smith"
              value={pendingDisplayName}
              onChange={(e) => setPendingDisplayName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); onDisplayNameChange(pendingDisplayName.trim()); }
              }}
              className="text-sm"
              aria-label="Display name"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onDisplayNameChange(pendingDisplayName.trim())}
              aria-label="Save display name"
            >
              <Save className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Separator />
        <div className="space-y-1">
          <Label htmlFor="display-profile" className="text-sm font-medium">
            About Me
          </Label>
          <Textarea
            id="display-profile"
            placeholder="A short bio visible to other attendees…"
            value={pendingDisplayProfile}
            onChange={(e) => setPendingDisplayProfile(e.target.value)}
            rows={3}
            className="text-sm resize-none"
            aria-label="Profile bio"
          />
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onDisplayProfileChange(pendingDisplayProfile.trim())}
              aria-label="Save profile bio"
            >
              <Save className="h-4 w-4" />
              Save
            </Button>
          </div>
        </div>
        <Separator />
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
              onClick={onEmailVerification}
              className="shrink-0 text-amber-600 dark:text-amber-400 px-0 gap-1"
            >
              <MailCheck className="h-3.5 w-3.5" />
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
            onClick={onPasswordReset}
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
        {groups && groups.length > 0 && (
          <>
            <Separator />
            <div className="bg-amber-50 dark:bg-amber-950">
              <p className="text-xs text-muted-foreground mb-1.5">Groups</p>
              <div className="flex flex-wrap gap-1.5">
                {groups.map((group) => (
                  <Badge key={group} variant="secondary" className="text-xs">
                    {group}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
