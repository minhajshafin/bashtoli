# Task: COD Checkout Flow

**Phase:** 4 — Checkout + Emails  
**Week:** 6

## Goal

Implement Cash on Delivery checkout with stock validation, order creation, and inventory decrement.

## Requirements

- Checkout page at `/checkout` with form fields:
  - Name, phone, email (optional), address, notes, fulfillment_type (delivery | pickup)
- Zod validation on all fields via Server Action
- Server-side stock validation before order creation
- DB transaction: create order + order_items, decrement stock (`UPDATE ... WHERE stock_qty >= qty`)
- Reject checkout with clear message if insufficient stock
- Generate human-readable order number (`ORD-YYYYMMDD-NNNN`)
- Delivery fee placeholder (default 0; logic TBD per [Open Items](../docs/open-items.md))
- Redirect to order confirmation page on success
- Clear guest cart after successful order

## Acceptance Criteria

- [ ] Guest can complete checkout without an account
- [ ] Form validation rejects missing required fields
- [ ] Order rejected with message when stock insufficient
- [ ] Concurrent orders for last item: only one succeeds (transaction)
- [ ] Order number generated in correct format
- [ ] Stock decremented atomically on order creation
- [ ] Order confirmation page shows order details
- [ ] Guest cart cleared after successful checkout

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
| `lib/utils/order-number.ts` | Create |

## Definition of Done

- [ ] End-to-end guest checkout works
- [ ] Stock decrement verified in database
- [ ] Order number unique and human-readable
- [ ] Transaction rollback on failure tested
