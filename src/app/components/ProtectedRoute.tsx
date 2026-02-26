import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
//import { auth } from '../../lib/firebase';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or your loading component
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
