export type ExerciseType = 'weight' | 'cardio'

export interface Exercise {
  id: string
  name: string // Hebrew display name
  type: ExerciseType
}

export interface WorkoutTemplate {
  id: string
  name: string // e.g. "רגליים + ידיים"
  exerciseIds: string[]
}

// 'other' is a machine-specific number (e.g. a plate or pin number), shown without a unit
export type WeightUnit = 'kg' | 'lb' | 'other'

// The weight used on one machine for an exercise. Several machines (cable, plate-loaded,
// dumbbells...) can do the same exercise; each keeps its own numbers and unit.
export interface MachineEntry {
  machine: string // user-entered name, may be empty
  weight: number
  unit: WeightUnit
}

export interface ExerciseLog {
  exerciseId: string
  entries: MachineEntry[]
  done?: boolean // cardio in the MVP is a simple "done" checkbox
  // cardio (Phase 2): durationMin, speedKmh, inclinePct
}

export interface WorkoutSession {
  id: string
  date: string // ISO date, YYYY-MM-DD
  templateId: string
  logs: ExerciseLog[]
}
