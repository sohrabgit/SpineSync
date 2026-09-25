# SpineSync

A mobile-first web app for **30-day cervical disc recovery and ergonomic health**. It turns the playbook in [`docs/cervical_disc_recovery_playbook-2.md`](docs/cervical_disc_recovery_playbook-2.md) into an interactive daily companion.

> SpineSync helps you manage your own recovery. It does not replace advice from a qualified clinician.

## Features

- **Morning pain check-in** (VAS 0–10, radiating arm pain, numbness, red-flag screen). Your answers pick one of four plan levels:
  | Condition | Plan |
  | --- | --- |
  | Any red-flag symptom | **Medical pause**: exercises stop and an urgent-consult screen appears |
  | VAS ≥ 7 **or** radiating arm pain | **Flare-up mode**: isometrics and strengthening paused; cold, heat and rest only; warning banner shown |
  | VAS < 7 and pain higher than the last check-in | **Reduced**: exercises drop one difficulty tier |
  | Otherwise | **Standard**: the protocol for the current phase |
- **Exercise tracker**: a ring timer for holds that runs hold → relax → next rep automatically, with haptic and sound cues and a screen wake lock. Also step-by-step instructions, safety notes, and per-side/direction sets.
- **Ergonomics guide**: 10 activity categories (desk, sleep, devices, driving, cooking, bathing, travel, childcare, shopping, sexual health) with tappable checklists, a movement-break counter, and a 20-20-20 reminder.
- **Progress dashboard**: a pain trend line with flare days marked, daily adherence bars, NDI checkpoints (days 1/15/30), pain delta, streak, and a table view.
- **On-device coach**: rule-based insights (safety → trend → adherence → NDI) that make no API calls.
- **Your data stays on your device**: stored in `localStorage` with JSON export and import. No account, no server.

### Formulas

- **NDI %** = sum of answered section scores ÷ (answered sections × 5) × 100
- **Daily adherence %** = (completed exercises + checked ergonomic tasks) ÷ total scheduled tasks × 100
- **Pain delta** = mean VAS of the first 3 logged days − mean VAS of the last 3 logged days (positive = improvement)

## Tech stack (free to build and host)

Vite · React 19 · TypeScript (strict) · Tailwind CSS v4 · Zustand (persist) · Recharts · lucide-react · Vitest

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit tests for the decision tree and metrics
npm run build      # type-check + production build to dist/
```

To try the program progression without waiting days, open **Settings → Simulate next day**.

## Project structure

```
src/
  types/recovery.ts      Domain model (persisted root follows the product JSON schema)
  data/                  Exercise library, tier protocols, ergonomics, NDI, red flags, schedule
  lib/                   Pure logic: adaptive decision tree, metrics, coach, dates (+ tests)
  store/                 Zustand store with localStorage persistence and day rollover
  hooks/                 Hold timer, day rollover, wake lock
  components/            Layout shell and UI primitives
  features/              today · exercises · ergonomics · progress · onboarding · settings
```

## Deploying (free)

**GitHub Pages (preconfigured):** push to `master`, then in the repo go to **Settings → Pages → Source: GitHub Actions**. `.github/workflows/deploy.yml` runs the tests, builds with `BASE_PATH=/<repo-name>/`, and publishes the site.

**Cloudflare Pages / Netlify / Vercel:** build command `npm run build`, output directory `dist`. No base path is needed because it defaults to `/`.

The app uses tab state instead of URL routes, so no SPA rewrite rules are needed.

## License

MIT
