# Task: Order History

**Phase:** 5 — Customer Accounts  
**Week:** 8

## Goal

Allow logged-in customers to view their past orders linked by `user_id`.

## Requirements

- Order history page at `/account/orders`
- List orders sorted by date (newest first)
- Each order shows: order number, date, status, total, item count
- Link to order detail view (reuse order status component)
- Account dashboard at `/account` with links to orders, addresses, wishlist
- Only show orders belonging to the logged-in user

## Acceptance Criteria

- [ ] Logged-in user sees list of their orders
- [ ] Guest orders (placed before signup) not shown unless linked
- [ ] Order detail shows items, status, and totals
- [ ] Empty state when user has no orders
- [ ] Unauthenticated access redirects to login

## Dependencies

- [01-signup-login.md](./01-signup-login.md)
- Phase 4 (orders exist from checkout)

## Files to Modify

| File | Action |
|---|---|
| `app/(storefront)/account/page.tsx` | Create |
| `app/(storefront)/account/orders/page.tsx` | Create |
| `app/(storefront)/account/layout.tsx` | Update |
| `components/storefront/order-history-list.tsx` | Create |
| `lib/queries/customer-orders.ts` | Create |

## Definition of Done

- [ ] Order history displays correctly for logged-in users
- [ ] RLS restricts to own orders only
- [ ] Account navigation complete (orders, addresses, wishlist)
