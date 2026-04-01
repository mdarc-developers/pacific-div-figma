# Firebase Cloud Functions

This directory contains the Firebase Cloud Functions for the Amateur Radio Conference Companion AttendeeApp.

## Functions

| Function                        | Trigger                                                           | Purpose                                                                                                                                           |
| ------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sendWelcomeEmail`              | `beforeUserCreated` (blocking, v2)                                | Sends a welcome email via the Gmail API when a new Firebase Auth user is created.                                                                 |
| `sendVerificationEmailOnCreate` | `auth.user().onCreate` (v1)                                       | Generates a Firebase one-time email-verification link and delivers it via the Gmail API whenever a new email/password user is created.            |
| `resendVerificationEmail`       | HTTPS Callable                                                    | Lets an authenticated user request a fresh email-verification link delivered via the Gmail API (replaces the direct Firebase SDK call).           |
| `sendFeedbackEmail`             | HTTPS Callable                                                    | Forwards app-feedback form submissions to the team via the Gmail API; optionally CCs the submitter.                                               |
| `incrementSignupCounter`        | `onDocumentCreated("users/{uid}")`                                | Increments `stats/signupCounter.count` in Firestore whenever a new user document is created.                                                      |
| `notifyPrizeWinner`             | `onDocumentCreated("prizeWinners/{winnerId}")`                    | Sends SMS via Twilio and email via Gmail API to the attendee whose raffle ticket matches a newly drawn prize winner.                              |
| `incrementAttendeeCounter`      | `onDocumentCreated("conferences/{conferenceId}/attendees/{uid}")` | Increments `conferences/{conferenceId}.attendeeCounter` when a user marks themselves as attending.                                                |
| `decrementAttendeeCounter`      | `onDocumentDeleted("conferences/{conferenceId}/attendees/{uid}")` | Decrements `conferences/{conferenceId}.attendeeCounter` when a user removes their attendance.                                                     |
| `syncPublicProfile`             | `onDocumentWritten("users/{uid}")`                                | Writes or removes the `publicProfiles/{uid}` document whenever a user document changes, exposing only the safe-to-share subset of profile fields. |
| `purgeExpiredUserData`          | Scheduled (`every day 03:00 UTC`)                                 | Removes per-conference user data (bookmarks, votes, notes, etc.) for conferences whose retention window (endDate + 90 days) has passed.           |
| `adminLookupUser`               | HTTPS Callable                                                    | Looks up a Firebase Auth user by email address; requires `user-admin` group membership.                                                           |
| `adminResendVerificationEmail`  | HTTPS Callable                                                    | Admin-initiated resend of the email-verification link to a target user; requires `user-admin` group membership.                                   |

### `sendWelcomeEmail`

A **Cloud Functions v2 blocking function** (`beforeUserCreated`) that fires before every new user record is written to Firebase Auth.

- Sends a branded welcome email to the newly registered user via the **Gmail API**.
- Authenticates using a service account with domain-wide delegation (`google-auth-library` JWT client).
- Never blocks user registration — email delivery failures are caught, logged, and silently ignored.

### `sendVerificationEmailOnCreate`

A **Firebase Auth v1 trigger** (`auth.user().onCreate`) that fires after every new email/password user record is created.

- Generates a Firebase one-time email-verification link via the Admin SDK (`admin.auth().generateEmailVerificationLink()`).
- Delivers the link via the **Gmail API** using the same service-account pathway as `sendWelcomeEmail`.
- Skips users who sign in with Google (their email is already verified by Google).
- Skips users without an email address.
- Email delivery failures are caught and logged without preventing registration.

> **Why a v1 `onCreate` trigger instead of `beforeUserCreated`?**
> `beforeUserCreated` is a blocking function that runs _before_ the Firebase Auth record exists.
> `generateEmailVerificationLink()` requires the Auth record to already exist, so a separate
> post-creation trigger is necessary.

### `resendVerificationEmail`

An **HTTPS Callable** function invoked from the "Send verification" button on the Profile page.

- The caller must be authenticated; sending to any address other than the caller's own is not permitted.
- Generates a fresh Firebase email-verification link and delivers it via the Gmail API.
- Returns `{ success: true }` on success; throws an `HttpsError` on failure.

### `sendFeedbackEmail`

An **HTTPS Callable** function that handles App Feedback form submissions.

- Accepts `{ email?, pageUrl, message, ccSender }` from the client.
- Sends the feedback to the configured team address (`pacific-div@mdarc.org`) via the Gmail API.
- Optionally CCs the submitter when `ccSender` is `true` and a valid email is supplied.

### `incrementSignupCounter`

A **Firestore trigger** (`onDocumentCreated`) that fires whenever a new document is created in the `users/{uid}` collection.

- Atomically increments `count` in the `stats/signupCounter` Firestore document.
- Self-initializing: creates the counter document on the first signup if it does not exist.
- The counter is displayed in the `AdminStatsBar` component visible to mdarc-developer users.

### `incrementAttendeeCounter`

A **Firestore trigger** (`onDocumentCreated`) that fires whenever a new document is created in the `conferences/{conferenceId}/attendees/{uid}` sub-collection.

- Atomically increments the `attendeeCounter` field on the parent `conferences/{conferenceId}` document.
- Self-initializing: creates the field on the first attendee if it does not exist.

### `decrementAttendeeCounter`

A **Firestore trigger** (`onDocumentDeleted`) that fires whenever a document is deleted from the `conferences/{conferenceId}/attendees/{uid}` sub-collection.

- Atomically decrements the `attendeeCounter` field on the parent `conferences/{conferenceId}` document.

### `notifyPrizeWinner`

A **Firestore trigger** (`onDocumentCreated`) that fires whenever a new document is created in the `prizeWinners/{winnerId}` collection.

- Queries all user documents to find the attendee whose `raffleTickets.{conferenceId}` array contains the winning ticket number.
- Sends an **SMS** via Twilio if the matched user has `smsNotifications: true` and a `phoneNumber` set in their profile.
- Sends an **email** via the Gmail API if the matched user has an email address and Gmail secrets are configured.
- Updates the winner document with a `notifiedAt` timestamp after all notifications are dispatched.

### `syncPublicProfile`

A **Firestore trigger** (`onDocumentWritten`) that fires whenever a `users/{uid}` document is created, updated, or deleted.

- If the document is deleted, or if the user has set `profileVisible: false`, the corresponding `publicProfiles/{uid}` document is removed.
- Otherwise, writes a safe-to-share subset of the user document to `publicProfiles/{uid}`: `displayName`, `callsign`, `displayProfile`, `exhibitors`, and `speakerSessions`.
- Sensitive fields (`email`, `groups`, `prizesDonated`, etc.) are intentionally excluded.

### `purgeExpiredUserData`

A **scheduled function** that runs daily at 03:00 UTC.

- Reads the `conferences` Firestore collection to determine the `endDate` of each conference.
- Identifies conferences whose retention window (endDate + 90 days) has passed.
- For each affected user document, removes per-conference data keys from: `bookmarks`, `prevBookmarks`, `exhibitorBookmarks`, `prevExhibitorBookmarks`, `notes`, `exhibitorNotes`, `sessionVotes`, and `exhibitorVotes`.
- Writes an `auditLog` subcollection entry on each purged user document.

### `adminLookupUser`

An **HTTPS Callable** function that looks up a Firebase Auth user by email address.

- The caller must be authenticated and a member of the `groups/user-admin` Firestore document.
- Returns `{ uid, email, displayName, emailVerified, creationTime }`.
- Used by the `UserAdminPage` for user lookup and support workflows.

### `adminResendVerificationEmail`

An **HTTPS Callable** function that lets a user-admin resend the email-verification link to a target user on their behalf.

- The caller must be authenticated and a member of the `groups/user-admin` Firestore document.
- Generates a fresh Firebase email-verification link and delivers it via the Gmail API.
- Used by the `UserAdminPage` when supporting users whose verification email was not received.

---

## Prerequisites

Before deploying, complete the following one-time setup.

### 1. Install the Firebase CLI

```bash
npm install -g firebase-tools
```

Requires Node.js 24 (matches the `"engines"` field in `functions/package.json`).

### 2. Enable the Gmail API

Enable the Gmail API in your Google Cloud project:
<https://console.cloud.google.com/apis/library/gmail.googleapis.com>

### 3. Create a service account for Gmail delegation

1. Go to **IAM & Admin → Service Accounts** in the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new service account. Grant it **no GCP roles** (it only needs Gmail delegation).
3. Download the JSON key file — you will need its contents when setting secrets below.

### 4. Enable domain-wide delegation

This allows the service account to send email on behalf of a specific Google Workspace user (the `GMAIL_SENDER_EMAIL`).

1. Open the service account you just created.
2. Click **Edit** → enable **"Enable Google Workspace domain-wide delegation"**.
3. Note the **OAuth 2 client ID** shown.

### 5. Authorize the Gmail scope

1. Go to **Google Workspace Admin Console → Security → API Controls → Domain-wide Delegation**.
2. Add the client ID from step 4 and authorize the scope:
   ```
   https://www.googleapis.com/auth/gmail.send
   ```

### 6. Configure the runtime service account

Firebase CLI defaults to the legacy App Engine service account
(`project-id@appspot.gserviceaccount.com`) when granting Secret Manager IAM access for
blocking functions. That account does **not** exist in projects that never enabled App
Engine, which causes deployment to fail with:

```
Error: … Service account pacific-div@appspot.gserviceaccount.com does not exist.
```

Override this by pointing Firebase at the **Compute Engine default service account**:

1. Find your **project number** at <https://console.cloud.google.com/iam-admin/settings>.
2. Copy `.env.example` to `.env` in this directory and substitute your project number:

   ```bash
   cp .env.example .env
   # Edit functions/.env:
   #   FUNCTION_SERVICE_ACCOUNT=<PROJECT_NUMBER>-compute@developer.gserviceaccount.com
   ```

   `functions/.env` is git-ignored — never commit it.

---

## Deployment

### 1. Install dependencies

```bash
# From the functions/ directory
cd functions
npm install
```

### 2. Store secrets in Firebase Secret Manager

The Gmail functions (`sendWelcomeEmail`, `sendVerificationEmailOnCreate`, `resendVerificationEmail`, `sendFeedbackEmail`, and `adminResendVerificationEmail`) all share two secrets. `notifyPrizeWinner` additionally requires three Twilio secrets. Provision them once before the first deployment:

```bash
# From the repo root (firebase.json must be present)
# Paste the full contents of your service-account-key.json when prompted
firebase functions:secrets:set GMAIL_SERVICE_ACCOUNT_JSON

