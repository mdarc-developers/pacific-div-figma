import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";

export function FeedbackPage() {
  const [searchParams] = useSearchParams();
  const referrer = searchParams.get("referrer") ?? window.location.origin;
  const [message, setMessage] = useState("");

  const mailtoHref = useMemo(
    () =>
      `mailto:pacific-div@mdarc.org?subject=${encodeURIComponent("App Feedback")}&body=${encodeURIComponent(`Page: ${referrer}\n\n${message}`)}`,
    [referrer, message],
  );

  const handleSend = () => {
    window.location.href = mailtoHref;
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
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Page
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 break-all bg-gray-100 dark:bg-gray-800 rounded px-3 py-2">
              {referrer}
            </p>
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
          <Button
            className="w-full"
            disabled={message.trim() === ""}
            onClick={handleSend}
          >
            Send Feedback
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
