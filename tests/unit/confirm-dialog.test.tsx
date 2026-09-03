import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ConfirmDialogProvider, useConfirm } from '@/components/ui/confirm-dialog'

function TestConsumer({ onResult }: { onResult?: (res: boolean) => void }) {
  const confirm = useConfirm()

  const handleAction = async () => {
    const ok = await confirm({
      title: 'Clear Shopping Bag?',
      description: 'Are you sure you want to remove all items from your bag?',
      confirmText: 'Clear Bag',
      cancelText: 'Keep Items',
      variant: 'danger',
    })
    onResult?.(ok)
  }

  return (
    <button onClick={handleAction} data-testid="trigger-btn">
      Trigger Confirm
    </button>
  )
}

describe('ConfirmDialog System', () => {
  it('throws error when useConfirm is called outside ConfirmDialogProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<TestConsumer />)).toThrow(
      'useConfirm must be used within a ConfirmDialogProvider context.'
    )
    spy.mockRestore()
  })

  it('renders modal with custom title, description, and buttons upon trigger', async () => {
    render(
      <ConfirmDialogProvider>
        <TestConsumer />
      </ConfirmDialogProvider>
    )

    expect(screen.queryByText('Clear Shopping Bag?')).not.toBeInTheDocument()

    const trigger = screen.getByTestId('trigger-btn')
    fireEvent.click(trigger)

    expect(screen.getByText('Clear Shopping Bag?')).toBeInTheDocument()
    expect(
      screen.getByText('Are you sure you want to remove all items from your bag?')
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Clear Bag' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Keep Items' })).toBeInTheDocument()
  })

  it('resolves true when confirm button is clicked', async () => {
    const handleResult = vi.fn()

    render(
      <ConfirmDialogProvider>
        <TestConsumer onResult={handleResult} />
      </ConfirmDialogProvider>
    )

    fireEvent.click(screen.getByTestId('trigger-btn'))
    const confirmBtn = screen.getByRole('button', { name: 'Clear Bag' })
    fireEvent.click(confirmBtn)

    await waitFor(() => {
      expect(handleResult).toHaveBeenCalledWith(true)
    })
    expect(screen.queryByText('Clear Shopping Bag?')).not.toBeInTheDocument()
  })

  it('resolves false when cancel button is clicked', async () => {
    const handleResult = vi.fn()

    render(
      <ConfirmDialogProvider>
        <TestConsumer onResult={handleResult} />
      </ConfirmDialogProvider>
    )

    fireEvent.click(screen.getByTestId('trigger-btn'))
    const cancelBtn = screen.getByRole('button', { name: 'Keep Items' })
    fireEvent.click(cancelBtn)

    await waitFor(() => {
      expect(handleResult).toHaveBeenCalledWith(false)
    })
    expect(screen.queryByText('Clear Shopping Bag?')).not.toBeInTheDocument()
  })

  it('resolves false when Escape key is pressed', async () => {
    const handleResult = vi.fn()

    render(
      <ConfirmDialogProvider>
        <TestConsumer onResult={handleResult} />
      </ConfirmDialogProvider>
    )

    fireEvent.click(screen.getByTestId('trigger-btn'))
    expect(screen.getByText('Clear Shopping Bag?')).toBeInTheDocument()

    fireEvent.keyDown(window, { key: 'Escape' })

    await waitFor(() => {
      expect(handleResult).toHaveBeenCalledWith(false)
    })
    expect(screen.queryByText('Clear Shopping Bag?')).not.toBeInTheDocument()
  })
})
