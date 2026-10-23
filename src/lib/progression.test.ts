import { describe, expect, it } from 'vitest'
import { getLastLog, roundToHalf, suggestNext } from './progression'
import type { Exercise, ExerciseLog, WorkoutSession } from './types'

const benchPress: Exercise = { id: 'bench', name: 'לחיצת חזה', type: 'weight' }
const pullUp: Exercise = { id: 'pullup', name: 'מתח', type: 'bodyweight' }
const walk: Exercise = { id: 'walk', name: 'הליכה', type: 'cardio' }

function log(exerciseId: string, sets: [number, number][]): ExerciseLog {
  return { exerciseId, sets: sets.map(([weightKg, reps]) => ({ weightKg, reps })) }
}

function session(id: string, date: string, logs: ExerciseLog[]): WorkoutSession {
  return { id, date, templateId: 't', logs }
}

describe('getLastLog', () => {
  it('returns null when there is no history', () => {
    expect(getLastLog('bench', [])).toBeNull()
  })

  it('returns null when no session has this exercise', () => {
    const sessions = [session('1', '2026-01-01', [log('squat', [[100, 10]])])]
    expect(getLastLog('bench', sessions)).toBeNull()
  })

  it('returns the log from the most recent session even when sessions are unsorted', () => {
    const newest = log('bench', [[60, 10]])
    const sessions = [
      session('1', '2026-01-05', [log('bench', [[55, 10]])]),
      session('2', '2026-01-20', [newest]),
      session('3', '2026-01-10', [log('bench', [[57.5, 10]])]),
    ]
    expect(getLastLog('bench', sessions)).toBe(newest)
  })

  it('skips sessions where the exercise has no sets', () => {
    const withSets = log('bench', [[60, 10]])
    const sessions = [
      session('1', '2026-01-01', [withSets]),
      session('2', '2026-01-02', [log('bench', [])]),
    ]
    expect(getLastLog('bench', sessions)).toBe(withSets)
  })

  it('prefers the later-saved session on the same date', () => {
    const later = log('bench', [[62.5, 10]])
    const sessions = [
      session('1', '2026-01-01', [log('bench', [[60, 10]])]),
      session('2', '2026-01-01', [later]),
    ]
    expect(getLastLog('bench', sessions)).toBe(later)
  })
})

describe('suggestNext', () => {
  it('returns null when there is no last log', () => {
    expect(suggestNext(null, benchPress)).toBeNull()
  })

  it('returns null when the last log has no sets', () => {
    expect(suggestNext(log('bench', []), benchPress)).toBeNull()
  })

  it('adds the increment when every set reached the target', () => {
    const last = log('bench', [[60, 10], [60, 10], [60, 12]])
    expect(suggestNext(last, benchPress)).toEqual({ weightKg: 62.5, reps: 10 })
  })

  it('keeps the same weight when one set failed', () => {
    const last = log('bench', [[60, 10], [60, 10], [60, 8]])
    expect(suggestNext(last, benchPress)).toEqual({ weightKg: 60, reps: 10 })
  })

  it('uses the top weight of the last session', () => {
    const last = log('bench', [[50, 10], [60, 10], [55, 10]])
    expect(suggestNext(last, benchPress)).toEqual({ weightKg: 62.5, reps: 10 })
  })

  it('respects custom targetReps and incrementKg', () => {
    const exercise: Exercise = { ...benchPress, targetReps: 8, incrementKg: 5 }
    const last = log('bench', [[80, 8], [80, 8]])
    expect(suggestNext(last, exercise)).toEqual({ weightKg: 85, reps: 8 })
  })

  it('rounds the suggested weight to 0.5 kg', () => {
    const exercise: Exercise = { ...benchPress, incrementKg: 1.25 }
    const last = log('bench', [[20, 10]])
    // 21.25 -> 21.5
    expect(suggestNext(last, exercise)).toEqual({ weightKg: 21.5, reps: 10 })
  })

  it('bodyweight: adds one rep when every set reached the target', () => {
    const last = log('pullup', [[0, 10], [0, 10]])
    expect(suggestNext(last, pullUp)).toEqual({ weightKg: 0, reps: 11 })
  })

  it('bodyweight: keeps the target when one set failed', () => {
    const last = log('pullup', [[0, 10], [0, 7]])
    expect(suggestNext(last, pullUp)).toEqual({ weightKg: 0, reps: 10 })
  })

  it('returns null for cardio', () => {
    expect(suggestNext(log('walk', [[0, 1]]), walk)).toBeNull()
  })
})

describe('roundToHalf', () => {
  it.each([
    [21.25, 21.5],
    [21.2, 21],
    [21.74, 21.5],
    [21.76, 22],
    [60, 60],
  ])('rounds %d to %d', (input, expected) => {
    expect(roundToHalf(input)).toBe(expected)
  })
})
