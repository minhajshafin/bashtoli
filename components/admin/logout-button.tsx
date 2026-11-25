'use client'

import React from 'react'
import { LogOut } from 'lucide-react'
import { logoutAction } from '@/lib/actions/auth'

/**
 * Logout button rendered in the sidebar footer for signing out of admin.
 */
export function LogoutButton() {
  return (
    <form action={logoutAction} className="w-full">
      <button
        id="admin-logout-btn"
        type="submit"
        title="Sign out"
        className="group flex min-h-[42px] w-full items-center justify-between rounded-xl border border-adm-border bg-adm-surface-2/60 px-3.5 py-2 text-xs font-semibold text-adm-fg-2 hover:bg-adm-danger-bg hover:text-adm-danger hover:border-adm-danger-border transition-colors cursor-pointer"
      >
        <span>Sign out</span>
        <LogOut
          className="h-3.5 w-3.5 text-adm-muted group-hover:text-adm-danger transition-colors"
          aria-hidden="true"
        />
      </button>
    </form>
  )
}
