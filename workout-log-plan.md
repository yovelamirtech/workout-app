# Workout Log — Project Plan

A simple, mobile-first web app for logging gym workouts and knowing what to lift next time.

---

## ⚠️ Read first — how to work with this file (every agent, every session)

1. **Read this whole file before writing any code.**
2. **Work in order.** Phase 0 and Phase 1 are the **MVP for a programming class on CI/CD**. They must stay small and simple and be fully tested. **Do not start Phase 2 or later until the owner explicitly says so.**
3. When you **start** a task, set its Status to 🟡.
4. When you **finish** a task, set it to ✅ and fill in "Notes / what's left": what you did, any decisions you made, anything that is still missing.
5. If you only partly finish, keep it 🟡 and write **exactly** what remains, so the next agent can continue without guessing.
6. A task is ✅ **only if** `npm run lint`, `npm test` and `npm run build` all pass.
7. **Before ending every work session: update the plan table and add a line to the Work Log at the bottom. This is mandatory.**
8. If you change a decision in this file (stack, data model, rules), update the relevant section too, not only the table.

**Status legend:** ⬜ not started · 🟡 in progress · ✅ done · ⏸️ blocked (explain why in notes)

---

## Product

**Changed on 2026-10-30 (Phase 1c): the app is a workout plan, not a log.** There is no history and no "finish workout". The user opens a workout at the gym and sees, for each exercise, the machine and weight to use. When they progress, they tap "ערוך" on that one exercise, change it, tap "שמור", and it is saved for next time. The goal is as little friction as possible.

One exercise can be done on several machines that work the same muscle (a cable machine, a plate-loaded machine, plain dumbbells...). Each has different numbers and mechanics, so each exercise holds one weight per machine, with a machine name and unit typed by the user. Units: kg, lb, or "other" (a machine-specific number, shown without a unit). Units are never converted or compared between machines. Cardio exercises hold speed (km/h) and incline (%).

The two default workouts are built in: their exercise list is fixed and they can't be renamed or deleted. The user can create workouts, add exercises to them (from the existing list or a new exercise with a name and type), remove exercises, rename and delete them. Plans belong to a workout: the same exercise in two workouts keeps separate numbers.

Everything is stored locally in the browser. No backend, no login.

---

## Tech stack

- React + TypeScript, built with Vite
- Tailwind CSS (current stable version, via the official Vite plugin)
- Vitest + jsdom
- React Testing Library + `@testing-library/user-event` + `@testing-library/jest-dom`
- ESLint
- localStorage for persistence
- GitHub Actions for CI, GitHub Pages for deploy

Install current stable versions and check the official docs for setup. Don't rely on memory for config syntax.

**UI:** Hebrew, right-to-left (`<html lang="he" dir="rtl">`), mobile-first, large touch targets.

---

## Engineering principles

- **Business logic lives in pure functions in `src/lib/`.** No React and no localStorage in them, so they are trivial to test.
- **Storage is behind one small module** (`src/lib/storage.ts`) so it can be swapped later (e.g. for sync).
- **Simple over clever.** No state-management libraries in the MVP. Use `useState` / `useReducer`, and context only if really needed.
- Every pure function has unit tests. Every main user flow has at least one component test.
- Tests sit next to the code (`plan.ts` + `plan.test.ts`).

### Suggested structure

```
src/
  lib/
    types.ts
    plan.ts             + plan.test.ts      (formatting, cleaning machines, workout changes)
    storage.ts          + storage.test.ts
  data/
    defaultWorkouts.ts
  components/
    ExerciseCard.tsx    (view the plan, edit one exercise)
    MachineRow.tsx
    AddExercisePanel.tsx
    fields.ts
  screens/
    HomeScreen.tsx
    WorkoutScreen.tsx
  App.tsx
.github/workflows/ci.yml
```

---

## Data model

```ts
type ExerciseType = 'weight' | 'cardio';

interface Exercise {
  id: string;
  name: string;            // Hebrew display name
  type: ExerciseType;
}

type WeightUnit = 'kg' | 'lb' | 'other';   // 'other' = machine-specific number, no unit shown

interface MachineEntry {
  machine: string;         // typed by the user, may be empty
  weight: number;          // 0 = not set yet
  unit: WeightUnit;
}

interface CardioPlan {
  speedKmh: number;        // 0 = not set
  inclinePct: number;      // 0 = not set
}

interface WorkoutExercise {  // one exercise in a workout, with its plan
  exerciseId: string;
  machines: MachineEntry[];  // weight exercises
  cardio?: CardioPlan;       // cardio exercises
}

interface Workout {
  id: string;
  name: string;            // e.g. "רגליים + ידיים"
  builtIn: boolean;        // default workouts: fixed exercises, no rename/delete
  exercises: WorkoutExercise[];
}
```

