import type { ExerciseLog, MachineEntry } from './types'

export function emptyMachineEntry(): MachineEntry {
  return { machine: '', weight: 0, unit: 'kg' }
}

// Rows for a new workout: one row per machine used before, prefilled with last time's
// name, weight and unit, or a single empty row for an exercise with no history.
export function getDraftEntries(lastEntries: MachineEntry[]): MachineEntry[] {
  if (lastEntries.length === 0) return [emptyMachineEntry()]
  return lastEntries.map((entry) => ({ ...entry }))
}

// Keeps only what was actually logged: machines with a weight, and cardio marked done.
export function finalizeLogs(draftLogs: ExerciseLog[]): ExerciseLog[] {
  return draftLogs
    .map((log) => ({
      ...log,
      entries: log.entries
        .filter((entry) => entry.weight > 0)
        .map((entry) => ({ ...entry, machine: entry.machine.trim() })),
    }))
    .filter((log) => log.entries.length > 0 || log.done)
}
