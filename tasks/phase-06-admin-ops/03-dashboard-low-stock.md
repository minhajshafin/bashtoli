# Task: Dashboard Home & Low-Stock Alerts

**Phase:** 6 — Admin Ops  
**Week:** 9

## Goal

Build the admin dashboard home page with key metrics and low-stock indicators.

## Requirements

- Dashboard home at `/admin` (replace placeholder)
- Display:
  - Today's order count
  - Pending order count
  - Low-stock product count (configurable threshold, default: stock_qty ≤ 5)
- Low-stock list: product name, variant, current stock
- Quick links to pending orders and low-stock products
- Auto-decrement stock on order placement already handled in Phase 4; verify integration

## Acceptance Criteria

- [ ] Dashboard shows accurate today's order count
- [ ] Pending orders count matches filter on orders page
- [ ] Low-stock count reflects variants at or below threshold
- [ ] Low-stock list links to product edit page
- [ ] Metrics update in real-time on page refresh
- [ ] Dashboard accessible to staff and admin

## Dependencies

- [01-order-management.md](./01-order-management.md)
- [02-order-status-workflow.md](./02-order-status-workflow.md)

## Files to Modify

| File | Action |
|---|---|
| `app/admin/page.tsx` | Update |
| `components/admin/dashboard-stats.tsx` | Create |
| `components/admin/low-stock-list.tsx` | Create |
| `lib/queries/dashboard.ts` | Create |

## Definition of Done

- [ ] Dashboard metrics accurate with test data
- [ ] Low-stock threshold configurable
- [ ] Quick links functional
