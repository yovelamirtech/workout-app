import { describe, expect, it } from 'vitest'
import {
  addExerciseToWorkout,
  cleanMachines,
  createExercise,
  createWorkout,
  formatCardio,
  formatMachine,
  formatWeight,
  removeExerciseFromWorkout,
  updateWorkoutExercise,
} from './plan'
import type { Workout } from './types'

const workout: Workout = {
  id: 'w',
  name: 'אימון',
  builtIn: false,
  exercises: [
    { exerciseId: 'bench', machines: [{ machine: 'כבל', weight: 30, unit: 'kg' }] },
    { exerciseId: 'row', machines: [] },
  ],
}

describe('formatWeight', () => {
  it('shows kg and lb with their unit and "other" as a bare number', () => {
    expect(formatWeight(40, 'kg')).toBe('40 ק״ג')
    expect(formatWeight(90, 'lb')).toBe('90 פאונד')
    expect(formatWeight(7, 'other')).toBe('7')
  })
})

describe('formatMachine', () => {
  it('shows the machine name and weight', () => {
    expect(formatMachine({ machine: 'כבל', weight: 12.5, unit: 'kg' })).toBe('כבל: 12.5 ק״ג')
  })

  it('shows just the weight without a name', () => {
    expect(formatMachine({ machine: '', weight: 40, unit: 'lb' })).toBe('40 פאונד')
  })

  it('shows a dash when the weight is not set', () => {
    expect(formatMachine({ machine: 'כבל', weight: 0, unit: 'kg' })).toBe('כבל: —')
  })
})

describe('formatCardio', () => {
  it('shows speed and incline', () => {
    expect(formatCardio({ speedKmh: 5.5, inclinePct: 12 })).toBe('מהירות 5.5 קמ״ש · שיפוע 12%')
  })

  it('shows only what is set', () => {
    expect(formatCardio({ speedKmh: 6, inclinePct: 0 })).toBe('מהירות 6 קמ״ש')
    expect(formatCardio({ speedKmh: 0, inclinePct: 10 })).toBe('שיפוע 10%')
  })

  it('returns null when nothing is set', () => {
    expect(formatCardio(undefined)).toBeNull()
    expect(formatCardio({ speedKmh: 0, inclinePct: 0 })).toBeNull()
  })
})

describe('cleanMachines', () => {
  it('trims names and drops completely empty rows, keeping a name without a weight', () => {
    expect(
      cleanMachines([
        { machine: '  כבל ', weight: 30, unit: 'kg' },
        { machine: '   ', weight: 0, unit: 'kg' },
        { machine: 'מכונה', weight: 0, unit: 'lb' },
        { machine: '', weight: 7, unit: 'other' },
      ]),
    ).toEqual([
      { machine: 'כבל', weight: 30, unit: 'kg' },
      { machine: 'מכונה', weight: 0, unit: 'lb' },
      { machine: '', weight: 7, unit: 'other' },
    ])
  })
})

describe('workout changes', () => {
  it('updates only the edited exercise', () => {
    const updated = updateWorkoutExercise(workout, {
      exerciseId: 'bench',
      machines: [{ machine: 'כבל', weight: 32.5, unit: 'kg' }],
    })
    expect(updated.exercises).toEqual([
      { exerciseId: 'bench', machines: [{ machine: 'כבל', weight: 32.5, unit: 'kg' }] },
      { exerciseId: 'row', machines: [] },
    ])
    expect(workout.exercises[0].machines[0].weight).toBe(30)
  })

  it('adds an exercise with an empty plan, at most once', () => {
    const added = addExerciseToWorkout(workout, 'fly')
    expect(added.exercises.at(-1)).toEqual({ exerciseId: 'fly', machines: [] })
    expect(addExerciseToWorkout(added, 'fly').exercises).toHaveLength(3)
  })

  it('removes an exercise', () => {
    expect(removeExerciseFromWorkout(workout, 'bench').exercises.map((e) => e.exerciseId)).toEqual(['row'])
  })

  it('creates an empty custom workout with a trimmed name', () => {
    const created = createWorkout('  גב ')
    expect(created).toEqual({ id: expect.any(String), name: 'גב', builtIn: false, exercises: [] })
    expect(createWorkout('גב').id).not.toBe(created.id)
  })

  it('creates an exercise with a trimmed name', () => {
    expect(createExercise(' מתח ', 'weight')).toEqual({ id: expect.any(String), name: 'מתח', type: 'weight' })
  })
})
