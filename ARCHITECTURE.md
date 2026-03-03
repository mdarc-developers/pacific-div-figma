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
| Runtime             | React 19.x, Node 24.12                                           | Peer dependencies; not in `dependencies` directly                                                                                     |
| Language            | TypeScript 5.9                                                   | Strict mode enabled                                                                                                                   |
| Bundler             | Vite 6.x                                                         | With `@vitejs/plugin-react` and `@tailwindcss/vite`                                                                                   |
| Styling             | Tailwind CSS 4.1                                                 | Config-less; driven by `@tailwindcss/vite` plugin. CSS custom-property theme in `theme.css`. `tw-animate-css` for animation utilities |
| UI primitives       | shadcn/ui pattern                                                | Thin wrappers in `src/app/components/ui/` over Radix UI primitives                                                                    |
| Icons               | lucide-react 0.487                                               | Used throughout for nav, cards, header                                                                                                |
| Calendar            | FullCalendar 6.x                                                 | 3-day and 1-day time-grid views in ScheduleView (`@fullcalendar/react` + `timeGridPlugin`)                                            |
| Router              | react-router-dom 7.x                                             | Client-side routing; `BrowserRouter` at root uses React Router, getting ready for mobile apps                                         |
| Backend / Auth      | Firebase 12.x                                                    | Auth (email+password, Google OAuth), Firestore (data layer), Storage (planned)                                                        |
| Toast notifications | Sonner 2.x                                                       | Used in ProfilePage for email-verification / password-reset feedback                                                                  |
| Lint                | ESLint 9 (flat config) + typescript-eslint + eslint-plugin-react | Runs inside Vite via `@nabla/vite-plugin-eslint`                                                                                      |
| Hosting & CI        | Firebase Hosting + GitHub Actions                                | Two workflows: deploy-on-merge-to-main (live), deploy-on-PR (preview channel)                                                         |

### Notable dependencies _installed but not currently used_

- `next-themes` — installed but **replaced** by the custom `ThemeContext` + `FirebaseThemeSync` pattern; may be removed in a future cleanup
- Most of the Radix primitives beyond `tabs`, `accordion`, `toggle`, `toggle-group`, and `tooltip` have been scaffolded by the Figma-to-code export and are available for future features without requiring a new install.
- `react-slick` for carousel
- `react-responsive-masonry` for zooming
- `recharts` charting for react
- `react-hook-form` forms and validation library
- `date-fns` date utilities
- `@floating-ui/react` positioning engine for tooltips / popovers
- `react-resizable-panels` resizable panel layout

---

## 3. Source Tree

