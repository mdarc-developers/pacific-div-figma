# Firebase Cloud Functions

This directory contains the Firebase Cloud Functions for the Pacific Division Conference Attendee App.

## Functions

| Function                  | Trigger                            | Purpose                                                                            |
| ------------------------- | ---------------------------------- | ---------------------------------------------------------------------------------- |
| `sendWelcomeEmail`        | `beforeUserCreated` (blocking, v2) | Sends a welcome email via the Gmail API when a new Firebase Auth user is created.  |
| `incrementSignupCounter`  | `onDocumentCreated("users/{uid}")` | Increments `stats/signupCounter.count` in Firestore whenever a new user document is created. |

### `sendWelcomeEmail`

A **Cloud Functions v2 blocking function** (`beforeUserCreated`) that fires before every new user record is written to Firebase Auth.

- Sends a branded welcome email to the newly registered user via the **Gmail API**.
- Authenticates using a service account with domain-wide delegation (`google-auth-library` JWT client).
- Never blocks user registration — email delivery failures are caught, logged, and silently ignored.

### `incrementSignupCounter`

A **Firestore trigger** (`onDocumentCreated`) that fires whenever a new document is created in the `users/{uid}` collection.

- Atomically increments `count` in the `stats/signupCounter` Firestore document.
- Self-initializing: creates the counter document on the first signup if it does not exist.
- The counter is displayed in the `AdminStatsBar` component visible to mdarc-developer users.

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

The `sendWelcomeEmail` function reads two secrets at runtime. Provision them once before the first deployment:

```bash
# From the repo root (firebase.json must be present)
# Paste the full contents of your service-account-key.json when prompted
firebase functions:secrets:set GMAIL_SERVICE_ACCOUNT_JSON

# Enter the sender email address (e.g. no-reply@yourdomain.com) when prompted
firebase functions:secrets:set GMAIL_SENDER_EMAIL
```

### 3. Build and deploy

```bash
# Compile TypeScript (from the functions/ directory)
cd functions && npm run build

# Deploy only the Cloud Functions — run from the repo root
firebase deploy --only functions
```

> **Tip:** You can also use the convenience script defined in `package.json`:
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

| Name | Description |
|------|-------------|
| `GMAIL_SERVICE_ACCOUNT_JSON` | Full JSON key file for the Gmail delegation service account |
| `GMAIL_SENDER_EMAIL` | The "From" address (must be the account the service account delegates on behalf of) |
| `FUNCTION_SERVICE_ACCOUNT` | Compute Engine default SA email — set in `functions/.env` (see Prerequisites §6) |

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

---

## Directory structure

```
functions/
├── src/
│   ├── index.ts          # Exported Cloud Function definitions
│   ├── welcomeEmail.ts   # Email content helpers (subject, HTML builder, base64 encoder)
│   └── index.test.ts     # Vitest unit tests
├── .env.example          # Template for required environment variables
├── .gitignore
├── package.json
├── tsconfig.json
└── vitest.config.ts
```
