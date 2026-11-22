import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { runWhenIdle } from '@/lib/utils/run-when-idle'

describe('runWhenIdle cross-browser utility', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('uses window.requestIdleCallback when available', () => {
    const callback = vi.fn()
    const mockCancelIdleCallback = vi.fn()
    const mockRequestIdleCallback = vi.fn((fn) => {
      setTimeout(fn, 100)
      return 42
    })

    vi.stubGlobal('requestIdleCallback', mockRequestIdleCallback)
    vi.stubGlobal('cancelIdleCallback', mockCancelIdleCallback)

    const cancel = runWhenIdle(callback, 3000)

    expect(mockRequestIdleCallback).toHaveBeenCalledTimes(1)
    expect(mockRequestIdleCallback).toHaveBeenCalledWith(callback, { timeout: 3000 })
    expect(callback).not.toHaveBeenCalled()

    vi.advanceTimersByTime(100)
    expect(callback).toHaveBeenCalledTimes(1)

    cancel()
    expect(mockCancelIdleCallback).toHaveBeenCalledWith(42)
  })

  it('falls back to setTimeout on Safari when requestIdleCallback is undefined', () => {
    const callback = vi.fn()

    // Simulate Safari / WebKit by removing requestIdleCallback
    vi.stubGlobal('requestIdleCallback', undefined)
    vi.stubGlobal('cancelIdleCallback', undefined)

    const cancel = runWhenIdle(callback, 2500)

    expect(callback).not.toHaveBeenCalled()

    // Advances timer within bounded timeout
    vi.advanceTimersByTime(200)
    expect(callback).toHaveBeenCalledTimes(1)

    cancel()
  })

  it('cancels the fallback timer before execution when cancel is called', () => {
    const callback = vi.fn()

    vi.stubGlobal('requestIdleCallback', undefined)

    const cancel = runWhenIdle(callback, 1000)

    // Cancel immediately
    cancel()

    vi.advanceTimersByTime(500)
    expect(callback).not.toHaveBeenCalled()
  })
})
