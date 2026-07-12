# Task: Wishlist

**Phase:** 5 — Customer Accounts  
**Week:** 8

## Goal

Implement account-only wishlist (save for later) functionality.

## Requirements

- Wishlist page at `/account/wishlist`
- "Add to Wishlist" button on PDP (visible only when logged in)
- Remove from wishlist action
- Wishlist displays product card with link to PDP
- UNIQUE constraint enforced (`user_id`, `product_id`)
- Not accessible to guests (button hidden, route protected)

## Acceptance Criteria

- [x] Logged-in user can add product to wishlist from PDP
- [x] Wishlist page shows saved products with images and prices
- [x] User can remove items from wishlist
- [x] Duplicate add handled gracefully (no error)
- [x] Guest users do not see wishlist button
- [x] `/account/wishlist` redirects to login for unauthenticated users

## Dependencies

- [01-signup-login.md](./01-signup-login.md)
- [02-product-detail-page.md](../phase-03-storefront/02-product-detail-page.md)

## Files to Modify

| File | Action |
|---|---|
| `app/(storefront)/account/wishlist/page.tsx` | Create |
| `components/storefront/wishlist-button.tsx` | Create |
| `components/storefront/wishlist-item.tsx` | Create |
| `lib/actions/wishlist.ts` | Create |

## Definition of Done

- [x] Wishlist add/remove tested
- [x] Account-only access enforced
- [x] UNIQUE constraint prevents duplicates
