import { User } from "lucide-react";

export function ProfileView() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
      <User className="h-16 w-16 mx-auto mb-4 text-gray-400" />
      <h3 className="text-xl font-semibold mb-2">Account Features</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        <a
          href="/login"
          className="gap-2 text-blue-600 dark:text-blue-400 hover:underline"
        >Sign in</a> to access personalized features:
      </p>
      <ul className="text-left max-w-md mx-auto space-y-2 text-gray-700 dark:text-gray-300">
        <li>• Bookmark favorite sessions</li>
        <li>• Receive prize winner notifications</li>
        <li>• Send messages to other attendees</li>
        <li>• Dark mode preferences</li>
        <li>• SMS & email notifications</li>
      </ul>
      <p className="text-sm text-gray-500 dark:text-gray-500 mt-6">
        Authentication will be enabled with Firebase configuration
      </p>
    </div>
  );
}
