# Task: Guest Order Lookup

**Phase:** 4 — Checkout + Emails  
**Week:** 6–7

## Goal

Allow guests to look up order status using order number and phone number without an account.

## Requirements

- Order lookup form on `/order/[orderNumber]` or dedicated lookup page
- Server Action validates: order_number + phone must match an existing order
- Display: order number, status, items, total, fulfillment type, date
- Do not expose full address or other PII beyond what customer provided
- Rate limiting recommended (optional for v1)

## Acceptance Criteria

- [ ] Guest enters order number + phone and sees order status
- [ ] Mismatched phone returns generic "not found" (no info leak)
- [ ] Valid lookup shows current order status and item summary
- [ ] Lookup works without authentication
- [ ] Invalid order number returns appropriate error

## Dependencies

- [01-cod-checkout.md](./01-cod-checkout.md)

## Files to Modify

| File | Action |
|---|---|
| `app/(storefront)/order/lookup/page.tsx` | Create |
| `app/(storefront)/order/[orderNumber]/page.tsx` | Update |
| `components/storefront/order-lookup-form.tsx` | Create |
| `components/storefront/order-status.tsx` | Create |
| `lib/actions/order-lookup.ts` | Create |
| `lib/validations/order-lookup.ts` | Create |

## Definition of Done

- [ ] Guest lookup tested with valid and invalid inputs
- [ ] No sensitive data leaked on failed lookup
- [ ] Order status reflects current DB state
