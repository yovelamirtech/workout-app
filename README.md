# Workout Log — יומן אימונים

[![CI](https://github.com/yovelamirtech/workout-app/actions/workflows/ci.yml/badge.svg)](https://github.com/yovelamirtech/workout-app/actions/workflows/ci.yml)

A simple, mobile-first web app (Hebrew, RTL) for logging gym workouts and knowing what to lift next time.

- Pick today's workout, log weight and reps for each set.
- See what you did **last time** on each exercise and a **suggested weight** for today.
- Everything is stored locally in the browser (localStorage). No backend, no login.

**Live site:** https://yovelamirtech.github.io/workout-app/

<!-- TODO: add a screenshot, e.g. docs/screenshot.png -->

## Progression rule

- No history for an exercise → no suggestion.
- Weight exercise: every set in the last session reached the target reps (default 10) → last top weight + increment (default 2.5 kg). Otherwise the same weight.
- Bodyweight exercise: every set reached the target → target + 1 rep. Otherwise the target.
- Weights are rounded to 0.5 kg.

The logic lives in [`src/lib/progression.ts`](src/lib/progression.ts) and is fully unit-tested.

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:5173/workout-app/

## Scripts

| Script | What it does |
|--------|--------------|
| `npm run dev` | Dev server |
| `npm run lint` | ESLint |
| `npm test` | Vitest (unit + component tests) |
| `npm run test:watch` | Vitest in watch mode |
| `npm run build` | Type-check and production build |

## CI/CD

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs on every push and pull request: install → lint → test → build.
On a push to `main` where everything is green, the `deploy` job publishes `dist/` to GitHub Pages.

One-time setup on GitHub: **Settings → Pages → Source: GitHub Actions**.
If the repo is not named `workout-app`, change `base` in [`vite.config.ts`](vite.config.ts).

## Tech

React + TypeScript (Vite), Tailwind CSS, Vitest + jsdom, React Testing Library, ESLint.