# Enter the sender email address (e.g. no-reply@yourdomain.com) when prompted
firebase functions:secrets:set GMAIL_SENDER_EMAIL

# Twilio credentials for SMS prize winner notifications (notifyPrizeWinner)
# Account SID and Auth Token: https://console.twilio.com → Account Dashboard
firebase functions:secrets:set TWILIO_ACCOUNT_SID
firebase functions:secrets:set TWILIO_AUTH_TOKEN

# Twilio "From" phone number in E.164 format (e.g. +12125551234)
# Must be a Twilio-purchased or verified number with SMS capability
firebase functions:secrets:set TWILIO_PHONE_NUMBER
```

### 3. Build and deploy

```bash
# Compile TypeScript (from the functions/ directory)
cd functions && npm run build

# Deploy only the Cloud Functions — run from the repo root
firebase deploy --only functions
```

> **Tip:** You can also use the convenience script defined in `package.json`:
>
> ```bash
> npm run deploy
> ```

See `FIREBASE_SETUP.md §9` for full Gmail / service-account setup instructions.

---

## Local Development

### Run unit tests

```bash
# From the functions/ directory
cd functions
npm test
```

### Use the Firebase Emulator Suite

```bash
# From the repo root (firebase.json must be present)
firebase emulators:start --only functions,auth
```

### Watch mode (auto-recompile on save)

```bash
# From the functions/ directory
cd functions && npm run build:watch
```

### View logs (deployed functions)

```bash
# From the repo root
firebase functions:log
```

Or via the [Google Cloud Console](https://console.cloud.google.com/logs) → filter by the function name.

---

## How It Works

### `sendWelcomeEmail`

```
New user registers
       │
       ▼
