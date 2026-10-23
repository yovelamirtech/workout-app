import { describe, expect, it } from 'vitest'
import { finalizeLogs, getNewSetDefaults } from './workout'
import type { Exercise } from './types'

const exercise: Exercise = { id: 'bench', name: 'לחיצת חזה', type: 'weight', targetReps: 8 }

describe('getNewSetDefaults', () => {
  it('copies the previous set', () => {
    const sets = [{ weightKg: 60, reps: 9 }]
    expect(getNewSetDefaults(sets, { weightKg: 62.5, reps: 8 }, exercise)).toEqual({ weightKg: 60, reps: 9 })
  })

  it('uses the suggestion for the first set', () => {
    expect(getNewSetDefaults([], { weightKg: 62.5, reps: 8 }, exercise)).toEqual({ weightKg: 62.5, reps: 8 })
  })

  it('falls back to no weight and the target reps', () => {
    expect(getNewSetDefaults([], null, exercise)).toEqual({ weightKg: 0, reps: 8 })
  })
})

describe('finalizeLogs', () => {
  it('drops sets without reps and exercises with nothing logged', () => {
    const logs = [
      { exerciseId: 'a', sets: [{ weightKg: 50, reps: 10 }, { weightKg: 50, reps: 0 }] },
      { exerciseId: 'b', sets: [{ weightKg: 50, reps: 0 }] },
      { exerciseId: 'c', sets: [] },
    ]
    expect(finalizeLogs(logs)).toEqual([{ exerciseId: 'a', sets: [{ weightKg: 50, reps: 10 }] }])
  })

  it('keeps cardio marked done', () => {
    const logs = [
      { exerciseId: 'walk', sets: [], done: true },
      { exerciseId: 'run', sets: [], done: false },
    ]
    expect(finalizeLogs(logs)).toEqual([{ exerciseId: 'walk', sets: [], done: true }])
  })
})
