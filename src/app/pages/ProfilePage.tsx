import { useState } from 'react';
import { ProfileView } from '@/app/components/ProfileView';
import { useAuth } from '@/app/contexts/AuthContext';
import { useTheme, type Theme } from '@/app/contexts/ThemeContext';
import { useConference } from '@/app/contexts/ConferenceContext';
import { useNavigate } from 'react-router-dom';
import { getAuth, sendEmailVerification, sendPasswordResetEmail } from "firebase/auth";
import { Toaster, toast } from "sonner";
import { MonitorCog, Moon, Sun } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/app/components/ui/toggle-group';

function isTheme(value: string): value is Theme {
  return value === 'light' || value === 'dark' || value === 'system';
}

interface ProfilePageProps {
  bookmarkedSessions?: string[];
  onToggleBookmark?: (sessionId: string) => void;
}

export function ProfilePage({ bookmarkedSessions = [] }: ProfilePageProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { activeConference, allConferencesList, setActiveConference } = useConference();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');

  if (!user) {
    //return <div>Loading...</div>;
    return <ProfileView />; //  not logged in
  }

  const auth = getAuth();
  const authCurrentUser = auth.currentUser;

  if (!authCurrentUser) {
    return <ProfileView />;
  }

  const authUserEmail = authCurrentUser.email;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/profile');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const handleEmailVerification = async () => {
    try {
      setError('');
      if (authCurrentUser != null) {
        await sendEmailVerification(authCurrentUser);
        toast('Email Verification Sent');
      } else {
        toast('No Email To Verify');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to sendEmailVerification';
      setError(message);
    }
  };

  const handlePasswordReset = async () => {
    try {
      setError('');
      if (authUserEmail != null) {
        await sendPasswordResetEmail(auth, authUserEmail);
        toast('Password Reset Email Sent');
      } else {
        toast('No Email To Send Password Reset');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to sendPasswordResetEmail';
      setError(message);
    }
  };

  return (
    <div className="max-w-md">
      <><Toaster /></>
      <h1 className="text-3xl font-bold mb-8">Profile</h1>

      <div className="space-y-6 profile-info">

        {user.displayName && (
          <div className="profile-field">
            <label className="block text-sm font-medium text-gray-700 mb-2">Display Name:</label>
            {user.displayName}
          </div>
        )}

        <div className="profile-field">
          <label className="block text-sm font-medium text-gray-700 mb-2">User ID:</label>
          {user.uid}
              <button type="button" onClick={handlePasswordReset}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                &lt;reset password&gt;
              </button>
          
        </div>

        {user.photoURL && (
          <div className="profile-field">
          <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture:</label>
            <img src={user.photoURL} alt="Profile" className="profile-picture" />
          </div>
        )}

        <div className="profile-field">
          <label className="block text-sm font-medium text-gray-700 mb-2">
          Last Sign In:</label>
          <p>{user.metadata.lastSignInTime}</p>
        </div>

        <div className="profile-field">
          <label className="block text-sm font-medium text-gray-700 mb-2">
          Account Created:</label>
          <p>{user.metadata.creationTime}</p>
        </div>


        <div className="profile-field">
          <label className="block text-sm font-medium text-gray-700 mb-2">
          Email:</label>
          <p>{user.email}</p>
        </div>

        <div className="profile-field">
          <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Verified:</label>
          <p>{user.emailVerified ? 'Yes' :
            //<form onSubmit={handleEmailVerification}>
              <button type="button" onClick={handleEmailVerification}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                &lt;send verification now&gt;
              </button>
            //</form>
          }</p>
        </div>

        <div className="profile-field">
          <label className="block text-sm font-medium text-gray-700 mb-2">
          Email alert toggle:</label>
          <p>&lt;none yet&gt;</p>
        </div>

        <div className="profile-field">
          <label className="block text-sm font-medium text-gray-700 mb-2">
          Bookmarks:</label>
          {bookmarkedSessions.length > 0 ?
            <p>{bookmarkedSessions}</p> :
            <p>&lt;none yet&gt;</p>
          }
        </div>

        <div className="profile-field">
          <label className="block text-sm font-medium text-gray-700 mb-2">
          Dark mode:</label>
          <ToggleGroup
            type="single"
            value={theme}
            onValueChange={(value) => { if (!value || !isTheme(value)) return; setTheme(value); }}
            variant="outline"
            size="sm"
            aria-label="Theme"
          >
            <ToggleGroupItem value="light" aria-label="Light theme" title="Light theme">
              <Sun className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="system" aria-label="System theme" title="System theme">
              <MonitorCog className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="dark" aria-label="Dark theme" title="Dark theme">
              <Moon className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="profile-field">
          <label className="block text-sm font-medium text-gray-700 mb-2">
          Prizes won:</label>
          <p>&lt;none yet&gt;</p>
        </div>

        <div className="profile-field">
          <label className="block text-sm font-medium text-gray-700 mb-2">
          SMS Number:</label>
          <p>&lt;none yet&gt;</p>
        </div>

        <div className="profile-field">
          <label className="block text-sm font-medium text-gray-700 mb-2">
          SMS alert toggle:</label>
          <p>&lt;none yet&gt;</p>
        </div>

        <div className="profile-field">
          <label className="block text-sm font-medium text-gray-700 mb-2">
          Messages:</label>
          <p>&lt;none yet&gt;</p>
        </div>

        <div className="profile-field">
          <label className="block text-sm font-medium text-gray-700 mb-2">
          Messages toggle:</label>
          <p>&lt;none yet&gt;</p>
        </div>

      </div>

      <button onClick={handleLogout} className="logout-button border border-2 border-solid shadow-md">
        Log Out
      </button>

      {error && (
        <p className="text-red-500 dark:text-red-400 mt-4 text-sm">{error}</p>
      )}
    </div>
  );
}

