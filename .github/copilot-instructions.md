# Copilot Instructions — Amateur Radio Conference Attendee App

## Project overview

This is a **React 18 + TypeScript + Vite** progressive web app for amateur radio (ham radio) ARRL Division conferences. It is live at <https://pacific-div.web.app> and hosted on Firebase Hosting. The Figma source design lives at <https://www.figma.com/design/fAJt1K7Tm5xlgtypyfRTq5/Attendee-Conference-App>. See [`ARCHITECTURE.md`](../ARCHITECTURE.md) for the full technical reference.

---

## Technology stack

| Layer | Technology |
|---|---|
| Runtime | React 18 (peer dep) |
| Language | TypeScript 5.x — **strict mode** |
| Bundler | Vite 6.x with `@vitejs/plugin-react` and `@tailwindcss/vite` |
| Styling | Tailwind CSS 4.x — **no `tailwind.config.js`**; CSS custom-property theme in `src/styles/theme.css` |
| UI primitives | shadcn/ui pattern — thin wrappers in `src/app/components/ui/` over Radix UI |
| Icons | `lucide-react` |
| Calendar | FullCalendar 6.x (`timeGridThreeDay` + `timeGridDay`) |
| Router | `react-router-dom` 7.x with `BrowserRouter` |
| Backend / Auth | Firebase 12.x — Auth (email+password, Google OAuth), Firestore, Storage |
| Lint | ESLint 9 flat config + `typescript-eslint` + `eslint-plugin-react` |
| CI / Hosting | Firebase Hosting + GitHub Actions (merge-to-main → live; PR → preview) |

---

## Development commands

```bash
npm i            # install dependencies
npm run dev      # Vite dev server with hot reload
npm run build    # production bundle → dist/
npm run lint     # ESLint across all src files
npm run test     # Vitest unit tests
npm run deploy   # firebase deploy (requires firebase CLI login)
```

Firebase config values must be supplied as `VITE_FIREBASE_*` environment variables (e.g., in a local `.env` file — never commit secrets).

---

## Repository layout (key paths)

```
.github/
  workflows/           # CI: firebase-hosting-merge.yml, firebase-hosting-pull-request.yml
src/
  main.tsx             # Entry: AuthProvider → ConferenceProvider → BrowserRouter → App
  app/
    App.tsx            # Route table + persistent layout (Header, Nav, Footer)
    components/        # Shared UI — ConferenceHeader, Navigation, MapsView, ScheduleView, …
      ui/              # shadcn-style Radix wrappers — treat as stable; do not edit unless buggy
    contexts/          # AuthContext, ThemeContext, ConferenceContext
    pages/             # Route-level containers (MapsPage, SchedulePage, ProfilePage, …)
  data/                # Hard-coded sample conference data (temporary — see roadmap)
  lib/
    firebase.ts        # initializeApp; exports auth, db, storage singletons
  types/
    conference.ts      # All shared TypeScript interfaces
  styles/              # index.css, theme.css (CSS custom properties), fonts.css
ARCHITECTURE.md        # Full technical reference — read before making major changes
```

---

## Coding conventions

1. **Path alias** — always use `@/` (maps to `src/`). Both `vite.config.ts` and `tsconfig.json` declare this alias.
2. **Page vs View split** — every route tab has two layers:
   - `src/app/pages/<Name>Page.tsx` — owns route-level state (auth checks, bookmarks, etc.)
   - `src/app/components/<Name>View.tsx` — handles all rendering; receives props from the Page.
   Follow this pattern when adding new tabs.
3. **Unauthenticated rendering** — `AlertsPage` and `ProfilePage` do **not** use `ProtectedRoute`. They conditionally render a placeholder View or the authenticated UI directly. This is intentional.
4. **shadcn UI components** — everything in `src/app/components/ui/` is a Radix wrapper. Do not edit these files unless fixing a confirmed bug.
5. **Commented-out scaffolding** — blocks of commented code in `App.tsx`, `ConferenceHeader.tsx`, `ProfilePage.tsx`, etc. are intentional placeholders for planned features. Do **not** remove them.
6. **Hard-coded data is temporary** — `MapsPage` and `SchedulePage` import directly from sample data files. Do not add more direct sample-data imports; this is the single replacement point for the future Firestore migration.
7. **Timezone handling** — session times are stored without an offset (e.g., `"2026-10-16T09:00:00"`). Append `conference.timezoneNumeric` (e.g., `"-0700"`) at render time. Use `conference.timezone` (IANA string) with `Intl.DateTimeFormat`. Extract the day-of-month via `split('-')[2]` (not `DateTimeFormat`) — see the comment in `ScheduleView.tsx` for the cross-browser reason.
8. **`ProtectedRoute` exists but is unwired** — use it when adding routes that must require authentication.
9. **Dark mode** — `.dark` theme vars are fully defined in `theme.css`; `next-themes` is installed but unused. Wire `useTheme` into the Profile page when implementing the toggle.

---

## TypeScript interfaces (`src/types/conference.ts`)

All domain types live in a single file. Every interface carries a `conferenceId` foreign key for the multi-conference model. Key types: `Conference`, `Session`, `MapImage`, `Prize`, `PrizeWinner`, `UserProfile`, `Message`.

---

## Authentication flow

`AuthContext` wraps the app and exposes:

- `user` — Firebase `User | null`
- `loading` — boolean
- `signIn(email, password)` — `signInWithEmailAndPassword`
- `signUp(email, password)` — `createUserWithEmailAndPassword`
- `signInWithGoogle()` — `GoogleAuthProvider` + `signInWithPopup`
- `logout()` — `signOut`

---

## Planned / stub features (do not remove scaffolding)

- Firestore data layer (replace hard-coded imports)
- Multi-conference selector
- Prize notifications
- Bookmark persistence to Firestore
- Dark mode toggle
- SMS & email notification settings
- Messaging / forum board
- Admin interfaces
- Offline support
- CSV data import / export
- Callsign verification

See `ARCHITECTURE.md §9` and `FIREBASE_SETUP.md` for details.
