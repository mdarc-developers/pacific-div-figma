import { AlertCircle, CheckCircle, LogOut } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/components/ui/avatar";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import type { User } from "firebase/auth";

interface ProfileHeaderCardProps {
  user: User;
  initials: string;
  onLogout: () => void;
}

export function ProfileHeaderCard({
  user,
  initials,
  onLogout,
}: ProfileHeaderCardProps) {
  return (
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
            onClick={onLogout}
            className="logout-button border-2 border-solid shadow-md"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
