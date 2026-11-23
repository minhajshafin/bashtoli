import React from 'react'
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import {
  AccountOverviewSkeleton,
  AccountOrdersSkeleton,
  AccountProfileSkeleton,
  AccountAddressesSkeleton,
  AccountWishlistSkeleton,
  AccountPageSkeleton,
} from '@/components/storefront/skeletons'

describe('Account Skeletons', () => {
  it('AccountOverviewSkeleton renders with aria-busy and label', () => {
    const { container } = render(<AccountOverviewSkeleton />)
    expect(container.querySelector('[aria-label="Loading account overview"]')).toBeTruthy()
    expect(container.querySelector('[aria-busy="true"]')).toBeTruthy()
  })

  it('AccountOrdersSkeleton renders with aria-busy and label', () => {
    const { container } = render(<AccountOrdersSkeleton />)
    expect(container.querySelector('[aria-label="Loading order history"]')).toBeTruthy()
    expect(container.querySelector('[aria-busy="true"]')).toBeTruthy()
  })

  it('AccountProfileSkeleton renders with aria-busy and label', () => {
    const { container } = render(<AccountProfileSkeleton />)
    expect(container.querySelector('[aria-label="Loading profile settings"]')).toBeTruthy()
    expect(container.querySelector('[aria-busy="true"]')).toBeTruthy()
  })

  it('AccountAddressesSkeleton renders with aria-busy and label', () => {
    const { container } = render(<AccountAddressesSkeleton />)
    expect(container.querySelector('[aria-label="Loading saved addresses"]')).toBeTruthy()
    expect(container.querySelector('[aria-busy="true"]')).toBeTruthy()
  })

  it('AccountWishlistSkeleton renders with aria-busy and label', () => {
    const { container } = render(<AccountWishlistSkeleton />)
    expect(container.querySelector('[aria-label="Loading wishlist"]')).toBeTruthy()
    expect(container.querySelector('[aria-busy="true"]')).toBeTruthy()
  })

  it('AccountPageSkeleton aliases to AccountOverviewSkeleton', () => {
    const { container } = render(<AccountPageSkeleton />)
    expect(container.querySelector('[aria-label="Loading account overview"]')).toBeTruthy()
  })
})
