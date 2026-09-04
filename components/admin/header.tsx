import React from 'react'
import Link from 'next/link'
import { ExternalLink, Shield, ShieldCheck, User } from 'lucide-react'
import { getServerProfile } from '@/lib/supabase/get-server-profile'
import { LogoutButton } from './logout-button'
import { SidebarToggleButton } from './sidebar-toggle-button'
import { AdminBreadcrumbs } from './admin-breadcrumbs'

const ROLE_BADGE: Record<
  string,
  { label: string; class: string; icon: React.ComponentType<{ className?: string }> }
> = {
  admin: {
    label: 'Admin',
    class: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: ShieldAlertIcon,
  },
  staff: {
    label: 'Staff',
    class: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: ShieldCheck,
  },
  customer: {
    label: 'Customer',
    class: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: Shield,
  },
}

function ShieldAlertIcon({ className }: { className?: string }) {
  return <Shield className={className} />
}

/**
 * Admin top header — server component.
 * Features:
 * - Mobile menu toggle
 * - Dynamic path breadcrumbs
 * - Quick "View Live Store" safe exit link
 * - Security Role indicator badge
 * - Authenticated user identity pill
 * - Sign out button
 */
export async function Header() {
  const profile = await getServerProfile()

  const displayName = profile?.full_name ?? profile?.email?.split('@')[0] ?? 'Admin User'
  const email = profile?.email ?? ''
  const role = profile?.role ?? 'customer'
  const badge = ROLE_BADGE[role] ?? ROLE_BADGE.customer
  const BadgeIcon = badge.icon

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 z-30">
      {/* Left — mobile toggle + breadcrumb trail */}
      <div className="flex items-center gap-4 min-w-0">
        <SidebarToggleButton />
        <AdminBreadcrumbs />
      </div>

      {/* Right — live store link + user security info + sign-out */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        {/* Quick link to live storefront */}
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/70 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          title="Open public storefront in a new tab"
        >
          <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
          <span>View Store</span>
        </Link>

        {/* Divider */}
        <span className="hidden md:block h-5 w-px bg-slate-200" aria-hidden="true" />

        {/* User Identity & Role Pill */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs">
            {displayName.charAt(0).toUpperCase()}
          </div>

          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-bold text-slate-800 leading-tight">
              {displayName}
            </span>
            {email && (
              <span className="text-[10px] text-slate-400 leading-none truncate max-w-[140px]">
                {email}
              </span>
            )}
          </div>

          {/* Role badge */}
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-bold ${badge.class}`}
          >
            <BadgeIcon className="h-3 w-3" />
            {badge.label}
          </span>
        </div>

        {/* Sign Out */}
        <div className="pl-1">
          <LogoutButton />
        </div>
      </div>
    </header>
  )
}
