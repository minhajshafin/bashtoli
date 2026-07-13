import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from './logout-button'
import { SidebarToggleButton } from './sidebar-toggle-button'

const ROLE_BADGE: Record<string, { label: string; class: string }> = {
  admin: {
    label: 'Admin',
    class: 'bg-rose-100 text-rose-700',
  },
  staff: {
    label: 'Staff',
    class: 'bg-amber-100 text-amber-700',
  },
  customer: {
    label: 'Customer',
    class: 'bg-slate-100 text-slate-600',
  },
}

/**
 * Admin top header — server component.
 * Fetches the current user's name and role, then renders the header bar.
 * Sign-out is delegated to the <LogoutButton> client component.
 */
export async function Header() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Profile might not exist in edge cases; degrade gracefully.
  const { data: profile } = user
    ? await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', user.id)
        .single()
    : { data: null }

  const displayName = profile?.full_name ?? user?.email ?? 'Unknown user'
  const role = profile?.role ?? 'customer'
  const badge = ROLE_BADGE[role] ?? ROLE_BADGE.customer

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
      {/* Left — mobile menu toggle button */}
      <SidebarToggleButton />

      {/* Right — user info + sign-out */}
      <div className="flex items-center gap-3">
        {/* Role badge */}
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge.class}`}
        >
          {badge.label}
        </span>

        {/* User name */}
        <span className="hidden text-sm font-medium text-slate-700 sm:block">
          {displayName}
        </span>

        {/* Divider */}
        <span className="h-5 w-px bg-slate-200" aria-hidden="true" />

        <LogoutButton />
      </div>
    </header>
  )
}
