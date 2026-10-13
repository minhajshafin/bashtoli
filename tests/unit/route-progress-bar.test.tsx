import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import {
  RouteProgressBar,
  startRouteProgress,
  doneRouteProgress,
  ROUTE_PROGRESS_START_EVENT,
  ROUTE_PROGRESS_DONE_EVENT,
} from '@/components/storefront/route-progress-bar'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/products',
  useSearchParams: () => new URLSearchParams(),
}))

describe('RouteProgressBar Component & Events', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  it('renders nothing when idle', () => {
    const { container } = render(<RouteProgressBar />)
    expect(container.firstChild).toBeNull()
  })

  it('starts progress bar when startRouteProgress is dispatched', () => {
    const { container } = render(<RouteProgressBar />)

    act(() => {
      startRouteProgress()
    })

    // Progress bar container should be visible
    const barContainer = container.querySelector('[aria-hidden="true"]')
    expect(barContainer).toBeTruthy()

    // Inner progress line
    const progressLine = barContainer?.querySelector('div')
    expect(progressLine).toBeTruthy()
    expect(progressLine?.style.width).toBe('18%')

    // Advance time and check trickle
    act(() => {
      vi.advanceTimersByTime(250)
    })
    expect(parseFloat(progressLine?.style.width || '0')).toBeGreaterThan(18)
  })

  it('completes and fades out on doneRouteProgress', () => {
    const { container } = render(<RouteProgressBar />)

    act(() => {
      startRouteProgress()
    })
    expect(container.querySelector('[aria-hidden="true"]')).toBeTruthy()

    act(() => {
      doneRouteProgress()
    })

    const barContainer = container.querySelector('[aria-hidden="true"]')
    const progressLine = barContainer?.querySelector('div')
    expect(progressLine?.style.width).toBe('100%')
    expect(barContainer?.getAttribute('style')).toContain('opacity: 0')

    // After animation completes, element is unmounted
    act(() => {
      vi.advanceTimersByTime(350)
    })
    expect(container.firstChild).toBeNull()
  })
})
