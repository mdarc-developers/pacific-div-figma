import { AlertsView } from "@/app/components/AlertsView";
//import { User } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export function AlertsPage() {
  const { user } = useAuth();

  if (!user) {
    //return <div>Loading...</div>;
    return <AlertsView />; //  not logged in
  }
  return (
    <div className="profile-container max-w-lg mx-auto space-y-4">
      <div className="profile-info">
        <div className="profile-field">
          <label>Email:</label> {user.email}
        </div>
      </div>
    </div>
  );
}
