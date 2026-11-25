import React from 'react'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { connection } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fetchStaffList } from '@/lib/actions/staff'
import { PromoteUserForm } from '@/components/admin/promote-user-form'
import { StaffList } from '@/components/admin/staff-list'

export const metadata: Metadata = {
  title: 'Staff Management',
  description: 'Manage staff accounts and administrative authorization roles.',
}

export const instant = false

export default async function StaffManagementPage() {
  await connection()
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile || profile.role !== 'admin') {
    redirect('/admin')
  }

  const staff = await fetchStaffList()

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="pb-5 border-b border-adm-border">
        <h1 className="admin-page-title text-adm-fg">Staff Accounts</h1>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <PromoteUserForm />
        <StaffList staff={staff} currentUserId={user.id} />
      </div>
    </div>
  )
}