```
pacific-div-figma/
├── .github/workflows/          # CI — Firebase deploy on merge & PR preview
├── public/                     # Static assets served verbatim
│   ├── pacificon-2026.ics      # iCal calendar file for the conference
│   ├── settings/defaults.csv   # Default user settings seed (theme, etc.)
│   └── 404.html
├── src/
│   ├── main.tsx                # React entry — mounts ThemeProvider → ConferenceProvider → AuthProvider → SearchProvider → BrowserRouter → App
│   ├── app/
│   │   ├── App.tsx             # Route table + persistent layout (Header, SearchBar, Nav, Footer)
│   │   ├── components/
│   │   │   ├── AccountCard.tsx        # Profile: email verification & password reset actions
│   │   │   ├── AdminCard.tsx          # Profile: admin link card (prize-admin only)
│   │   │   ├── AlertsView.tsx         # Unauthenticated placeholder for Alerts tab
│   │   │   ├── AttendeesView.tsx      # Attendee list display
│   │   │   ├── BookmarkListCard.tsx   # Profile: bookmarked sessions list
│   │   │   ├── ConferenceFooter.tsx   # Contact email + status notices
│   │   │   ├── ConferenceHeader.tsx   # Collapsible banner; dynamic brand color & contrast
│   │   │   ├── ExhibitorView.tsx      # Single exhibitor detail
│   │   │   ├── ExhibitorsMapView.tsx  # Leaflet-based exhibitor booth map
│   │   │   ├── FirebaseThemeSync.tsx  # Headless component: syncs ThemeContext ↔ Firestore
│   │   │   ├── ForumsMapView.tsx      # Leaflet-based forum room map
│   │   │   ├── MapsView.tsx           # Tabbed map viewer with ImageWithFallback
│   │   │   ├── Navigation.tsx         # Tab bar (Maps, Schedule, Forums, Exhibitors, Prizes, …)
│   │   │   ├── NotificationsCard.tsx  # Profile: notification toggle stubs
│   │   │   ├── PacificonSvgExhibitorMap.tsx  # SVG floor-map component for Pacificon
│   │   │   ├── ProfileHeaderCard.tsx  # Profile: user avatar + name/callsign header
│   │   │   ├── ProfileView.tsx        # Unauthenticated placeholder for Profile tab
│   │   │   ├── PrizesAdminView.tsx    # Admin UI for managing prize winners
│   │   │   ├── PrizesImageView.tsx    # Prize image carousel view
│   │   │   ├── PrizesView.tsx         # Attendee-facing prize list + raffle ticket entry
│   │   │   ├── ProtectedRoute.tsx     # HOC: redirects to /login when no auth user
│   │   │   ├── RaffleTicketsCard.tsx  # Profile: raffle ticket management
│   │   │   ├── ScheduleView.tsx       # Card list + FullCalendar; bookmark toggle
│   │   │   ├── SearchBar.tsx          # Fuse.js search bar; highlights results via SearchContext
│   │   │   ├── SettingsCard.tsx       # Profile: dark/light/system theme toggle
│   │   │   ├── figma/
│   │   │   │   └── ImageWithFallback.tsx  # <img> that swaps to an inline SVG on error
│   │   │   └── ui/                    # shadcn-style Radix wrappers (tabs, card, badge, button, …)
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx        # React Context + Provider for Firebase Auth state
│   │   │   ├── ConferenceContext.tsx  # Conference selection; exposes activeConference + allConferencesList
│   │   │   ├── SearchContext.tsx      # Highlight state for search results (session/exhibitor/forum)
│   │   │   └── ThemeContext.tsx       # light/dark/system theme; persists to localStorage + Firestore
│   │   ├── hooks/
│   │   │   ├── useBookmarks.ts        # localStorage-backed bookmark toggle with prev-bookmark tracking
│   │   │   ├── usePrizesAdmin.ts      # Returns true if current user is in "prize-admin" group
│   │   │   └── useRaffleTickets.ts    # localStorage-backed raffle ticket list with range-add support
│   │   └── pages/                     # Route-level containers; own state, delegate to Views
│   │       ├── AlertsPage.tsx         # Shows AlertsView when unauthed, alert list when authed
│   │       ├── AttendeesPage.tsx      # Shows AttendeesView
│   │       ├── ExhibitorsPage.tsx     # Shows ExhibitorsMapView + ExhibitorView
│   │       ├── ForumsPage.tsx         # Shows ForumsMapView + ScheduleView for forum sessions
│   │       ├── LoginPage.tsx          # Email/password + Google sign-in; redirects on auth
│   │       ├── MapsPage.tsx           # Venue maps via MapsView
│   │       ├── PrizesAdminPage.tsx    # Admin prize management (prize-admin group only)
│   │       ├── PrizesPage.tsx         # Attendee prize list + raffle ticket entry
│   │       ├── ProfilePage.tsx        # Full profile when authed; email verification & password reset
│   │       ├── SchedulePage.tsx       # Owns bookmarkedSessions state; renders ScheduleView
│   │       ├── SearchPage.tsx         # ScheduleView filtered by search; scrolls to highlighted session
│   │       └── SignUpPage.tsx         # Email/password + Google sign-up; client-side validation
│   ├── data/
│   │   ├── all-conferences.ts                  # Master list used by ConferenceContext
│   │   ├── hamcation-2026.ts                   # Feb Orlando, FL — Hamcation 2026
│   │   ├── hamcation-2026-exhibitor-*.ts        # Exhibitor override/supplemental data
│   │   ├── hamcation-2027.ts                   # Feb Orlando, FL — Hamcation 2027
│   │   ├── hamvention-2026.ts                  # May Dayton, OH — Hamvention 2026
│   │   ├── huntsville-hamfest-2026.ts           # Aug Huntsville, AL — Hamfest 2026
│   │   ├── pacificon-2026.ts                   # Oct San Ramon, CA — Pacificon 2026
│   │   ├── pacificonSvgExhibitorMapData.ts                    # SVG booth/room data for PacificonSvgExhibitorMap
│   │   ├── quartzfest-2027.ts                  # Jan Quartzsite, AZ — Quartzfest 2027
│   │   ├── quartzfest-2027-session-*.ts         # Session override/supplemental data
│   │   ├── quartzfest-2027-userprofile-*.ts     # Attendee override/supplemental data
│   │   ├── seapac-2026.ts                      # Jun Portland, OR — SeaPac 2026
│   │   ├── seapac-2026-session-*.ts             # Session override/supplemental data
│   │   ├── yuma-2026.ts                        # Feb Yuma, AZ — Yuma Hamfest 2026
│   │   ├── yuma-2026-prize-*.ts                # Prize override/supplemental data
│   │   ├── yuma-2026-prizewinner-*.ts           # Prize winner override/supplemental data
│   │   ├── yuma-2027.ts                        # Feb Yuma, AZ — Yuma Hamfest 2027
│   │   ├── extract-*.html                      # One-off data-extraction helper pages (not bundled)
│   │   └── *.test.ts                           # Vitest unit tests for data integrity
│   ├── lib/
│   │   ├── colorUtils.ts      # contrastingColor() and related WCAG helpers
│   │   ├── conferenceData.ts  # Vite glob import — loads all *-20XX.ts data files eagerly
│   │   ├── firebase.ts        # initializeApp; exports auth, db, storage singletons
│   │   ├── googleDrive.ts     # Helpers for Google Drive asset access (planned)
│   │   ├── localStorage.ts    # loadFromStorage / saveToStorage generic helpers
│   │   ├── overrideUtils.ts   # Merges supplemental/override data into base conference data
│   │   ├── prizesData.ts      # Aggregates PRIZE_DATA and PRIZE_WINNER_DATA from all conference modules
│   │   ├── sessionData.ts     # Aggregates SESSION_DATA, map images, rooms, booths, exhibitors; populates mapSessionRooms / mapExhibitorBooths on Conference objects as a side effect
│   │   └── userProfileData.ts # Aggregates ALL_USER_PROFILES and ATTENDEE_DATA
│   ├── services/
│   │   ├── searchService.ts       # Fuse.js search index; buildIndex / search / applyFilters
│   │   └── userSettingsService.ts # getUserTheme / setUserTheme via Firestore userSettings collection
│   ├── types/
│   │   └── conference.ts          # All shared TypeScript interfaces (see §5)
│   └── styles/
│       ├── index.css              # Import hub + Tailwind source directive
│       ├── tailwind.css           # (currently empty — placeholder)
│       ├── theme.css              # CSS custom properties for light & dark, @theme inline mapping
│       └── fonts.css              # (currently empty — placeholder for custom fonts)
├── e2e/                           # Playwright end-to-end tests (*.spec.ts)
├── vite.config.ts                 # Plugins (react, tailwindcss, eslint); @ alias → src/
├── tsconfig.json                  # Strict, bundler module resolution, paths alias
├── eslint.config.js               # Lint config
├── firebase.json                  # Hosting config; SPA rewrite rule
├── .firebaserc                    # Points to project `pacific-div`
├── .gitignore
├── .webhintrc                     # no-inline-styles rule for conference header color
└── package.json                   # Scripts: dev, build, deploy, lint, test, etc.
```

