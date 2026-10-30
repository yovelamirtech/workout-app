import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Exercise, WorkoutSession, WorkoutTemplate } from '../lib/types'
import WorkoutScreen from './WorkoutScreen'

const exercises: Exercise[] = [
  { id: 'bench', name: 'לחיצת חזה', type: 'weight' },
  { id: 'row', name: 'חתירה', type: 'weight' },
  { id: 'walk', name: 'הליכה בשיפוע', type: 'cardio' },
]
const template: WorkoutTemplate = { id: 't', name: 'אימון בדיקה', exerciseIds: ['bench', 'row', 'walk'] }
const sessions: WorkoutSession[] = [
  {
    id: '1',
    date: '2026-10-01',
    templateId: 't',
    logs: [
      {
        exerciseId: 'bench',
        entries: [
          { machine: 'כבל', weight: 30, unit: 'kg' },
          { machine: 'מכונה', weight: 7, unit: 'other' },
        ],
      },
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
  it('shows a row per machine used before, prefilled with last time and its unit', () => {
    renderScreen()
    const bench = screen.getByRole('region', { name: 'לחיצת חזה' })

    expect(within(bench).getByLabelText('שם מכונה 1')).toHaveValue('כבל')
    expect(within(bench).getByLabelText('משקל מכונה 1')).toHaveValue(30)
    expect(within(bench).getByLabelText('יחידה מכונה 1')).toHaveValue('kg')
    expect(within(bench).getByText('30 ק״ג')).toBeInTheDocument()

    expect(within(bench).getByLabelText('שם מכונה 2')).toHaveValue('מכונה')
    expect(within(bench).getByLabelText('משקל מכונה 2')).toHaveValue(7)
    expect(within(bench).getByLabelText('יחידה מכונה 2')).toHaveValue('other')
    expect(within(bench).getByText('7')).toBeInTheDocument()
  })

  it('has one empty row for an exercise with no history and no reps input', () => {
    renderScreen()
    const row = screen.getByRole('region', { name: 'חתירה' })
    expect(within(row).getByLabelText('שם מכונה 1')).toHaveValue('')
    expect(within(row).queryByLabelText('שם מכונה 2')).not.toBeInTheDocument()
    expect(within(row).queryByText(/פעם קודמת/)).not.toBeInTheDocument()
    expect(screen.queryByText(/חזרות/)).not.toBeInTheDocument()
  })

  it('saves prefilled weights unchanged when finishing right away', async () => {
    const user = userEvent.setup()
    const onFinish = renderScreen()
    await user.click(screen.getByRole('button', { name: 'סיום ושמירה' }))
    expect(onFinish).toHaveBeenCalledWith([
      {
        exerciseId: 'bench',
        entries: [
          { machine: 'כבל', weight: 30, unit: 'kg' },
          { machine: 'מכונה', weight: 7, unit: 'other' },
        ],
      },
    ])
  })

  it('changes a prefilled weight, adds a new machine, and saves only machines with a weight', async () => {
    const user = userEvent.setup()
    const onFinish = renderScreen()
    const bench = screen.getByRole('region', { name: 'לחיצת חזה' })

    await user.clear(within(bench).getByLabelText('משקל מכונה 1'))
    await user.type(within(bench).getByLabelText('משקל מכונה 1'), '32.5')
    await user.clear(within(bench).getByLabelText('משקל מכונה 2'))

    await user.click(within(bench).getByRole('button', { name: /הוספת מכונה/ }))
    await user.type(within(bench).getByLabelText('שם מכונה 3'), 'משקולות')
    await user.type(within(bench).getByLabelText('משקל מכונה 3'), '30')
    await user.selectOptions(within(bench).getByLabelText('יחידה מכונה 3'), 'lb')

    await user.click(screen.getByRole('button', { name: 'סיום ושמירה' }))
    expect(onFinish).toHaveBeenCalledWith([
      {
        exerciseId: 'bench',
        entries: [
          { machine: 'כבל', weight: 32.5, unit: 'kg' },
          { machine: 'משקולות', weight: 30, unit: 'lb' },
        ],
      },
    ])
  })

  it('removes a machine row', async () => {
    const user = userEvent.setup()
    renderScreen()
    const bench = screen.getByRole('region', { name: 'לחיצת חזה' })
    await user.click(within(bench).getByRole('button', { name: 'מחיקת מכונה 1' }))
    expect(within(bench).getByLabelText('שם מכונה 1')).toHaveValue('מכונה')
    expect(within(bench).queryByLabelText('שם מכונה 2')).not.toBeInTheDocument()
  })

  it('shows last time when typing the name of a machine used before', async () => {
    const user = userEvent.setup()
    renderScreen()
    const bench = screen.getByRole('region', { name: 'לחיצת חזה' })
    await user.click(within(bench).getByRole('button', { name: 'מחיקת מכונה 1' }))
    expect(within(bench).queryByText('30 ק״ג')).not.toBeInTheDocument()

    await user.click(within(bench).getByRole('button', { name: /הוספת מכונה/ }))
    await user.type(within(bench).getByLabelText('שם מכונה 2'), 'כבל')
    expect(within(bench).getByText('30 ק״ג')).toBeInTheDocument()
  })

  it('logs cardio as done with a checkbox', async () => {
    const user = userEvent.setup()
    const onFinish = renderScreen()
    await user.click(screen.getByRole('checkbox', { name: 'הליכה בשיפוע' }))
    await user.click(screen.getByRole('button', { name: 'סיום ושמירה' }))
    expect(onFinish).toHaveBeenCalledWith([
      expect.objectContaining({ exerciseId: 'bench' }),
      { exerciseId: 'walk', entries: [], done: true },
    ])
  })
})
