import { useRef } from 'react'
import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useFitText } from './useFitText'

function Line({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  useFitText(ref, text)
  return <p ref={ref}>{text}</p>
}

// jsdom has no layout: the text is 10 "rem" wide and the line has the given width in px
function mockLayout(lineWidth: number) {
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(lineWidth)
  vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockImplementation(function (this: HTMLElement) {
    return parseFloat(this.style.fontSize) * 16 * 10
  })
}

describe('useFitText', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('keeps the normal size when the text fits', () => {
    mockLayout(200)
    render(<Line text="כבל: 40 ק״ג" />)
    const line = screen.getByText('כבל: 40 ק״ג')
    expect(line.style.fontSize).toBe('1.125rem')
    expect(line.style.whiteSpace).toBe('nowrap')
  })

  it('shrinks the text a little to fit on one line', () => {
    mockLayout(150)
    render(<Line text="מכונה ארוכה: 40 ק״ג" />)
    const line = screen.getByText('מכונה ארוכה: 40 ק״ג')
    expect(line.style.fontSize).toBe('0.875rem')
    expect(line.style.whiteSpace).toBe('nowrap')
  })

  it('wraps at the smallest size when the text still does not fit', () => {
    mockLayout(100)
    render(<Line text="מכונה ארוכה מאוד: 40 ק״ג" />)
    const line = screen.getByText('מכונה ארוכה מאוד: 40 ק״ג')
    expect(line.style.fontSize).toBe('0.875rem')
    expect(line.style.whiteSpace).toBe('')
  })
})
