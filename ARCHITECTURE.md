# Amateur Radio Conference Attendee App — Technical Architecture

**Purpose of this document:** Provide a complete, self-contained technical reference so that AI models and developers can understand the full stack, conventions, data flow, and planned roadmap without needing to read every source file.

---

## 1. Project Identity & URLs

| Item                | Value                                                                       |
| ------------------- | --------------------------------------------------------------------------- |
| Figma source        | https://www.figma.com/design/fAJt1K7Tm5xlgtypyfRTq5/Attendee-Conference-App |
| URL                 | https://pacific-div.web.app                                                 |
| Conference websites | https://www.pacificon.org , Hamcation.com , Hamvention.org , Hamfest.org    |
| Contact             | webmaster@pacificon.org                                                     |
| Firebase project ID | `pacific-div`                                                               |

The app is purpose-built for amateur radio (ham radio) ARRL Division conferences. The sample data models a 3-day event https://www.pacificon.org at the San Ramon Marriott each Oct.

---

## 2. Technology Stack

| Layer               | Technology                                                       | Notes                                                                                                                                 |
| ------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Runtime             | React 18.3.1                                                     | Peer dependency; not in `dependencies` directly                                                                                       |
| Language            | TypeScript 5.9                                                   | Strict mode enabled                                                                                                                   |
| Bundler             | Vite 6.x                                                         | With `@vitejs/plugin-react` and `@tailwindcss/vite`                                                                                   |
| Styling             | Tailwind CSS 4.1                                                 | Config-less; driven by `@tailwindcss/vite` plugin. CSS custom-property theme in `theme.css`. `tw-animate-css` for animation utilities |
| UI primitives       | shadcn/ui pattern                                                | Thin wrappers in `src/app/components/ui/` over Radix UI primitives                                                                    |
| Icons               | lucide-react 0.487                                               | Used throughout for nav, cards, header                                                                                                |
| Calendar            | FullCalendar 6.x                                                 | 3-day and 1-day time-grid views in ScheduleView (`@fullcalendar/react` + `timeGridPlugin`)                                            |
| Router              | react-router-dom 7.x                                             | Client-side routing; `BrowserRouter` at root uses React Router, getting ready for mobile apps                                         |
| Backend / Auth      | Firebase 12.x                                                    | Auth (email+password, Google OAuth), Firestore (data layer), Storage (planned)                                                |
| Toast notifications | Sonner 2.x                                                       | Used in ProfilePage for email-verification / password-reset feedback                                                                  |
| Lint                | ESLint 9 (flat config) + typescript-eslint + eslint-plugin-react | Runs inside Vite via `@nabla/vite-plugin-eslint`                                                                                      |
| Hosting & CI        | Firebase Hosting + GitHub Actions                                | Two workflows: deploy-on-merge-to-main (live), deploy-on-PR (preview channel)                                                         |

### Notable dependencies _installed but not currently used_

* `next-themes` for dark and light
* `@mui/material`, `@mui/icons-material`
* `@emotion/*` writes css styles with javascript though we use tailwindcss
* `vaul` is a drawer
* Most of the Radix primitives beyond `tabs`, `accordion`, and `tooltip`. These have been scaffolded by the Figma-to-code export and are available for future features without requiring a new install.
* `react-dnd` for drag and drop
* `react-slick` for carousel
* `react-responsive-masonry` for zooming
* `motion` for animation
* `recharts` charting for react
* `react-hook-form` forms and validation library 
* `cmdk` for a command menu

---

## 3. Source Tree

