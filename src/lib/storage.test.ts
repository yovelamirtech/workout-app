import { describe, expect, it } from 'vitest'
import { defaultWorkouts } from '../data/defaultWorkouts'
import { loadData, saveData, STORAGE_KEY, type AppData } from './storage'

const data: AppData = {
  workouts: [
    {
      id: 'legs-arms',
      name: 'רגליים + ידיים',
      builtIn: true,
      exercises: [{ exerciseId: 'leg-curl', machines: [{ machine: 'כבל', weight: 40, unit: 'kg' }] }],
    },
  ],
  customExercises: [{ id: 'x', name: 'מתח', type: 'weight' }],
}

describe('storage', () => {
  it('starts with the default workouts, all with an empty plan', () => {
    const loaded = loadData()
    expect(loaded).toEqual({ workouts: defaultWorkouts, customExercises: [] })
    expect(loaded.workouts.every((w) => w.builtIn && w.exercises.every((e) => e.machines.length === 0))).toBe(true)
  })

  it('does not share objects with the default data', () => {
    loadData().workouts[0].exercises[0].machines.push({ machine: 'כבל', weight: 1, unit: 'kg' })
    expect(defaultWorkouts[0].exercises[0].machines).toEqual([])
  })

  it('round-trips save → load', () => {
    saveData(data)
    expect(loadData()).toEqual(data)
  })

  it('stores data under the versioned key', () => {
    saveData(data)
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull()
  })

  it('ignores the old workout log and starts from scratch', () => {
    localStorage.setItem('workout-log:v1', JSON.stringify({ sessions: [] }))
    expect(loadData().workouts).toEqual(defaultWorkouts)
  })

  it('falls back to the defaults for corrupt JSON or a wrong shape', () => {
    localStorage.setItem(STORAGE_KEY, '{not json')
    expect(loadData().workouts).toEqual(defaultWorkouts)
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ workouts: 'oops', customExercises: [] }))
    expect(loadData().workouts).toEqual(defaultWorkouts)
    localStorage.setItem(STORAGE_KEY, 'null')
    expect(loadData().workouts).toEqual(defaultWorkouts)
  })
})
