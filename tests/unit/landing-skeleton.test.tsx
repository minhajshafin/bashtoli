import React from 'react'
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { LandingPageSkeleton } from '@/components/storefront/skeletons'

describe('LandingPageSkeleton', () => {
  it('renders without throwing', () => {
    const { container } = render(<LandingPageSkeleton />)
    expect(container).toBeTruthy()
    expect(container.querySelector('[aria-label="Loading homepage"]')).toBeTruthy()
  })
})
