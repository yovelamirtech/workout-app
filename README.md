# Workout Log — יומן אימונים

[![CI](https://github.com/yovelamirtech/workout-app/actions/workflows/ci.yml/badge.svg)](https://github.com/yovelamirtech/workout-app/actions/workflows/ci.yml)

A simple, mobile-first web app (Hebrew, RTL) that keeps your **workout plan**: open it at the gym, see today's exercises with the machine and weight to use, and update a weight when you progress.

- Pick a workout and see each exercise as plain text: machine and weight (kg, lb, or "other" for a machine-specific number). Cardio shows speed and incline.
- Tap "ערוך" on one exercise, change it, tap "שמור". Only that exercise is edited, and the change is saved right away for next time. There is no history and no "finish workout" step.
- One exercise can be done on several machines; each has its own name, weight and unit.
- The two default workouts have a fixed exercise list. You can create your own workouts, add or remove exercises (existing ones or new ones you create), rename and delete them.
- Plans belong to a workout: the same exercise in two workouts keeps separate numbers.
- Everything is stored locally in the browser (localStorage). No backend, no login.

**Live site:** https://yovelamirtech.github.io/workout-app/

<!-- TODO: add a screenshot, e.g. docs/screenshot.png -->

## The plan

- Data is stored under the `workout-plan:v1` key. The old workout log (`workout-log:v1`) is not read: the plan starts from scratch.
- Saving an exercise trims machine names and drops rows left completely empty.
- Units are never converted or compared between machines.

The logic lives in [`src/lib/plan.ts`](src/lib/plan.ts) and is fully unit-tested.

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