```
pacific-div-figma-main/
├── .github/workflows/          # CI — Firebase deploy on merge & PR preview
├── public/                     # Static assets served verbatim
│   ├── pacificon-2026.ics      # iCal calendar file for the conference
│   ├── *map*.png / *.jpg       # 5 venue/event map images
│   └── 404.html
├── src/
│   ├── main.tsx                # React entry — mounts AuthProvider → BrowserRouter → App
│   ├── app/
│   │   ├── App.tsx             # Route table + persistent layout (Header, Nav, Footer)
│   │   ├── components/
│   │   │   ├── ConferenceHeader.tsx   # Collapsible banner; dynamic brand color & contrast
│   │   │   ├── ConferenceFooter.tsx   # Contact email + status notices
│   │   │   ├── Navigation.tsx         # 4-tab nav bar (Maps, Schedule, Prizes, Profile)
│   │   │   ├── ProtectedRoute.tsx     # HOC: redirects to /login when no auth user
│   │   │   ├── ScheduleView.tsx       # Card list + FullCalendar; bookmark toggle
│   │   │   ├── MapsView.tsx           # Tabbed map viewer with ImageWithFallback
│   │   │   ├── AlertsView.tsx         # Unauthenticated placeholder for Prizes tab
│   │   │   ├── ProfileView.tsx        # Unauthenticated placeholder for Profile tab
│   │   │   ├── figma/
│   │   │   │   └── ImageWithFallback.tsx  # <img> that swaps to an inline SVG on error
│   │   │   └── ui/                    # shadcn-style Radix wrappers (tabs, card, badge, button, …)
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx        # React Context + Provider for Firebase Auth state
│   │   └── pages/                     # Route-level containers; own state, delegate to Views
│   │       ├── MapsPage.tsx
│   │       ├── SchedulePage.tsx       # Owns bookmarkedSessions state
│   │       ├── AlertsPage.tsx         # Shows AlertsView when unauthed, email when authed
│   │       ├── ProfilePage.tsx        # Full profile when authed; email verification & password reset
│   │       ├── LoginPage.tsx          # Email/password + Google sign-in; redirects on auth
│   │       └── SignUpPage.tsx         # Email/password + Google sign-up; client-side validation
│   ├── data/
│   │   └── pacificon-sample.ts        # Hard-coded seed: pacificonData, sampleSessions, sampleMaps
│   ├── lib/
│   │   └── firebase.ts               # initializeApp; exports auth, db, storage singletons
│   ├── types/
│   │   └── conference.ts             # All shared TypeScript interfaces (see §5)
│   └── styles/
│       ├── index.css                 # Import hub + Tailwind source directive
│       ├── tailwind.css              # (currently empty — placeholder)
│       ├── theme.css                 # CSS custom properties for light & dark, @theme inline mapping
│       └── fonts.css                 # (currently empty — placeholder for custom fonts)
├── vite.config.ts                    # Plugins (react, tailwindcss, eslint); @ alias → src/
├── tsconfig.json                     # Strict, bundler module resolution, paths alias
├── firebase.json                     # Hosting config; SPA rewrite rule
├── .firebaserc                       # Points to project `pacific-div`
└── package.json                      # Scripts: dev, build, deploy, lint
```

---

## 4. Routing & Component Hierarchy

```
<AuthProvider>                         # Firebase onAuthStateChanged listener
  <BrowserRouter>
    <App>
      <ConferenceHeader />             # Always visible; collapsible
        <ConferenceSelecer />          # coming soon
      <Navigation />                   # Always visible; 4-tab grid
      <Routes>
        /          → redirect → /maps
        /maps      → <MapsPage>        # <MapsView>
        /schedule  → <SchedulePage>    # <ScheduleView> + <Calendar>
        /alerts    → <AlertsPage>      # <AlertsView> | inline email display
        /profile   → <ProfilePage>     # <ProfileView> | full profile, links to /login and /signup
          /login     → <LoginPage>
          /signup    → <SignUpPage>
        *          → redirect → /404.html
      </Routes>
      <ConferenceFooter />             - Always visible
    </App>
  </BrowserRouter>
</AuthProvider>
```

**Key routing decisions:**

- The root `/` redirects to `/maps` (the default landing tab).
- `/login` and `/signup` are **not** guarded; they self-redirect to `/profile` (or `/`) when a user is already authenticated via a `useEffect` watching `AuthContext.user`.
- `ProtectedRoute` exists but is **not yet wired** into the route table. It is available for guarding future routes.
- A catch-all `*` route redirects to the static `404.html` in `public/`.

---

## 5. TypeScript Interfaces (`src/types/conference.ts`)

All domain types live in a single file. Every interface carries a `conferenceId` foreign key to support the multi-conference model.

### Conference

Core event metadata. `primaryColor` / `secondaryColor` drive the header banner. Times are stored as **local date strings** (no offset baked in); the companion fields `timezone` (`"America/Los_Angeles"`) and `timezoneNumeric` (`"-0700"`) are used at render time to produce correct locale-formatted output.

### Session

