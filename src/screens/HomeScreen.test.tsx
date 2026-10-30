import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { defaultWorkouts } from '../data/defaultWorkouts'
import HomeScreen from './HomeScreen'

function renderScreen() {
  const props = { onOpenWorkout: vi.fn(), onCreateWorkout: vi.fn() }
  render(<HomeScreen workouts={defaultWorkouts} {...props} />)
  return props
}

describe('HomeScreen', () => {
  it('lists the workouts and opens the tapped one', async () => {
    const user = userEvent.setup()
    const { onOpenWorkout } = renderScreen()

    await user.click(screen.getByRole('button', { name: /חזה, גב, כתפיים \+ קרדיו/ }))
    expect(onOpenWorkout).toHaveBeenCalledWith('chest-back-shoulders-cardio')
  })

  it('creates a new workout with a name', async () => {
    const user = userEvent.setup()
    const { onCreateWorkout } = renderScreen()

    await user.click(screen.getByRole('button', { name: '+ אימון חדש' }))
    expect(screen.getByRole('button', { name: 'יצירה' })).toBeDisabled()
    await user.type(screen.getByLabelText('שם האימון החדש'), 'גב')
    await user.click(screen.getByRole('button', { name: 'יצירה' }))
    expect(onCreateWorkout).toHaveBeenCalledWith('גב')
  })
})
