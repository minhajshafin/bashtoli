# Task: Order Status Workflow

**Phase:** 6 — Admin Ops  
**Week:** 9

## Goal

Implement order status transitions with automatic restocking on cancellation and status history logging.

## Requirements

- Status update UI on order detail page (admin/staff only)
- Allowed admin transitions per [PRD — Order Status Workflow](../docs/prd.md#8-order-status-workflow):
  ```
  pending → confirmed → shipped → out_for_delivery (optional) → delivered
     ↘              ↘
  cancelled       cancelled   (both restock items)
  ```
- **Admin can cancel** from: `pending`, `confirmed`, `shipped`, `out_for_delivery`
- **Customer self-cancel** is handled in Phase 5 Task 5-05 (pending + 24h window)
- On `cancelled`: restock all items in `order_items` (increment `variant.stock_qty`)
- Log all status changes to `order_status_history` (status, changed_by, changed_at)
- Prevent invalid transitions (e.g. `delivered → pending`)
- **Status-change emails:** on transition to `confirmed`, `shipped`, or `delivered`, send customer notification email via Resend (when customer email is on file in `guest_email` or linked account)
- Zod validation on status update server action

## Acceptance Criteria

- [ ] Admin can move order from pending → confirmed → shipped → delivered
- [ ] Admin can cancel from pending, confirmed, shipped, or out_for_delivery
- [ ] Optional out_for_delivery step available
- [ ] Cancelling order restocks all variant quantities
- [ ] Status history recorded with user and timestamp
- [ ] Invalid status transitions rejected with clear error
- [ ] Guest order lookup reflects updated status
- [ ] Customer email sent on confirmed, shipped, and delivered transitions (when email on file)
- [ ] Email failure does not block status update; error logged to Sentry

## Dependencies

- [01-order-management.md](./01-order-management.md)

## Files to Modify

| File | Action |
|---|---|
| `app/admin/orders/[id]/page.tsx` | Update |
| `components/admin/order-status-select.tsx` | Create |
| `components/admin/order-status-history.tsx` | Create |
| `lib/actions/order-status.ts` | Create (includes email trigger on status change) |
| `lib/validations/order-status.ts` | Create |
| `lib/email/templates/order-status-update.tsx` | Create |

## Definition of Done

- [ ] All valid transitions tested (including pending → cancelled)
- [ ] Cancellation restock verified in database
- [ ] Status history accurate for all transitions
- [ ] Invalid transitions blocked
- [ ] Status-change emails verified in Resend test mode