Stored as `{ workouts, customExercises }` under `workout-plan:v1`. On first load (or corrupt data) the default workouts are used with an empty plan. The old log key `workout-log:v1` is not read or deleted.

### Default workouts (seed data)

- **רגליים + ידיים:** squat / leg press, leg curl, leg extension, calves, cable biceps curl, cable triceps extension
- **חזה, גב, כתפיים + קרדיו:** bench press, lat pulldown, machine fly, machine row, cable lateral raise, incline walk (cardio: speed and incline)

---

## Core rules: the plan (`src/lib/plan.ts`)

- `formatMachine`: "כבל: 40 ק״ג"; without a name just the weight; without a weight "כבל: —".
- `formatCardio`: "מהירות 5.5 קמ״ש · שיפוע 12%", only the parts that are set, or `null`.
- `cleanMachines`: on save, trims names and drops rows with no name and no weight.
- `updateWorkoutExercise`, `addExerciseToWorkout` (at most once), `removeExerciseFromWorkout`, `createWorkout`, `createExercise`.

The "last time" rule (`lastTime.ts`) and the history were removed on 2026-10-30 together with the log.

---

## Class demo idea (CI/CD)

1. Show green CI and the live GitHub Pages site.
2. On a branch, break the rule on purpose (e.g. in `formatWeight` swap the unit labels, or make `cleanMachines` drop rows without a weight), push, and open a PR. CI goes red and the PR shows a failing check.
3. Fix it, push, and CI goes green. Merge, and the site redeploys automatically.

---

## Plan

### Phase 0 — Setup (class)

| # | Task | Done when | Status | Notes / what's left |
|---|------|-----------|--------|---------------------|
| 0.1 | Scaffold Vite + React + TS | `npm run dev` shows the app | ✅ | create-vite 9 (Vite 8, React 19, TS 6). Removed the template's demo files and oxlint (we use ESLint). Dev URL is `/workout-app/` because of `base`. |
| 0.2 | Add Tailwind, set Hebrew + RTL | a Tailwind class visibly works; `dir="rtl"` on `<html>` | ✅ | Tailwind 4 via `@tailwindcss/vite`; `src/index.css` has `@import "tailwindcss"`. `<html lang="he" dir="rtl">`. |
| 0.3 | Set up Vitest + jsdom + RTL + jest-dom | one sample component test passes with `npm test` | ✅ | Test config is inside `vite.config.ts`. Setup file `src/test/setup.ts` (jest-dom matchers, cleanup, clears localStorage after each test). No globals: tests import from `vitest`. |
| 0.4 | ESLint and npm scripts `lint`, `test`, `build` | all three scripts run and pass | ✅ | ESLint 10 flat config (`eslint.config.js`): js + typescript-eslint + react-hooks + react-refresh. Also `test:watch`. |
| 0.5 | GitHub Actions CI (`.github/workflows/ci.yml`) | on push and PR: install → lint → test → build; a failing test makes the run red | 🟡 | Workflow runs on every push and PR (Node 22, npm ci → lint → test → build); first run on `main` was green. **Left:** show a red run from a failing test on a branch/PR (this is class demo step 2). |
| 0.6 | Deploy to GitHub Pages | push to `main` deploys automatically; Vite `base` set to the repo name; live URL in README | ✅ | Repo: https://github.com/yovelamirtech/workout-app (public). Pages source = GitHub Actions. The `deploy` job in `ci.yml` runs only on push to `main` after the `ci` job is green. `base: '/workout-app/'`. Live: https://yovelamirtech.github.io/workout-app/ (in README). |

### Phase 1 — MVP (class)

