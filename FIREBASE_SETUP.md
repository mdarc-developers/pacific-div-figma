# Firebase Setup Instructions

This application uses Firebase for backend services. Follow these steps to configure Firebase:

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter a project name (e.g., "ham-radio-conference")
4. Follow the setup wizard

## 2. Enable Firebase Services

### Authentication

1. In Firebase Console, go to "Authentication"
2. Click "Get Started"
3. Enable "Email/Password" sign-in method
4. Enable "Google" sign-in for Google OAuth

## 2a. Configure Authorized Domains & OAuth Redirect URIs

The app supports both popup-based and redirect-based Google sign-in. The redirect
flow (`signInWithRedirect`) navigates the browser to Google's OAuth page and then
back. Firebase must trust the domains it redirects back to, and Google's OAuth
consent screen must allow the redirect URIs that Firebase uses.

### Authorized domains (Firebase Console)

Firebase Auth maintains an allowlist of domains that are permitted to host the
sign-in flow. By default, `localhost` and `<project>.firebaseapp.com` are added
automatically. For the live app you must add:

1. Open **Firebase Console → Authentication → Settings → Authorized domains**.
2. Verify these domains are listed (add any that are missing):
   - `pacific-div.web.app` — primary Firebase Hosting domain
   - `pacific-div.firebaseapp.com` — Firebase Auth / SDK domain (added by default)
   - `localhost` — local development (added by default)
3. If you use a custom domain (e.g. `conference.example.com`) add it here too.

### OAuth redirect URIs (Google Cloud Console)

Firebase Auth uses its own OAuth handler URL as the redirect URI when completing
a Google sign-in. You need to allow this URI in your Google OAuth client:

1. Open [Google Cloud Console → APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials).
2. Click the **OAuth 2.0 Client ID** used by your Firebase project (it is named
   after your project, e.g. `Web client (auto created by Google Service)`).
3. Under **Authorised redirect URIs**, add:
   ```
   https://<YOUR_PROJECT_ID>.firebaseapp.com/__/auth/handler
   ```
   For this project that is:
   ```
   https://pacific-div.firebaseapp.com/__/auth/handler
   ```
4. Save. Changes propagate within a few minutes.

> **Why `firebaseapp.com/__/auth/handler`?** Firebase Auth routes the OAuth
> callback through its own handler on the `firebaseapp.com` auth domain. This
> domain is intentionally kept _separate_ from the app's Hosting domain
> (`pacific-div.web.app`) so Chrome does not intercept the OAuth popup or
> redirect as a navigation into the installed PWA.

### PWA standalone mode — redirect vs popup

| Environment                       | Behaviour                                                                                                                                                             |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Desktop Chrome / Firefox          | `signInWithPopup` succeeds — no redirect needed.                                                                                                                      |
| iOS Safari (browser tab)          | Popup usually works; redirect fallback available.                                                                                                                     |
| iOS Safari (installed PWA / A2HS) | Popup blocked → app calls `signInWithRedirect` automatically. User is sent to Google, then returned to the app. `getRedirectResult()` finishes sign-in on app reload. |
| Android Chrome (installed PWA)    | Popup usually works; redirect fallback available.                                                                                                                     |

**No infinite-redirect loop:** `getRedirectResult(auth)` is called exactly once
at app startup. It resolves with `null` when no redirect is pending, and with the
user credential after a completed redirect. Firebase clears the pending state
after the first successful call, preventing any loop.

**No dedicated callback route required:** Firebase handles the entire OAuth
round-trip through `/__/auth/handler` on the `firebaseapp.com` domain. The app
does not need a `/auth/callback` route.

### Firestore Database

1. Go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in production mode"
4. Select a location closest to your users

### Storage

1. Go to "Storage"
2. Click "Get Started"
3. Accept the default security rules (you can customize later)

## 3. Get Your Firebase Config

1. In Project Overview, click the web icon (</>) to add a web app
2. Register your app with a nickname
3. Copy the `firebaseConfig` object — you'll need the six values below

### Local development

Copy `.env.example` to `.env` and fill in the values from your Firebase config:

```
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

# Optional — enables Firebase Analytics / Google Analytics (starts with "G-")
VITE_FIREBASE_MEASURE_ID=G-XXXXXXXXXX
```

Never commit `.env` — it is already listed in `.gitignore`.

### GitHub Actions (CI/CD)

The app uses **Firebase Hosting runtime auto-configuration**: when served from Firebase
Hosting, an inline script in `index.html` fetches `/__/firebase/init.json` (a JSON
config endpoint provided by Firebase Hosting) synchronously before the app modules
load. This sets `window.__FIREBASE_DEFAULTS__` so `firebase.ts` can read the project
config at runtime without needing `VITE_FIREBASE_*` secrets baked into the build.

> **Why `init.json` instead of `init.js`?** Firebase Hosting's `/__/firebase/init.js`
> script requires the compat CDN SDK (`window.firebase`) to be present, which this app
> does not load. Using the raw JSON endpoint (`/__/firebase/init.json`) avoids that
> requirement entirely.

