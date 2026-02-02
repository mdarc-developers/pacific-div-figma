import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User } from "lucide-react";

const getErrorMessage = (err: unknown): string => {
  if (err instanceof Error) return err.message;
  return 'An unexpected error occurred';
};

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/profile');
    }
  }, [user, navigate]);

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true)
      await signIn(email, password);
      // Navigation handled by useEffect when user state updates
    } catch (err) {
      setError(getErrorMessage(err) || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true)
      await signInWithGoogle();
      // Navigation handled by useEffect when user state updates
    } catch (err) {
      setError(getErrorMessage(err) || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  // const handleSignUpSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   try {
  //     await signUp(email, password);
  //     navigate('/');
  //   } catch (err) {
  //     setError('Failed to sign up');
  //   }
  // };

  return (
    <div className="login-container bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
      <User className="h-16 w-16 mx-auto mb-4 text-gray-400" />
      <form onSubmit={handleSignInSubmit}>
        <h2 className="text-xl font-semibold mb-2">Login</h2>
        {error && <div className="error">{error}</div>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
        <button type="submit"
          className="gap-2 text-blue-600 dark:text-blue-400 hover:underline"
          disabled={loading}
        >{loading ? 'Signing In...' : 'Sign In'}</button> |
        <button type="button"
          onClick={handleGoogleSignIn}
          className="gap-2 text-blue-600 dark:text-blue-400 hover:underline"
          disabled={loading}
        >&nbsp;Sign in with Google
        </button><br /><br />
      </form>
      First time? <a
        href="/signup"
        className="gap-2 text-blue-600 dark:text-blue-400 hover:underline"
      >sign up now</a>
    </div>
  );
};
