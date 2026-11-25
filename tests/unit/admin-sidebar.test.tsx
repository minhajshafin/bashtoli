import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Sidebar } from '@/components/admin/sidebar'

let mockPathname = '/admin'

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}))

vi.mock('@/lib/actions/auth', () => ({
  logoutAction: vi.fn(),
}))

function setViewportMatch(isDesktop: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: isDesktop,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  })
}

describe('Admin Sidebar & Mobile Native Drawer', () => {
  beforeEach(() => {
    mockPathname = '/admin'
    vi.clearAllMocks()
  })

  it('renders desktop <aside> with unique admin navigation IDs and active state', () => {
    setViewportMatch(true)
    const { container } = render(<Sidebar />)

    expect(container.querySelector('aside')).not.toBeNull()
    expect(container.querySelector('dialog')).toBeNull()
    expect(container.querySelectorAll('#admin-nav-dashboard')).toHaveLength(1)

    const dashLink = screen.getByRole('link', { name: 'Dashboard' })
    expect(dashLink).toHaveAttribute('aria-current', 'page')
  })

  it('renders native <dialog> drawer on mobile viewports and opens via toggle-sidebar event', () => {
    setViewportMatch(false)
    const origShowModal = HTMLDialogElement.prototype.showModal
    const origClose = HTMLDialogElement.prototype.close

    const showModalMock = vi.fn(function (this: HTMLDialogElement) {
      this.setAttribute('open', '')
    })
    const closeMock = vi.fn(function (this: HTMLDialogElement) {
      this.removeAttribute('open')
    })

    HTMLDialogElement.prototype.showModal = showModalMock
    HTMLDialogElement.prototype.close = closeMock

    try {
      const { container } = render(<Sidebar />)
      const dialog = container.querySelector('dialog')
      expect(dialog).not.toBeNull()
      expect(container.querySelector('aside')).toBeNull()
      expect(container.querySelectorAll('#admin-nav-orders')).toHaveLength(1)

      fireEvent(window, new CustomEvent('toggle-sidebar'))
      expect(showModalMock).toHaveBeenCalledTimes(1)

      const closeBtn = screen.getByRole('button', { name: 'Close navigation menu' })
      fireEvent.click(closeBtn)
      expect(closeMock).toHaveBeenCalledTimes(1)
    } finally {
      HTMLDialogElement.prototype.showModal = origShowModal
      HTMLDialogElement.prototype.close = origClose
    }
  })
})
