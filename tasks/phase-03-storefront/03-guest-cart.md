# Task: Guest Cart (localStorage)

**Phase:** 3 — Storefront Core  
**Week:** 5

## Goal

Implement guest shopping cart persisted in localStorage with cart page UI.

## Requirements

- Cart state managed in localStorage (variant_id, qty, product snapshot for display)
- Cart page at `/cart`
- Display: product name, variant info, unit price, quantity, line total
- Update quantity (+/− buttons) and remove items
- Show subtotal
- "Proceed to Checkout" button (links to checkout — implemented in Phase 4)
- Cart icon in header with item count badge
- Persist cart across page reloads and browser sessions
- Show "unavailable" for deactivated products; block checkout button

## Acceptance Criteria

- [x] Adding item from PDP updates cart and header badge
- [x] Cart persists after page reload
- [x] User can change quantity and remove items on `/cart`
- [x] Subtotal calculates correctly
- [x] Deactivated product in cart shows "unavailable" label
- [x] Checkout button disabled when cart has unavailable items
- [x] Empty cart shows appropriate empty state

## Dependencies

- [02-product-detail-page.md](./02-product-detail-page.md)

## Files to Modify

| File | Action |
|---|---|
| `app/(storefront)/cart/page.tsx` | Create |
| `components/storefront/cart-item.tsx` | Create |
| `components/storefront/cart-summary.tsx` | Create |
| `components/storefront/cart-icon.tsx` | Create |
| `lib/cart/guest-cart.ts` | Create |
| `lib/cart/cart-context.tsx` | Create |
| `app/(storefront)/layout.tsx` | Create/Update |

## Definition of Done

- [x] Guest cart fully functional without login
- [x] Cart state consistent across all storefront pages
- [x] Unavailable item handling works
- [x] Ready for checkout integration (Phase 4)
