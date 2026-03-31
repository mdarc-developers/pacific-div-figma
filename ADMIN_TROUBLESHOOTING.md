# Admin Troubleshooting Guide

This guide maps the most common support questions from app users to the specific
console pages and log queries that help you investigate them.

The Firebase project ID for this app is **`pacific-div`**.

---

## Console Quick-Links

| Console | URL |
|---------|-----|
| Firebase Console — project home | <https://console.firebase.google.com/project/pacific-div/overview> |
| Firebase Authentication — Users | <https://console.firebase.google.com/project/pacific-div/authentication/users> |
| Firestore — Database browser | <https://console.firebase.google.com/project/pacific-div/firestore/databases/-default-/data> |
| Cloud Functions — Dashboard | <https://console.firebase.google.com/project/pacific-div/functions> |
| Cloud Functions — Logs (Firebase view) | <https://console.firebase.google.com/project/pacific-div/functions/logs> |
| Google Cloud Logging | <https://console.cloud.google.com/logs/query?project=pacific-div> |
| Google Cloud Functions (GCP view) | <https://console.cloud.google.com/functions/list?project=pacific-div> |
| Google Cloud Secret Manager | <https://console.cloud.google.com/security/secret-manager?project=pacific-div> |
| Google Cloud IAM | <https://console.cloud.google.com/iam-admin/iam?project=pacific-div> |

---

## 1. Firebase Console Pages

### 1.1 Authentication → Users

**URL:** <https://console.firebase.google.com/project/pacific-div/authentication/users>

This is the primary list of every registered account. From here you can:

- **Search** by email address or UID using the filter box.
- **Verify** whether a user's email is marked as verified (green check icon).
- **Copy a UID** — needed to locate the user's Firestore document and group
  membership.
- **Disable or delete** an account.
- **Send a password-reset email** using the three-dot menu on any user row.

> **Note:** The in-app *User Management* page (`/admin/users`) mirrors much of
> this functionality for `user-admin` members without requiring Firebase Console
> access. Use the Firebase Console when deeper inspection or bulk operations are
> needed.

### 1.2 Authentication → Settings

**URL:** <https://console.firebase.google.com/project/pacific-div/authentication/settings>

Contains:

- **Authorized domains** — must include `pacific-div.web.app` and
  `pacific-div.firebaseapp.com`. If users see "auth/unauthorized-domain" errors
  add the missing domain here.
- **Sign-in method** — verify that Email/Password and Google are both enabled.
- **Email templates** — customize verification and password-reset emails.

### 1.3 Firestore — `groups` Collection

**URL:** <https://console.firebase.google.com/project/pacific-div/firestore/databases/-default-/data/~2Fgroups>

The app uses three group documents to control admin access:

| Document | Who it grants access to |
|----------|-------------------------|
| `groups/mdarc-developers` | Full developer / super-admin. Can read all user documents and audit logs; bypasses most Firestore rules. |
| `groups/user-admin` | Can look up any user by email via the in-app User Management page (`/admin/users`) and read all audit log entries. |
| `groups/prize-admin` | Can create and delete prize-winner entries and trigger winner notifications. |

Each document uses the same structure:

```json
{
  "members": {
    "<UID_1>": true,
    "<UID_2>": true
  }
}
```

**To add a user to a group:**

1. Find the user's UID in **Authentication → Users**.
2. Open the relevant group document in Firestore.
3. Expand the `members` map and add a new field: key = UID, value = `true`
   (boolean).

**To remove a user from a group:** delete their UID key from the `members` map.

> Groups are **read-only from the client** — Firestore rules deny all writes to
> the `groups` collection from the app. Changes must be made via the Firebase
> Console or the Admin SDK.

### 1.4 Firestore — `users` Collection

**URL:** <https://console.firebase.google.com/project/pacific-div/firestore/databases/-default-/data/~2Fusers>

Each document ID is a Firebase Auth UID. Key fields:

| Field | Purpose |
|-------|---------|
| `email` | The address the account was registered with. |
| `callsign` | Ham radio callsign (user-provided). |
| `displayName` | Display name shown in the attendees list. |
| `displayProfile` | `true` if the user has opted in to the public attendees list. |
| `emailVerified` | Mirrors the Auth record. |
| `attendance` | Array of `conferenceId` strings for registered conferences. |
| `raffleTickets` | Map of `{conferenceId: ticketNumber}`. |
| `notificationsEnabled`, `smsNotifications`, `cloudNotifications` | Notification preferences. |
| `fcmTokens` | Array of FCM push-notification device tokens. |

