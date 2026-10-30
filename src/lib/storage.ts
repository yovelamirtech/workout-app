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

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialData()
    const data = JSON.parse(raw) as Partial<AppData> | null
    if (!Array.isArray(data?.workouts) || !Array.isArray(data.customExercises)) return initialData()
    return { workouts: data.workouts, customExercises: data.customExercises }
  } catch {
    return initialData()
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}
