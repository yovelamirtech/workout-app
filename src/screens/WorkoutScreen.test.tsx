import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Exercise, Workout } from '../lib/types'
import WorkoutScreen from './WorkoutScreen'

const exercises: Exercise[] = [
  { id: 'bench', name: 'לחיצת חזה', type: 'weight' },
  { id: 'row', name: 'חתירה', type: 'weight' },
  { id: 'walk', name: 'הליכה בשיפוע', type: 'cardio' },
  { id: 'fly', name: 'פרפר', type: 'weight' },
]

const builtIn: Workout = {
  id: 't',
  name: 'אימון בדיקה',
  builtIn: true,
  exercises: [
    {
      exerciseId: 'bench',
      machines: [
        { machine: 'כבל', weight: 30, unit: 'kg' },
        { machine: 'מכונה', weight: 7, unit: 'other' },
      ],
    },
    { exerciseId: 'row', machines: [] },
    { exerciseId: 'walk', machines: [], cardio: { speedKmh: 5.5, inclinePct: 12 } },
  ],
}

const custom: Workout = { ...builtIn, id: 'c', name: 'האימון שלי', builtIn: false }

function renderScreen(workout: Workout = builtIn) {
  const props = {
    onUpdate: vi.fn<(workout: Workout) => void>(),
    onCreateExercise: vi.fn(),
    onDelete: vi.fn(),
    onBack: vi.fn(),
  }
  render(<WorkoutScreen workout={workout} exercises={exercises} {...props} />)
  return props
}

