import { describe, expect, it } from 'vitest'
import { loadSessions, saveSessions, STORAGE_KEY } from './storage'
import type { WorkoutSession } from './types'

const sessions: WorkoutSession[] = [
  {
    id: '1',
    date: '2026-10-23',
    templateId: 'legs-arms',
    logs: [{ exerciseId: 'leg-curl', sets: [{ weightKg: 40, reps: 10 }] }],
  },
]

describe('storage', () => {
  it('returns [] when storage is empty', () => {
    expect(loadSessions()).toEqual([])
  })

  it('round-trips save → load', () => {
    saveSessions(sessions)
    expect(loadSessions()).toEqual(sessions)
  })

  it('stores data under the versioned key', () => {
    saveSessions(sessions)
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull()
  })

  it('returns [] for corrupt JSON without crashing', () => {
    localStorage.setItem(STORAGE_KEY, '{not json')
    expect(loadSessions()).toEqual([])
  })

  it('returns [] when the stored shape is wrong', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ sessions: 'oops' }))
    expect(loadSessions()).toEqual([])
    localStorage.setItem(STORAGE_KEY, 'null')
    expect(loadSessions()).toEqual([])
  })
})