A single talk/event. `startTime` / `endTime` are ISO-style local strings (`"2026-10-16T09:00:00"`). `category` and optional `track` are used as badge labels on the schedule cards.

### MapImage

A venue map. `order` controls tab sequence. `url` points to a `/public/` asset. `floor` is optional.

### Prize / PrizeWinner

Defined in the type system and in Firestore security rules but **not yet rendered**. PrizeWinner includes `notifiedAt` / `claimedAt` timestamps for a notification lifecycle.

### UserProfile

Extends Firebase Auth's `User` with app-specific fields: `callsign`, `darkMode`, `bookmarkedSessions[]`, notification toggles, SMS phone number.

### Message

A public-board or DM model. `isPublic` + optional `boardId` distinguish the two modes.
`votes` supports an upvote pattern.

---

## 6. Authentication Flow (`AuthContext`)

`src/app/contexts/AuthContext.tsx` wraps the entire app and exposes four async actions plus the current `user` and a `loading` flag.

```
Mount
  └── onAuthStateChanged(auth, cb)   ← Firebase listener; sets user + clears loading
       ├── user = null  →  renders login prompts in AlertsView / ProfileView
       └── user = User  →  renders authenticated content

signIn(email, password)        → signInWithEmailAndPassword
signUp(email, password)        → createUserWithEmailAndPassword
signInWithGoogle()             → GoogleAuthProvider + signInWithPopup
logout()                       → signOut
```

Config values (`apiKey`, `projectId`, etc.) are read from **Vite env vars** (`import.meta.env.VITE_FIREBASE_*`), keeping secrets out of source.

`db` (Firestore) and `storage` (Cloud Storage) are also initialized and exported from `firebase.ts` but **not yet consumed** anywhere in the app — they are placeholders for the data-layer migration described in §9.

---

## 7. Page-by-Page Behaviour

### 7.1 Maps (`/maps`)

- `MapsPage` imports `sampleMaps` directly and passes them to `MapsView`.
- `MapsView` renders a **Radix Tabs** component. Each tab shows one `<ImageWithFallback>` inside a `<Card>`.
- Maps are sorted by their `order` field.
- `ImageWithFallback` catches `onError` and replaces the broken image with a base64-encoded inline SVG placeholder, preserving the original URL as a `data-original-url` attribute for debugging.

### 7.2 Schedule (`/schedule`)

- `SchedulePage` owns `bookmarkedSessions` state (array of session IDs) and passes a toggle callback down.
- `ScheduleView` does two things simultaneously:
  1. **Card list** — sessions grouped by date into collapsible day sections, filtered by a tab row (`All Days` / one tab per day). Each card shows title, category + track badges, description, time, room, speaker, and a bookmark icon.
  2. **FullCalendar** — a `timeGridThreeDay` view rendered below the card list. Events are mapped from sessions with the numeric timezone offset appended to produce correct absolute times.
- Time formatting uses `Intl.DateTimeFormat` with the conference's IANA timezone string. Day numbers are extracted via `String.split('-')[2]` rather than `DateTimeFormat` to avoid a known cross-browser inconsistency noted in a code comment.

### 7.3 Alerts / Prizes (`/alerts`)

- When **not authenticated**: shows `AlertsView` — a static placeholder prompting the user to sign in.
- When **authenticated**: currently only displays the user's email. This is explicitly a stub; the full prize-notification UI is planned (see §9).

### 7.4 Profile (`/profile`)

- When **not authenticated**: shows `ProfileView` — a static list of upcoming account features with a sign-in link.
- When **authenticated**: `ProfilePage` renders every field from the Firebase `User` object (uid, email, displayName, photoURL, metadata). It also surfaces two Firebase Auth actions inline:
  - **Send Verification Email** — calls `sendEmailVerification` and shows a Sonner toast.
  - **Reset Password** — calls `sendPasswordResetEmail` and shows a Sonner toast.
- Many profile fields (dark mode, SMS, messages, prizes won) are rendered as `<none yet>` stubs, mapping directly onto the `UserProfile` interface fields that will be populated once Firestore integration lands.

### 7.5 Login (`/login`)

- Email/password form + a Google sign-in button.
- Redirects to `/profile` on successful auth via a `useEffect` watching `AuthContext.user`.
- Links to `/signup` for first-time users.

