import React from 'react'

/**
 * Account Overview Skeleton (/account).
 * Renders inside AccountLayoutWrapper's main content area (lg:col-span-8).
 * Exactly matches AccountPage: title, 2-column quick links grid, and recent orders.
 */
export function AccountOverviewSkeleton() {
  return (
    <div
      className="space-y-6 sm:space-y-8 animate-delayed-fade-in"
      aria-busy="true"
      aria-label="Loading account overview"
    >
      {/* Masthead Header */}
      <div className="border-b border-forest-800 pb-4 sm:pb-5">
        <div className="h-7 sm:h-8 w-48 sm:w-60 rounded-xl skeleton-shimmer-dark" />
      </div>

      {/* Quick Links Grid (2 columns on all viewports) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 sm:h-32 rounded-2xl border border-forest-800/80 bg-forest-900/90 p-4 sm:p-5 flex flex-col justify-between shadow-xs"
          >
            <div className="flex items-start justify-between">
              <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl skeleton-shimmer-dark shrink-0" />
              <div className="h-4 w-4 rounded-md skeleton-shimmer-dark opacity-40" />
            </div>
            <div className="space-y-1.5 mt-2">
              <div className="h-3.5 w-24 sm:w-28 rounded-md skeleton-shimmer-dark" />
              <div className="h-2.5 w-16 sm:w-20 rounded-md skeleton-shimmer-dark opacity-60" />
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders Section */}
      <div className="space-y-3 sm:space-y-4 pt-2">
        <div className="flex items-center justify-between pb-1">
          <div className="h-5 w-32 rounded-md skeleton-shimmer-dark" />
          <div className="h-4 w-20 rounded-md skeleton-shimmer-dark opacity-50" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-2xl border border-forest-800/80 bg-forest-900/90 p-4 sm:p-5 flex items-center justify-between shadow-xs"
            >
              <div className="space-y-1.5">
                <div className="h-4 w-28 rounded-md skeleton-shimmer-dark" />
                <div className="h-3 w-36 rounded-md skeleton-shimmer-dark opacity-60" />
              </div>
              <div className="h-9 w-24 rounded-xl skeleton-shimmer-dark" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Order History Skeleton (/account/orders).
 * Renders inside AccountLayoutWrapper's main content area.
 * Exactly matches OrderHistoryPage: back link, title, and order history cards.
 */
export function AccountOrdersSkeleton() {
  return (
    <div
      className="space-y-6 animate-delayed-fade-in"
      aria-busy="true"
      aria-label="Loading order history"
    >
      {/* Top Utility Navigation */}
      <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-forest-800">
        <div className="h-4 w-32 rounded-md skeleton-shimmer-dark" />
      </div>

      {/* Masthead Header */}
      <div className="border-b border-forest-800 pb-5">
        <div className="h-7 sm:h-8 w-44 sm:w-56 rounded-xl skeleton-shimmer-dark" />
      </div>

      {/* Order Cards List */}
      <div className="space-y-3.5 sm:space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-forest-800/80 bg-forest-900/90 p-4 sm:p-5 sm:p-6 shadow-xs space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-forest-800/60">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-28 rounded-md skeleton-shimmer-dark" />
                  <div className="h-5 w-20 rounded-full skeleton-shimmer-dark" />
                </div>
                <div className="h-3 w-36 rounded-md skeleton-shimmer-dark opacity-60" />
              </div>
              <div className="h-5 w-20 rounded-md skeleton-shimmer-dark self-start sm:self-auto" />
            </div>
            <div className="flex items-center justify-between pt-1">
              <div className="h-3.5 w-32 rounded-md skeleton-shimmer-dark opacity-60" />
              <div className="h-8 w-24 rounded-xl skeleton-shimmer-dark" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Profile Settings Skeleton (/account/profile).
 * Renders inside AccountLayoutWrapper's main content area.
 * Exactly matches ProfilePage: back link, title, and profile form cards.
 */
export function AccountProfileSkeleton() {
  return (
    <div
      className="space-y-6 animate-delayed-fade-in"
      aria-busy="true"
      aria-label="Loading profile settings"
    >
      {/* Top Utility Navigation Row */}
      <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-forest-800">
        <div className="h-4 w-32 rounded-md skeleton-shimmer-dark" />
      </div>

      {/* Masthead Header */}
      <div className="border-b border-forest-800 pb-5">
        <div className="h-7 sm:h-8 w-48 sm:w-60 rounded-xl skeleton-shimmer-dark" />
      </div>

      {/* Form Card 1: Personal Info */}
      <div className="p-5 sm:p-7 rounded-2xl border border-forest-800/80 bg-forest-900/90 shadow-xs space-y-5">
        <div className="pb-3 border-b border-forest-800/70">
          <div className="h-4 w-40 rounded-md skeleton-shimmer-dark" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <div className="h-3 w-20 rounded-md skeleton-shimmer-dark opacity-70" />
            <div className="h-11 w-full rounded-xl skeleton-shimmer-dark" />
          </div>
          <div className="space-y-1.5">
            <div className="h-3 w-24 rounded-md skeleton-shimmer-dark opacity-70" />
            <div className="h-11 w-full rounded-xl skeleton-shimmer-dark" />
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="h-3 w-28 rounded-md skeleton-shimmer-dark opacity-70" />
          <div className="h-18 w-full rounded-xl skeleton-shimmer-dark" />
        </div>
        <div className="h-10 w-36 rounded-xl skeleton-shimmer-dark" />
      </div>

      {/* Form Card 2: Password Security */}
      <div className="p-5 sm:p-7 rounded-2xl border border-forest-800/80 bg-forest-900/90 shadow-xs space-y-5">
        <div className="pb-3 border-b border-forest-800/70">
          <div className="h-4 w-36 rounded-md skeleton-shimmer-dark" />
        </div>
        <div className="space-y-3 max-w-md">
          <div className="h-11 w-full rounded-xl skeleton-shimmer-dark" />
          <div className="h-11 w-full rounded-xl skeleton-shimmer-dark" />
          <div className="h-10 w-36 rounded-xl skeleton-shimmer-dark" />
        </div>
      </div>
    </div>
  )
}

/**
 * Saved Addresses Skeleton (/account/addresses).
 * Renders inside AccountLayoutWrapper's main content area.
 * Exactly matches AddressesPage: back link, header with Add button, and address cards.
 */
export function AccountAddressesSkeleton() {
  return (
    <div
      className="space-y-6 animate-delayed-fade-in"
      aria-busy="true"
      aria-label="Loading saved addresses"
    >
      {/* Top Utility Navigation */}
      <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-forest-800">
        <div className="h-4 w-32 rounded-md skeleton-shimmer-dark" />
      </div>

      {/* Header card with Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-forest-800 pb-5">
        <div className="h-7 sm:h-8 w-44 sm:w-56 rounded-xl skeleton-shimmer-dark" />
        <div className="h-11 sm:h-10 w-full sm:w-40 rounded-xl skeleton-shimmer-dark" />
      </div>

      {/* Address Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl border border-forest-800/80 bg-forest-900/90 shadow-xs space-y-3.5 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-4 w-28 rounded-md skeleton-shimmer-dark" />
                <div className="h-4 w-16 rounded-full skeleton-shimmer-dark" />
              </div>
              <div className="h-3.5 w-4/5 rounded-md skeleton-shimmer-dark opacity-70" />
              <div className="h-3 w-32 rounded-md skeleton-shimmer-dark opacity-60" />
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-forest-800/60">
              <div className="h-8 w-16 rounded-lg skeleton-shimmer-dark" />
              <div className="h-8 w-16 rounded-lg skeleton-shimmer-dark opacity-60" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Customer Wishlist Skeleton (/account/wishlist).
 * Renders inside AccountLayoutWrapper's main content area.
 * Exactly matches WishlistPage: back link, header with counter and Move All button, and wishlist item cards.
 */
export function AccountWishlistSkeleton() {
  return (
    <div
      className="w-full space-y-6 animate-delayed-fade-in"
      aria-busy="true"
      aria-label="Loading wishlist"
    >
      {/* Top Utility Navigation Row */}
      <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-forest-800">
        <div className="h-4 w-28 rounded-md skeleton-shimmer-dark" />
      </div>

      {/* Masthead Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-forest-800">
        <div className="flex items-center gap-3">
          <div className="h-7 sm:h-8 lg:h-9 w-40 sm:w-52 rounded-xl skeleton-shimmer-dark" />
          <div className="h-5 w-16 rounded-full skeleton-shimmer-dark opacity-80" />
        </div>
        <div className="h-10 w-36 rounded-xl skeleton-shimmer-dark" />
      </div>

      {/* Wishlist Items List (Matching WishlistItem card layout) */}
      <div className="space-y-3 sm:space-y-3.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl border border-forest-800/80 bg-forest-900/90 shadow-xs"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              {/* Thumbnail */}
              <div className="h-16 w-16 sm:h-18 sm:w-18 rounded-xl skeleton-shimmer-dark shrink-0" />
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="h-2.5 w-16 rounded-md skeleton-shimmer-dark opacity-60" />
                <div className="h-4 w-44 rounded-md skeleton-shimmer-dark" />
                <div className="h-3.5 w-20 rounded-md skeleton-shimmer-dark" />
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <div className="h-9 w-28 rounded-xl skeleton-shimmer-dark" />
              <div className="h-9 w-9 rounded-xl skeleton-shimmer-dark opacity-60" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Backward compatibility alias for AccountOverviewSkeleton.
 */
export const AccountPageSkeleton = AccountOverviewSkeleton
