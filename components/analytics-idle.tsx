'use client'

import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { runWhenIdle } from '@/lib/utils/run-when-idle'

const VercelAnalytics = dynamic(
  () => import('@vercel/analytics/react').then((m) => m.Analytics),
  { ssr: false }
)

/**
 * Lazy-loads Vercel Analytics strictly after the browser main thread is idle.
 * Prevents third-party analytics evaluation from interfering with LCP or TBT.
 */
export function AnalyticsIdle() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    return runWhenIdle(() => setMounted(true), 4000)
  }, [])

  if (!mounted) return null
  return <VercelAnalytics />
}