---

## 4. Routing & Component Hierarchy

```
<ThemeProvider>                        # light/dark/system; persists to localStorage + Firestore
<ConferenceProvider>                   # Conference selection; exposes activeConference
  <AuthProvider>                       # Firebase onAuthStateChanged listener
    <SearchProvider>                   # Highlight state for search result navigation
      <BrowserRouter>
        <App>
          <FirebaseThemeSync />        # Headless: syncs theme ↔ Firestore on login/change
          <ConferenceHeader />         # Always visible; collapsible
            <ConferenceSelector />     # coming soon
          <SearchBar />               # Always visible; Fuse.js search
          <Navigation />              # Always visible; tab grid
          <Routes>
            /          → redirect → /schedule
            /maps      → <MapsPage>        # Venue maps
            /schedule  → <SchedulePage>    # <ScheduleView> + <Calendar>
            /forums    → <ForumsPage>      # ForumsMapView + ScheduleView for forum sessions
            /exhibitors→ <ExhibitorsPage>  # ExhibitorsMapView + ExhibitorView
            /prizes    → <PrizesPage>      # Prize list + raffle ticket entry
            /attendees → <AttendeesPage>   # Attendee list
            /alerts    → <AlertsPage>      # <AlertsView> or alert list when authed
            /profile   → <ProfilePage>     # <ProfileView> | full profile
            /login     → <LoginPage>
            /signup    → <SignUpPage>
            /search    → <SearchPage>      # ScheduleView scoped to search results
            /admin/prizes → <PrizesAdminPage>  # Prize admin (prize-admin group only)
            /pacificonfloormap → <PacificonSvgExhibitorMap>  # SVG floor map
            *          → redirect → /404.html
          <ConferenceFooter />         # Always visible
```

