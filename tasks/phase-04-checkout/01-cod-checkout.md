# Task: COD Checkout Flow

**Phase:** 4 — Checkout + Emails  
**Week:** 6

## Goal

Implement Cash on Delivery checkout with stock validation, order creation, and inventory decrement.

## Requirements

- Checkout page at `/checkout` with form fields:
  - Name, phone, email (optional), address, notes
  - `fulfillment_type`: delivery or pickup
  - `delivery_zone` (shown only when delivery selected): Inside Dhaka (৳70) / Outside Dhaka (৳120)
- Delivery fee calculated from `lib/config/delivery.ts` constants based on selected zone; 0 for pickup
- Zod validation on all fields via Server Action
- Server-side stock validation before order creation
- DB transaction: create order + order_items, decrement stock (`UPDATE ... WHERE stock_qty >= qty`)
- Reject checkout with clear message if insufficient stock
- Order number via Postgres function with daily sequential counter reset (e.g., `generate_order_number()` SQL function)
- Rate limiting: max 5 checkout attempts per IP per minute (implement via middleware or Vercel Edge)
- Redirect to order confirmation page on success
- Clear guest cart after successful order

## Acceptance Criteria

- [x] Guest can complete checkout without an account
- [x] Delivery zone selector shown for delivery; hidden for pickup
- [x] Correct delivery fee applied based on zone (70 / 120 / 0)
- [x] Form validation rejects missing required fields
- [x] Order rejected with message when stock insufficient
- [x] Concurrent orders for last item: only one succeeds (transaction)
- [x] Order number generated in correct format (`ORD-YYYYMMDD-NNNN`)
- [x] Stock decremented atomically on order creation
- [x] Order confirmation page shows order details and delivery fee
- [x] Guest cart cleared after successful checkout

## Dependencies

- [03-guest-cart.md](../phase-03-storefront/03-guest-cart.md)
- Phase 1 database schema (orders, order_items tables)

## Files to Modify

| File | Action |
|---|---|
| `app/(storefront)/checkout/page.tsx` | Create |
| `app/(storefront)/order/[orderNumber]/page.tsx` | Create |
| `components/storefront/checkout-form.tsx` | Create |
| `lib/validations/checkout.ts` | Create |
| `lib/actions/checkout.ts` | Create |
| `lib/utils/order-number.ts` | Create (wraps Postgres `generate_order_number()` function) |
| `lib/config/delivery.ts` | Reference (created in Phase 1) |
| `components/storefront/delivery-zone-select.tsx` | Create |

## Definition of Done

- [x] End-to-end guest checkout works
- [x] Stock decrement verified in database
- [x] Order number unique and human-readable
- [x] Transaction rollback on failure tested
