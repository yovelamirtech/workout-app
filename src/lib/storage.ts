import type { ExerciseLog, WorkoutSession } from './types'

// The only module that touches localStorage, so it can be swapped later (e.g. for sync).
export const STORAGE_KEY = 'workout-log:v1'

interface StoredData {
  sessions: WorkoutSession[]
}

// Logs saved before machines existed: a list of kg sets with reps
interface LegacyExerciseLog {
  exerciseId: string
  sets: { weightKg: number }[]
  done?: boolean
}

// A legacy log keeps its top weight as one unnamed machine in kg
function migrateLog(log: ExerciseLog | LegacyExerciseLog): ExerciseLog {
  if (!('sets' in log)) return log
  const topWeight = Math.max(0, ...log.sets.map((set) => set.weightKg))
  return {
    exerciseId: log.exerciseId,
    entries: topWeight > 0 ? [{ machine: '', weight: topWeight, unit: 'kg' }] : [],
    ...(log.done !== undefined && { done: log.done }),
  }
}

export function loadSessions(): WorkoutSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const data = JSON.parse(raw) as Partial<StoredData> | null
    if (!Array.isArray(data?.sessions)) return []
    return data.sessions.map((session) => ({ ...session, logs: session.logs.map(migrateLog) }))
  } catch {
    return []
  }
}

export function saveSessions(sessions: WorkoutSession[]): void {
  const data: StoredData = { sessions }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}
