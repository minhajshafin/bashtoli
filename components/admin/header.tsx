import React from 'react'
import Link from 'next/link'
import { connection } from 'next/server'
import { ArrowUpRight, Shield, ShieldCheck } from 'lucide-react'
import { getServerProfile } from '@/lib/supabase/get-server-profile'
import { LogoutButton } from './logout-button'
import { SidebarToggleButton } from './sidebar-toggle-button'
import { AdminBreadcrumbs } from './admin-breadcrumbs'
import { AdminThemeToggle } from './admin-theme-toggle'

const ROLE_BADGE: Record<
  string,
  { label: string; className: string; icon: React.ComponentType<{ className?: string }> }
> = {
  admin: {
    label: 'Admin',
    className: 'bg-adm-accent-tint text-adm-accent-text border-adm-accent-border',
    icon: Shield,
  },
  staff: {
    label: 'Staff',
    className: 'bg-adm-info-bg text-adm-info border-adm-info-border',
    icon: ShieldCheck,
  },
  customer: {
    label: 'Customer',
    className: 'bg-adm-surface-2 text-adm-muted border-adm-border',
    icon: Shield,
  },
}

/**
 * Minimal Admin Top Header — server component.
 */
export async function Header() {
  await connection()
  const profile = await getServerProfile()

  const displayName = profile?.full_name ?? profile?.email?.split('@')[0] ?? 'Admin User'
  const email = profile?.email ?? ''
  const role = profile?.role ?? 'customer'
  const badge = ROLE_BADGE[role] ?? ROLE_BADGE.customer
  const BadgeIcon = badge.icon

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-adm-border bg-adm-surface px-4 sm:px-6 z-30">
      {/* Left — mobile menu trigger + breadcrumb trail */}
      <div className="flex items-center gap-3 min-w-0 flex-1 overflow-hidden pr-2">
        <SidebarToggleButton />
        <AdminBreadcrumbs />
      </div>

      {/* Right — store link + theme switch + account + sign-out */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-adm-border bg-adm-surface-2/60 px-3 py-1.5 text-xs font-medium text-adm-fg-2 hover:bg-adm-surface-2 hover:text-adm-fg transition-colors"
          title="Open storefront"
        >
          <span>View Store</span>
          <ArrowUpRight className="h-3.5 w-3.5 text-adm-muted" aria-hidden="true" />
        </Link>

        <AdminThemeToggle />

        <span className="hidden md:block h-5 w-px bg-adm-border" aria-hidden="true" />

        {/* Account Identity & Role Pill */}
        <div className="flex items-center gap-2">
          <div
            aria-hidden="true"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-adm-accent-tint border border-adm-accent-border text-adm-accent-text font-semibold text-xs"
          >
            {displayName.charAt(0).toUpperCase()}
          </div>

          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-semibold text-adm-fg leading-tight">
              {displayName}
            </span>
            {email && (
              <span className="text-[11px] text-adm-muted leading-none truncate max-w-[150px] mt-0.5">
                {email}
              </span>
            )}
          </div>

          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${badge.className}`}
          >
            <BadgeIcon className="h-3 w-3" aria-hidden="true" />
            {badge.label}
          </span>
        </div>

        <LogoutButton />
      </div>
    </header>
  )
}