**Subcollection `users/{uid}/auditLog`:**  
Immutable audit trail written by the app and Cloud Functions. Entries record
actions such as data exports, account deletions, and admin lookups. The in-app
User Management page displays these entries when you search for a user.

### 1.5 Firestore — `stats` Collection

**URL:** <https://console.firebase.google.com/project/pacific-div/firestore/databases/-default-/data/~2Fstats>

- `stats/signupCounter` — running total of registered users (publicly readable).
  The `AdminStatsBar` component (visible to `mdarc-developers`) reads this
  value.

### 1.6 Cloud Functions — Dashboard

**URL:** <https://console.firebase.google.com/project/pacific-div/functions>

Lists all deployed functions with their trigger type and most-recent invocation
status. A red error indicator here usually means a deployment or permissions
issue rather than a per-user problem.

### 1.7 Cloud Functions — Logs (Firebase view)

**URL:** <https://console.firebase.google.com/project/pacific-div/functions/logs>

A quick tail of recent function executions. Useful for verifying that
`sendWelcomeEmail` and `sendVerificationEmailOnCreate` fired after a new
sign-up. For structured queries, use Google Cloud Logging instead (§2.1).

---

## 2. Google Cloud Console Pages

### 2.1 Cloud Logging — Log Explorer

**URL:** <https://console.cloud.google.com/logs/query?project=pacific-div>

The most powerful tool for investigating function failures. All Cloud Functions
write structured logs that are queryable here.

#### Useful log queries

Paste any of these into the **Log Explorer** query box:

**All Cloud Function executions (last 24 hours):**
```
resource.type="cloud_run_revision"
```

**Logs for a specific function by name:**
```
resource.type="cloud_run_revision"
resource.labels.service_name="sendwelcomeemail"
```

> **Cloud Logging service name format:** Firebase Functions v2 are deployed as
> Cloud Run services. Cloud Run converts the exported function name to
> **all-lowercase** for the `service_name` label (e.g. `sendWelcomeEmail` →
> `sendwelcomeemail`). Use the lowercase form in `resource.labels.service_name`
> queries. The table below maps each function's export name to its log label:
>
> | Function export name | Cloud Logging `service_name` |
> |----------------------|------------------------------|
> | `sendWelcomeEmail` | `sendwelcomeemail` |
> | `sendVerificationEmailOnCreate` | `sendverificationemailoncreate` |
> | `resendVerificationEmail` | `resendverificationemail` |
> | `adminLookupUser` | `adminlookupuser` |
> | `adminResendVerificationEmail` | `adminresendverificationemail` |
> | `incrementSignupCounter` | `incrementsignupcounter` |
> | `incrementAttendeeCounter` | `incrementattendeecounter` |
> | `decrementAttendeeCounter` | `decrementattendeecounter` |
> | `syncPublicProfile` | `syncpublicprofile` |
> | `purgeExpiredUserData` | `purgeexpireduserdata` |
> | `notifyPrizeWinner` | `notifyprizewinneronwrite` |
> | `sendFeedbackEmail` | `sendFeedbackEmail` → `sendfeedbackemail` |

**All ERROR-level logs across functions:**
```
resource.type="cloud_run_revision"
severity>=ERROR
```

**Logs mentioning a specific user UID** (replace `<UID>` with the actual UID
found via Authentication → Users or the in-app User Management page):
```
resource.type="cloud_run_revision"
("<UID>")
```

**Welcome or verification email failures for a specific email address:**
```
resource.type="cloud_run_revision"
("sendWelcomeEmail" OR "sendVerificationEmailOnCreate")
("user@example.com")
```

**Prize winner notification failures:**
```
resource.type="cloud_run_revision"
resource.labels.service_name="notifyprizewinneronwrite"
severity>=ERROR
```

**Feedback email failures:**
```
resource.type="cloud_run_revision"
resource.labels.service_name="sendfeedbackemail"
severity>=ERROR
```

> **Tip:** Use the **time range** selector (top right of Log Explorer) to narrow
> results. The default is the last hour; extend to "Last 7 days" when
> investigating delayed reports.

### 2.2 Cloud Functions (GCP view)

**URL:** <https://console.cloud.google.com/functions/list?project=pacific-div>

Shows per-function invocation counts, error rates, and 99th-percentile latency
charts. Useful for confirming a function is being called at all, and for spotting
systematic failures (e.g. a spike in errors after a code deployment).

