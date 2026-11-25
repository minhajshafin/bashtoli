import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import {
  AdminThemeToggle,
  ADMIN_THEME_STORAGE_KEY,
} from '@/components/admin/admin-theme-toggle'

function mockSystemColorScheme(isDark: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn((query: string) => ({
      matches: isDark,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })),
  })
}

describe('AdminThemeToggle', () => {
  beforeEach(() => {
    window.localStorage.clear()
    delete document.documentElement.dataset.adminTheme
  })

  it('follows OS light preference by default and toggles to persisted dark override, then reverts to OS default', () => {
    mockSystemColorScheme(false)

    render(<AdminThemeToggle />)

    const button = screen.getByRole('button', { name: 'Switch to dark theme' })
    expect(window.localStorage.getItem(ADMIN_THEME_STORAGE_KEY)).toBeNull()

    // Toggle light -> dark (differs from OS light, so persisted)
    fireEvent.click(button)
    expect(window.localStorage.getItem(ADMIN_THEME_STORAGE_KEY)).toBe('dark')
    expect(document.documentElement.dataset.adminTheme).toBe('dark')
    expect(screen.getByRole('button', { name: 'Switch to light theme' })).toBeInTheDocument()

    // Toggle back to light (matches OS light, so storage entry removed)
    fireEvent.click(screen.getByRole('button', { name: 'Switch to light theme' }))
    expect(window.localStorage.getItem(ADMIN_THEME_STORAGE_KEY)).toBeNull()
    expect(document.documentElement.dataset.adminTheme).toBe('')
    expect(screen.getByRole('button', { name: 'Switch to dark theme' })).toBeInTheDocument()
  })

  it('follows OS dark preference by default and toggles to persisted light override', () => {
    mockSystemColorScheme(true)

    render(<AdminThemeToggle />)

    const button = screen.getByRole('button', { name: 'Switch to light theme' })
    fireEvent.click(button)

    expect(window.localStorage.getItem(ADMIN_THEME_STORAGE_KEY)).toBe('light')
    expect(document.documentElement.dataset.adminTheme).toBe('light')
    expect(screen.getByRole('button', { name: 'Switch to dark theme' })).toBeInTheDocument()
  })

  it('updates document dataset when theme changes in another browser tab', () => {
    mockSystemColorScheme(false)
    render(<AdminThemeToggle />)

    window.localStorage.setItem(ADMIN_THEME_STORAGE_KEY, 'dark')
    fireEvent(
      window,
      new StorageEvent('storage', {
        key: ADMIN_THEME_STORAGE_KEY,
        newValue: 'dark',
      })
    )

    expect(document.documentElement.dataset.adminTheme).toBe('dark')
    expect(screen.getByRole('button', { name: 'Switch to light theme' })).toBeInTheDocument()
  })
})
