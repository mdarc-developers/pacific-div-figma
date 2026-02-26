import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
//import { Conference } from '@/types/conference';
import { User } from "lucide-react";

const getErrorMessage = (err: unknown): string => {
  if (err instanceof Error) return err.message;
  return "An unexpected error occurred";
};

export function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp, signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    if (password.length < 6) {
      return setError("Password must be at least 6 characters");
    }

    try {
      setError("");
      setLoading(true);
      await signUp(email, password);
      // Navigation handled by useEffect when user state updates
    } catch (err: unknown) {
      setError(getErrorMessage(err) || "Failed to create an account");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setError("");
      setLoading(true);
      await signInWithGoogle();
      // Navigation handled by useEffect when user state updates
    } catch (err: unknown) {
      setError(getErrorMessage(err) || "Failed to sign up with Google");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
      <User className="h-16 w-16 mx-auto mb-4 text-gray-400" />
      <form onSubmit={handleSubmit}>
        <h2 className="text-xl font-semibold mb-2">Sign Up</h2>
        {error && <div className="error">{error}</div>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
        <br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
        <br />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={loading}
        />
        <br />
        <button type="submit" disabled={loading}>
          {loading ? "Creating Account..." : "Sign Up"}
        </button>{" "}
        |
        <button type="button" onClick={handleGoogleSignUp} disabled={loading}>
          &nbsp;Sign up with Google
        </button>
        <p>
          <br />
          Already have an account?
          <Link
            to="/login"
            className="gap-2 text-blue-600 dark:text-blue-400 hover:underline"
          >
            &nbsp;Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