beforeUserCreated fires (v2 blocking trigger)
       │
       ├─ No email address? → skip
       ├─ Secrets missing?  → log error, skip
       ├─ JSON parse error? → log error, skip
       │
       ▼
JWT auth via google-auth-library
(service account impersonates GMAIL_SENDER_EMAIL)
       │
       ▼
gmail.users.messages.send()
       │
       ├─ Success → log info, user registration continues
       └─ Failure → log error, user registration still continues
```

Configuration is injected at runtime from Firebase Secret Manager:

| Name                         | Description                                                                         |
| ---------------------------- | ----------------------------------------------------------------------------------- |
| `GMAIL_SERVICE_ACCOUNT_JSON` | Full JSON key file for the Gmail delegation service account                         |
| `GMAIL_SENDER_EMAIL`         | The "From" address (must be the account the service account delegates on behalf of) |
| `FUNCTION_SERVICE_ACCOUNT`   | Compute Engine default SA email — set in `functions/.env` (see Prerequisites §6)    |

### `incrementSignupCounter`

```
New document created in users/{uid}
       │
       ▼
onDocumentCreated fires (Firestore trigger)
       │
       ▼
stats/signupCounter.count += 1   (FieldValue.increment, merge:true)
```

No secrets or environment variables are required for this function.

### `incrementAttendeeCounter`

```
New document created in conferences/{conferenceId}/attendees/{uid}
       │
       ▼
