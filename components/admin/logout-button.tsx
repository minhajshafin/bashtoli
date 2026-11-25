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
        title="Sign out"
        className="group inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-adm-border bg-adm-surface px-3 py-1.5 text-xs font-medium text-adm-fg-2 hover:bg-adm-danger-bg hover:text-adm-danger hover:border-adm-danger-border transition-colors cursor-pointer"
      >
        <LogOut className="h-3.5 w-3.5 text-adm-muted group-hover:text-adm-danger transition-colors" aria-hidden="true" />
        <span className="hidden sm:inline">Sign out</span>
      </button>
    </form>
  )
}
