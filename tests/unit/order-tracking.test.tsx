import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { OrderReferencePill } from '@/components/storefront/order-reference-pill'
import { OrderStatus } from '@/components/storefront/order-status'

describe('OrderReferencePill', () => {
  const writeTextMock = vi.fn().mockResolvedValue(undefined)

  beforeEach(() => {
    vi.clearAllMocks()
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    })
  })

  it('renders order number reference clearly', () => {
    render(<OrderReferencePill orderNumber="BSH-2026-9999" />)
    expect(screen.getByText('BSH-2026-9999')).toBeInTheDocument()
    expect(screen.getByText('Copy')).toBeInTheDocument()
  })

  it('copies reference to clipboard and shows feedback upon click', async () => {
    render(<OrderReferencePill orderNumber="BSH-2026-9999" />)
    const button = screen.getByRole('button', { name: /copy order reference/i })

    fireEvent.click(button)

    expect(writeTextMock).toHaveBeenCalledWith('BSH-2026-9999')
    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument()
    })
  })

  it('triggers copy on Enter keyboard press', async () => {
    render(<OrderReferencePill orderNumber="BSH-2026-9999" />)
    const button = screen.getByRole('button', { name: /copy order reference/i })

    fireEvent.keyDown(button, { key: 'Enter' })

    expect(writeTextMock).toHaveBeenCalledWith('BSH-2026-9999')
    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument()
    })
  })
})

describe('OrderStatus Component', () => {
  it('renders cancelled state alert when order is cancelled', () => {
    render(<OrderStatus status="cancelled" />)
    expect(screen.getByText('Order Cancelled')).toBeInTheDocument()
    expect(
      screen.getByText(/This order has been cancelled/i)
    ).toBeInTheDocument()
  })

  it('renders 4 delivery milestone steps for active order', () => {
    render(
      <OrderStatus
        status="pending"
        createdAt="2026-09-09T09:49:00.000Z"
      />
    )
    expect(screen.getByText('Order Placed')).toBeInTheDocument()
    expect(screen.getByText('Studio Packing')).toBeInTheDocument()
    expect(screen.getAllByText('In Transit').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Delivered').length).toBeGreaterThan(0)
    expect(screen.getByText('Current')).toBeInTheDocument()
  })

  it('correctly sets active step for shipped status', () => {
    render(<OrderStatus status="shipped" />)
    expect(screen.getByText('Current')).toBeInTheDocument()
  })
})
