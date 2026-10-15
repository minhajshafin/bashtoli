'use client'

import React, { useEffect, useState, useRef, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

/** Custom browser events to programmatically control the progress bar if needed */
export const ROUTE_PROGRESS_START_EVENT = 'bashtoli:route-progress-start'
export const ROUTE_PROGRESS_DONE_EVENT = 'bashtoli:route-progress-done'

/**
 * Programmatically start the top route progress bar
 */
export function startRouteProgress() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(ROUTE_PROGRESS_START_EVENT))
  }
}

/**
 * Programmatically complete the top route progress bar
 */
export function doneRouteProgress() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(ROUTE_PROGRESS_DONE_EVENT))
  }
}

function ProgressBarInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const searchString = searchParams?.toString() || ''
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const [fading, setFading] = useState(false)

  const trickleTimerRef = useRef<NodeJS.Timeout | null>(null)
  const finishTimerRef = useRef<NodeJS.Timeout | null>(null)
  const safetyTimerRef = useRef<NodeJS.Timeout | null>(null)

  const clearTimers = () => {
    if (trickleTimerRef.current) clearInterval(trickleTimerRef.current)
    if (finishTimerRef.current) clearTimeout(finishTimerRef.current)
    if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current)
  }

  const start = () => {
    clearTimers()
    setFading(false)
    setVisible(true)
    setProgress(18)

    // Fluid trickle increment
    trickleTimerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 88) return prev
        const remaining = 90 - prev
        const step = Math.max(1, Math.floor(remaining * 0.12))
        return Math.min(prev + step, 88)
      })
    }, 220)

    // Safety timeout: auto-complete if navigation exceeds 8s
    safetyTimerRef.current = setTimeout(() => {
      done()
    }, 8000)
  }

  const done = () => {
    if (trickleTimerRef.current) clearInterval(trickleTimerRef.current)
    if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current)

    setProgress(100)
    setFading(true)

    finishTimerRef.current = setTimeout(() => {
      setVisible(false)
      setProgress(0)
      setFading(false)
    }, 320)
  }

  const isInitialMount = useRef(true)

  // Complete progress bar whenever route pathname or search params update
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    done()
    return () => clearTimers()
  }, [pathname, searchString])

  // Listen to global events and link clicks
  useEffect(() => {
    const handleStartEvent = () => start()
    const handleDoneEvent = () => done()

    window.addEventListener(ROUTE_PROGRESS_START_EVENT, handleStartEvent)
    window.addEventListener(ROUTE_PROGRESS_DONE_EVENT, handleDoneEvent)

    // Intercept clicks on anchor tags for internal navigation
    const handleDocumentClick = (e: MouseEvent) => {
      // Ignore modified clicks or non-primary clicks
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return

      const target = (e.target as Element | null)?.closest('a')
      if (!target) return

      const href = target.getAttribute('href')
      if (!href) return

      // Ignore external, target blank, download, or pseudo protocols
      if (
        target.target === '_blank' ||
        target.hasAttribute('download') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('javascript:') ||
        href.startsWith('#')
      ) {
        return
      }

      try {
        const url = new URL(target.href, window.location.href)
        const currentUrl = new URL(window.location.href)

        // Ignore different origins
        if (url.origin !== currentUrl.origin) return

        // Ignore same page and same search query (e.g. hash jumps)
        if (url.pathname === currentUrl.pathname && url.search === currentUrl.search) {
          return
        }

        // Trigger the progress bar
        start()
      } catch {
        // Ignore invalid URLs
      }
    }

    // Intercept browser back/forward buttons
    const handlePopState = () => {
      start()
    }

    document.addEventListener('click', handleDocumentClick, true)
    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener(ROUTE_PROGRESS_START_EVENT, handleStartEvent)
      window.removeEventListener(ROUTE_PROGRESS_DONE_EVENT, handleDoneEvent)
      document.removeEventListener('click', handleDocumentClick, true)
      window.removeEventListener('popstate', handlePopState)
      clearTimers()
    }
  }, [])

  if (!visible) return null

  return (
    <div
      aria-hidden="true"
      data-route-progress-bar="true"
      className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none transition-opacity duration-300"
      style={{
        opacity: fading ? 0 : 1,
      }}
    >
      <div
        className="h-[2px] transition-all duration-200 ease-out"
        style={{
          width: `${progress}%`,
          backgroundColor: 'var(--color-btn-accent-bg)',
        }}
      />
    </div>
  )
}

/**
 * Editorial 2px Top Hairline Navigation Progress Bar.
 * Wraps inner hooks in Suspense to preserve Next.js 16 SSR streaming.
 */
export function RouteProgressBar() {
  return (
    <Suspense fallback={null}>
      <ProgressBarInner />
    </Suspense>
  )
}
