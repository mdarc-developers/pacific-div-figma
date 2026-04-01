import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Checkbox } from "@/app/components/ui/checkbox";
import { useAuth } from "@/app/contexts/AuthContext";
import { getFunctions, httpsCallable } from "firebase/functions";
import app from "@/lib/firebase";

export function FeedbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const referrer = searchParams.get("referrer") ?? window.location.origin;

  const [email, setEmail] = useState("");
  const [pageUrl, setPageUrl] = useState(referrer);
  const [message, setMessage] = useState("");
  const [ccSender, setCcSender] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Populate email from the logged-in user's profile when available.
  // Only overwrite if the field is still empty to preserve manual edits.
  useEffect(() => {
    if (user?.email && !email) {
      setEmail(user.email);
    }
  }, [user]); // intentionally omits `email` to avoid re-running when user types

  const handleSend = async () => {
    setError(null);
    setSending(true);
    try {
      const functions = getFunctions(app);
      const sendFeedbackEmail = httpsCallable(functions, "sendFeedbackEmail");
      await sendFeedbackEmail({
        email: email.trim() || undefined,
        pageUrl,
        message,
        ccSender,
      });
      // Redirect back to the originating page on success.
      // Extract just the path from a full URL so react-router navigate works.
      const redirectPath = (() => {
        try {
          const url = new URL(pageUrl);
          return url.pathname + url.search + url.hash || "/";
        } catch {
          return pageUrl.startsWith("/") ? pageUrl : "/";
        }
      })();
      navigate(redirectPath);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to send feedback.";
      setError(msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">App Feedback</CardTitle>
          <p className="text-sm text-muted-foreground">
            Questions, errors, or omissions? Let us know.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label
              htmlFor="feedback-page"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block"
            >
              Page
            </label>
            <Input
              id="feedback-page"
              value={pageUrl}
              onChange={(e) => setPageUrl(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="feedback-email"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block"
            >
              Your email (optional)
            </label>
            <Input
              id="feedback-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="feedback-cc"
              checked={ccSender}
              onCheckedChange={(checked) => setCcSender(checked === true)}
              disabled={!email.trim()}
            />
            <label
              htmlFor="feedback-cc"
              className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none"
            >
              Send me a copy of this feedback
            </label>
          </div>
          <div>
            <label
              htmlFor="feedback-message"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block"
            >
              Message
            </label>
            <Textarea
              id="feedback-message"
              placeholder="Describe the question, error, or omission…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
            />
          </div>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          <Button
            className="w-full"
            disabled={message.trim() === "" || sending}
            onClick={handleSend}
          >
            {sending ? "Sending…" : "Send Feedback"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
