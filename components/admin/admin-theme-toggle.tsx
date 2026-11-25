'use client'

import React, { useEffect, useSyncExternalStore } from 'react'
import { Moon, Sun } from 'lucide-react'

export const ADMIN_THEME_STORAGE_KEY = 'bashtoli-admin-theme'
const THEME_EVENT = 'bashtoli-admin-theme-change'
const DARK_MQ = '(prefers-color-scheme: dark)'

export type ResolvedTheme = 'light' | 'dark'
type StoredTheme = ResolvedTheme | null

function readStoredTheme(): StoredTheme {
  try {
    const val = window.localStorage.getItem(ADMIN_THEME_STORAGE_KEY)
    return val === 'light' || val === 'dark' ? val : null
  } catch {
    return null
  }
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'light'
  }
  return window.matchMedia(DARK_MQ).matches ? 'dark' : 'light'
}

export function applyAdminThemeToDocument(stored: StoredTheme) {
  if (typeof document === 'undefined') return
  if (stored === 'light' || stored === 'dark') {
    document.documentElement.dataset.adminTheme = stored
  } else {
    document.documentElement.dataset.adminTheme = ''
  }
}

function subscribeTheme(callback: () => void) {
  const onThemeChange = () => callback()
  const onStorage = (e: StorageEvent) => {
    if (e.key === ADMIN_THEME_STORAGE_KEY || e.key === null) {
      applyAdminThemeToDocument(readStoredTheme())
      callback()
    }
  }
  const mql = typeof window.matchMedia === 'function' ? window.matchMedia(DARK_MQ) : null
  const onMediaChange = () => callback()

  window.addEventListener(THEME_EVENT, onThemeChange)
  window.addEventListener('storage', onStorage)
  mql?.addEventListener('change', onMediaChange)

  return () => {
    window.removeEventListener(THEME_EVENT, onThemeChange)
    window.removeEventListener('storage', onStorage)
    mql?.removeEventListener('change', onMediaChange)
  }
}

function getClientTheme(): ResolvedTheme {
  return readStoredTheme() ?? getSystemTheme()
}

function getServerTheme(): ResolvedTheme | null {
  return null
}

/**
 * One-click Light / Dark theme toggle scoped to /admin.
 * Defaults to OS preference without storing an override; writes only when diverging
 * from OS preference and clears storage when toggled back to match OS.
 */
export function AdminThemeToggle() {
  const renderedTheme = useSyncExternalStore(
    subscribeTheme,
    getClientTheme,
    getServerTheme
  )

  useEffect(() => {
    applyAdminThemeToDocument(readStoredTheme())
    return () => {
      applyAdminThemeToDocument(null)
    }
  }, [])

  const handleToggle = () => {
    const osTheme = getSystemTheme()
    const current = readStoredTheme() ?? osTheme
    const next: ResolvedTheme = current === 'dark' ? 'light' : 'dark'
    const storedToPersist: StoredTheme = next === osTheme ? null : next

    try {
      if (storedToPersist) {
        window.localStorage.setItem(ADMIN_THEME_STORAGE_KEY, storedToPersist)
      } else {
        window.localStorage.removeItem(ADMIN_THEME_STORAGE_KEY)
      }
    } catch {
      // Storage blocked: still apply in-memory visual theme
    }

    applyAdminThemeToDocument(storedToPersist)
    window.dispatchEvent(new CustomEvent(THEME_EVENT))
  }

  const isDark = renderedTheme === 'dark'
  const label = renderedTheme
    ? isDark
      ? 'Switch to light theme'
      : 'Switch to dark theme'
    : 'Toggle color theme'

  return (
    <button
      id="admin-theme-toggle"
      type="button"
      onClick={handleToggle}
      aria-label={label}
      title={label}
      className="inline-flex min-h-[38px] min-w-[38px] items-center justify-center rounded-xl border border-adm-border bg-adm-surface text-adm-fg-2 hover:bg-adm-surface-2 hover:text-adm-fg transition-colors cursor-pointer"
    >
      {renderedTheme === 'dark' ? (
        <Sun className="h-4 w-4 text-adm-warning" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  )
}
