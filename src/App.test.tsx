import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'
import { loadSessions } from './lib/storage'

describe('App', () => {
  it('start → add set → finish → appears in history and storage', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /רגליים \+ ידיים/ }))

    const legCurl = screen.getByRole('region', { name: 'כפיפת ברכיים' })
    await user.click(within(legCurl).getByRole('button', { name: /הוספת סט/ }))
    await user.type(within(legCurl).getByLabelText('משקל סט 1'), '40')
    await user.click(screen.getByRole('button', { name: 'סיום ושמירה' }))

    expect(screen.getByRole('heading', { name: 'היסטוריה' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'רגליים + ידיים' })).toBeInTheDocument()
    expect(screen.getByText(/כפיפת ברכיים: 40×10/)).toBeInTheDocument()

    const saved = loadSessions()
    expect(saved).toHaveLength(1)
    expect(saved[0].logs).toEqual([{ exerciseId: 'leg-curl', sets: [{ weightKg: 40, reps: 10 }] }])
  })

  it('shows the suggestion from the last saved workout', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /רגליים \+ ידיים/ }))
    const legCurl = screen.getByRole('region', { name: 'כפיפת ברכיים' })
    await user.click(within(legCurl).getByRole('button', { name: /הוספת סט/ }))
    await user.type(within(legCurl).getByLabelText('משקל סט 1'), '40')
    await user.click(screen.getByRole('button', { name: 'סיום ושמירה' }))

    await user.click(screen.getByRole('button', { name: 'אימון חדש' }))
    await user.click(screen.getByRole('button', { name: /רגליים \+ ידיים/ }))

    const nextLegCurl = screen.getByRole('region', { name: 'כפיפת ברכיים' })
    expect(within(nextLegCurl).getByText('40×10')).toBeInTheDocument()
    expect(within(nextLegCurl).getByText('42.5 ק״ג × 10')).toBeInTheDocument()
  })

  it('cannot finish an empty workout', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /רגליים \+ ידיים/ }))
    expect(screen.getByRole('button', { name: 'סיום ושמירה' })).toBeDisabled()
  })
})
