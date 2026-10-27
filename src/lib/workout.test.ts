import { describe, expect, it } from 'vitest'
import { finalizeLogs, getDraftEntries } from './workout'

describe('getDraftEntries', () => {
  it('starts with one empty row when there is no history', () => {
    expect(getDraftEntries([])).toEqual([{ machine: '', weight: 0, unit: 'kg' }])
  })

  it('has an empty row per machine used before, keeping name and unit', () => {
    const lastEntries = [
      { machine: 'כבל', weight: 35, unit: 'kg' as const },
      { machine: 'מכונה', weight: 7, unit: 'other' as const },
    ]
    expect(getDraftEntries(lastEntries)).toEqual([
      { machine: 'כבל', weight: 0, unit: 'kg' },
      { machine: 'מכונה', weight: 0, unit: 'other' },
    ])
  })
})

describe('finalizeLogs', () => {
  it('drops machines without a weight and exercises with nothing logged', () => {
    const logs = [
      {
        exerciseId: 'a',
        entries: [
          { machine: 'כבל', weight: 30, unit: 'kg' as const },
          { machine: 'מכונה', weight: 0, unit: 'lb' as const },
        ],
      },
      { exerciseId: 'b', entries: [{ machine: 'כבל', weight: 0, unit: 'kg' as const }] },
      { exerciseId: 'c', entries: [] },
    ]
    expect(finalizeLogs(logs)).toEqual([{ exerciseId: 'a', entries: [{ machine: 'כבל', weight: 30, unit: 'kg' }] }])
  })

  it('trims machine names', () => {
    const logs = [{ exerciseId: 'a', entries: [{ machine: '  כבל ', weight: 30, unit: 'kg' as const }] }]
    expect(finalizeLogs(logs)[0].entries[0].machine).toBe('כבל')
  })

  it('keeps cardio marked done', () => {
    const logs = [
      { exerciseId: 'walk', entries: [], done: true },
      { exerciseId: 'run', entries: [], done: false },
    ]
    expect(finalizeLogs(logs)).toEqual([{ exerciseId: 'walk', entries: [], done: true }])
  })
})
