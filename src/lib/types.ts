export type ExerciseType = 'weight' | 'cardio'

export interface Exercise {
  id: string
  name: string // Hebrew display name
  type: ExerciseType
}

// 'other' is a machine-specific number (e.g. a plate or pin number), shown without a unit
export type WeightUnit = 'kg' | 'lb' | 'other'

// The weight to use on one machine for an exercise. Several machines (cable, plate-loaded,
// dumbbells...) can do the same exercise; each keeps its own numbers and unit.
export interface MachineEntry {
  machine: string // user-entered name, may be empty
  weight: number // 0 = not set yet
  unit: WeightUnit
}

export interface CardioPlan {
  speedKmh: number // 0 = not set
  inclinePct: number // 0 = not set
}

// One exercise in a workout with the plan for next time. Plans belong to the workout:
// the same exercise in two workouts keeps separate numbers.
export interface WorkoutExercise {
  exerciseId: string
  machines: MachineEntry[] // weight exercises
  cardio?: CardioPlan // cardio exercises
}

export interface Workout {
  id: string
  name: string // e.g. "רגליים + ידיים"
  // The default workouts can't be renamed or deleted and their exercise list is fixed
  builtIn: boolean
  exercises: WorkoutExercise[]
}