onDocumentCreated fires (Firestore trigger)
       │
       ▼
conferences/{conferenceId}.attendeeCounter += 1   (FieldValue.increment, merge:true)
```

No secrets or environment variables are required for this function.

### `decrementAttendeeCounter`

```
Document deleted from conferences/{conferenceId}/attendees/{uid}
       │
       ▼
onDocumentDeleted fires (Firestore trigger)
       │
       ▼
conferences/{conferenceId}.attendeeCounter -= 1   (FieldValue.increment, merge:true)
```

No secrets or environment variables are required for this function.

### `notifyPrizeWinner`

```
New document created in prizeWinners/{winnerId}
       │
       ▼
onDocumentCreated fires (Firestore trigger)
       │
       ├─ No winningTicket? → warn + exit
       │
       ▼
Fetch prize name from prizes/{prizeId}
       │
       ▼
Query all users — find those whose raffleTickets.{conferenceId} contains winningTicket
       │
       ├─ smsNotifications=true && phoneNumber set?
       │      └─ Twilio client.messages.create()
       │           ├─ Success → log info
       │           └─ Failure → log error (notifications continue)
       │
       ├─ email set?
       │      └─ Gmail API gmail.users.messages.send()
       │           ├─ Success → log info
       │           └─ Failure → log error (notifications continue)
       │
       ▼
prizeWinners/{winnerId}.notifiedAt = ISO timestamp
```

Required Firebase Secrets:

| Name                         | Description                                                                                                                              |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `TWILIO_ACCOUNT_SID`         | Twilio Account SID (starts with "AC…") — Account Dashboard                                                                               |
| `TWILIO_AUTH_TOKEN`          | Twilio Auth Token — Account Dashboard                                                                                                    |
| `TWILIO_PHONE_NUMBER`        | Twilio "From" number in E.164 format (e.g. `+12125551234`)                                                                               |
| `GMAIL_SERVICE_ACCOUNT_JSON` | Full JSON key file for the Gmail delegation service account (shared with `sendWelcomeEmail`; skip if email notifications are not needed) |
| `GMAIL_SENDER_EMAIL`         | The "From" address for prize winner emails (shared with `sendWelcomeEmail`; skip if email notifications are not needed)                  |

### `sendVerificationEmailOnCreate`

```
New email/password user created in Firebase Auth
       │
       ▼
auth.user().onCreate fires (v1 trigger)
       │
       ├─ No email? → skip
       ├─ Email already verified (Google sign-in)? → skip
       ├─ Secrets missing? → log error, skip
       │
       ▼
admin.auth().generateEmailVerificationLink(email)
       │
       ▼
JWT auth via google-auth-library
(service account impersonates GMAIL_SENDER_EMAIL)
       │
       ▼
gmail.users.messages.send()
       │
       ├─ Success → log info
       └─ Failure → log error (registration unaffected)
```

Required Firebase Secrets (same as `sendWelcomeEmail`):

| Name                         | Description                                                                         |
| ---------------------------- | ----------------------------------------------------------------------------------- |
| `GMAIL_SERVICE_ACCOUNT_JSON` | Full JSON key file for the Gmail delegation service account                         |
| `GMAIL_SENDER_EMAIL`         | The "From" address (must be the account the service account delegates on behalf of) |

### `resendVerificationEmail`

```
Authenticated user clicks "Send verification" on Profile page
       │
       ▼
resendVerificationEmail callable invoked
       │
       ├─ Not authenticated? → throw unauthenticated
       ├─ Email already verified? → throw failed-precondition
       ├─ Secrets missing? → log error, throw internal
       │
       ▼
admin.auth().generateEmailVerificationLink(email)
       │
       ▼
gmail.users.messages.send()
       │
       ├─ Success → return { success: true }
       └─ Failure → throw internal
```

Required Firebase Secrets (same as `sendWelcomeEmail`):

| Name                         | Description                                                                         |
| ---------------------------- | ----------------------------------------------------------------------------------- |
| `GMAIL_SERVICE_ACCOUNT_JSON` | Full JSON key file for the Gmail delegation service account                         |
| `GMAIL_SENDER_EMAIL`         | The "From" address (must be the account the service account delegates on behalf of) |

### `sendFeedbackEmail`

```
User submits feedback form
       │
       ▼
sendFeedbackEmail callable invoked
       │
       ├─ Missing pageUrl or message? → throw invalid-argument
       ├─ Secrets missing? → log error, throw internal
       │
       ▼
