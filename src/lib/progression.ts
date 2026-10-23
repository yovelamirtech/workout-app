import type { Exercise, ExerciseLog, Suggestion, WorkoutSession } from './types'

export const DEFAULT_TARGET_REPS = 10
export const DEFAULT_INCREMENT_KG = 2.5

export function roundToHalf(value: number): number {
  return Math.round(value * 2) / 2
}

// Most recent log (by session date) that has at least one set for this exercise.
// On the same date, the session saved later in the array wins.
export function getLastLog(exerciseId: string, sessions: WorkoutSession[]): ExerciseLog | null {
  let lastLog: ExerciseLog | null = null
  let lastDate = ''

  for (const session of sessions) {
    const log = session.logs.find((l) => l.exerciseId === exerciseId && l.sets.length > 0)
    if (log && session.date >= lastDate) {
      lastLog = log
      lastDate = session.date
    }
  }

  return lastLog
}

export function suggestNext(lastLog: ExerciseLog | null, exercise: Exercise): Suggestion | null {
  if (!lastLog || lastLog.sets.length === 0 || exercise.type === 'cardio') {
    return null
  }

  const targetReps = exercise.targetReps ?? DEFAULT_TARGET_REPS
  const allSetsHitTarget = lastLog.sets.every((set) => set.reps >= targetReps)

  if (exercise.type === 'bodyweight') {
    return { weightKg: 0, reps: allSetsHitTarget ? targetReps + 1 : targetReps }
  }

  const incrementKg = exercise.incrementKg ?? DEFAULT_INCREMENT_KG
  const topWeightKg = Math.max(...lastLog.sets.map((set) => set.weightKg))
  const weightKg = allSetsHitTarget ? topWeightKg + incrementKg : topWeightKg

  return { weightKg: roundToHalf(weightKg), reps: targetReps }
}
