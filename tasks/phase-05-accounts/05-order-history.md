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
- Only show orders belonging to the logged-in user (`user_id` match)
- **Guest order linking:** after sign-up, query `orders` where `phone` matches profile phone OR `guest_email` matches account email AND `user_id IS NULL`; prompt user to claim matching orders; on confirmation, set `orders.user_id` to the new profile ID
- **Customer self-cancel:** on order detail view, show Cancel button if `status = 'pending'` AND `created_at > NOW() - INTERVAL '24 hours'`; triggers restock

## Acceptance Criteria

- [x] Logged-in user sees list of their orders
- [x] After signup, user is prompted to claim matching guest orders (phone/email match)
- [x] Claimed guest orders appear in order history
- [x] Order detail shows items, status, totals, and delivery zone/fee
- [x] Customer can cancel pending orders within 24 hours; Cancel button hidden after window
- [x] Cancellation restocks items and redirects with confirmation
- [x] Empty state when user has no orders
- [x] Unauthenticated access redirects to login

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
| `lib/actions/claim-guest-orders.ts` | Create |
| `lib/actions/customer-cancel-order.ts` | Create |

## Definition of Done

- [x] Order history displays correctly for logged-in users
- [x] RLS restricts to own orders only
- [x] Account navigation complete (orders, addresses, wishlist)
