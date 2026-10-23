import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { defaultTemplates } from '../data/defaultTemplates'
import HomeScreen from './HomeScreen'

describe('HomeScreen', () => {
  it('lists the templates and starts the tapped one', async () => {
    const user = userEvent.setup()
    const onStartWorkout = vi.fn()
    render(<HomeScreen templates={defaultTemplates} onStartWorkout={onStartWorkout} />)

    expect(screen.getAllByRole('button')).toHaveLength(defaultTemplates.length)
    await user.click(screen.getByRole('button', { name: /חזה, גב, כתפיים \+ קרדיו/ }))
    expect(onStartWorkout).toHaveBeenCalledWith('chest-back-shoulders-cardio')
  })
})
