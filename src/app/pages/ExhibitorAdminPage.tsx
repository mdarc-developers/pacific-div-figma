import { ShieldAlert, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/app/contexts/AuthContext";
import { useConference } from "@/app/contexts/ConferenceContext";
import { useExhibitorAdmin } from "@/app/hooks/useExhibitorAdmin";
import { ExhibitorAdminView } from "@/app/components/ExhibitorAdminView";
import { Button } from "@/app/components/ui/button";
import { BOOTH_DATA, EXHIBITOR_DATA } from "@/lib/sessionData";

export function ExhibitorAdminPage() {
  const { user, loading } = useAuth();
  const { activeConference } = useConference();
  const isExhibitorAdmin = useExhibitorAdmin();

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
          to access exhibitors management.
        </p>
      </div>
    );
  }

  // Signed in but not in the exhibitor-admin group
  if (!isExhibitorAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <ShieldAlert className="h-12 w-12 text-red-400" />
        <p className="text-lg font-medium">Access Denied</p>
        <p className="text-sm text-gray-500">
          Your account does not have exhibitor-admin group membership.
        </p>
      </div>
    );
  }

  // EXHIBITOR_DATA[id] is a [mapUrl, Exhibitor[]] tuple; index [1] is the array
  const exhibitors = EXHIBITOR_DATA[activeConference.id]?.[1] ?? [];
  // BOOTH_DATA[id] is an array of [mapUrl, Booth[]] tuples; flatten to a single array
  const allBooths = (BOOTH_DATA[activeConference.id] ?? []).flatMap(
    ([, booths]) => booths,
  );

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-6">
        <ShieldCheck className="h-5 w-5 text-green-600" />
        <h1 className="text-2xl font-bold">Exhibitors Management</h1>
        <span className="text-sm text-gray-500 ml-2">
          ({activeConference.name})
        </span>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Add, edit, or remove exhibitors for the active conference.
      </p>
      <ExhibitorAdminView
        conferenceId={activeConference.id}
        initialExhibitors={exhibitors}
        allBooths={allBooths}
      />
    </div>
  );
}
