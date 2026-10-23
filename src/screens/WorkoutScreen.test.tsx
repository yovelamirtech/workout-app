import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Exercise, WorkoutSession, WorkoutTemplate } from '../lib/types'
import WorkoutScreen from './WorkoutScreen'

const exercises: Exercise[] = [
  { id: 'bench', name: 'לחיצת חזה', type: 'weight' },
  { id: 'pullup', name: 'מתח', type: 'bodyweight' },
  { id: 'walk', name: 'הליכה בשיפוע', type: 'cardio' },
]
const template: WorkoutTemplate = { id: 't', name: 'אימון בדיקה', exerciseIds: ['bench', 'pullup', 'walk'] }
const sessions: WorkoutSession[] = [
  {
    id: '1',
    date: '2026-10-01',
    templateId: 't',
    logs: [
      { exerciseId: 'bench', sets: [{ weightKg: 60, reps: 10 }, { weightKg: 60, reps: 10 }] },
      { exerciseId: 'pullup', sets: [{ weightKg: 0, reps: 10 }, { weightKg: 0, reps: 6 }] },
    ],
  },
]

function renderScreen(onFinish = vi.fn()) {
  render(
    <WorkoutScreen
      template={template}
      exercises={exercises}
      sessions={sessions}
      onFinish={onFinish}
      onCancel={vi.fn()}
    />,
  )
  return onFinish
}

describe('WorkoutScreen', () => {
  it('shows last time and suggested today for each exercise', () => {
    renderScreen()
    const bench = screen.getByRole('region', { name: 'לחיצת חזה' })
    expect(within(bench).getByText('60×10, 60×10')).toBeInTheDocument()
    expect(within(bench).getByText('62.5 ק״ג × 10')).toBeInTheDocument()

    const pullup = screen.getByRole('region', { name: 'מתח' })
    expect(within(pullup).getByText('10, 6 חזרות')).toBeInTheDocument()
    expect(within(pullup).getByText('10 חזרות')).toBeInTheDocument()
  })

  it('adds a set pre-filled with the suggestion, edits it and removes sets', async () => {
    const user = userEvent.setup()
    const onFinish = renderScreen()
    const bench = screen.getByRole('region', { name: 'לחיצת חזה' })
    const addSet = within(bench).getByRole('button', { name: /הוספת סט/ })

    await user.click(addSet)
    expect(within(bench).getByLabelText('משקל סט 1')).toHaveValue(62.5)
    expect(within(bench).getByLabelText('חזרות סט 1')).toHaveValue(10)

    await user.clear(within(bench).getByLabelText('חזרות סט 1'))
    await user.type(within(bench).getByLabelText('חזרות סט 1'), '8')

    await user.click(addSet)
    expect(within(bench).getByLabelText('חזרות סט 2')).toHaveValue(8)

    await user.click(within(bench).getByRole('button', { name: 'מחיקת סט 2' }))
    expect(within(bench).queryByLabelText('חזרות סט 2')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'סיום ושמירה' }))
    expect(onFinish).toHaveBeenCalledWith([{ exerciseId: 'bench', sets: [{ weightKg: 62.5, reps: 8 }] }])
  })

  it('bodyweight sets have no weight input', async () => {
    const user = userEvent.setup()
    renderScreen()
    const pullup = screen.getByRole('region', { name: 'מתח' })
    await user.click(within(pullup).getByRole('button', { name: /הוספת סט/ }))
    expect(within(pullup).queryByLabelText('משקל סט 1')).not.toBeInTheDocument()
    expect(within(pullup).getByLabelText('חזרות סט 1')).toHaveValue(10)
  })

  it('logs cardio as done with a checkbox', async () => {
    const user = userEvent.setup()
    const onFinish = renderScreen()
    await user.click(screen.getByRole('checkbox', { name: 'הליכה בשיפוע' }))
    await user.click(screen.getByRole('button', { name: 'סיום ושמירה' }))
    expect(onFinish).toHaveBeenCalledWith([{ exerciseId: 'walk', sets: [], done: true }])
  })
})
