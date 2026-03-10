// Firebase Cloud Messaging Service Worker
// Handles background push notifications for prize winner alerts.
//
// This file must live at /firebase-messaging-sw.js (served from the root) so
// the Firebase Messaging SDK can register it automatically when getToken() is
// called without an explicit serviceWorkerRegistration.
//
// NOTE: The Firebase SDK version below (12.8.0) must match the version used in
// the main application (package.json / firebase.json). Update both together
// when upgrading Firebase.

importScripts("/__/firebase/12.8.0/firebase-app-compat.js");
importScripts("/__/firebase/12.8.0/firebase-messaging-compat.js");

// Use Firebase Hosting auto-config (available in production).
// Silently skipped during local development where this endpoint is absent.
try {
  importScripts("/__/firebase/init.js");
} catch (_) {
  // Local development — Firebase Hosting config not available.
}

// Only wire up background messaging if the Firebase app was auto-configured.
if (firebase.apps.length > 0) {
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const title = payload.notification?.title ?? "🎉 Prize Winner!";
    const options = {
      body:
        payload.notification?.body ??
        "You have won a prize! Visit the app to claim it.",
      icon: "/favicon.png",
    };
    self.registration.showNotification(title, options);
  });
}
