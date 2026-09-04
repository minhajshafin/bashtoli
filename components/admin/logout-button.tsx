'use client'

import React from 'react'
import { LogOut } from 'lucide-react'
import { logoutAction } from '@/lib/actions/auth'

/**
 * Logout button — client component for submitting auth sign-out action.
 * Styled cleanly for the admin white header bar.
 */
export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        id="admin-logout-btn"
        type="submit"
        title="Sign out of Admin"
        className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition-colors shadow-2xs cursor-pointer"
      >
        <LogOut className="h-3.5 w-3.5 text-slate-400 group-hover:text-rose-600 transition-colors" />
        <span>Sign out</span>
      </button>
    </form>
  )
}
