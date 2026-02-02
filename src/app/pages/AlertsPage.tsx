import { AlertsView } from '@/app/components/AlertsView';
//import { User } from "lucide-react";
import { useAuth } from '../contexts/AuthContext';
//import { useNavigate } from 'react-router-dom';


export function AlertsPage() {
  const { user } = useAuth();
  //const { user, logout } = useAuth();
  //const navigate = useNavigate();

  if (!user) {
    //return <div>Loading...</div>;
    return <AlertsView />; //  not logged in
  }
  return (
    <div className="profile-container">
      <div className="profile-info">
        <div className="profile-field">
          <label>Email:</label> {user.email}
        </div>
      </div>
    </div>
  );
}
