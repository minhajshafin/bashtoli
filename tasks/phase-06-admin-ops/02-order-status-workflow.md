# Task: Order Status Workflow

**Phase:** 6 — Admin Ops  
**Week:** 9

## Goal

Implement order status transitions with automatic restocking on cancellation and status history logging.

## Requirements

- Status update UI on order detail page
- Allowed transitions per [PRD — Order Status Workflow](../docs/prd.md#8-order-status-workflow):
  ```
  pending → confirmed → shipped → out_for_delivery (optional) → delivered
                  ↘ cancelled (restocks items)
  ```
- On `cancelled`: restock all items in `order_items` (increment variant stock_qty)
- Log status changes to `order_status_history` (status, changed_by, changed_at)
- Prevent invalid transitions (e.g. delivered → pending)
- Zod validation on status update server action

## Acceptance Criteria

- [ ] Admin can move order from pending → confirmed → shipped → delivered
- [ ] Optional out_for_delivery step available
- [ ] Cancelling order restocks all variant quantities
- [ ] Status history recorded with user and timestamp
- [ ] Invalid status transitions rejected with error
- [ ] Guest order lookup reflects updated status

## Dependencies

- [01-order-management.md](./01-order-management.md)

## Files to Modify

| File | Action |
|---|---|
| `app/admin/orders/[id]/page.tsx` | Update |
| `components/admin/order-status-select.tsx` | Create |
| `components/admin/order-status-history.tsx` | Create |
| `lib/actions/order-status.ts` | Create |
| `lib/validations/order-status.ts` | Create |

## Definition of Done

- [ ] All valid transitions tested
- [ ] Cancellation restock verified in database
- [ ] Status history accurate
- [ ] Invalid transitions blocked
