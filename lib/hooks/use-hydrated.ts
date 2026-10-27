'use client'

import { useSyncExternalStore } from 'react'

const emptySubscribe = () => () => {}

/**
 * Custom hook that safely detects whether client hydration has completed.
 * Uses useSyncExternalStore with getServerSnapshot returning false,
 * guaranteeing identical initial client and server render values.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
}
