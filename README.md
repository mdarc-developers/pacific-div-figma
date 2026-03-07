# Amateur Radio Conference Attendee Companion App

This is an attendee companion web app designed for attendees of several ARRL conferences.
The goals are to enhance the attendee experience and provide the tools that conference organizers need.
This React 19 app hosted on Google Firebase enables development and authentication.
The planned iOS and Android apps developed with expo.dev will provide the best experience.
Great care and testing will enable seamless offline use by using a local-first LoFi.so architecture.

Live app: **https://pacific-div.web.app**

## Implemented Features

- **Multi-conference support** — browse sessions, maps, exhibitors, and prizes for multiple conferences (Quartzfest, Hamcation, Yuma Hamfest, Hamvention, SeaPac, Huntsville Hamfest, Pacificon)
- **Schedule** — card list + FullCalendar 3-day / 1-day views with per-day filtering and session bookmarking
- **Maps** — tabbed venue map viewer with fallback SVG placeholder for missing images
- **Interactive exhibitor map** — Leaflet-based booth overlay with search highlighting; SVG floor plan for Pacificon
- **Interactive forum map** — Leaflet-based room overlay with search highlighting
- **Prizes** — attendee prize list, raffle ticket entry, image carousel, and admin prize-management interface
- **Attendees** — conference attendee list
- **Search** — Fuse.js in-memory full-text search across sessions, exhibitors, and forums; results scroll and highlight in the relevant view
- **Firebase Auth** — email/password and Google sign-in; email verification; password reset
- **Dark / light / system theme** — fully wired; persists to `localStorage` and Firestore so it roams across devices
- **User profile** — avatar, callsign, account card, theme toggle, notification stubs, bookmarked sessions, raffle tickets, prize-admin link
- **Cloud Functions** — welcome email on new user registration; signup counter; see [`functions/README.md`](functions/README.md) for details
- **Firestore security rules** — per-collection access control for conferences, sessions, maps, users, prizes, messages, and stats

## Conferences

Sample data has been loaded for:

- Quartzfest — Jan, Quartzsite, AZ
- Hamcation — Feb, Orlando, FL
- Yuma Hamfest — Feb, Yuma, AZ
- Hamvention — May, Dayton, OH
- SeaPac — Jun, Portland, OR
- Huntsville Hamfest — Aug, Huntsville, AL
- Pacificon — Oct, San Ramon, CA

## Development

```bash
npm install        # install dependencies
npm run dev        # Vite dev server with hot reload
```

## Deploying

Three independent deployment targets must be managed separately:

### 1. Web app (Hosting)

```bash
npm run build                  # compile → dist/
firebase deploy --only hosting # deploy web app → https://pacific-div.web.app
```

### 2. Firestore security rules

```bash
firebase deploy --only firestore:rules
```

This deploys `firestore.rules` from the repo root. Run this whenever the rules file changes.

### 3. Cloud Functions

See [`functions/README.md`](functions/README.md) for full setup instructions (secrets, service account, `.env`).

```bash
firebase deploy --only functions
```

> **Note:** Each target can be deployed independently. The GitHub Actions CI workflows deploy only the Hosting target automatically on merge to `main` or when a PR is opened. Firestore rules and Cloud Functions must be deployed manually.

## Running tests

Run `npm run test` to execute the unit test suite (must be run from within the project directory tree).

To run tests from **any** directory (including outside the project tree or any subdirectory), use the included wrapper scripts:

- **macOS / Linux:** `test.sh`
- **Windows:** `test.bat`

Both scripts automatically navigate to the project root before running the tests, so they work regardless of your current working directory.

```bash
# macOS / Linux — from any directory
/path/to/pacific-div-figma/test.sh
```

```bat
:: Windows — from any directory (e.g. src\data)
C:\path\to\pacific-div-figma\test.bat
```

You can add the project root to your `PATH` (or create a shell alias / Windows shortcut) so you can invoke `test.sh` or `test.bat` without the full path.

### End-to-end tests

```bash
npm run build:test  # build with --mode test (stub Firebase keys are fine)
npm run test:e2e    # Playwright tests against http://127.0.0.1:5173
```
