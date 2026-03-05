import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
//import { Conference } from '@/types/conference';
import { User } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";

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
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-sm mx-auto">
        <h2 className="text-xl font-semibold mb-2">Sign Up</h2>
        {error && <div className="error">{error}</div>}
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
        <Input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={loading}
        />
        <Button type="submit" disabled={loading} className="w-full mt-1">
          {loading ? "Creating Account..." : "Sign Up"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleSignUp}
          disabled={loading}
          className="w-full"
        >
          <svg viewBox="0 0 24 24" className="size-4 shrink-0" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Sign up with Google
        </Button>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
