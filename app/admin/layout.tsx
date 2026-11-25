import type { Metadata } from 'next'
import { connection } from 'next/server'
import { JetBrains_Mono } from 'next/font/google'
import { Sidebar } from '@/components/admin/sidebar'
import { Header } from '@/components/admin/header'
import { AdminConfirmDialogProvider } from '@/components/admin/admin-confirm-dialog'
import { ToastProvider } from '@/components/ui/toast'

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    template: '%s | Bashtoli Admin',
    default: 'Bashtoli Admin',
  },
  description: 'Bashtoli store management dashboard',
  robots: { index: false, follow: false },
}

export const instant = false

/**
 * Root layout for all /admin/* routes.
 * Scopes adaptive Light & Dark admin tokens and JetBrains Mono exclusively
 * to /admin without altering storefront color schemes.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await connection()
  return (
    <ToastProvider variant="admin">
      <AdminConfirmDialogProvider>
        <div
          className={`admin-theme ${jetbrainsMono.variable} flex h-screen overflow-hidden bg-adm-bg text-adm-fg font-sans antialiased`}
        >
          {/* Skip link for keyboard navigation */}
          <a
            href="#admin-main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[120] focus:rounded-xl focus:bg-adm-accent focus:px-4 focus:py-2.5 focus:text-xs focus:font-semibold focus:text-adm-accent-fg focus:shadow-elevation-3"
          >
            Skip to main content
          </a>

          <Sidebar />

          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <Header />

            <main
              id="admin-main-content"
              tabIndex={-1}
              className="flex-1 overflow-y-auto outline-none"
            >
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {children}
              </div>
            </main>
          </div>
        </div>
      </AdminConfirmDialogProvider>
    </ToastProvider>
  )
}
