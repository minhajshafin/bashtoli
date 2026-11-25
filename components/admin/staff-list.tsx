'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { demoteUserAction, type StaffMember } from '@/lib/actions/staff'
import { useAdminConfirm } from '@/components/admin/admin-confirm-dialog'

interface StaffListProps {
  staff: StaffMember[]
  currentUserId: string
}

export function StaffList({ staff, currentUserId }: StaffListProps) {
  const router = useRouter()
  const confirm = useAdminConfirm()
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleDemote = async (member: StaffMember) => {
    const ok = await confirm({
      title: `Demote ${member.full_name || member.email}?`,
      description:
        'Are you sure you want to demote this user back to a customer role? They will immediately lose access to the administrative dashboard.',
      confirmText: 'Demote User',
      cancelText: 'Cancel',
      variant: 'warning',
    })
    if (!ok) return

    setError(null)
    setSuccessMessage(null)

    startTransition(async () => {
      const res = await demoteUserAction(member.id)
      if (res.error) {
        setError(res.error)
      } else {
        setSuccessMessage(`${member.full_name || member.email} has been demoted successfully.`)
        router.refresh()
        setTimeout(() => setSuccessMessage(null), 3000)
      }
    })
  }

  return (
    <div className="bg-paper-50 border border-paper-300 rounded-2xl overflow-hidden shadow-subtle">
      <div className="p-5 sm:p-6 border-b border-paper-300 bg-paper-200/60 flex flex-wrap justify-between items-center gap-3">
        <div>
          <p className="admin-kicker text-ink-500 mb-0.5">Authorized Directory</p>
          <h2 className="text-base font-bold text-ink-950">Current Staff Members</h2>
          <p className="text-xs text-ink-600 mt-0.5">
            Active administrators and staff members with access to the store management dashboard.
          </p>
        </div>
        <span className="rounded-full bg-ink-950 px-3 py-1 font-mono text-[11px] font-bold text-paper-50">
          {staff.length} {staff.length === 1 ? 'Member' : 'Members'}
        </span>
      </div>

      {(error || successMessage) && (
        <div className="px-5 pt-4 space-y-3">
          {error && (
            <div
              role="alert"
              className="rounded-xl bg-signal-danger-bg border border-signal-danger-border p-3 text-xs font-semibold text-signal-danger animate-shake"
            >
              {error}
            </div>
          )}

          {successMessage && (
            <div
              role="status"
              className="rounded-xl bg-ink-950 border border-ink-800 p-3 text-xs font-semibold text-paper-50"
            >
              {successMessage}
            </div>
          )}
        </div>
      )}

      <div
        tabIndex={0}
        role="region"
        aria-labelledby="staff-table-caption"
        className="admin-table-region focus-visible:outline-2 focus-visible:outline-ink-950 focus-visible:outline-inset"
      >
        <table className="admin-responsive-table w-full border-collapse text-left text-sm">
          <caption id="staff-table-caption" className="sr-only">
            Authorized staff and administrator accounts
          </caption>
          <thead>
            <tr className="border-b border-paper-300 bg-paper-200/40 text-ink-600 font-mono text-[11px] font-semibold uppercase tracking-[0.12em]">
              <th scope="col" className="px-6 py-3.5">Full Name</th>
              <th scope="col" className="px-6 py-3.5">Email Address</th>
              <th scope="col" className="px-6 py-3.5">Phone</th>
              <th scope="col" className="px-6 py-3.5 text-center">Dashboard Role</th>
              <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-paper-200">
            {staff.map((member) => {
              const isSelf = member.id === currentUserId
              const isAdminRole = member.role === 'admin'
              const cannotDemote = isSelf || isAdminRole

              return (
                <tr key={member.id} className="hover:bg-paper-100/80 transition-colors">
                  <th scope="row" className="px-6 py-4 font-bold text-ink-950 whitespace-nowrap text-left">
                    <span>{member.full_name || 'Anonymous User'}</span>
                    {isSelf && (
                      <span className="ml-2 rounded-md bg-paper-200 border border-ink-400/70 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase text-ink-950">
                        You
                      </span>
                    )}
                  </th>
                  <td data-label="Email" className="px-6 py-4 font-mono text-xs text-ink-700 whitespace-nowrap">
                    {member.email || 'N/A'}
                  </td>
                  <td data-label="Phone" className="px-6 py-4 font-mono text-xs text-ink-600 whitespace-nowrap">
                    {member.phone || 'N/A'}
                  </td>
                  <td data-label="Role" className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-bold capitalize ${
                        isAdminRole
                          ? 'bg-ink-950 text-paper-50 border-ink-950'
                          : 'bg-paper-50 text-ink-800 border-ink-400 border-dashed'
                      }`}
                    >
                      {member.role}
                    </span>
                  </td>
                  <td data-label="Actions" className="px-6 py-4 text-right whitespace-nowrap">
                    {cannotDemote ? (
                      <span className="font-mono text-xs text-ink-500 italic select-none">
                        Locked
                      </span>
                    ) : (
                      <button
                        id={`admin-demote-staff-${member.id}`}
                        type="button"
                        onClick={() => handleDemote(member)}
                        disabled={isPending}
                        className="inline-flex min-h-[38px] items-center justify-center rounded-xl bg-signal-danger-bg border border-signal-danger-border px-3.5 text-xs font-bold text-signal-danger hover:bg-signal-danger hover:text-paper-50 transition-colors disabled:opacity-50 cursor-pointer"
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
  )
}
