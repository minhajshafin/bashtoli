'use client'

import React from 'react'
import { LogOut } from 'lucide-react'
import { logoutAction } from '@/lib/actions/auth'

/**
 * Logout button — client component for submitting auth sign-out action.
 */
export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        id="admin-logout-btn"
        type="submit"
        title="Sign out of Admin"
        className="group inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-paper-300 bg-paper-50 px-3 py-1.5 text-xs font-semibold text-ink-800 hover:bg-ink-950 hover:text-paper-50 hover:border-ink-950 transition-colors cursor-pointer"
      >
        <LogOut className="h-3.5 w-3.5 text-ink-500 group-hover:text-paper-50 transition-colors" aria-hidden="true" />
        <span className="hidden sm:inline">Sign out</span>
      </button>
    </form>
  )
}
