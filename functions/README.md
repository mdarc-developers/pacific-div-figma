# Cloud Functions — `functions/`

This directory contains Firebase Cloud Functions v2 for the Pacific Division Conference Attendee App.

## Functions

| Function                  | Trigger                           | Purpose                                                                            |
| ------------------------- | --------------------------------- | ---------------------------------------------------------------------------------- |
| `sendWelcomeEmail`        | `beforeUserCreated` (blocking)    | Sends a welcome email via the Gmail API when a new Firebase Auth user is created.  |
| `incrementSignupCounter`  | `onDocumentCreated("users/{uid}")` | Increments `stats/signupCounter.count` in Firestore whenever a new user document is written. |

## Prerequisites

- [Firebase CLI](https://firebase.google.com/docs/cli): `npm install -g firebase-tools`
- Node.js 24 (matches the `"engines"` field in `package.json`)
- A Google Cloud service account with **domain-wide delegation** enabled and the `https://www.googleapis.com/auth/gmail.send` scope granted — this allows the service account to send email on behalf of a specific Google Workspace user (the `GMAIL_SENDER_EMAIL`) (required by `sendWelcomeEmail`)

## Local setup

```bash
# From the functions/ directory
cd functions
npm install
```

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
# Edit .env — set FUNCTION_SERVICE_ACCOUNT to your Compute Engine default SA:
#   {project-number}-compute@developer.gserviceaccount.com
# Find your project number at https://console.cloud.google.com/iam-admin/settings
```

> The `.env` file is git-ignored — never commit it.

## Build

```bash
npm run build          # compile TypeScript → lib/
npm run build:watch    # watch mode for development
```

## Tests

```bash
npm run test           # Vitest unit tests
```

## Store secrets in Firebase Secret Manager

The `sendWelcomeEmail` function reads two secrets at runtime. Provision them once before the first deployment:

```bash
# Store the JSON key file for the Gmail service account
firebase functions:secrets:set GMAIL_SERVICE_ACCOUNT_JSON
# Paste the entire contents of your service-account-key.json when prompted

# Store the sender email address (must match the delegated user)
firebase functions:secrets:set GMAIL_SENDER_EMAIL
# Enter the sender address, e.g. no-reply@yourdomain.com
```

See `FIREBASE_SETUP.md §9` for full Gmail / service-account setup instructions.

## Deploy

Deploy **only** the Cloud Functions (does not affect Hosting or Firestore rules):

```bash
# From the repo root
firebase deploy --only functions
```

Or use the convenience script inside `functions/`:

```bash
cd functions
npm run deploy
```

## View logs

```bash
firebase functions:log
```

Or via the [Google Cloud Console](https://console.cloud.google.com/logs) → filter by the function name.

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
