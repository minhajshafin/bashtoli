'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M9.293 2.293a1 1 0 0 1 1.414 0l7 7A1 1 0 0 1 17 11h-1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6H3a1 1 0 0 1-.707-1.707l7-7Z"
          clipRule="evenodd"
        />
      </svg>
    ),
    /** exact match — only active on /admin itself */
    exact: true,
  },
  {
    label: 'Products',
    href: '/admin/products',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <path d="M2 3a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H2Z" />
        <path
          fillRule="evenodd"
          d="M2 7.5h16l-1.573 7.327A2 2 0 0 1 14.46 16H5.54a2 2 0 0 1-1.967-1.673L2 7.5Zm5 3.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5Z"
          clipRule="evenodd"
        />
      </svg>
    ),
    exact: false,
  },
  {
    label: 'Categories',
    href: '/admin/categories',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75Zm0 10.5a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75ZM2 10a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 2 10Z"
          clipRule="evenodd"
        />
      </svg>
    ),
    exact: false,
  },
  {
    label: 'Orders',
    href: '/admin/orders',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M4 2a2 2 0 0 0-2 2v11a3 3 0 1 0 6 0V4a2 2 0 0 0-2-2H4Zm1 14a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm5-1.757 4.9-4.9a2 2 0 0 0 0-2.828L13.485 5.1a2 2 0 0 0-2.828 0L9 6.757v8.486ZM16 17H9.071l6-6H16a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1Z"
          clipRule="evenodd"
        />
      </svg>
    ),
    exact: false,
  },
]

/**
 * Admin sidebar navigation — client component so it can read `usePathname`
 * to highlight the active link without a full page reload.
 */
export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col bg-slate-900">
      {/* Brand */}
      <div className="flex h-16 items-center px-6">
        <span className="text-lg font-bold tracking-tight text-white">
          Bashtoli
        </span>
        <span className="ml-2 rounded-md bg-indigo-600 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
          Admin
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
          Menu
        </p>

        {NAV_ITEMS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              id={`admin-nav-${item.label.toLowerCase()}`}
              href={item.href}
              className={[
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white',
              ].join(' ')}
              aria-current={isActive ? 'page' : undefined}
            >
              {item.icon}
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer — version */}
      <div className="border-t border-slate-800 px-6 py-4">
        <p className="text-[11px] text-slate-600">Bashtoli v0.1 · Phase 2</p>
      </div>
    </aside>
  )
}
