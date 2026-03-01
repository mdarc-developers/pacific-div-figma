import { KeyRound } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Separator } from "@/app/components/ui/separator";
import type { User } from "firebase/auth";

interface AccountCardProps {
  user: User;
  onEmailVerification: () => void;
  onPasswordReset: () => void;
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
  onEmailVerification,
  onPasswordReset,
}: AccountCardProps) {
  return (
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
              onClick={onEmailVerification}
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
      </CardContent>
    </Card>
  );
}