Click any function name → **Logs** tab for a pre-filtered view of that
function's log stream (equivalent to the Cloud Logging query above but scoped
automatically).

### 2.3 Secret Manager

**URL:** <https://console.cloud.google.com/security/secret-manager?project=pacific-div>

Stores the secrets consumed by Cloud Functions:

| Secret name | Used by |
|-------------|---------|
| `GMAIL_SERVICE_ACCOUNT_JSON` | `sendWelcomeEmail`, `sendVerificationEmailOnCreate`, `resendVerificationEmail`, `adminResendVerificationEmail`, `sendFeedbackEmail` |
| `GMAIL_SENDER_EMAIL` | Same email functions |
| `TWILIO_ACCOUNT_SID` | `notifyPrizeWinner` (SMS) |
| `TWILIO_AUTH_TOKEN` | `notifyPrizeWinner` (SMS) |
| `TWILIO_PHONE_NUMBER` | `notifyPrizeWinner` (SMS) |

If emails or SMS messages are silently failing, verify that the latest secret
version is **enabled** (not disabled or destroyed) and that the Cloud Functions
service account has the **Secret Manager Secret Accessor** IAM role.

### 2.4 IAM & Admin

**URL:** <https://console.cloud.google.com/iam-admin/iam?project=pacific-div>

Confirm that the Compute Engine default service account
(`<PROJECT_NUMBER>-compute@developer.gserviceaccount.com`) has:

- **Secret Manager Secret Accessor** — required to read `GMAIL_*` and
  `TWILIO_*` secrets.
- **Firebase Authentication Admin** (granted automatically) — required to
  generate email-verification links.

---

## 3. Common Support Scenarios

### 3.1 "I never received my verification email"

1. **Firebase Console → Authentication → Users:** find the user by email and
   check the *Email verified* column. If it already shows a check mark,
   verification succeeded and the user just needs to refresh/re-sign-in.
2. **In-app User Management (`/admin/users`):** look up the user by email. If
   `emailVerified = No`, click **Resend Verification Email** — this calls the
   `adminResendVerificationEmail` Cloud Function which delivers via Gmail rather
   than Firebase's default SMTP.
3. **Cloud Logging** — query for `sendVerificationEmailOnCreate` around the
   user's registration time to check for delivery errors:
   ```
   resource.type="cloud_run_revision"
   resource.labels.service_name="sendverificationemailoncreate"
   ("user@example.com")
   ```
4. If the Gmail API returned an error, check **Secret Manager** (§2.3) to
   ensure `GMAIL_SERVICE_ACCOUNT_JSON` and `GMAIL_SENDER_EMAIL` are current.

### 3.2 "I can't sign in — it says my email is not verified"

Same steps as §3.1. After resending the verification email, ask the user to:
1. Check their spam/junk folder.
2. Click the link within 72 hours (Firebase verification links expire).
3. Sign out of the app and sign back in after clicking the link.

### 3.3 "The admin page says I don't have permission"

The in-app admin pages require group membership. The error message identifies
which group is missing.

| Admin page | Required group document |
|------------|------------------------|
| `/admin/users` | `groups/user-admin` |
| `/admin/prizes` | `groups/prize-admin` |
| `/admin/exhibitors` | `groups/mdarc-developers` (no separate group yet) |
| `/admin/sessions` | `groups/mdarc-developers` (no separate group yet) |

**To grant access:**

1. Obtain the user's UID from **Authentication → Users**.
2. Open the corresponding group document in **Firestore → groups**.
3. Add a boolean field `members.<UID>` = `true`.

### 3.4 "My account doesn't appear in the Attendees list"

The attendees list shows users who have:
1. Registered for the conference (created a document in
   `conferences/{conferenceId}/attendees/{uid}`), **and**
2. Set `displayProfile = true` in their `users/{uid}` Firestore document.

**To diagnose:**
- In **Firestore → `users/{uid}`**: check `displayProfile` and `attendance`.
- In **Firestore → `conferences/{conferenceId}/attendees`**: search for the
  user's UID to confirm conference registration.

### 3.5 "I didn't receive my prize winner notification"

1. **Firestore → `prizeWinners`**: confirm the winner document exists and
   contains the correct `winnerEmail` and `winnerCallsign`.
2. **Cloud Logging** — check for errors from the prize notification function:
   ```
   resource.type="cloud_run_revision"
   resource.labels.service_name="notifyprizewinneronwrite"
   severity>=ERROR
   ```
