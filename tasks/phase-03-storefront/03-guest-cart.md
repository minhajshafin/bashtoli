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

- [ ] Adding item from PDP updates cart and header badge
- [ ] Cart persists after page reload
- [ ] User can change quantity and remove items on `/cart`
- [ ] Subtotal calculates correctly
- [ ] Deactivated product in cart shows "unavailable" label
- [ ] Checkout button disabled when cart has unavailable items
- [ ] Empty cart shows appropriate empty state

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

- [ ] Guest cart fully functional without login
- [ ] Cart state consistent across all storefront pages
- [ ] Unavailable item handling works
- [ ] Ready for checkout integration (Phase 4)
