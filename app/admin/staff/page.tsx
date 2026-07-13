import React from 'react'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { fetchStaffList } from '@/lib/actions/staff'
import { PromoteUserForm } from '@/components/admin/promote-user-form'
import { StaffList } from '@/components/admin/staff-list'

export const metadata: Metadata = {
  title: 'Staff Management | Bashtoli Admin',
  description: 'Manage staff accounts and administrative authorization roles.',
}

/**
 * Staff management route page (restricted to administrators only).
 */
export default async function StaffManagementPage() {
  const supabase = await createClient()

  // 1. Authenticate user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 2. Fetch profile role to enforce admin access controls (staff roles are blocked)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile || profile.role !== 'admin') {
    redirect('/admin')
  }

  // 3. Fetch staff members list
  const staff = await fetchStaffList()

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Staff Accounts</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review, promote, and manage store administrative dashboard privileges.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Promotion input panel */}
        <PromoteUserForm />

        {/* Staff accounts list table */}
        <StaffList staff={staff} currentUserId={user.id} />
      </div>
    </div>
  )
}
