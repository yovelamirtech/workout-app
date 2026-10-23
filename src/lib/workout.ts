import { DEFAULT_TARGET_REPS } from './progression'
import type { Exercise, ExerciseLog, SetEntry, Suggestion } from './types'

// Values for a newly added set: copy the previous set, else today's suggestion, else empty weight.
export function getNewSetDefaults(
  currentSets: SetEntry[],
  suggestion: Suggestion | null,
  exercise: Exercise,
): SetEntry {
  const previousSet = currentSets.at(-1)
  if (previousSet) return { ...previousSet }
  if (suggestion) return { ...suggestion }
  return { weightKg: 0, reps: exercise.targetReps ?? DEFAULT_TARGET_REPS }
}

// Keeps only what was actually logged: sets with reps, and cardio marked done.
export function finalizeLogs(draftLogs: ExerciseLog[]): ExerciseLog[] {
  return draftLogs
    .map((log) => ({ ...log, sets: log.sets.filter((set) => set.reps > 0) }))
    .filter((log) => log.sets.length > 0 || log.done)
}
