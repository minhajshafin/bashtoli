'use client'

import React from 'react'

export function SidebarToggleButton() {
  const handleToggle = () => {
    window.dispatchEvent(new CustomEvent('toggle-sidebar'))
  }

  return (
    <button
      id="admin-sidebar-mobile-toggle"
      type="button"
      onClick={handleToggle}
      className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-adm-border bg-adm-surface text-adm-fg hover:bg-adm-surface-2 md:hidden transition-colors cursor-pointer"
      aria-label="Open navigation menu"
    >
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  )
}
