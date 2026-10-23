import type { WorkoutSession } from './types'

// The only module that touches localStorage, so it can be swapped later (e.g. for sync).
export const STORAGE_KEY = 'workout-log:v1'

interface StoredData {
  sessions: WorkoutSession[]
}

export function loadSessions(): WorkoutSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const data = JSON.parse(raw) as Partial<StoredData> | null
    return Array.isArray(data?.sessions) ? data.sessions : []
  } catch {
    return []
  }
}

export function saveSessions(sessions: WorkoutSession[]): void {
  const data: StoredData = { sessions }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}