The workflow files still accept these secrets as optional inputs (for PR preview
deployments or non-Hosting environments). If you wish to set them, go to
**Settings → Secrets and variables → Actions** in your GitHub repository and add:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

When the secrets are absent the CI build still succeeds. On Firebase Hosting the
config is supplied automatically at page load via `/__/firebase/init.json`.

## 4. Set Up Firestore Collections

Create these collections in Firestore:

### conferences

- **Document ID**: conference-id (e.g., "pacificon-2026")
- **Fields**: name, location, venue, startDate, endDate, timezone, primaryColor, secondaryColor, website

### sessions

- **Document ID**: auto-generated
- **Fields**: conferenceId, title, description, speaker, location, startTime, endTime, category, track

### maps

- **Document ID**: auto-generated
- **Fields**: conferenceId, name, url, floor, order

### users

- **Document ID**: uid (Firebase Auth user ID)
- **Fields**: email, callsign, displayName, darkMode, bookmarkedSessions[], notificationsEnabled, smsNotifications, phoneNumber

### prizes

- **Document ID**: auto-generated
- **Fields**: conferenceId, name, description, category

### prizeWinners

- **Document ID**: auto-generated
- **Fields**: prizeId, winnerCallsign, winnerEmail, winnerName, notifiedAt, claimedAt

### messages

- **Document ID**: auto-generated
- **Fields**: conferenceId, from, to, isPublic, content, boardId, votes, createdAt

## 5. Configure Firestore Security Rules

The security rules live in `firestore.rules` in the repository root and are
deployed automatically by `firebase deploy`. The rules reference a
`groups/mdarc-developers` document to identify privileged developer accounts
(see §5a below).

To deploy rules only:

```bash
firebase deploy --only firestore:rules
```

### 5a. Set up the `groups/mdarc-developers` document

The `AdminStatsBar` component (shown above `ConferenceHeader` for mdarc-developer
users) reads the count of user profiles and the signup counter from Firestore.
The security rules grant these read permissions to users listed in the
`groups/mdarc-developers` Firestore document.

**Create this document once** in the Firebase Console or via admin SDK:

- **Collection**: `groups`
- **Document ID**: `mdarc-developers`
- **Field**: `members` (Map)
  - Each key is a Firebase Auth UID; each value is `true`

Example document structure:

```json
{
  "members": {
    "UID_OF_DEVELOPER_1": true,
    "UID_OF_DEVELOPER_2": true
  }
}
```

To find a user's UID: Firebase Console → Authentication → Users → copy UID.

> **Note**: The `groups` collection is readable by any authenticated user but
> writable only via the Firebase Admin SDK (Cloud Functions). Never store
> sensitive data in a group document — only UID membership flags.

### 5b. Full rules reference

The canonical rules are in `firestore.rules`. For reference, the key
collections and their access patterns are:

| Collection                        | Read                                | Write                        |
| --------------------------------- | ----------------------------------- | ---------------------------- |
| `conferences`, `sessions`, `maps` | Public                              | Admin (`isAdmin` field)      |
| `users/{uid}`                     | Own doc only (`get`)                | Own doc only                 |
| `users` (list/count)              | mdarc-developers only               | —                            |
| `groups/{groupId}`                | Any authenticated user              | Admin SDK only               |
| `stats/{document}`                | mdarc-developers only               | Cloud Functions only         |
| `prizes`                          | Public                              | Admin (`isAdmin` field)      |
| `prizeWinners`                    | Own wins or admin                   | Admin (`isAdmin` field)      |
| `messages`                        | Public messages or sender/recipient | Any authenticated user (own) |

## 6. Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Map images can be read by anyone
    match /maps/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // User profile images
    match /profile-images/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 7. CSV Data Loading

The app is designed to load data from CSV files. To implement this:

1. Store CSV files in Firebase Storage under `/conferences/{conferenceId}/data/`
2. Create Cloud Functions to parse and load CSV data into Firestore
3. The app will cache data locally using IndexedDB for offline access

### Example CSV Structure

**sessions.csv**:

```
title,description,speaker,location,startTime,endTime,category,track
"Introduction to HF Digital Modes","Learn about FT8...","John Smith K6JS","Main Ballroom","2026-10-16T09:00:00","2026-10-16T10:30:00","Technical","Digital Modes"
```

## 8. Admin Interface

To enable the admin interfaces for Forums Chair and Prizes Chair:

1. Add an `isAdmin` field and `adminRole` field to user documents
2. Create admin pages that check user roles
3. Build forms for adding/editing sessions, prizes, and winners

## 9. Cloud Functions — Welcome and Verification Emails

The `functions/` directory contains Firebase Cloud Functions that handle email delivery
for new user registrations via the **Gmail API** authenticated through `google-auth-library`.

### `sendWelcomeEmail`

The `sendWelcomeEmail` function fires on every new user registration and sends a
welcome email. It is implemented as a **Cloud Functions v2 blocking function**
(`beforeUserCreated` from `firebase-functions/v2/identity`). It runs on Node.js 24
and uses the Compute Engine default service account.

Because it is a v2 blocking function, email delivery failures are caught and logged
without blocking user registration.

