import { useLayoutEffect } from 'react'
import type { RefObject } from 'react'

// text-lg, text-base, text-sm: shrink only a little, then wrap
export const FIT_FONT_SIZES = ['1.125rem', '1rem', '0.875rem'] as const

// Shrinks the element's text until it fits on one line. If it still doesn't fit at the
// smallest size, the text wraps (the element should allow breaking long words).
export function useFitText(ref: RefObject<HTMLElement | null>, text: string): void {
  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return
    const el: HTMLElement = element

    function fit() {
      el.style.whiteSpace = 'nowrap'
      for (const size of FIT_FONT_SIZES) {
        el.style.fontSize = size
        if (el.scrollWidth <= el.clientWidth) return
      }
      el.style.whiteSpace = ''
    }

    fit()
    // Fit again when the card width changes (e.g. the phone is rotated)
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(fit)
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, text])
}