**Key routing decisions:**

- The root `/` redirects to `/schedule` (the default landing tab).
- `/login` and `/signup` are **not** guarded; they self-redirect to `/profile` (or `/`) when a user is already authenticated via a `useEffect` watching `AuthContext.user`.
- `ProtectedRoute` exists but is **not yet wired** into the route table. It is available for guarding future routes.
- A catch-all `*` route redirects to the static `404.html` in `public/`.

---

## 5. TypeScript Interfaces (`src/types/conference.ts`)

All domain types live in a single file. Every interface carries a `conferenceId` foreign key to support the multi-conference model.

### Conference

Core event metadata. `primaryColor` / `secondaryColor` drive the header banner. Times are stored as **local date strings** (no offset baked in); the companion fields `timezone` (`"America/Los_Angeles"`) and `timezoneNumeric` (`"-0700"`) are used at render time to produce correct locale-formatted output.

`mapSessionRooms?: [string, boolean, boolean][]` — Each tuple is `[mapImageUrl, sessionsLoaded, roomsLoaded]`. `sessionsLoaded` is `true` when a conference module exports `mapSessions`; `roomsLoaded` is `true` when it exports `mapRooms`. The array is populated as a side effect by `updateMapSessionRooms()` in `src/lib/sessionData.ts` during module load. Its presence (and length) indicates that a Leaflet-based room/session map is available for the conference.

`mapExhibitorBooths?: [string, boolean, boolean][]` — Each tuple is `[mapImageUrl, exhibitorsLoaded, boothsLoaded]`. `exhibitorsLoaded` is `true` when a conference module exports `mapExhibitors`; `boothsLoaded` is `true` when it exports `mapBooths`. The array is populated as a side effect by `updateMapExhibitorBooths()` in `src/lib/sessionData.ts` during module load. `ExhibitorsPage` reads `activeConference.mapExhibitorBooths?.length` (as `numEmaps`) and only renders `ExhibitorsMapView` when `numEmaps === 1`.

### Session

A single talk/event. `startTime` / `endTime` are ISO-style local strings (`"2026-10-16T09:00:00"`). `category` and optional `track?: string[]` are used as badge labels on the schedule cards.

### MapImage

Venue, forum and exhibitor maps.
`order` controls tab sequence.
`url` points to a `/public/` asset.
`floor` is optional.

### Booth

A physical vendor or club booth on the floor map. `coords` is a polygon expressed as `[x, y]` pairs; `locationZone` identifies the hall section.

### Exhibitor

A vendor or club exhibitor. Links to one or more `Booth` entries via `boothName` / `location`. Optional `prizesDonated[]` connects to the prizes system.

### Room

A meeting or forum room on the floor map. `coords` is a polygon; `color` is the fill used on the map overlay.

### Prize / PrizeWinner

`Prize` is a donatable item; `PrizeWinner` records who won and tracks the notification lifecycle via `notifiedAt` / `claimedAt` timestamps.

### UserProfile

Extends Firebase Auth's `User` with app-specific fields: `callsign`, `darkMode`, `bookmarkedSessions[]`, notification toggles, SMS phone number, `raffleTickets[]`, `roles[]`, `groups[]`, and optional exhibitor/session/prize associations.

### Message

A public-board or DM model. `isPublic` + optional `boardId` distinguish the two modes. `votes` supports an upvote pattern.

---

## 6. Authentication Flow (`AuthContext`) & Theme

`src/app/contexts/AuthContext.tsx` wraps the app and exposes four async actions plus the current `user` and a `loading` flag.

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