| # | Task | Done when | Status | Notes / what's left |
|---|------|-----------|--------|---------------------|
| 1.1 | Types + default templates | `types.ts` and `defaultTemplates.ts` exist with the seed data above | ✅ | Added `Suggestion` type and `ExerciseLog.done` (cardio checkbox). `defaultTemplates.ts` also exports `defaultExercises`. All seed exercises are `weight` except incline walk (`cardio`). |
| 1.2 | `progression.ts`: `getLastLog`, `suggestNext` | all rules above implemented; unit tests cover every case listed | ✅ | `suggestNext` returns `{ weightKg, reps }` or `null` (also `null` for cardio). `getLastLog` skips logs with no sets; on equal dates the later-saved session wins. Bodyweight rule implemented literally: target+1 or target. |
| 1.3 | `storage.ts`: load and save sessions | tests: save → load round-trip; empty storage returns `[]`; corrupt JSON returns `[]` without crashing | ✅ | Stored as `{ sessions: [...] }` under `workout-log:v1`. Wrong shape also returns `[]`. |
| 1.4 | Home screen | lists templates; tapping one starts a workout | ✅ | Navigation is a `useState` screen value in `App.tsx` (no router). |
| 1.5 | Workout screen | each exercise shows "last time" and "suggested today"; user can add, edit and remove sets (weight + reps) | ✅ | Components `ExerciseCard` and `SetRow`. A new set copies the previous set, else the suggestion, else empty weight + target reps (`lib/workout.ts`). Bodyweight has no weight input; cardio is a "done" checkbox. |
| 1.6 | Finish and save workout | session saved to storage; component test covers start → add set → finish → appears in history | ✅ | `finalizeLogs` drops sets with 0 reps and untouched exercises; "finish" is disabled until something is logged. After saving, the app goes to History. Covered in `App.test.tsx`. Also checked manually in the browser. |
| 1.7 | History screen | past sessions listed newest first, with date and template name | ✅ | Date shown as DD/MM/YYYY; each session also lists its exercises and sets. |
| 1.8 | README | what it is, screenshot, live link, how to run and test, CI status badge | 🟡 | Written, with CI badge and live link. **Left:** add a screenshot. |

### Phase 1b — Owner changes after the MVP

| # | Task | Done when | Status | Notes / what's left |
|---|------|-----------|--------|---------------------|
| 1b.1 | Weight only, several machines per exercise | no reps anywhere; each exercise logs a weight per machine (name, weight, unit kg/lb/other); "last time" per machine; old data migrated | ✅ | Removed reps, `bodyweight`, `targetReps`, `incrementKg`, `suggestNext` and the "suggested today" line. `progression.ts` replaced by `lastTime.ts`; `SetRow` replaced by `MachineRow`. One weight per machine per workout. Machine names are free text; an empty name is allowed (shown as just the weight). |

| 1b.2 | Prefill last weights, delete and edit history | | ✅ | PRs #2, #3. Superseded by 1c.1. |

### Phase 1c — Workout plan instead of a log (owner change, 2026-10-30)

| # | Task | Done when | Status | Notes / what's left |
|---|------|-----------|--------|---------------------|
| 1c.1 | Plan, not log | no history; workout screen shows each exercise as text (machine, weight, unit; cardio speed and incline); "ערוך" edits one exercise and saves it right away | ✅ | Removed `HistoryScreen`, `history.ts`, `lastTime.ts`, `workout.ts` and the "finish" step. New `plan.ts`, new storage key `workout-plan:v1` (starts from scratch). Plans are per workout, not shared between workouts. |
| 1c.2 | Custom workouts | create, rename, delete workouts; add (existing or new) and remove exercises; built-in workouts stay fixed | ✅ | Custom exercises are kept in the library even when removed from a workout; there is no UI to delete or rename them yet. No reordering. |

**🛑 Stop here until the owner says to continue.**

### Phase 2 — A genuinely useful app

| # | Task | Done when | Status | Notes / what's left |
|---|------|-----------|--------|---------------------|
| 2.1 | Manage templates | create, rename, delete templates; add, remove and reorder exercises | 🟡 | Done in 1c.2 except reordering. |
| 2.2 | Exercise library | add custom exercises with type and muscle group | 🟡 | Add with name and type done in 1c.2. Left: muscle group, rename/delete custom exercises. |
| 2.3 | Edit and delete past sessions | with a confirmation before delete | ⏸️ | No history since 1c.1. |
| 2.4 | Real cardio logging | duration, speed, incline; "last time" shown for cardio too | 🟡 | Speed and incline in the plan since 1c.1. Left: duration, if wanted. |
| 2.5 | Rest timer | starts after a set is logged; configurable length; sound or vibration where supported | ⬜ | |
| 2.6 | Double progression (rep range) | per-exercise range (e.g. 8–12): add reps until the top of the range, then add weight and drop to the bottom; fully unit-tested | ⏸️ | Not relevant since 1b.1: the owner does not log reps. |
| 2.7 | Stall detection | failing the target 3 sessions in a row → suggest a ~10% deload; tested | ⏸️ | Not relevant since 1b.1: needs reps. |
| 2.8 | Draft workout survives refresh | in-progress workout auto-saved and restored | ⏸️ | Not relevant since 1c.1: every save is immediate. |
| 2.9 | Copy last workout | one tap pre-fills today's sets from last time | ⏸️ | Not relevant since 1c.1. |

