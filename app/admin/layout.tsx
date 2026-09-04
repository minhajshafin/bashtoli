import type { Metadata } from 'next'
import { Sidebar } from '@/components/admin/sidebar'
import { Header } from '@/components/admin/header'
import { AdminConfirmDialogProvider } from '@/components/admin/admin-confirm-dialog'
import { ToastProvider } from '@/components/ui/toast'

export const metadata: Metadata = {
  title: {
    template: '%s | Bashtoli Admin',
    default: 'Bashtoli Admin',
  },
  description: 'Bashtoli store management dashboard',
  robots: { index: false, follow: false },
}

/**
 * Root layout for all /admin/* routes.
 *
 * Note: auth-gating is handled upstream in middleware (adminGuard),
 * so by the time any component here renders, the user is already
 * verified as staff or admin.
 *
 * Layout: fixed sidebar on the left, scrollable main content on the right.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ToastProvider>
      <AdminConfirmDialogProvider>
        <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900 font-sans antialiased selection:bg-indigo-100 selection:text-indigo-900">
          {/* Sidebar — fixed width, full viewport height */}
          <Sidebar />

          {/* Content area */}
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <Header />

            <main
              id="admin-main-content"
              className="flex-1 overflow-y-auto"
            >
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">{children}</div>
            </main>
          </div>
        </div>
      </AdminConfirmDialogProvider>
    </ToastProvider>
  )
}