`db` (Firestore) and `storage` (Cloud Storage) are also initialized and exported from `firebase.ts`. Firestore is currently used for persisting theme preferences; Storage is a placeholder for future migrations.

### Theme (`ThemeContext` + `FirebaseThemeSync`)

`src/app/contexts/ThemeContext.tsx` provides a `theme` (`"light" | "dark" | "system"`), a `resolvedTheme`, and a `setTheme` setter. It:

- Reads / writes `localStorage` for persistence across sessions.
- Applies the `.dark` class to `<html>` and sets `colorScheme` when the resolved theme changes.
- Responds to OS-level `prefers-color-scheme` changes while in `"system"` mode.
- Syncs across browser tabs/windows via the `storage` event.

`src/app/components/FirebaseThemeSync.tsx` is a headless React component mounted inside `<App>`. On user login it reads the saved theme from Firestore (`userSettings/{uid}`) and calls `setTheme`. On subsequent theme changes it writes the new value back to Firestore via `src/services/userSettingsService.ts`.

---

## 7. Page-by-Page Behaviour

### 7.1 Maps (`/maps`)

- `MapsPage` loads `conferenceMaps` from the active conference data (via `SESSION_DATA` aggregated in `src/lib/sessionData.ts`) and passes them to `MapsView`.
- `MapsView` renders a **Radix Tabs** component. Each tab shows one `<ImageWithFallback>` inside a `<Card>`.
- Maps are sorted by their `order` field.
- `ImageWithFallback` catches `onError` and replaces the broken image with a base64-encoded inline SVG placeholder, preserving the original URL as a `data-original-url` attribute for debugging.

### 7.2 Schedule (`/schedule`)

- `SchedulePage` uses the `useBookmarks` hook (localStorage-backed) and passes toggle callbacks to `ScheduleView`.
- `ScheduleView` does two things simultaneously:
  1. **Card list** — sessions grouped by date into collapsible day sections, filtered by a tab row (`All Days` / one tab per day). Each card shows title, category + track badges, description, time, room, speaker, and a bookmark icon.
  2. **FullCalendar** — a `timeGridThreeDay` view rendered below the card list. Events are mapped from sessions with the numeric timezone offset appended to produce correct absolute times.
- Time formatting uses `Intl.DateTimeFormat` with the conference's IANA timezone string. Day numbers are extracted via `String.split('-')[2]` rather than `DateTimeFormat` to avoid a known cross-browser inconsistency noted in a code comment.

### 7.3 Forums (`/forums`)

- `ForumsPage` shows a `ForumsMapView` (Leaflet-based room map) alongside a `ScheduleView` scoped to forum sessions.
- The forum map URL and room overlays are sourced from `ROOM_DATA[activeConference.id]` (a `[mapImageUrl, Room[]]` tuple exported by the conference module as `mapRooms`). The matching `MapImage` is resolved from `MAP_DATA` by URL; a hard-coded fallback is used when no match is found.
- `mapSessionRooms` on the active `Conference` object tracks whether both `mapSessions` and `mapRooms` have been loaded for each map URL; it is populated by `sessionData.ts` as a side effect and is visible in the developer debug panel on `ForumsPage` when the `mdarc-developer` role is active.
- Room names from the map can be highlighted via `SearchContext.highlightForumRoomName`.

### 7.4 Exhibitors (`/exhibitors`)

- `ExhibitorsPage` shows an `ExhibitorsMapView` (Leaflet-based booth map) and an `ExhibitorView` for detail.
- The booth map URL and booth overlays are sourced from `BOOTH_DATA[activeConference.id]` (a `[mapImageUrl, Booth[]]` tuple exported by the conference module as `mapBooths`). Exhibitor data comes from `EXHIBITOR_DATA[activeConference.id]`.
- `ExhibitorsPage` reads `activeConference.mapExhibitorBooths?.length` as `numEmaps` and only renders `ExhibitorsMapView` when `numEmaps === 1` (single-map assumption). Multi-map support is scaffolded but currently disabled behind comments.
- `mapExhibitorBooths` on the active `Conference` object is populated by `sessionData.ts` as a side effect (via `updateMapExhibitorBooths()`). A developer debug panel displaying the tuples is rendered when the `mdarc-developer` role is active.
- Exhibitor booths can be highlighted via `SearchContext.highlightExhibitorId`.

