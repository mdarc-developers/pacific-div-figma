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
4. Optionally enable "Google" sign-in for easier authentication

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

Copy `.env.example` to `.env` and fill in the six values from your Firebase config:

```
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

Never commit `.env` — it is already listed in `.gitignore`.

### GitHub Actions (CI/CD)

The build step reads the same six variables from repository secrets so that
the production and PR-preview bundles contain the correct Firebase config.

1. In your GitHub repository go to **Settings → Secrets and variables → Actions**
2. Add each of the following **Repository secrets** with its value from the Firebase Console:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

Without these secrets the CI build will abort with a clear error message before
Firebase is initialized, instead of producing a silent white-screen failure.

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

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to all conferences, sessions, and maps
    match /conferences/{conferenceId} {
      allow read: if true;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }

    match /sessions/{sessionId} {
      allow read: if true;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }

    match /maps/{mapId} {
      allow read: if true;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }

    // Users can read and write their own profile
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Public read for prizes
    match /prizes/{prizeId} {
      allow read: if true;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }

    // Prize winners can only see their own wins
    match /prizeWinners/{winnerId} {
      allow read: if request.auth != null &&
        (resource.data.winnerEmail == request.auth.token.email ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true);
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }

    // Messages
    match /messages/{messageId} {
      allow read: if resource.data.isPublic == true ||
        (request.auth != null &&
         (resource.data.from == request.auth.uid || resource.data.to == request.auth.uid));
      allow create: if request.auth != null;
      allow update: if request.auth != null && resource.data.from == request.auth.uid;
      allow delete: if request.auth != null && resource.data.from == request.auth.uid;
    }
  }
}
```

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

## 9. Notifications

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
