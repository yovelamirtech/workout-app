import { describe, expect, it } from 'vitest'
import { findLastEntry, getLastEntries, machineKey } from './lastTime'
import type { ExerciseLog, MachineEntry, WeightUnit, WorkoutSession } from './types'

function entry(machine: string, weight: number, unit: WeightUnit = 'kg'): MachineEntry {
  return { machine, weight, unit }
}

function log(exerciseId: string, entries: MachineEntry[]): ExerciseLog {
  return { exerciseId, entries }
}

function session(id: string, date: string, logs: ExerciseLog[]): WorkoutSession {
  return { id, date, templateId: 't', logs }
}

describe('machineKey', () => {
  it('ignores case and extra spaces', () => {
    expect(machineKey('  Cable   Machine ')).toBe('cable machine')
  })
})

describe('getLastEntries', () => {
  it('returns [] when there is no history', () => {
    expect(getLastEntries('bench', [])).toEqual([])
  })

  it('returns [] when no session has this exercise', () => {
    const sessions = [session('1', '2026-01-01', [log('squat', [entry('מכונה', 100)])])]
    expect(getLastEntries('bench', sessions)).toEqual([])
  })

  it('returns the latest weight of each machine, even when sessions are unsorted', () => {
    const sessions = [
      session('1', '2026-01-05', [log('bench', [entry('כבל', 30), entry('מכונה', 90, 'lb')])]),
      session('2', '2026-01-20', [log('bench', [entry('כבל', 35)])]),
      session('3', '2026-01-10', [log('bench', [entry('כבל', 32.5)])]),
    ]
    expect(getLastEntries('bench', sessions)).toEqual([entry('כבל', 35), entry('מכונה', 90, 'lb')])
  })

  it('lists the most recently used machine first', () => {
    const sessions = [
      session('1', '2026-01-01', [log('bench', [entry('כבל', 30)])]),
      session('2', '2026-01-02', [log('bench', [entry('משקולות', 14)])]),
    ]
    expect(getLastEntries('bench', sessions).map((e) => e.machine)).toEqual(['משקולות', 'כבל'])
  })

  it('keeps each machine in its own unit', () => {
    const sessions = [session('1', '2026-01-01', [log('bench', [entry('מכונה', 7, 'other'), entry('כבל', 60, 'lb')])])]
    expect(getLastEntries('bench', sessions)).toEqual([entry('מכונה', 7, 'other'), entry('כבל', 60, 'lb')])
  })

  it('treats names that differ only in case or spaces as the same machine', () => {
    const sessions = [
      session('1', '2026-01-01', [log('bench', [entry('Cable', 30)])]),
      session('2', '2026-01-02', [log('bench', [entry(' cable ', 35)])]),
    ]
    expect(getLastEntries('bench', sessions)).toEqual([entry(' cable ', 35)])
  })

  it('on the same date, the later-saved session wins', () => {
    const sessions = [
      session('1', '2026-01-01', [log('bench', [entry('כבל', 30)])]),
      session('2', '2026-01-01', [log('bench', [entry('כבל', 35)])]),
    ]
    expect(getLastEntries('bench', sessions)).toEqual([entry('כבל', 35)])
  })
})

describe('findLastEntry', () => {
  const lastEntries = [entry('כבל', 35), entry('מכונה', 90, 'lb')]

  it('finds the machine by name', () => {
    expect(findLastEntry('מכונה', lastEntries)).toEqual(entry('מכונה', 90, 'lb'))
  })

  it('returns null for a new machine', () => {
    expect(findLastEntry('משקולות', lastEntries)).toBeNull()
  })
})