### 7.6 Sign Up (`/signup`)

- Same dual-method pattern as login.
- Client-side validation: passwords must match and be ≥ 6 characters.
- Redirects to `/` on success.

---

## 8. Styling & Theming

### 8.1 Tailwind v4 + CSS custom properties

Tailwind is configured entirely through the Vite plugin — there is no `tailwind.config.js`. The `@source` directive in `index.css` scans all `.js/.ts/.jsx/.tsx` files for class usage.

`theme.css` defines a full set of CSS custom properties in `:root` (light) and `.dark` (dark mode), then maps them into Tailwind's design-token layer via `@theme inline`. This gives every shadcn `ui/` component access to tokens like `--color-card`, `--color-muted-foreground`, `--radius`, etc.

A `@custom-variant dark` rule (`&:is(.dark *)`) enables dark-mode variants throughout the tree. Dark mode is **not yet togglable at runtime** — the `.dark` class would need to be added/removed on `<html>` (the `next-themes` package is installed but unused).

### 8.2 Conference brand colour

`ConferenceHeader` reads `conference.primaryColor` (default `#ff4e00`, "international orange") and applies it as the header background via an inline style. A `contrastingColor()` utility computes relative luminance and returns black or white for the text, ensuring WCAG-level contrast regardless of the brand colour.

### 8.3 Base typography

`theme.css` sets default font sizes and weights for `h1`–`h4`, `label`, `button`, and `input` in `@layer base`, so Tailwind utility classes always win in specificity.

---

## 9. Planned / Stub Features (Roadmap)

The codebase contains significant scaffolding for features that are **typed, documented in security rules, but not yet wired**. This section maps each stub to where it appears.

| Feature                                     | Current State                                                                                          | Where to build                                                                                                                         |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| **iOS and Android installable and web UIs** | web UI first. plan to use React Native expo.dev tool                                                   | implement using expo.dev                                                                                                               |
| **Firestore data layer**                    | `db` exported from `firebase.ts`; collections + security rules fully documented in `FIREBASE_SETUP.md` | Replace hard-coded imports of `pacificon-sample.ts` with Firestore listeners. Each page currently pulls from the sample file directly. |
| **Multi-conference selector**               | `Conference` interface has an `id` key; all child types carry `conferenceId`                           | Add a conference-picker component; swap the single `pacificonData` constant for a fetched/selected conference.                         |
| **Prize notifications**                     | `AlertsPage` stub; `Prize` + `PrizeWinner` types; Firestore rules for `prizes` / `prizeWinners`        | Build a prize-card list; add Firestore real-time listener on `prizeWinners` filtered by current user email/callsign.                   |
| **Bookmark persistence**                    | `SchedulePage` owns in-memory `bookmarkedSessions[]`; `UserProfile.bookmarkedSessions` field exists    | Persist to Firestore `users/{uid}` on toggle; load on mount.                                                                           |
| **Dark mode toggle**                        | `ProfilePage` renders `<none yet>`; `.dark` theme vars fully defined; `next-themes` installed          | Wire `next-themes`'s `useTheme` hook into a toggle on the Profile page.                                                                |
| **SMS & email notification settings**       | Stub fields in ProfilePage; `UserProfile` interface has the toggles                                    | Add toggle switches; persist to Firestore. Notification dispatch via Cloud Functions (see FIREBASE_SETUP.md §9).                       |
| **Messaging / forum board**                 | `Message` interface fully typed; Firestore rules written                                               | Build a message-board page; use Firestore real-time queries filtered by `isPublic` or current user.                                    |
| **Admin interfaces**                        | `FIREBASE_SETUP.md` §8 outlines roles                                                                  | Add `isAdmin` / `adminRole` to user doc; create guarded admin pages for sessions, prizes, winners.                                     |
| **Offline support**                         | Footer mentions "Offline capable planned"                                                              | Enable Firestore offline persistence; optionally add a Service Worker for asset caching.                                               |
| **CSV data import/export**                  | `FIREBASE_SETUP.md` §7 describes the pattern                                                           | Cloud Function to parse CSV from Storage into Firestore; admin export endpoint.                                                        |
| **Callsign verification**                   | Mentioned in FIREBASE_SETUP.md                                                                         | Optional qrz.com API lookup on profile save.                                                                                           |

---

## 10. CI / Deployment

