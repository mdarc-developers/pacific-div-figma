import { ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/app/components/ui/button";
import { useAuth } from "@/app/contexts/AuthContext";

const linkBtnClass = "px-0 h-auto text-sm";

/**
 * Shown on the /attendees page when the current user does not have permission
 * to fetch the attendee list — either because they are not signed in or because
 * their email address has not yet been verified.
 *
 * Includes a link to /profile where users can sign in, create an account, or
 * resend the email verification message.
 */
export function AttendeesAccessDeniedView() {
  const { user } = useAuth();
  const emailUnverified = !!user && !user.emailVerified;

  return (
    <div
      className="flex flex-col items-center justify-center py-16 gap-4 text-center"
      data-testid="attendees-access-denied"
    >
      <ShieldAlert className="h-12 w-12 text-gray-400" />
      <p className="text-lg font-medium">
        {emailUnverified ? "Email Verification Required" : "Sign In Required"}
      </p>
      <p className="text-sm text-gray-500 max-w-sm">
        {emailUnverified ? (
          <>
            The attendee list is only available to participants with a verified
            email address. Please check your inbox for a verification link, or
            visit your{" "}
            <Button asChild variant="link" className={linkBtnClass}>
              <Link to="/profile">profile page</Link>
            </Button>{" "}
            to resend the verification email.
          </>
        ) : (
          <>
            The attendee list is only available to registered participants with
            a verified email address. Please{" "}
            <Button asChild variant="link" className={linkBtnClass}>
              <Link to="/login">sign in</Link>
            </Button>{" "}
            or visit your{" "}
            <Button asChild variant="link" className={linkBtnClass}>
              <Link to="/profile">profile page</Link>
            </Button>{" "}
            to create an account.
          </>
        )}
      </p>
    </div>
  );
}
