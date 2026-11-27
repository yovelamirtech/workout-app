import { defaultWorkouts } from '../data/defaultWorkouts'
import type { Exercise, Workout } from './types'

// The only module that touches localStorage, so it can be swapped later (e.g. for sync).
// The old workout log (`workout-log:v1`) is not read: the plan starts from scratch.
export const STORAGE_KEY = 'workout-plan:v1'

export interface AppData {
  workouts: Workout[]
  customExercises: Exercise[] // added by the user, next to the default exercises
}

function initialData(): AppData {
  return { workouts: structuredClone(defaultWorkouts), customExercises: [] }
}

// A built-in workout's exercise list can't be edited in the app, so saved data follows the
// current defaults: exercises added to a default show up, and saved plans are kept.
function syncBuiltIn(workout: Workout): Workout {
  const defaults = defaultWorkouts.find((w) => w.id === workout.id)
  if (!workout.builtIn || !defaults) return workout
  return {
    ...workout,
    exercises: defaults.exercises.map(
      (d) => workout.exercises.find((e) => e.exerciseId === d.exerciseId) ?? structuredClone(d),
    ),
  }
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialData()
    const data = JSON.parse(raw) as Partial<AppData> | null
    if (!Array.isArray(data?.workouts) || !Array.isArray(data.customExercises)) return initialData()
    return { workouts: data.workouts.map(syncBuiltIn), customExercises: data.customExercises }
  } catch {
    return initialData()
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}
