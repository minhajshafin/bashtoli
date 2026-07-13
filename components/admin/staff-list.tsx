'use client'

import React, { useState, useTransition } from 'react'
import { demoteUserAction, type StaffMember } from '@/lib/actions/staff'

interface StaffListProps {
  staff: StaffMember[]
  currentUserId: string
}

export function StaffList({ staff, currentUserId }: StaffListProps) {
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleDemote = async (member: StaffMember) => {
    const confirm = window.confirm(`Are you sure you want to demote ${member.full_name || member.email} back to customer role?`)
    if (!confirm) return

    setError(null)
    setSuccessMessage(null)

    startTransition(async () => {
      const res = await demoteUserAction(member.id)
      if (res.error) {
        setError(res.error)
      } else {
        setSuccessMessage(`${member.full_name || member.email} has been demoted successfully.`)
        // Auto-clear message
        setTimeout(() => setSuccessMessage(null), 3000)
      }
    })
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs space-y-4">
      <div className="p-5 border-b border-slate-150 bg-slate-50 flex justify-between items-center">
        <div>
          <h2 className="text-sm font-bold text-slate-800">Current Staff Members</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Active administrators and staff members who have access to the store management dashboard.
          </p>
        </div>
        <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-850 border border-indigo-200">
          {staff.length} Members
        </span>
      </div>

      <div className="p-5 pt-0 space-y-4">
        {error && (
          <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700 animate-shake">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-800">
            {successMessage}
          </div>
        )}

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                <th className="px-5 py-3">Full Name</th>
                <th className="px-5 py-3">Email Address</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3 text-center">Dashboard Role</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {staff.map((member) => {
                const isSelf = member.id === currentUserId
                const isAdminRole = member.role === 'admin'
                // Cannot demote self or other admins
                const cannotDemote = isSelf || isAdminRole

                return (
                  <tr key={member.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-900 whitespace-nowrap">
                      {member.full_name || 'Anonymous User'}
                      {isSelf && (
                        <span className="ml-1.5 rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-extrabold uppercase text-indigo-800">
                          You
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-slate-550 whitespace-nowrap">{member.email || 'N/A'}</td>
                    <td className="px-5 py-3.5 text-slate-450 whitespace-nowrap">{member.phone || 'N/A'}</td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold capitalize ${
                        isAdminRole
                          ? 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                          : 'bg-amber-100 text-amber-900 border border-amber-200'
                      }`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      {cannotDemote ? (
                        <span className="text-xs text-slate-400 font-medium italic select-none">
                          Locked
                        </span>
                      ) : (
                        <button
                          id={`admin-demote-staff-${member.id}`}
                          onClick={() => handleDemote(member)}
                          disabled={isPending}
                          className="inline-flex h-8 items-center justify-center rounded-lg bg-rose-50 border border-rose-200 px-3 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors disabled:opacity-50"
                        >
                          Demote Member
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
