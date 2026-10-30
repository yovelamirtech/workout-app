import type { CardioPlan, Exercise, ExerciseType, MachineEntry, WeightUnit, Workout, WorkoutExercise } from './types'

const UNIT_LABELS: Record<WeightUnit, string> = { kg: 'ק״ג', lb: 'פאונד', other: '' }

// "40 ק״ג", "90 פאונד", or just "7" for a machine-specific number
export function formatWeight(weight: number, unit: WeightUnit): string {
  return `${weight} ${UNIT_LABELS[unit]}`.trim()
}

// "כבל: 40 ק״ג", "40 ק״ג" without a name, "כבל: —" without a weight
export function formatMachine(entry: MachineEntry): string {
  const weight = entry.weight > 0 ? formatWeight(entry.weight, entry.unit) : '—'
  return entry.machine ? `${entry.machine}: ${weight}` : weight
}

// "מהירות 5.5 קמ״ש · שיפוע 12%", or null when nothing is set
export function formatCardio(cardio: CardioPlan | undefined): string | null {
  if (!cardio) return null
  const parts = [
    cardio.speedKmh > 0 && `מהירות ${cardio.speedKmh} קמ״ש`,
    cardio.inclinePct > 0 && `שיפוע ${cardio.inclinePct}%`,
  ].filter((part) => part !== false)
  return parts.length > 0 ? parts.join(' · ') : null
}

export function emptyMachineEntry(): MachineEntry {
  return { machine: '', weight: 0, unit: 'kg' }
}

// Trims names and drops rows left completely empty (no name and no weight)
export function cleanMachines(entries: MachineEntry[]): MachineEntry[] {
  return entries
    .map((entry) => ({ ...entry, machine: entry.machine.trim() }))
    .filter((entry) => entry.machine !== '' || entry.weight > 0)
}

export function updateWorkoutExercise(workout: Workout, updated: WorkoutExercise): Workout {
  return {
    ...workout,
    exercises: workout.exercises.map((item) => (item.exerciseId === updated.exerciseId ? updated : item)),
  }
}

// An exercise appears at most once in a workout
export function addExerciseToWorkout(workout: Workout, exerciseId: string): Workout {
  if (workout.exercises.some((item) => item.exerciseId === exerciseId)) return workout
  return { ...workout, exercises: [...workout.exercises, { exerciseId, machines: [] }] }
}

export function removeExerciseFromWorkout(workout: Workout, exerciseId: string): Workout {
  return { ...workout, exercises: workout.exercises.filter((item) => item.exerciseId !== exerciseId) }
}

export function createWorkout(name: string): Workout {
  return { id: crypto.randomUUID(), name: name.trim(), builtIn: false, exercises: [] }
}

export function createExercise(name: string, type: ExerciseType): Exercise {
  return { id: crypto.randomUUID(), name: name.trim(), type }
}
