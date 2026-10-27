# Workout Log — יומן אימונים

[![CI](https://github.com/yovelamirtech/workout-app/actions/workflows/ci.yml/badge.svg)](https://github.com/yovelamirtech/workout-app/actions/workflows/ci.yml)

A simple, mobile-first web app (Hebrew, RTL) for logging gym workouts and knowing what to lift next time.

- Pick today's workout and log the weight you used on each exercise. No reps.
- One exercise can be done on several machines (cable, plate-loaded machine, dumbbells...). Each machine has its own name, weight and unit (kg, lb, or "other" for a machine-specific number).
- See what you did **last time** on each machine.
- Everything is stored locally in the browser (localStorage). No backend, no login.

**Live site:** https://yovelamirtech.github.io/workout-app/

<!-- TODO: add a screenshot, e.g. docs/screenshot.png -->

## Last time

- For each exercise, every machine used before gets a row in the next workout, with its name, unit and last weight.
- The latest session wins (on the same date, the one saved later). Machines are matched by name, ignoring case and extra spaces.
- Units are never converted or compared between machines.
- Data saved before machines existed (sets with reps) is migrated on load: the top weight becomes one unnamed machine in kg.

The logic lives in [`src/lib/lastTime.ts`](src/lib/lastTime.ts) and is fully unit-tested.

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
