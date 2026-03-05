import { LogIn, UserPlus, User } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Separator } from "@/app/components/ui/separator";

export function ProfileView() {
  return (
    <Card className="max-w-lg">
      <CardContent className="pt-6 pb-6 flex flex-col items-center text-center gap-4">
        <User className="h-16 w-16 text-muted-foreground" />
        <div>
          <h3 className="text-xl font-semibold">Account Features</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Sign in to access personalized features
          </p>
        </div>

        <ul className="text-left w-full max-w-xs space-y-2 text-sm text-muted-foreground">
          <li>• Bookmark favorite sessions</li>
          <li>• Receive prize winner notifications</li>
          <li>• Send messages to other attendees</li>
          <li>• Dark mode preferences</li>
          <li>• SMS &amp; email notifications</li>
        </ul>

        <div className="w-full max-w-xs flex flex-col gap-3 mt-2">
          <Button asChild size="lg" className="w-full">
            <Link to="/login">
              <LogIn className="h-4 w-4" />
              Sign In
            </Link>
          </Button>

          <Separator className="my-1" />

          <p className="text-sm text-muted-foreground">New to the app?</p>
          <Button asChild size="lg" variant="outline" className="w-full">
            <Link to="/signup">
              <UserPlus className="h-4 w-4" />
              Sign Up Now
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
