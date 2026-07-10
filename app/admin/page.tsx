import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Dashboard',
}

/**
 * Stat card — placeholder for now.
 * Real data will be wired in Phase 6 (admin ops).
 */
function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
  accent: string
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${accent}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  )
}

/**
 * Admin dashboard home page.
 * Stat cards are placeholders (zeros) until Phase 6 wires real queries.
 */
export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = user
    ? await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', user.id)
        .single()
    : { data: null }

  const greeting = profile?.full_name
    ? `Welcome back, ${profile.full_name.split(' ')[0]}!`
    : 'Welcome back!'

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{greeting}</h1>
        <p className="mt-1 text-sm text-slate-500">
          Here&apos;s a snapshot of your store today.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Today's Orders"
          value={0}
          accent="bg-indigo-50 text-indigo-600"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
              <path fillRule="evenodd" d="M6 5v1H4.667a1.75 1.75 0 0 0-1.743 1.598l-.826 9.14A1.75 1.75 0 0 0 3.84 18.5H16.16a1.75 1.75 0 0 0 1.742-1.763l-.826-9.14A1.75 1.75 0 0 0 15.333 6H14V5a4 4 0 0 0-8 0Zm4-2.5A2.5 2.5 0 0 0 7.5 5v1h5V5A2.5 2.5 0 0 0 10 2.5ZM7.5 10a2.5 2.5 0 0 0 5 0V8.75a.75.75 0 0 1 1.5 0V10a4 4 0 0 1-8 0V8.75a.75.75 0 0 1 1.5 0V10Z" clipRule="evenodd" />
            </svg>
          }
        />
        <StatCard
          label="Pending Orders"
          value={0}
          accent="bg-amber-50 text-amber-600"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clipRule="evenodd" />
            </svg>
          }
        />
        <StatCard
          label="Low Stock Items"
          value={0}
          accent="bg-rose-50 text-rose-600"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
              <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
            </svg>
          }
        />
      </div>

      {/* Phase placeholder notice */}
      <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-5">
        <p className="text-sm font-medium text-indigo-800">
          Phase 2 in progress — catalog management (Tasks 2–5) coming next.
        </p>
        <p className="mt-1 text-sm text-indigo-600">
          Stats will be wired to live data in Phase 6 (Admin Ops).
        </p>
      </div>
    </div>
  )
}
