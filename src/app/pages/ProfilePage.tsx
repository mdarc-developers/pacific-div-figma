import { useEffect, useState } from 'react';
import { ProfileView } from '@/app/components/ProfileView';
import { User } from "lucide-react";
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getAuth, sendEmailVerification, sendPasswordResetEmail } from "firebase/auth";
import { Toaster, toast } from "sonner";

interface LoginPageProps {
  bookmarkedSessions?: string[];
  conference: Conference;
  onToggleBookmark?: (sessionId: string) => void;
}


export function ProfilePage ({ bookmarkedSessions = [], conference, onToggleBookmark }: LoginPageProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  if (!user) {
    //return <div>Loading...</div>;
    return <ProfileView />; //  not logged in
  }

  const auth = getAuth();
  const authCurrentUser = auth.currentUser;
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
      await sendEmailVerification(authCurrentUser);
      toast('Email Verification Sent');
    } catch (err: any) {
      setError(err.message || 'Failed to sendEmailVerification');
    }
  };

  const handlePasswordReset = async () => {
    try {
      setError('');
      await sendPasswordResetEmail(auth, authUserEmail);
      toast('Password Reset Email Sent');
    } catch (err: any) {
      setError(err.message || 'Failed to sendPasswordResetEmail');
    }
  };

  return (
    <div className="profile-container">
      <h1>Profile</h1>
      
      <div className="profile-info">

        {user.displayName && (
          <div className="profile-field">
            <label>Display Name:</label>
            <p>{user.displayName}</p>
          </div>
        )}

        <div className="profile-field">
          <label>User ID:</label>
          <p>{user.uid}
            <> <Toaster />
              <button type="button" onClick={handlePasswordReset}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                &lt;reset password&gt;
              </button> </>
            </p>
        </div>

        {user.photoURL && (
          <div className="profile-field">
            <label>Profile Picture:</label>
            <img src={user.photoURL} alt="Profile" className="profile-picture" />
          </div>
        )}

        <div className="profile-field">
          <label>Last Sign In:</label>
          <p>{user.metadata.lastSignInTime}</p>
        </div>

        <div className="profile-field">
          <label>Account Created:</label>
          <p>{user.metadata.creationTime}</p>
        </div>


        <div className="profile-field">
          <label>Email:</label>
          <p>{user.email}</p>
        </div>

        <div className="profile-field">
          <label>Email Verified:</label>
          <p>{user.emailVerified ? 'Yes' :
            //<form onSubmit={handleEmailVerification}>
              <> <Toaster />
              <button type="button" onClick={handleEmailVerification}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                &lt;send verification now&gt;
              </button> </>
            //</form>
          }</p>
        </div>

        <div className="profile-field">
          <label>Email alert toggle:</label>
          <p>&lt;none yet&gt;</p>
        </div>

        <div className="profile-field">
          <label>Bookmarks:</label>
        {bookmarkedSessions > 0 ? 
          <p>{ bookmarkedSessions }</p>
         : 
          <p>&lt;none yet&gt;</p>
        }
        </div>

        <div className="profile-field">
          <label>Dark mode:</label>
          <p>&lt;none yet&gt;</p>
        </div>

        <div className="profile-field">
          <label>Prizes won:</label>
          <p>&lt;none yet&gt;</p>
        </div>

        <div className="profile-field">
          <label>SMS Number:</label>
          <p>&lt;none yet&gt;</p>
        </div>

        <div className="profile-field">
          <label>SMS alert toggle:</label>
          <p>&lt;none yet&gt;</p>
        </div>

        <div className="profile-field">
          <label>Messages:</label>
          <p>&lt;none yet&gt;</p>
        </div>

        <div className="profile-field">
          <label>Messages toggle:</label>
          <p>&lt;none yet&gt;</p>
        </div>

      </div>

      <button onClick={handleLogout} className="logout-button">
        Log Out
      </button>
    </div>
  );
}


//  return (
//    <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
//      <User className="h-16 w-16 mx-auto mb-4 text-gray-400" />
//      <h3 className="text-xl font-semibold mb-2">Account Features</h3>
//      <p className="text-gray-600 dark:text-gray-400 mb-4">
//        <a
//          href="/logout"
//          className="gap-2 text-blue-600 dark:text-blue-400 hover:underline"
//        >Sign Out</a>
//      </p>
//      <ul className="text-left max-w-md mx-auto space-y-2 text-gray-700 dark:text-gray-300">
//        <li>• Bookmark favorite sessions</li>
//        <li>• Receive prize winner notifications</li>
//        <li>• Send messages to other attendees</li>
//        <li>• Dark mode preferences</li>
//        <li>• SMS & email notifications</li>
//      </ul>
//    </div>
//  );