describe('WorkoutScreen', () => {
  it('shows the plan as text, without inputs', () => {
    renderScreen()
    const bench = screen.getByRole('region', { name: 'לחיצת חזה' })
    expect(within(bench).getByText('כבל: 30 ק״ג')).toBeInTheDocument()
    expect(within(bench).getByText('מכונה: 7')).toBeInTheDocument()
    expect(within(screen.getByRole('region', { name: 'חתירה' })).getByText('לא הוגדר עדיין')).toBeInTheDocument()
    expect(screen.getByText('מהירות 5.5 קמ״ש · שיפוע 12%')).toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument()
  })

  it('edits one exercise and saves only that exercise', async () => {
    const user = userEvent.setup()
    const { onUpdate } = renderScreen()
    const bench = screen.getByRole('region', { name: 'לחיצת חזה' })

    await user.click(within(bench).getByRole('button', { name: 'עריכת לחיצת חזה' }))
    expect(screen.getAllByRole('button', { name: 'שמור' })).toHaveLength(1)
    await user.clear(within(bench).getByLabelText('משקל מכונה 1'))
    await user.type(within(bench).getByLabelText('משקל מכונה 1'), '32.5')
    await user.click(within(bench).getByRole('button', { name: 'שמור' }))

    expect(onUpdate).toHaveBeenCalledWith({
      ...builtIn,
      exercises: [
        {
          exerciseId: 'bench',
          machines: [
            { machine: 'כבל', weight: 32.5, unit: 'kg' },
            { machine: 'מכונה', weight: 7, unit: 'other' },
          ],
        },
        builtIn.exercises[1],
        builtIn.exercises[2],
      ],
    })
    expect(within(bench).queryByLabelText('משקל מכונה 1')).not.toBeInTheDocument()
  })

  it('opens an exercise with no plan with one empty machine row, and drops it if left empty', async () => {
    const user = userEvent.setup()
    const { onUpdate } = renderScreen()
    const row = screen.getByRole('region', { name: 'חתירה' })

    await user.click(within(row).getByRole('button', { name: 'עריכת חתירה' }))
    expect(within(row).getByLabelText('שם מכונה 1')).toHaveValue('')
    await user.click(within(row).getByRole('button', { name: /הוספת מכונה/ }))
    await user.type(within(row).getByLabelText('שם מכונה 2'), 'משקולות')
    await user.type(within(row).getByLabelText('משקל מכונה 2'), '20')
    await user.selectOptions(within(row).getByLabelText('יחידה מכונה 2'), 'lb')
    await user.click(within(row).getByRole('button', { name: 'שמור' }))

    expect(onUpdate.mock.calls[0][0].exercises[1]).toEqual({
      exerciseId: 'row',
      machines: [{ machine: 'משקולות', weight: 20, unit: 'lb' }],
    })
  })

  it('opens the editor when the card is tapped', async () => {
    const user = userEvent.setup()
    renderScreen()
    const bench = screen.getByRole('region', { name: 'לחיצת חזה' })

    await user.click(within(bench).getByText('כבל: 30 ק״ג'))
    expect(within(bench).getByLabelText('משקל מכונה 1')).toHaveValue(30)
  })

  it('does not open the editor when the touch moved, as in a scroll', () => {
    renderScreen()
    const bench = screen.getByRole('region', { name: 'לחיצת חזה' })

    fireEvent.pointerDown(bench, { clientX: 100, clientY: 100 })
    fireEvent.click(bench, { clientX: 100, clientY: 160 })
    expect(within(bench).queryByLabelText('משקל מכונה 1')).not.toBeInTheDocument()
  })

  it('the only machine cannot be deleted', async () => {
    const user = userEvent.setup()
    renderScreen()
    const bench = screen.getByRole('region', { name: 'לחיצת חזה' })

    await user.click(within(bench).getByRole('button', { name: 'עריכת לחיצת חזה' }))
    expect(within(bench).getByRole('button', { name: 'מחיקת מכונה 1' })).toBeEnabled()
    await user.click(within(bench).getByRole('button', { name: 'מחיקת מכונה 2' }))
    expect(within(bench).getByRole('button', { name: 'מחיקת מכונה 1' })).toBeDisabled()
  })

  it('cancel discards the changes', async () => {
    const user = userEvent.setup()
    const { onUpdate } = renderScreen()
    const bench = screen.getByRole('region', { name: 'לחיצת חזה' })

    await user.click(within(bench).getByRole('button', { name: 'עריכת לחיצת חזה' }))
    await user.click(within(bench).getByRole('button', { name: 'מחיקת מכונה 1' }))
    await user.click(within(bench).getByRole('button', { name: 'ביטול' }))

    expect(onUpdate).not.toHaveBeenCalled()
    expect(within(bench).getByText('כבל: 30 ק״ג')).toBeInTheDocument()
  })

  it('edits cardio speed and incline', async () => {
    const user = userEvent.setup()
    const { onUpdate } = renderScreen()
    const walk = screen.getByRole('region', { name: 'הליכה בשיפוע' })

    await user.click(within(walk).getByRole('button', { name: 'עריכת הליכה בשיפוע' }))
    expect(within(walk).queryByLabelText(/מכונה/)).not.toBeInTheDocument()
    await user.clear(within(walk).getByLabelText('מהירות (קמ״ש)'))
    await user.type(within(walk).getByLabelText('מהירות (קמ״ש)'), '6')
    await user.clear(within(walk).getByLabelText('שיפוע (%)'))
    await user.type(within(walk).getByLabelText('שיפוע (%)'), '15')
    await user.click(within(walk).getByRole('button', { name: 'שמור' }))

    expect(onUpdate.mock.calls[0][0].exercises[2]).toEqual({
      exerciseId: 'walk',
      machines: [],
      cardio: { speedKmh: 6, inclinePct: 15 },
    })
  })

  it('a built-in workout cannot be renamed, deleted, or have exercises added or removed', async () => {
    const user = userEvent.setup()
    renderScreen()
    expect(screen.queryByRole('button', { name: /הוספת תרגיל/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'שינוי שם' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'מחיקת אימון' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'עריכת לחיצת חזה' }))
    expect(screen.queryByRole('button', { name: 'הסרה מהאימון' })).not.toBeInTheDocument()
  })

  describe('a workout the user created', () => {
    it('removes an exercise after confirming', async () => {
      const user = userEvent.setup()
      vi.spyOn(window, 'confirm').mockReturnValue(true)
      const { onUpdate } = renderScreen(custom)

      await user.click(screen.getByRole('button', { name: 'עריכת חתירה' }))
      await user.click(screen.getByRole('button', { name: 'הסרה מהאימון' }))

      expect(onUpdate.mock.calls[0][0].exercises.map((e) => e.exerciseId)).toEqual([
        'bench',
        'walk',
      ])
      vi.restoreAllMocks()
    })

    it('adds an existing exercise that is not in the workout yet', async () => {
      const user = userEvent.setup()
      const { onUpdate } = renderScreen(custom)

      await user.click(screen.getByRole('button', { name: '+ הוספת תרגיל' }))
      const panel = screen.getByRole('region', { name: 'הוספת תרגיל' })
      expect(within(panel).queryByRole('button', { name: /לחיצת חזה/ })).not.toBeInTheDocument()
      await user.click(within(panel).getByRole('button', { name: '+ פרפר' }))

      expect(onUpdate.mock.calls[0][0].exercises.at(-1)).toEqual({ exerciseId: 'fly', machines: [] })
    })

    it('creates a new exercise', async () => {
      const user = userEvent.setup()
      const { onCreateExercise } = renderScreen(custom)

      await user.click(screen.getByRole('button', { name: '+ הוספת תרגיל' }))
      const create = screen.getByRole('button', { name: 'יצירה והוספה' })
      expect(create).toBeDisabled()
      await user.type(screen.getByLabelText('שם התרגיל החדש'), 'אופניים')
      await user.selectOptions(screen.getByLabelText('סוג התרגיל החדש'), 'cardio')
      await user.click(create)

      expect(onCreateExercise).toHaveBeenCalledWith('אופניים', 'cardio')
    })

    it('renames the workout', async () => {
      const user = userEvent.setup()
      const { onUpdate } = renderScreen(custom)

      await user.click(screen.getByRole('button', { name: 'שינוי שם' }))
      await user.clear(screen.getByLabelText('שם האימון'))
      await user.type(screen.getByLabelText('שם האימון'), 'גב ')
      await user.click(screen.getByRole('button', { name: 'שמור' }))

      expect(onUpdate).toHaveBeenCalledWith({ ...custom, name: 'גב' })
    })

    it('deletes the workout after confirming', async () => {
      const user = userEvent.setup()
      const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
      const { onDelete } = renderScreen(custom)

      await user.click(screen.getByRole('button', { name: 'מחיקת אימון' }))
      expect(onDelete).not.toHaveBeenCalled()
      confirm.mockReturnValue(true)
      await user.click(screen.getByRole('button', { name: 'מחיקת אימון' }))
      expect(onDelete).toHaveBeenCalled()
      vi.restoreAllMocks()
    })
  })
})
