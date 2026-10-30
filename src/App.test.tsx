import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'
import { loadData } from './lib/storage'

describe('App', () => {
  it('edits a weight in a workout, saves it, and shows it the next time the workout is opened', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<App />)

    await user.click(screen.getByRole('button', { name: /רגליים \+ ידיים/ }))
    const curl = screen.getByRole('region', { name: 'כפיפת מרפקים בכבל' })
    await user.click(within(curl).getByRole('button', { name: 'עריכת כפיפת מרפקים בכבל' }))
    await user.type(within(curl).getByLabelText('שם מכונה 1'), 'כבל')
    await user.type(within(curl).getByLabelText('משקל מכונה 1'), '12.5')
    await user.click(within(curl).getByRole('button', { name: 'שמור' }))
    expect(within(curl).getByText('כבל: 12.5 ק״ג')).toBeInTheDocument()

    const saved = loadData().workouts.find((w) => w.id === 'legs-arms')
    expect(saved?.exercises.find((e) => e.exerciseId === 'cable-biceps-curl')?.machines).toEqual([
      { machine: 'כבל', weight: 12.5, unit: 'kg' },
    ])

    // Reopening the app shows the saved plan
    unmount()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /רגליים \+ ידיים/ }))
    expect(screen.getByText('כבל: 12.5 ק״ג')).toBeInTheDocument()
  })

  it('creates a workout, adds a new exercise to it, and goes back home', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: '+ אימון חדש' }))
    await user.type(screen.getByLabelText('שם האימון החדש'), 'גב')
    await user.click(screen.getByRole('button', { name: 'יצירה' }))
    expect(screen.getByRole('heading', { name: 'גב' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '+ הוספת תרגיל' }))
    await user.click(screen.getByRole('button', { name: '+ פולי עליון' }))
    await user.type(screen.getByLabelText('שם התרגיל החדש'), 'מתח')
    await user.click(screen.getByRole('button', { name: 'יצירה והוספה' }))
    expect(screen.getByRole('region', { name: 'פולי עליון' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'מתח' })).toBeInTheDocument()

    const data = loadData()
    expect(data.customExercises).toEqual([{ id: expect.any(String), name: 'מתח', type: 'weight' }])
    expect(data.workouts.at(-1)?.exercises.map((e) => e.exerciseId)).toEqual([
      'lat-pulldown',
      data.customExercises[0].id,
    ])

    await user.click(screen.getByRole('button', { name: '→ האימונים שלי' }))
    expect(screen.getByRole('button', { name: /גב\s*2 תרגילים/ })).toBeInTheDocument()
  })

  it('keeps plans separate when the same exercise is in two workouts', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: '+ אימון חדש' }))
    await user.type(screen.getByLabelText('שם האימון החדש'), 'חזה')
    await user.click(screen.getByRole('button', { name: 'יצירה' }))
    await user.click(screen.getByRole('button', { name: '+ הוספת תרגיל' }))
    await user.click(screen.getByRole('button', { name: '+ לחיצת חזה' }))
    await user.click(screen.getByRole('button', { name: 'עריכת לחיצת חזה' }))
    await user.type(screen.getByLabelText('משקל מכונה 1'), '50')
    await user.click(screen.getByRole('button', { name: 'שמור' }))

    await user.click(screen.getByRole('button', { name: '→ האימונים שלי' }))
    await user.click(screen.getByRole('button', { name: /חזה, גב, כתפיים \+ קרדיו/ }))
    const bench = screen.getByRole('region', { name: 'לחיצת חזה' })
    expect(within(bench).getByText('לא הוגדר עדיין')).toBeInTheDocument()
  })
})
