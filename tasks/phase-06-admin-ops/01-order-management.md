# Task: Order Management

**Phase:** 6 — Admin Ops  
**Week:** 9

## Goal

Build admin order list and detail views for staff and admin to manage incoming orders.

## Requirements

- Order list page at `/admin/orders`
- Filter by status (pending, confirmed, shipped, delivered, cancelled)
- Search by order number, customer name, or phone number
- Sort by date (newest first)
- Order detail page at `/admin/orders/[id]`
- Display: order number, customer info, items, totals, fulfillment type, delivery zone, delivery fee, status, timestamps
- Link order to customer profile if `user_id` present
- No bulk actions for v1

## Acceptance Criteria

- [ ] Admin/staff sees all orders in list view
- [ ] Status filter works correctly
- [ ] Search by order number, customer name, or phone returns correct results
- [ ] Order detail shows complete order information including delivery zone and fee
- [ ] Guest orders (no user_id) display customer_name and phone
- [ ] Order items show product name snapshot and price_at_purchase
- [ ] Customer role cannot access order admin pages

## Dependencies

- Phase 4 complete (orders exist from checkout)
- [01-admin-auth-middleware.md](../phase-02-admin-mvp/01-admin-auth-middleware.md)

## Files to Modify

| File | Action |
|---|---|
| `app/admin/orders/page.tsx` | Create |
| `app/admin/orders/[id]/page.tsx` | Create |
| `components/admin/order-list.tsx` | Create |
| `components/admin/order-detail.tsx` | Create |
| `lib/queries/orders.ts` | Create |

## Definition of Done

- [ ] Order list and detail pages functional
- [ ] Filters and sorting work
- [ ] Staff and admin access verified; customer blocked