3. Verify Twilio secrets are current in **Secret Manager** (§2.3).
4. Confirm the user's `notificationsEnabled` and `smsNotifications` fields in
   **Firestore → `users/{uid}`** are set as expected.

### 3.6 "I can't find the user with a partial email or callsign"

The in-app User Management page searches by **exact email address only** (the
`adminLookupUser` Cloud Function calls Firebase Auth's
`getUserByEmail()` internally).

For partial-match searches use **Firebase Console → Authentication → Users**,
which supports substring search in the UI. Alternatively:
- Search **Firestore → `users`** by callsign field using the filter panel
  (click the **Filter** icon, choose field = `callsign`, operator = `==`,
  value = the callsign).

### 3.7 Cloud Functions are not firing at all

1. **Firebase Console → Functions** (§1.6): confirm the functions are
   deployed and show a recent *Last deployed* timestamp.
2. **Google Cloud Functions** (§2.2): check per-function invocation counts.
   Zero invocations after a trigger event indicates a deployment or configuration
   problem.
3. **Cloud Logging → ALL errors** (§2.1) across a wide time window can surface
   cold-start failures or service-account permission denials.
4. Confirm the Compute Engine service account has the required IAM roles (§2.4).

### 3.8 "I accidentally deleted my account — can it be recovered?"

Firebase Auth account deletions are **irreversible**. However:
- The user's Firestore `users/{uid}` document may still exist if the
  `purgeExpiredUserData` function has not yet run.
- The audit log (`users/{uid}/auditLog`) is preserved until the data-retention
  purge.
- The user must register again with the same email address. After re-registration,
  an `mdarc-developer` can merge any recoverable data manually.

---

## 4. Deployed Cloud Functions Reference

| Function name | Trigger | What it does |
|---------------|---------|--------------|
| `sendWelcomeEmail` | `beforeUserCreated` (v2 blocking) | Sends a welcome email via Gmail API. Non-fatal if email fails. |
| `sendVerificationEmailOnCreate` | `auth.user().onCreate` (v1) | Generates and sends an email-verification link via Gmail API. |
| `resendVerificationEmail` | HTTPS Callable | Lets a signed-in user request a new verification email. |
| `adminLookupUser` | HTTPS Callable | Returns Auth record for an email address. Requires `user-admin` group. |
| `adminResendVerificationEmail` | HTTPS Callable | Sends verification email to another user. Requires `user-admin` group. |
| `incrementSignupCounter` | Firestore `users/{uid}` created | Increments `stats/signupCounter`. |
| `incrementAttendeeCounter` | Firestore `conferences/{id}/attendees/{uid}` created | Increments conference attendee count. |
| `decrementAttendeeCounter` | Firestore `conferences/{id}/attendees/{uid}` deleted | Decrements conference attendee count. |
| `syncPublicProfile` | Firestore `users/{uid}` written/deleted | Keeps `publicProfiles/{uid}` in sync (strips sensitive fields). |
| `purgeExpiredUserData` | Scheduled (daily) | Removes raffle-ticket and attendance data older than the retention window. |
| `notifyPrizeWinner` | Firestore `prizeWinners/{id}` created | Sends SMS (Twilio) and email notification to the prize winner. |
| `sendFeedbackEmail` | HTTPS Callable | Forwards user feedback form submissions via Gmail API. |

---

## 5. Key Firestore Paths at a Glance

| Path | Purpose |
|------|---------|
| `users/{uid}` | Per-user settings, preferences, and profile fields. |
| `users/{uid}/auditLog/{entryId}` | Immutable audit trail for the account. |
| `groups/mdarc-developers` | Super-admin group membership map. |
| `groups/user-admin` | User-admin group membership map. |
| `groups/prize-admin` | Prize-admin group membership map. |
| `conferences/{conferenceId}/attendees/{uid}` | Conference registration record. |
| `publicProfiles/{uid}` | Publicly visible subset of the user profile (no email). |
| `prizeWinners/{winnerId}` | Prize-winner records with contact info and notification status. |
| `stats/signupCounter` | Running total of registered users. |
| `stats/…` (other documents) | mdarc-developers-only stats. |

---

## Need Help?

- **App issues:** Contact webmaster@pacificon.org or pacific-div@mdarc.org.
- **Firebase / GCP access:** Request access from an existing `mdarc-developers`
  group member.
