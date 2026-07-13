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

- [x] Dashboard shows accurate today's order count
- [x] Pending orders count matches filter on orders page
- [x] Low-stock count reflects variants at or below threshold
- [x] Low-stock list links to product edit page
- [x] Metrics update in real-time on page refresh
- [x] Dashboard accessible to staff and admin

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

- [x] Dashboard metrics accurate with test data
- [x] Low-stock threshold configurable
- [x] Quick links functional
