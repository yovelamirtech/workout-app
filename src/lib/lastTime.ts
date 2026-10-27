import { sortSessionsNewestFirst } from './history'
import type { MachineEntry, WorkoutSession } from './types'

// Machine names are typed by hand, so "Cable " and "cable" are the same machine
export function machineKey(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLowerCase()
}

// The latest entry for each machine used for this exercise, most recently used first.
// On the same date, the session saved later wins.
export function getLastEntries(exerciseId: string, sessions: WorkoutSession[]): MachineEntry[] {
  const seen = new Set<string>()
  const lastEntries: MachineEntry[] = []

  for (const session of sortSessionsNewestFirst(sessions)) {
    const log = session.logs.find((l) => l.exerciseId === exerciseId)
    for (const entry of log?.entries ?? []) {
      const key = machineKey(entry.machine)
      if (!seen.has(key)) {
        seen.add(key)
        lastEntries.push(entry)
      }
    }
  }

  return lastEntries
}

export function findLastEntry(machine: string, lastEntries: MachineEntry[]): MachineEntry | null {
  const key = machineKey(machine)
  return lastEntries.find((entry) => machineKey(entry.machine) === key) ?? null
}
