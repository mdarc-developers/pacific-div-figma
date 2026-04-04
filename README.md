# Amateur Radio Conference Companion AttendeeApp

This is a web companion attendee app designed for attendees of several ARRL conferences.
The goals are to enhance the attendee experience and provide the tools that conference organizers need. The goal is to provide a native iOS app through the Apple App Store and an Android app through the Google Play Store.
This React 19 app hosted on Google Firebase enables development and authentication.
The iOS and Android apps will likely be developed with expo.dev and provide the best experience.
Great care and testing will enable seamless offline use by using a local-first LoFi.so architecture.

Live app: **https://pacific-div.web.app**

Registered domain: attendeeapp.com

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
- **Cloud Functions** — welcome email on new user registration; signup counter; SMS + email prize winner notifications via Twilio and Gmail API; see [`functions/README.md`](functions/README.md) for details
- **Firestore security rules** — per-collection access control for conferences, sessions, maps, users, prizes, messages, and stats

## Conferences

Sample data has been loaded for:

- Quartzfest — Jan, Quartzsite, AZ
- Hamcation — Feb, Orlando, FL
- Yuma Hamfest — Feb, Yuma, AZ
- VOMARC Hamfest — Apr, Sonoma, CA
- Reno Ham Swap — May, Reno, NV 
- Hamvention — May, Dayton, OH
- Carmichael Ham Swap — May, Carmichael, CA
- SeaPac — Jun, Portland, OR
- Huntsville Hamfest — Aug, Huntsville, AL
- Pacificon — Oct, San Ramon, CA

## Development

### Node.js version

This project requires **Node.js 25**. The required version is declared in both `package.json` (`"engines": { "node": "25" }`) and `.nvmrc`.

If you use [nvm](https://github.com/nvm-sh/nvm) (macOS/Linux) or [nvm-windows](https://github.com/coreybutler/nvm-windows):

```bash
nvm install   # reads .nvmrc and installs Node 25 if not already present
nvm use       # switches to the version declared in .nvmrc
```

After switching to Node 25, reinstall dependencies:

```bash
npm install        # install node_modules dependencies
npm run dev        # Vite dev server with hot reload at localhost:5173
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
cd functions
npm install
npm run build
firebase deploy --only functions
```

> **Note:** Each target can be deployed independently. The GitHub Actions CI workflows deploy only the Hosting target automatically on merge to `main` or when a PR is opened. Firestore rules and Cloud Functions must be deployed manually.

## Running tests

### Unit tests

```bash
npm run test          # run the Vitest unit test suite once
npm run testverbose   # same, with verbose per-test output
```

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

### Cloud Functions unit tests

The Firebase Cloud Functions have their own independent test suite under `functions/`. These tests are **not** run by `npm run test` at the project root — they must be run separately from within the `functions/` directory:

```bash
cd functions
npm install   # only needed once, or after updating functions/package.json
npm test
```

No Firebase project credentials or secrets are needed; the test suite runs fully offline with mocked Firebase Admin and mocked Twilio/Gmail clients.

### Saving test output

```bash
npm run testsave   # run tests and save timestamped output to test-results/testoutput.txt
```

`testsave.sh` records the UTC start/end timestamps and the hostname alongside the full Vitest output. The saved file can then be split by conference name (see below).

### Map image size tests

```bash
npm run testimagesizes   # validate that every map image in public/ matches the dimensions declared in its conference data file
```

This runs `src/data/mapImageDimensions.test.ts`, which reads the actual PNG/JPEG headers from the `public/` directory and asserts that each `MapImage` record's `width` and `height` match the real pixel dimensions of the file. Run this after adding or replacing any venue map images.

### End-to-end tests

```bash
npm run build:test   # build with --mode test (stub Firebase keys are fine)
npm run test:e2e     # Playwright tests against http://127.0.0.1:5173
npm run test:e2e:ui  # same tests with the Playwright interactive UI (trace viewer, step-through)
```

Always build first (`npm run build:test`) before running the E2E suite; Playwright exercises the production bundle served by `vite preview`.

### Splitting saved test output by conference

After running `npm run testsave`, you can break the combined `test-results/testoutput.txt` into per-conference files:

```bash
bash scripts/testlog-to-convention.sh
```

The script discovers all conference data files matching `src/data/*-20??.ts`, then routes each line of `testoutput.txt` to the first matching `test-results/testoutput-{conference}-YYYYMMDD.txt` file. Lines that do not match any conference name go to `testoutput-other-YYYYMMDD.txt`. Each output line is prefixed with its original line number so you can cross-reference the full log.

This is useful for quickly scanning warnings or failures that belong to a specific conference's data file rather than reading one large log.

### Expected `stderr` output during unit tests

All tests are expexcted to pass (`✓`). Some `stderr` messages are expected to appear during a normal run and are **not failures**.
