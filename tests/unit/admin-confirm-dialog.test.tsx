import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import {
  AdminConfirmDialogProvider,
  useAdminConfirm,
} from '@/components/admin/admin-confirm-dialog'

function TestAdminConsumer({ onResult }: { onResult?: (res: boolean) => void }) {
  const confirm = useAdminConfirm()

  const handleAction = async () => {
    const ok = await confirm({
      title: 'Delete Product?',
      description: 'Are you sure you want to delete this product? This cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    })
    onResult?.(ok)
  }

  return (
    <button onClick={handleAction} data-testid="trigger-admin-confirm">
      Trigger Admin Confirm
    </button>
  )
}

describe('AdminConfirmDialog System', () => {
  it('throws error when useAdminConfirm is called outside AdminConfirmDialogProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<TestAdminConsumer />)).toThrow(
      'useAdminConfirm must be used within an AdminConfirmDialogProvider.'
    )
    spy.mockRestore()
  })

  it('renders modal with custom title, description, and buttons upon trigger', async () => {
    render(
      <AdminConfirmDialogProvider>
        <TestAdminConsumer />
      </AdminConfirmDialogProvider>
    )

    expect(screen.queryByText('Delete Product?')).not.toBeInTheDocument()

    const trigger = screen.getByTestId('trigger-admin-confirm')
    fireEvent.click(trigger)

    expect(screen.getByText('Delete Product?')).toBeInTheDocument()
    expect(
      screen.getByText('Are you sure you want to delete this product? This cannot be undone.')
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('resolves true when confirm button is clicked', async () => {
    const handleResult = vi.fn()

    render(
      <AdminConfirmDialogProvider>
        <TestAdminConsumer onResult={handleResult} />
      </AdminConfirmDialogProvider>
    )

    fireEvent.click(screen.getByTestId('trigger-admin-confirm'))
    const confirmBtn = screen.getByRole('button', { name: 'Delete' })
    fireEvent.click(confirmBtn)

    await waitFor(() => {
      expect(handleResult).toHaveBeenCalledWith(true)
    })
    expect(screen.queryByText('Delete Product?')).not.toBeInTheDocument()
  })

  it('resolves false when cancel button is clicked', async () => {
    const handleResult = vi.fn()

    render(
      <AdminConfirmDialogProvider>
        <TestAdminConsumer onResult={handleResult} />
      </AdminConfirmDialogProvider>
    )

    fireEvent.click(screen.getByTestId('trigger-admin-confirm'))
    const cancelBtn = screen.getByRole('button', { name: 'Cancel' })
    fireEvent.click(cancelBtn)

    await waitFor(() => {
      expect(handleResult).toHaveBeenCalledWith(false)
    })
    expect(screen.queryByText('Delete Product?')).not.toBeInTheDocument()
  })

  it('resolves false when Escape key is pressed', async () => {
    const handleResult = vi.fn()

    render(
      <AdminConfirmDialogProvider>
        <TestAdminConsumer onResult={handleResult} />
      </AdminConfirmDialogProvider>
    )

    fireEvent.click(screen.getByTestId('trigger-admin-confirm'))
    expect(screen.getByText('Delete Product?')).toBeInTheDocument()

    fireEvent.keyDown(window, { key: 'Escape' })

    await waitFor(() => {
      expect(handleResult).toHaveBeenCalledWith(false)
    })
    expect(screen.queryByText('Delete Product?')).not.toBeInTheDocument()
  })

  it('resolves false when corner close button is clicked', async () => {
    const handleResult = vi.fn()

    render(
      <AdminConfirmDialogProvider>
        <TestAdminConsumer onResult={handleResult} />
      </AdminConfirmDialogProvider>
    )

    fireEvent.click(screen.getByTestId('trigger-admin-confirm'))
    const closeBtn = screen.getByRole('button', { name: 'Close dialog' })
    fireEvent.click(closeBtn)

    await waitFor(() => {
      expect(handleResult).toHaveBeenCalledWith(false)
    })
    expect(screen.queryByText('Delete Product?')).not.toBeInTheDocument()
  })

  it('uses native <dialog>.showModal() and close() when supported by browser', async () => {
    const handleResult = vi.fn()
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
      const { container } = render(
        <AdminConfirmDialogProvider>
          <TestAdminConsumer onResult={handleResult} />
        </AdminConfirmDialogProvider>
      )

      fireEvent.click(screen.getByTestId('trigger-admin-confirm'))
      expect(showModalMock).toHaveBeenCalledTimes(1)

      const dialogEl = container.querySelector('dialog')
      expect(dialogEl).not.toBeNull()
      fireEvent(dialogEl!, new Event('cancel', { cancelable: true }))

      await waitFor(() => {
        expect(handleResult).toHaveBeenCalledWith(false)
      })
      expect(closeMock).toHaveBeenCalledTimes(1)
    } finally {
      HTMLDialogElement.prototype.showModal = origShowModal
      HTMLDialogElement.prototype.close = origClose
    }
  })
})
