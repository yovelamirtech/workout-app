import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import App from './App'
import { loadSessions } from './lib/storage'

describe('App', () => {
  it('start → log a machine weight → finish → appears in history and storage', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /רגליים \+ ידיים/ }))

    const legCurl = screen.getByRole('region', { name: 'כפיפת ברכיים' })
    await user.type(within(legCurl).getByLabelText('שם מכונה 1'), 'כבל')
    await user.type(within(legCurl).getByLabelText('משקל מכונה 1'), '40')
    await user.click(screen.getByRole('button', { name: 'סיום ושמירה' }))

    expect(screen.getByRole('heading', { name: 'היסטוריה' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'רגליים + ידיים' })).toBeInTheDocument()
    expect(screen.getByText('כפיפת ברכיים: כבל 40 ק״ג')).toBeInTheDocument()

    const saved = loadSessions()
    expect(saved).toHaveLength(1)
    expect(saved[0].logs).toEqual([
      { exerciseId: 'leg-curl', entries: [{ machine: 'כבל', weight: 40, unit: 'kg' }] },
    ])
  })

  it('next workout is prefilled with each machine from last time and its weight', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /רגליים \+ ידיים/ }))
    const legCurl = screen.getByRole('region', { name: 'כפיפת ברכיים' })
    await user.type(within(legCurl).getByLabelText('שם מכונה 1'), 'כבל')
    await user.type(within(legCurl).getByLabelText('משקל מכונה 1'), '40')
    await user.click(within(legCurl).getByRole('button', { name: /הוספת מכונה/ }))
    await user.type(within(legCurl).getByLabelText('שם מכונה 2'), 'מכונה')
    await user.type(within(legCurl).getByLabelText('משקל מכונה 2'), '90')
    await user.selectOptions(within(legCurl).getByLabelText('יחידה מכונה 2'), 'lb')
    await user.click(screen.getByRole('button', { name: 'סיום ושמירה' }))

    await user.click(screen.getByRole('button', { name: 'אימון חדש' }))
    await user.click(screen.getByRole('button', { name: /רגליים \+ ידיים/ }))

    const nextLegCurl = screen.getByRole('region', { name: 'כפיפת ברכיים' })
    expect(within(nextLegCurl).getByLabelText('שם מכונה 1')).toHaveValue('כבל')
    expect(within(nextLegCurl).getByLabelText('משקל מכונה 1')).toHaveValue(40)
    expect(within(nextLegCurl).getByText('40 ק״ג')).toBeInTheDocument()
    expect(within(nextLegCurl).getByLabelText('שם מכונה 2')).toHaveValue('מכונה')
    expect(within(nextLegCurl).getByLabelText('משקל מכונה 2')).toHaveValue(90)
    expect(within(nextLegCurl).getByLabelText('יחידה מכונה 2')).toHaveValue('lb')
    expect(within(nextLegCurl).getByText('90 פאונד')).toBeInTheDocument()
  })

  it('deletes a workout from history and storage', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<App />)

    await user.click(screen.getByRole('button', { name: /רגליים \+ ידיים/ }))
    const legCurl = screen.getByRole('region', { name: 'כפיפת ברכיים' })
    await user.type(within(legCurl).getByLabelText('משקל מכונה 1'), '40')
    await user.click(screen.getByRole('button', { name: 'סיום ושמירה' }))

    await user.click(screen.getByRole('button', { name: /מחיקת אימון רגליים \+ ידיים/ }))
    expect(screen.getByText('עדיין אין אימונים שמורים')).toBeInTheDocument()
    expect(loadSessions()).toEqual([])
    vi.restoreAllMocks()
  })

  it('cannot finish an empty workout', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /רגליים \+ ידיים/ }))
    expect(screen.getByRole('button', { name: 'סיום ושמירה' })).toBeDisabled()
  })
})