### 7.5 Prizes (`/prizes`)

- `PrizesPage` renders `PrizesView`, which shows a list of prizes for the active conference from `PRIZE_DATA`.
- Attendees can enter and manage their raffle tickets here.
- `PrizesImageView` provides a scrollable image carousel of prize photos.

### 7.6 Attendees (`/attendees`)

- `AttendeesPage` renders `AttendeesView` with the list of attendees from `ATTENDEE_DATA`.

### 7.7 Alert / Prize Notifications (`/alerts`)

- When **not authenticated**: shows `AlertsView` — a static placeholder prompting the user to sign in.
- When **authenticated**: currently displays a stub; the full prize-notification UI is planned (see §9).

### 7.8 Profile (`/profile`)

- When **not authenticated**: shows `ProfileView` — a static list of upcoming account features with a sign-in link.
- When **authenticated**: `ProfilePage` renders a series of cards:
  - **ProfileHeaderCard** — user avatar, display name, callsign.
  - **AccountCard** — uid, email, verification status; Send Verification Email / Reset Password via Sonner toasts.
  - **SettingsCard** — light/dark/system theme toggle (wired to `ThemeContext`; persists via `FirebaseThemeSync`).
  - **NotificationsCard** — SMS and email notification toggle stubs.
  - **RaffleTicketsCard** — add/remove/range-add raffle ticket numbers (stored in `localStorage`).
  - **BookmarkListCard** — list of bookmarked sessions for the active conference.
  - **AdminCard** — visible only to users in the `prize-admin` group; links to `/admin/prizes`.

### 7.9 Login (`/login`)

- Email/password form + a Google sign-in button.
- Redirects to `/profile` on successful auth via a `useEffect` watching `AuthContext.user`.
- Links to `/signup` for first-time users.

### 7.10 Sign Up (`/signup`)

- Same dual-method pattern as login.
- Client-side validation: passwords must match and be ≥ 6 characters.
- Redirects to `/` on success.

### 7.11 Search (`/search`)

- `SearchPage` renders `ScheduleView` with all sessions from the active conference.
- An optional `?highlight=<sessionId>` query param causes the page to scroll to and focus that session card.
- Session search is powered by `SearchService` (Fuse.js) exposed via `SearchBar` and `SearchContext`.

### 7.12 Admin — Prizes (`/admin/prizes`)

- `PrizesAdminPage` is guarded: requires both authentication and membership in the `prize-admin` group (checked via `usePrizesAdmin`).
- `PrizesAdminView` allows admins to assign winners to prizes and view winner lists.

---

## 8. Styling & Theming

### 8.1 Tailwind v4 + CSS custom properties

Tailwind is configured entirely through the Vite plugin — there is no `tailwind.config.js`. The `@source` directive in `index.css` scans all `.js/.ts/.jsx/.tsx` files for class usage.

`theme.css` defines a full set of CSS custom properties in `:root` (light) and `.dark` (dark mode), then maps them into Tailwind's design-token layer via `@theme inline`. This gives every shadcn `ui/` component access to tokens like `--color-card`, `--color-muted-foreground`, `--radius`, etc.

A `@custom-variant dark` rule (`&:is(.dark *)`) enables dark-mode variants throughout the tree.

### 8.2 Dark mode toggle

Dark mode is now **fully wired**. `ThemeContext` manages the `"light" | "dark" | "system"` state, applies the `.dark` class to `<html>`, and persists the selection to `localStorage`. The `SettingsCard` on the Profile page exposes the toggle to authenticated users. `FirebaseThemeSync` additionally reads and writes the preference to Firestore so it roams across devices.

### 8.3 Conference brand colour

`ConferenceHeader` reads `conference.primaryColor` (default `#ff4e00`, "international orange") and applies it as the header background via an inline style. A `contrastingColor()` utility (in `src/lib/colorUtils.ts`) computes relative luminance and returns black or white for the text, ensuring WCAG-level contrast regardless of the brand colour.

### 8.4 Base typography

`theme.css` sets default font sizes and weights for `h1`–`h4`, `label`, `button`, and `input` in `@layer base`, so Tailwind utility classes always win in specificity.

---

## 9. Planned / Stub Features (Roadmap)

The codebase contains significant scaffolding for features that are typed, documented in security rules, or partially implemented. This section maps each to its current state.

