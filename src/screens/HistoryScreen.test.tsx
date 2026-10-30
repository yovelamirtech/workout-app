import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defaultExercises, defaultTemplates } from '../data/defaultTemplates'
import type { WorkoutSession } from '../lib/types'
import HistoryScreen from './HistoryScreen'

const sessions: WorkoutSession[] = [
  { id: 'old', date: '2026-10-01', templateId: 'legs-arms', logs: [] },
  { id: 'new', date: '2026-10-20', templateId: 'chest-back-shoulders-cardio', logs: [] },
]

function renderScreen(onDelete = vi.fn(), onEdit = vi.fn()) {
  render(
    <HistoryScreen
      sessions={sessions}
      templates={defaultTemplates}
      exercises={defaultExercises}
      onEdit={onEdit}
      onDelete={onDelete}
    />,
  )
  return { onDelete, onEdit }
}

describe('HistoryScreen', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('shows an empty message when there are no sessions', () => {
    render(
      <HistoryScreen
        sessions={[]}
        templates={defaultTemplates}
        exercises={defaultExercises}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    )
    expect(screen.getByText('עדיין אין אימונים שמורים')).toBeInTheDocument()
  })

  it('lists sessions newest first with date and template name', () => {
    renderScreen()

    const headings = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
    expect(headings).toEqual(['חזה, גב, כתפיים + קרדיו', 'רגליים + ידיים'])
    expect(screen.getByText('20/10/2026')).toBeInTheDocument()
    expect(screen.getByText('01/10/2026')).toBeInTheDocument()
  })

  it('deletes a session after confirming', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const { onDelete } = renderScreen()

    await user.click(screen.getByRole('button', { name: 'מחיקת אימון רגליים + ידיים 01/10/2026' }))
    expect(window.confirm).toHaveBeenCalled()
    expect(onDelete).toHaveBeenCalledWith('old')
  })

  it('does not delete when the confirmation is cancelled', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    const { onDelete } = renderScreen()

    await user.click(screen.getByRole('button', { name: 'מחיקת אימון רגליים + ידיים 01/10/2026' }))
    expect(onDelete).not.toHaveBeenCalled()
  })

  it('opens a session for editing', async () => {
    const user = userEvent.setup()
    const { onEdit } = renderScreen()

    await user.click(screen.getByRole('button', { name: 'עריכת אימון רגליים + ידיים 01/10/2026' }))
    expect(onEdit).toHaveBeenCalledWith('old')
  })
})
