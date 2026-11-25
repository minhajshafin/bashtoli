import React from 'react'
import Link from 'next/link'
import { connection } from 'next/server'
import { ArrowUpRight, Shield, ShieldCheck } from 'lucide-react'
import { getServerProfile } from '@/lib/supabase/get-server-profile'
import { LogoutButton } from './logout-button'
import { SidebarToggleButton } from './sidebar-toggle-button'
import { AdminBreadcrumbs } from './admin-breadcrumbs'

const ROLE_BADGE: Record<
  string,
  { label: string; className: string; icon: React.ComponentType<{ className?: string }> }
> = {
  admin: {
    label: 'Admin',
    className: 'bg-ink-950 text-paper-50 border-ink-950',
    icon: Shield,
  },
  staff: {
    label: 'Staff',
    className: 'bg-paper-200 text-ink-950 border-ink-400/70',
    icon: ShieldCheck,
  },
  customer: {
    label: 'Customer',
    className: 'bg-paper-100 text-ink-700 border-paper-300',
    icon: Shield,
  },
}

/**
 * Monochrome Dual-Tone Admin Top Header — server component.
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
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-paper-300 bg-paper-50 px-4 sm:px-6 z-30">
      {/* Left — mobile menu trigger + breadcrumb trail */}
      <div className="flex items-center gap-3 min-w-0 flex-1 overflow-hidden pr-2">
        <SidebarToggleButton />
        <AdminBreadcrumbs />
      </div>

      {/* Right — live store link + user identity + sign-out */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-paper-300 bg-paper-100 px-3 py-1.5 text-xs font-semibold text-ink-800 hover:bg-ink-950 hover:text-paper-50 hover:border-ink-950 transition-colors"
          title="Open public storefront in a new tab"
        >
          <span>View Store</span>
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>

        <span className="hidden md:block h-5 w-px bg-paper-300" aria-hidden="true" />

        {/* User Identity & Role Pill */}
        <div className="flex items-center gap-2.5">
          <div
            aria-hidden="true"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-950 text-paper-50 font-mono font-bold text-xs"
          >
            {displayName.charAt(0).toUpperCase()}
          </div>

          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-bold text-ink-950 leading-tight">
              {displayName}
            </span>
            {email && (
              <span className="font-mono text-[10px] text-ink-500 leading-none truncate max-w-[150px] mt-0.5">
                {email}
              </span>
            )}
          </div>

          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${badge.className}`}
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