### `sendVerificationEmailOnCreate`

The `sendVerificationEmailOnCreate` function fires after every new email/password user
record is created (`auth.user().onCreate`, v1 trigger). It generates a Firebase
one-time email-verification link via the Admin SDK and delivers it through the Gmail API
instead of Firebase's built-in SMTP channel (`noreply@*.firebaseapp.com`), ensuring
reliable delivery to corporate email domains.

> **Why a separate v1 `onCreate` trigger?** `beforeUserCreated` runs _before_ the
> Firebase Auth record exists — `generateEmailVerificationLink()` requires the record to
> already exist, so a post-creation trigger is used.

### `resendVerificationEmail`

The `resendVerificationEmail` HTTPS Callable function lets authenticated users request a
fresh email-verification link from the Profile page. It generates a new link via the
Admin SDK and delivers it through the Gmail API. This replaces the previous direct
`sendEmailVerification()` call from the Firebase client SDK, which sent from
`noreply@*.firebaseapp.com`.

### Prerequisites

1. **Enable the Gmail API** in your Google Cloud project:
   [https://console.cloud.google.com/apis/library/gmail.googleapis.com](https://console.cloud.google.com/apis/library/gmail.googleapis.com)

2. **Create a service account** in IAM & Admin → Service Accounts:
   - Grant it no GCP roles (it only needs Gmail delegation)
   - Download the JSON key file

3. **Enable domain-wide delegation** on the service account:
   - In the service account settings, enable "Enable G Suite domain-wide delegation"
   - Note the OAuth 2 client ID shown

4. **Authorize the scope** in Google Workspace Admin:
   - Go to Security → API Controls → Domain-wide Delegation
   - Add the client ID and scope `https://www.googleapis.com/auth/gmail.send`

5. **The sender address** must be a real Google Workspace / Gmail account that the
   service account is delegating on behalf of.

### Deploy the function

#### 1. Configure the runtime service account

Firebase CLI defaults to the legacy App Engine service account
(`project-id@appspot.gserviceaccount.com`) when it grants Secret Manager IAM
access for blocking functions. That account does **not** exist in projects
that never enabled App Engine, which causes deployment to fail with:

```
Error: … Service account pacific-div@appspot.gserviceaccount.com does not exist.
```

Override this by setting the `FUNCTION_SERVICE_ACCOUNT` deployment parameter to
the **Compute Engine default service account** for your project.

1. Find your **project number** at
   <https://console.cloud.google.com/iam-admin/settings>.
2. Copy `functions/.env.example` to `functions/.env` and substitute your
   project number:

   ```bash
   cp functions/.env.example functions/.env
   # Edit functions/.env:
   #   FUNCTION_SERVICE_ACCOUNT=<PROJECT_NUMBER>-compute@developer.gserviceaccount.com
   ```

   The `functions/.env` file is git-ignored — never commit it.

#### 2. Store secrets and deploy

```bash
# Install dependencies
cd functions && npm install

# Build TypeScript
npm run build

# Store secrets in Firebase Secret Manager (replace values with your own)
firebase functions:secrets:set GMAIL_SERVICE_ACCOUNT_JSON
# Paste the contents of your service-account-key.json when prompted

firebase functions:secrets:set GMAIL_SENDER_EMAIL
# Enter the sender email address (e.g. no-reply@yourdomain.com) when prompted

# Deploy only the functions
firebase deploy --only functions
```

### Local development

```bash
# Run functions tests
cd functions && npm test

# Use the Firebase Emulator Suite for local testing
firebase emulators:start --only functions,auth
```

### How it works

All three email functions (`sendWelcomeEmail`, `sendVerificationEmailOnCreate`, and
`resendVerificationEmail`) use `google-auth-library`'s `JWT` client to impersonate the
sender address via service-account domain-wide delegation, then call
`gmail.users.messages.send` to deliver the email.

Email delivery failures are caught and logged without blocking user registration or
throwing errors to the caller.

## 10. Notifications

### Email Notifications

- Use Firebase Cloud Functions with SendGrid or Mailgun
- Trigger on prizeWinner document creation

### SMS Notifications

- Use Twilio integration in Cloud Functions
- Check user's `smsNotifications` preference

### In-App Notifications

- Use Firestore real-time listeners
- Display notifications when user's callsign/email matches a new prize winner

## 10. Multi-Conference Support

The architecture supports multiple conferences:

- Each conference has a unique ID
- All related data (sessions, maps) reference the conferenceId
- Users can view multiple conferences through a conference selector

## Architecture Notes

- **Timezone Storage**: All times are stored in local time for the conference
  fields timezone (i.e. "Pacific/Los_Angeles") and timezoneNumeric (i.e. "-0700" is PDT) help
- **Offline Support**: Use Firestore offline persistence and Service Workers
- **CSV Export**: Admin interfaces should allow exporting data back to CSV
- **Callsign Verification**: Optional link to qrz.com for callsign lookup
- **Survey Integration**: Use Google Forms iframe or direct link

## Need Help?

Contact webmaster@pacificon.org or pacific-div@mdarc.org for assistance with Firebase setup.
