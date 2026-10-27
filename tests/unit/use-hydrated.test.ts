import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useHydrated } from '@/lib/hooks/use-hydrated'

describe('useHydrated hook', () => {
  it('returns true on the client environment after hydration', () => {
    const { result } = renderHook(() => useHydrated())
    expect(result.current).toBe(true)
  })
})
