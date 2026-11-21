import { describe, it, expect } from 'vitest'
import { formatPrice, formatPriceRange } from '@/lib/utils/format-price'

describe('formatPrice utility', () => {
  it('formats numbers with Tk prefix and commas', () => {
    expect(formatPrice(70)).toBe('Tk 70')
    expect(formatPrice(120)).toBe('Tk 120')
    expect(formatPrice(1200)).toBe('Tk 1,200')
    expect(formatPrice(0)).toBe('Tk 0')
  })

  it('formats numeric strings correctly', () => {
    expect(formatPrice('350')).toBe('Tk 350')
    expect(formatPrice('2500.5')).toBe('Tk 2,500.5')
  })

  it('handles null, undefined, or NaN gracefully', () => {
    expect(formatPrice(null)).toBe('Tk 0')
    expect(formatPrice(undefined)).toBe('Tk 0')
    expect(formatPrice('invalid')).toBe('Tk 0')
  })

  it('formats price ranges with formatPriceRange', () => {
    expect(formatPriceRange(50, 150)).toBe('Tk 50 – Tk 150')
    expect(formatPriceRange(50, 50)).toBe('Tk 50')
  })
})