### Phase 3 — Insights

| # | Task | Done when | Status | Notes / what's left |
|---|------|-----------|--------|---------------------|
| 3.1 | Exercise detail page | chart of top weight and estimated 1RM over time | ⬜ | |
| 3.2 | Personal records | PR detection (tested); badge or celebration when a new PR is logged | ⬜ | |
| 3.3 | Weekly summary | workouts this week vs a weekly goal (setting); volume per muscle group | ⬜ | |
| 3.4 | Calendar / heatmap | days trained, GitHub-contributions style | ⬜ | |
| 3.5 | Streaks | consecutive weeks hitting the goal; date edge cases tested | ⬜ | |

### Phase 4 — Quality and polish

| # | Task | Done when | Status | Notes / what's left |
|---|------|-----------|--------|---------------------|
| 4.1 | PWA | installable on iPhone home screen; works offline | ⬜ | |
| 4.2 | Backup | export and import all data as JSON; import validates the data | ⬜ | |
| 4.3 | Dark mode | follows the system setting plus a manual toggle | ⬜ | |
| 4.4 | Accessibility pass | labels, focus states, contrast, keyboard navigation | ⬜ | |
| 4.5 | Gym mode | big inputs, one-hand use, +/- steppers for weight | ⬜ | |
| 4.6 | E2E tests (Playwright) in CI | main flow tested end-to-end on every PR | ⬜ | |
| 4.7 | Coverage threshold in CI | e.g. ≥ 80% on `src/lib`; CI fails below it | ⬜ | |
| 4.8 | Units setting | kg / lb | ⏸️ | Covered by 1b.1: the unit is chosen per machine. |
| 4.9 | English UI (i18n) | language switch; LTR handled correctly | ⬜ | |

### Phase 5 — Optional, only if the owner asks

| # | Task | Done when | Status | Notes / what's left |
|---|------|-----------|--------|---------------------|
| 5.1 | Sync across devices | backend chosen with the owner (e.g. Supabase or Firebase); storage module swapped without touching the logic | ⬜ | |

---

## Work Log

Add one line at the end of every session.

| Date | Agent / session | What was done | Next step |
|------|-----------------|---------------|-----------|
| 2026-10-23 | Claude Code (Opus 5.5) | Phase 0 + Phase 1 code: scaffold, Tailwind/RTL, Vitest, ESLint, CI + Pages workflow, lib (progression, history, storage, workout), Home/Workout/History screens, README. lint, test (49 tests) and build pass. | Create the GitHub repo and push; enable Pages; fill in `<OWNER>` and the screenshot in README (0.5, 0.6, 1.8). Owner to review names. |
| 2026-10-23 | Claude Code (Opus 5.5) | Created the public GitHub repo `yovelamirtech/workout-app`, enabled Pages (GitHub Actions), pushed `main`. CI green, site deployed and checked live. | Class demo: failing test on a branch → red PR (finishes 0.5); README screenshot (1.8). |
| 2026-10-27 | Claude Code | Owner change 1b.1: weight only (no reps), several machines per exercise with name + weight + unit (kg/lb/other), "last time" per machine, no suggestion. Migration of old sets data on load. lint, test (44 tests) and build pass. | Owner to try it on the phone. Class demo (0.5) now breaks `lastTime.ts` instead of the progression rule. |
| 2026-10-30 | Claude Code | Owner change 1c: the app is now a workout plan. No history; each exercise is shown as text and edited on its own ("ערוך" → "שמור"); cardio has speed and incline; custom workouts (create, rename, delete, add/remove exercises, new exercises). Plans per workout. New storage key, starts from scratch. lint, test (35 tests) and build pass. | Owner to try it on the phone. |