Build HTML email (pageUrl, message, optional submitter email)
       │
       ▼
gmail.users.messages.send() → pacific-div@mdarc.org
       │                        (+ optional Cc to submitter)
       ├─ Success → return { success: true }
       └─ Failure → throw internal
```

Required Firebase Secrets (same as `sendWelcomeEmail`):

| Name                         | Description                                                                         |
| ---------------------------- | ----------------------------------------------------------------------------------- |
| `GMAIL_SERVICE_ACCOUNT_JSON` | Full JSON key file for the Gmail delegation service account                         |
| `GMAIL_SENDER_EMAIL`         | The "From" address (must be the account the service account delegates on behalf of) |

### `syncPublicProfile`

```
users/{uid} document created, updated, or deleted
       │
       ▼
onDocumentWritten fires (Firestore trigger)
       │
       ├─ Document deleted? → delete publicProfiles/{uid}
       ├─ profileVisible !== true? → delete publicProfiles/{uid}
       │
       ▼
Extract safe subset: displayName, callsign, displayProfile,
                     exhibitors, speakerSessions
       │
       ▼
publicProfiles/{uid}.set(safeSubset)
```

No secrets or environment variables are required for this function.

### `purgeExpiredUserData`

```
Daily schedule fires at 03:00 UTC
       │
       ▼
Load endDate from all conferences/* documents
       │
       ▼
Identify conferences where endDate + 90 days < now
       │
       ├─ None expired? → log info, exit
       │
       ▼
For each users/{uid} document (paginated, 100 at a time):
       │
       ├─ Remove expired conferenceId keys from:
       │    bookmarks, prevBookmarks, exhibitorBookmarks,
       │    prevExhibitorBookmarks, notes, exhibitorNotes,
       │    sessionVotes, exhibitorVotes
       │
       └─ Write auditLog entry: { action, timestamp, metadata }
```

No secrets or environment variables are required for this function.

### `adminLookupUser` and `adminResendVerificationEmail`

```
UserAdminPage calls adminLookupUser({ targetEmail })
       │
       ├─ Caller not authenticated? → throw unauthenticated
       ├─ Caller not in groups/user-admin? → throw permission-denied
       ├─ targetEmail missing? → throw invalid-argument
       │
       ▼
admin.auth().getUserByEmail(targetEmail)
       │
       └─ Returns { uid, email, displayName, emailVerified, creationTime }

UserAdminPage calls adminResendVerificationEmail({ targetUid })
       │
       ├─ Caller not authenticated? → throw unauthenticated
       ├─ Caller not in groups/user-admin? → throw permission-denied
       ├─ targetUid missing? → throw invalid-argument
       │
       ▼
admin.auth().getUser(targetUid) → generateEmailVerificationLink
       │
       ▼
gmail.users.messages.send()
       │
       ├─ Success → return { success: true }
       └─ Failure → throw internal
```

`adminResendVerificationEmail` requires the same Gmail secrets as `sendWelcomeEmail`.

---

## Directory structure

```
functions/
├── src/
│   ├── index.ts                    # Cloud Function definitions (sendWelcomeEmail,
│   │                               #   sendVerificationEmailOnCreate, resendVerificationEmail,
│   │                               #   adminLookupUser, adminResendVerificationEmail,
│   │                               #   incrementSignupCounter, syncPublicProfile,
│   │                               #   incrementAttendeeCounter, decrementAttendeeCounter)
│   ├── welcomeEmail.ts             # Welcome email content helpers (subject, HTML, base64 encoder)
│   ├── verificationEmail.ts        # Verification email content helpers (subject, HTML builder)
│   ├── prizeNotification.ts        # notifyPrizeWinner trigger (SMS via Twilio + email via Gmail API)
│   ├── feedbackEmail.ts            # sendFeedbackEmail callable (forwards feedback form submissions)
│   ├── feedbackEmailContent.ts     # Feedback email HTML template
│   ├── dataRetention.ts            # purgeExpiredUserData scheduled function
│   ├── index.test.ts               # Vitest unit tests for functions in index.ts
│   ├── verificationEmail.test.ts   # Vitest unit tests for verificationEmail.ts
│   ├── prizeNotification.test.ts   # Vitest unit tests for prizeNotification.ts
│   ├── feedbackEmail.test.ts       # Vitest unit tests for feedbackEmail.ts
│   └── dataRetention.test.ts       # Vitest unit tests for dataRetention.ts
├── .env.example          # Template for required environment variables
├── .gitignore
├── package.json
├── tsconfig.json
└── vitest.config.ts
```
