/**
 * Cross-browser Idle Task Scheduler.
 *
 * Invokes a callback when the browser main thread is idle. Provides an automatic
 * fallback using setTimeout for Safari / WebKit and older environments where
 * window.requestIdleCallback is unsupported.
 *
 * @param fn The callback to run when the thread is idle.
 * @param timeout Maximum wait time (ms) before forcing invocation (default: 2000).
 * @returns A cancellation function to abort the pending callback.
 */
export function runWhenIdle(fn: () => void, timeout = 2000): () => void {
  if (typeof window === 'undefined') {
    return () => {}
  }

  if (typeof window.requestIdleCallback === 'function') {
    const handle = window.requestIdleCallback(fn, { timeout })
    return () => {
      window.cancelIdleCallback(handle)
    }
  }

  const timerId = setTimeout(fn, Math.min(timeout, 200))
  return () => {
    clearTimeout(timerId)
  }
}
