import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { defaultExercises, defaultTemplates } from '../data/defaultTemplates'
import type { WorkoutSession } from '../lib/types'
import HistoryScreen from './HistoryScreen'

describe('HistoryScreen', () => {
  it('shows an empty message when there are no sessions', () => {
    render(<HistoryScreen sessions={[]} templates={defaultTemplates} exercises={defaultExercises} />)
    expect(screen.getByText('עדיין אין אימונים שמורים')).toBeInTheDocument()
  })

  it('lists sessions newest first with date and template name', () => {
    const sessions: WorkoutSession[] = [
      { id: 'old', date: '2026-10-01', templateId: 'legs-arms', logs: [] },
      { id: 'new', date: '2026-10-20', templateId: 'chest-back-shoulders-cardio', logs: [] },
    ]
    render(<HistoryScreen sessions={sessions} templates={defaultTemplates} exercises={defaultExercises} />)

    const headings = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
    expect(headings).toEqual(['חזה, גב, כתפיים + קרדיו', 'רגליים + ידיים'])
    expect(screen.getByText('20/10/2026')).toBeInTheDocument()
    expect(screen.getByText('01/10/2026')).toBeInTheDocument()
  })
})
