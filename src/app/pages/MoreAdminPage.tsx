import { ShieldAlert, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/app/contexts/AuthContext";
import { useConference } from "@/app/contexts/ConferenceContext";
import { useMoreAdmin } from "@/app/hooks/useMoreAdmin";
import { Button } from "@/app/components/ui/button";

export function MoreAdminPage() {
  const { user, loading } = useAuth();
  const { activeConference } = useConference();
  const isMoreAdmin = useMoreAdmin();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500">
        Loading…
      </div>
    );
  }

  // Not signed in
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <ShieldAlert className="h-12 w-12 text-gray-400" />
        <p className="text-lg font-medium">Sign in required</p>
        <p className="text-sm text-gray-500">
          Please{" "}
          <Button asChild variant="link" className="px-0 h-auto text-sm">
            <Link to="/login">sign in</Link>
          </Button>{" "}
          to access more management.
        </p>
      </div>
    );
  }

  // Signed in but not in the more-admin group
  if (!isMoreAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <ShieldAlert className="h-12 w-12 text-red-400" />
        <p className="text-lg font-medium">Access Denied</p>
        <p className="text-sm text-gray-500">
          Your account does not have more-admin group membership.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-6">
        <ShieldCheck className="h-5 w-5 text-green-600" />
        <h1 className="text-2xl font-bold">More Management</h1>
        <span className="text-sm text-gray-500 ml-2">
          ({activeConference.name})
        </span>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Additional conference management tools.
      </p>
    </div>
  );
}
