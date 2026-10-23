export type ExerciseType = 'weight' | 'bodyweight' | 'cardio'

export interface Exercise {
  id: string
  name: string // Hebrew display name
  type: ExerciseType
  targetReps?: number // default 10
  incrementKg?: number // default 2.5
}

export interface WorkoutTemplate {
  id: string
  name: string // e.g. "רגליים + ידיים"
  exerciseIds: string[]
}

export interface SetEntry {
  weightKg: number // 0 for bodyweight
  reps: number
}

export interface ExerciseLog {
  exerciseId: string
  sets: SetEntry[]
  done?: boolean // cardio in the MVP is a simple "done" checkbox
  // cardio (Phase 2): durationMin, speedKmh, inclinePct
}

export interface WorkoutSession {
  id: string
  date: string // ISO date, YYYY-MM-DD
  templateId: string
  logs: ExerciseLog[]
}

export interface Suggestion {
  weightKg: number
  reps: number
}
