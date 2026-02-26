import { Bell } from "lucide-react";

export function AlertsView() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
      <Bell className="h-16 w-16 mx-auto mb-4 text-gray-400" />
      <h3 className="text-xl font-semibold mb-2">Prize Notifications</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        <a
          href="/login"
          className="gap-2 text-blue-600 dark:text-blue-400 hover:underline"
        >
          Sign in
        </a>{" "}
        to receive notifications when you win prizes!
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-500">
        In-app, email, and SMS notifications available
      </p>
    </div>
  );
}
