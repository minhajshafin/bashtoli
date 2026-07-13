'use client'

import React from 'react'

export function SidebarToggleButton() {
  const handleToggle = () => {
    window.dispatchEvent(new CustomEvent('toggle-sidebar'))
  }

  return (
    <button
      id="admin-sidebar-mobile-toggle"
      onClick={handleToggle}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 md:hidden transition-colors"
      aria-label="Open sidebar menu"
    >
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  )
}