Two GitHub Actions workflows live in `.github/workflows/`:

| Workflow                            | Trigger                 | Effect                                                                          |
| ----------------------------------- | ----------------------- | ------------------------------------------------------------------------------- |
| `firebase-hosting-merge.yml`        | Push to `main`          | `npm ci && npm run build` → deploys to **live** channel (`pacific-div.web.app`) |
| `firebase-hosting-pull-request.yml` | Any PR (same-repo only) | Same build → deploys to a **preview** channel; URL posted back to the PR        |

Both workflows use the `FirebaseExtended/action-hosting-deploy@v0` action and authenticate via a `FIREBASE_SERVICE_ACCOUNT_PACIFIC_DIV` secret.

`firebase.json` configures hosting to serve from `dist/` and applies a catch-all rewrite (`** → /index.html`) so the SPA router handles all paths.

---

## 11. Environment & Local Development

```bash
npm i              # install deps
npm run dev        # Vite dev server (hot reload)
npm run build      # production bundle → dist/
npm run deploy     # firebase deploy (requires firebase CLI login)
npm run lint       # eslint across all src files
```

Firebase config values must be provided as environment variables prefixed `VITE_FIREBASE_*`. In local development these can live in a `.env` file at the project root (Vite loads it automatically); they are **not** committed (covered by `.gitignore`).

---

## 12. Key Conventions & Gotchas for Future AI Prompting

1. **Path alias.** All imports use `@/` which maps to `src/`. Both `vite.config.ts` (runtime) and `tsconfig.json` (editor/type-checking) declare this alias.

2. **Page vs View split.** Every tab follows a two-layer pattern: a _Page_ component lives in `src/app/pages/` and owns route-level state (e.g., bookmark array, auth checks). It delegates all rendering to a _View_ component in `src/app/components/`. When adding new tabs, follow this pattern. This developed from the prototype and was needed when the routing pages were implemented.

3. **Unauthenticated vs authenticated rendering.** `AlertsPage` and `ProfilePage` do **not** use `ProtectedRoute`. Instead they conditionally render a static "sign in" placeholder (the View) or the full authenticated UI directly in the Page. This is intentional — the tabs remain visible and informational even when logged out.

4. **Hard-coded data is temporary.** `MapsPage` and `SchedulePage` import directly from `pacificon-sample.ts`. This is the single point to replace when Firestore integration lands. Do **not** add more direct sample-data imports elsewhere.

5. **Timezone handling is tricky.** Session times are stored purposely without an offset (`"2026-10-16T09:00:00"`). At render time, `conference.timezoneNumeric` (e.g., `"-0700"`) is **concatenated** onto the string before passing to `new Date()` or FullCalendar. The IANA string (`conference.timezone`) is used separately for `Intl.DateTimeFormat`. Day-of-month is extracted via `split('-')[2]` rather than the formatter due to a noted cross-browser edge case.

6. **shadcn UI components are wrappers.** Everything in `src/app/components/ui/` is a thin styled wrapper over a Radix primitive. Do not edit them directly unless there are bugs; treat them as a stable design-system layer. Fixes wwere installed for bugs in the CLI installed Button and Dialog files. These were reported months ago.

7. **`ProtectedRoute` exists but is unused.** It is a ready-made HOC for guarding routes. Wire it in when features (e.g., messaging) require authentication.

8. **Commented-out code is intentional scaffolding.** Blocks of commented code (in `App.tsx`, `ConferenceHeader.tsx`, `ProfilePage.tsx`, etc.) represent prior iterations or planned wiring. Read them for context before removing.

## 13. How the sync works from /src/lib/firebase.ts

1. On mount, the hook fetches `public/settings/defaults.csv` (bundled by
   Vite/CRA, served as a static asset). It parses every row into a `uid → UserSettings` map.

2. It checks Firestore at `userSettings/{uid}`. If a doc already exists, that's
   the source of truth. If not, it seeds Firestore from the CSV row for that
   uid (or from empty defaults if the uid isn't in the CSV).

3. An `onSnapshot` listener keeps the local React state in sync in real time —
   so changes from another tab or device propagate instantly.

4. Every toggle / input change calls `updateDoc` on Firestore; the listener
   pushes the result back into state automatically.

5. Firestore security rule suggestion: only each user can read/write their own doc