| Feature                                     | Current State                                                                                                                                                    | Where to build                                                                                                             |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **iOS and Android installable and web UIs** | web UI first. plan to use React Native expo.dev tool                                                                                                             | implement using expo.dev                                                                                                   |
| **Firestore data layer**                    | `db` exported from `firebase.ts`; theme settings already read/written via `userSettingsService`; collections + security rules in `FIREBASE_SETUP.md`             | Replace hard-coded conference data imports with Firestore listeners. `src/lib/conferenceData.ts` is the aggregation point. |
| **Multi-conference selector**               | `ConferenceContext` exposes `allConferencesList` and `setActiveConference`; UI stub in `ConferenceHeader`                                                        | Add a visible conference-picker dropdown wired to `setActiveConference`.                                                   |
| **Prize notifications**                     | `AlertsPage` stub; `Prize` + `PrizeWinner` types; `PrizesView` and `PrizesAdminView` implemented with sample data; Firestore rules for `prizes` / `prizeWinners` | Add Firestore real-time listener on `prizeWinners` filtered by current user email/callsign.                                |
| **Bookmark persistence**                    | `useBookmarks` hook persists to `localStorage`; `UserProfile.bookmarkedSessions` field exists                                                                    | Persist to Firestore `users/{uid}` on toggle; load on mount (currently localStorage only).                                 |
| **Dark mode toggle**                        | ✅ Implemented — `ThemeContext` + `SettingsCard` on Profile + `FirebaseThemeSync` for Firestore persistence                                                      | —                                                                                                                          |
| **SMS & email notification settings**       | Stub toggles in `NotificationsCard`; `UserProfile` interface has the fields                                                                                      | Persist toggles to Firestore. Notification dispatch via Cloud Functions (see FIREBASE_SETUP.md §9).                        |
| **Messaging / forum board**                 | `Message` interface fully typed; Firestore rules written                                                                                                         | Build a message-board page; use Firestore real-time queries filtered by `isPublic` or current user.                        |
| **Admin interfaces**                        | `PrizesAdminPage` + `PrizesAdminView` built for prize management; `usePrizesAdmin` hook checks group membership via sample data                                  | Wire group membership to Firestore / Cloud IAM; extend to session and attendee admin.                                      |
| **Offline support**                         | Footer mentions "Offline capable planned"                                                                                                                        | Enable Firestore offline persistence; optionally add a Service Worker for asset caching.                                   |
| **CSV data import/export**                  | `FIREBASE_SETUP.md` §7 describes the pattern; `papaparse` installed                                                                                              | Cloud Function with papaparse CSV from Storage into Firestore; admin export endpoint.                                      |
| **Callsigns**                               | Verification mentioned in FIREBASE_SETUP.md; `callsign` field on `UserProfile`                                                                                   | Planned, optional qrz.com API lookup on profile save.                                                                      |

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
npm i                # install deps
npm run dev          # Vite dev server (hot reload)
npm run build        # production bundle → dist/
npm run build:test   # production bundle with --mode test (stub Firebase keys OK)
npm run preview      # serve dist/ locally at http://127.0.0.1:5173
npm run deploy       # firebase deploy (requires firebase CLI login)
npm run lint         # ESLint across all src files
npm run indent       # Prettier format all files
npm run test         # Vitest unit tests (run once)
npm run testverbose  # Vitest unit tests with verbose reporter
npm run test:e2e     # Playwright end-to-end tests (requires build first)
npm run test:e2e:ui  # Playwright with interactive UI
npm run testimagesizes  # Vitest run for map image dimension checks
```

Firebase config values must be provided as environment variables prefixed `VITE_FIREBASE_*`. In local development these can live in a `.env` file at the project root (Vite loads it automatically); they are **not** committed (covered by `.gitignore`). See `.env.example` for required keys.

---

## 12. Key Conventions & Gotchas for Future AI Prompting

1. **Path alias.** All imports use `@/` which maps to `src/`. Both `vite.config.ts` (runtime) and `tsconfig.json` (editor/type-checking) declare this alias.

2. **Page vs View split.** Every tab follows a two-layer pattern: a _Page_ component lives in `src/app/pages/` and owns route-level state (e.g., bookmark array, auth checks). It delegates all rendering to a _View_ component in `src/app/components/`. When adding new tabs, follow this pattern.

3. **Unauthenticated vs authenticated rendering.** `AlertsPage` and `ProfilePage` do **not** use `ProtectedRoute`. Instead they conditionally render a static "sign in" placeholder (the View) or the full authenticated UI directly in the Page. This is intentional — the tabs remain visible and informational even when logged out.

4. **Conference data is aggregated, not hard-coded per-page.** `src/lib/conferenceData.ts` uses a Vite eager glob import to pull in every `*-20XX.ts` file from `src/data/`. Higher-level helpers (`sessionData.ts`, `prizesData.ts`, `userProfileData.ts`) aggregate across all loaded modules into typed lookup objects keyed by conference ID. Pages consume these helpers via `ConferenceContext.activeConference.id`. This pattern was chosen to keep per-page code simple, allow multiple conferences to coexist in one bundle, and provide a single replacement point for the future Firestore migration.

5. **Timezone handling is tricky.** Session times are stored purposely without an offset (`"2026-10-16T09:00:00"`). At render time, `conference.timezoneNumeric` (e.g., `"-0700"`) is **concatenated** onto the string before passing to `new Date()` or FullCalendar. The IANA string (`conference.timezone`) is used separately for `Intl.DateTimeFormat`. Day-of-month is extracted via `split('-')[2]` rather than the formatter due to a noted cross-browser edge case.

6. **shadcn UI components are wrappers.** Everything in `src/app/components/ui/` is a thin styled wrapper over a Radix primitive. Do not edit them directly unless there are bugs; treat them as a stable design-system layer.

7. **`ProtectedRoute` exists but is unused.** It is a ready-made HOC for guarding routes. Wire it in when features (e.g., messaging) require authentication.

8. **Commented-out code is intentional scaffolding.** Blocks of commented code (in `App.tsx`, `ConferenceHeader.tsx`, `ProfilePage.tsx`, etc.) represent prior iterations or planned wiring. Do not remove them.

9. **Search uses Fuse.js, not a backend.** `SearchService` in `src/services/searchService.ts` builds an in-memory Fuse.js index from the active conference sessions. `SearchBar` queries this service and writes highlight IDs into `SearchContext`, which `ScheduleView` and the map views consume to scroll/highlight matching items.

10. **Bookmarks and raffle tickets use localStorage.** `useBookmarks` and `useRaffleTickets` both store data in `localStorage` keyed by conference ID. They reload automatically when `activeConference` changes. Firestore persistence is planned but not yet wired.

11. **`mapSessionRooms` and `mapExhibitorBooths` are populated as module-load side effects.** `src/lib/sessionData.ts` mutates the matching `Conference` objects in `allConferences` in-place when it processes each loaded conference module. `updateMapSessionRooms()` is called whenever `mapSessions` or `mapRooms` is found in a module; `updateMapExhibitorBooths()` is called whenever `mapExhibitors` or `mapBooths` is found. Both functions are idempotent for supplemental files (the `isSupplemental` flag bypasses the duplicate-load guard). Because both functions mutate the shared `allConferences` array, the populated fields are immediately visible to any consumer that imports `allConferences` after `sessionData.ts` has been imported (e.g., test files that `import "@/lib/sessionData"` at the top to trigger the side effects).

## 13. How Firestore settings sync works

Theme preference is the first user setting persisted to Firestore. The flow is:

1. On user **login**, `FirebaseThemeSync` (mounted inside `<App>`) calls `getUserTheme(uid)` from `src/services/userSettingsService.ts`, which reads `userSettings/{uid}.theme` from Firestore.

2. If a saved theme is found, it calls `ThemeContext.setTheme()` to apply it immediately — and sets a flag to suppress the echoed write-back that would otherwise follow.

3. On any subsequent **theme change** (user picks light/dark/system in `SettingsCard`), `FirebaseThemeSync` detects the change and calls `setUserTheme(uid, theme)`, which writes `{ theme }` (merge) to `userSettings/{uid}`.

4. On **logout**, `FirebaseThemeSync` clears its loaded-uid ref so that the next login re-reads Firestore rather than assuming the cached value.

5. Firestore security rule: each user can only read and write their own `userSettings/{uid}` document.

The same `userSettings` collection is the intended home for future user preferences (notification toggles, etc.) once those stubs are wired up.
