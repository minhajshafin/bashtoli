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
    <div className="bg-adm-surface border border-adm-border rounded-2xl overflow-hidden shadow-subtle">
      <div className="p-5 sm:px-6 border-b border-adm-border bg-adm-surface-2/60 flex flex-wrap justify-between items-center gap-3">
        <h2 className="text-sm font-semibold text-adm-fg">Staff Directory</h2>
        <span className="rounded-full bg-adm-surface border border-adm-border px-2.5 py-0.5 font-mono text-xs font-semibold text-adm-muted">
          {staff.length}
        </span>
      </div>

      {(error || successMessage) && (
        <div className="px-5 pt-4 space-y-3">
          {error && (
            <div
              role="alert"
              className="rounded-xl bg-adm-danger-bg border border-adm-danger-border p-3 text-xs font-semibold text-adm-danger animate-shake"
            >
              {error}
            </div>
          )}

          {successMessage && (
            <div
              role="status"
              className="rounded-xl bg-adm-success-bg border border-adm-success-border p-3 text-xs font-semibold text-adm-success"
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
        className="admin-table-region"
      >
        <table className="admin-responsive-table w-full border-collapse text-left text-sm">
          <caption id="staff-table-caption" className="sr-only">
            Authorized staff and administrator accounts
          </caption>
          <thead>
            <tr className="border-b border-adm-border bg-adm-surface-2/50 text-adm-muted text-xs font-medium">
              <th scope="col" className="px-6 py-3">Name</th>
              <th scope="col" className="px-6 py-3">Email</th>
              <th scope="col" className="px-6 py-3">Phone</th>
              <th scope="col" className="px-6 py-3 text-center">Role</th>
              <th scope="col" className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-adm-border">
            {staff.map((member) => {
              const isSelf = member.id === currentUserId
              const isAdminRole = member.role === 'admin'
              const cannotDemote = isSelf || isAdminRole

              return (
                <tr key={member.id} className="hover:bg-adm-surface-2/60 transition-colors">
                  <th scope="row" className="px-6 py-3.5 font-semibold text-adm-fg whitespace-nowrap text-left">
                    <span>{member.full_name || 'Unnamed User'}</span>
                    {isSelf && (
                      <span className="ml-2 rounded-md bg-adm-accent-tint border border-adm-accent-border px-1.5 py-0.5 text-[10px] font-semibold text-adm-accent-text">
                        You
                      </span>
                    )}
                  </th>
                  <td data-label="Email" className="px-6 py-3.5 font-mono text-xs text-adm-fg-2 whitespace-nowrap">
                    {member.email || 'N/A'}
                  </td>
                  <td data-label="Phone" className="px-6 py-3.5 font-mono text-xs text-adm-muted whitespace-nowrap">
                    {member.phone || 'N/A'}
                  </td>
                  <td data-label="Role" className="px-6 py-3.5 text-center">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize ${
                        isAdminRole
                          ? 'bg-adm-accent-tint text-adm-accent-text border-adm-accent-border'
                          : 'bg-adm-info-bg text-adm-info border-adm-info-border'
                      }`}
                    >
                      {member.role}
                    </span>
                  </td>
                  <td data-label="Actions" className="px-6 py-3.5 text-right whitespace-nowrap">
                    {cannotDemote ? (
                      <span className="font-mono text-xs text-adm-muted select-none">
                        Locked
                      </span>
                    ) : (
                      <button
                        id={`admin-demote-staff-${member.id}`}
                        type="button"
                        onClick={() => handleDemote(member)}
                        disabled={isPending}
                        className="inline-flex min-h-[36px] items-center justify-center rounded-xl bg-adm-danger-bg border border-adm-danger-border px-3.5 text-xs font-semibold text-adm-danger hover:bg-adm-danger hover:text-adm-danger-fg transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        Demote
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
