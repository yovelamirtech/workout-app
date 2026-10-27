import { describe, expect, it } from 'vitest'
import { formatDate, formatEntries, formatWeight, getTemplateName, sortSessionsNewestFirst, toIsoDate } from './history'
import type { WorkoutSession } from './types'

function session(id: string, date: string): WorkoutSession {
  return { id, date, templateId: 't', logs: [] }
}

describe('sortSessionsNewestFirst', () => {
  it('sorts by date, newest first', () => {
    const sessions = [session('a', '2026-01-05'), session('b', '2026-02-01'), session('c', '2026-01-10')]
    expect(sortSessionsNewestFirst(sessions).map((s) => s.id)).toEqual(['b', 'c', 'a'])
  })

  it('puts the later-saved session first on the same date', () => {
    const sessions = [session('a', '2026-01-05'), session('b', '2026-01-05')]
    expect(sortSessionsNewestFirst(sessions).map((s) => s.id)).toEqual(['b', 'a'])
  })

  it('does not mutate the input', () => {
    const sessions = [session('a', '2026-01-01'), session('b', '2026-02-01')]
    sortSessionsNewestFirst(sessions)
    expect(sessions.map((s) => s.id)).toEqual(['a', 'b'])
  })
})

describe('getTemplateName', () => {
  const templates = [{ id: 'legs', name: 'רגליים', exerciseIds: [] }]

  it('returns the template name', () => {
    expect(getTemplateName('legs', templates)).toBe('רגליים')
  })

  it('falls back when the template is missing', () => {
    expect(getTemplateName('gone', templates)).toBe('אימון')
  })
})

describe('toIsoDate', () => {
  it('formats a local date as YYYY-MM-DD with zero padding', () => {
    expect(toIsoDate(new Date(2026, 0, 5, 23, 30))).toBe('2026-01-05')
  })
})

describe('formatDate', () => {
  it('formats an ISO date as DD/MM/YYYY', () => {
    expect(formatDate('2026-10-23')).toBe('23/10/2026')
  })
})

describe('formatWeight', () => {
  it('shows the unit for kg and lb', () => {
    expect(formatWeight(40, 'kg')).toBe('40 ק״ג')
    expect(formatWeight(90, 'lb')).toBe('90 פאונד')
  })

  it('shows only the number for other units', () => {
    expect(formatWeight(7, 'other')).toBe('7')
  })
})

describe('formatEntries', () => {
  it('lists each machine with its weight', () => {
    const entries = [
      { machine: 'כבל', weight: 40, unit: 'kg' as const },
      { machine: 'מכונה', weight: 7, unit: 'other' as const },
    ]
    expect(formatEntries(entries)).toBe('כבל 40 ק״ג · מכונה 7')
  })

  it('shows just the weight for an unnamed machine', () => {
    expect(formatEntries([{ machine: '', weight: 40, unit: 'kg' }])).toBe('40 ק״ג')
  })
})
