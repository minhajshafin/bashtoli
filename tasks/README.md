# Tasks

Implementation tasks organized by project phase. Each task file follows a standard format:

- **Goal** — What this task achieves
- **Requirements** — What must be built
- **Acceptance Criteria** — How to verify completion
- **Dependencies** — Prior tasks or external decisions needed
- **Files to Modify** — Planned files (updated as implementation progresses)
- **Definition of Done** — Checklist for task completion

## Phase Overview

| Phase | Weeks | Directory | Tasks | Status |
|---|---|---|---|---|
| 1. Setup & Schema | 1–2 | [phase-01-setup/](./phase-01-setup/) | 8 | Not started |
| 2. Admin MVP + Catalog | 2–3 | [phase-02-admin-mvp/](./phase-02-admin-mvp/) | 5 | Not started |
| 3. Storefront Core | 4–5 | [phase-03-storefront/](./phase-03-storefront/) | 3 | Not started |
| 4. Checkout + Emails | 6–7 | [phase-04-checkout/](./phase-04-checkout/) | 4 | Not started |
| 5. Customer Accounts | 8 | [phase-05-accounts/](./phase-05-accounts/) | 6 | Not started |
| 6. Admin Ops | 9 | [phase-06-admin-ops/](./phase-06-admin-ops/) | 4 | Not started |
| 7. Polish & Content | 10–11 | [phase-07-polish/](./phase-07-polish/) | 5 | Not started |
| 8. QA & Launch | 12 | [phase-08-launch/](./phase-08-launch/) | 4 | Not started |

## Dependency Flow

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7 → Phase 8
          Admin MVP   Storefront  Checkout   Accounts   Admin Ops   Polish    Launch
```

Guest checkout is proven before account features. Real product data is available before storefront development.

## Related Documentation

- [PRD](../docs/prd.md)
- [Architecture](../docs/architecture.md)
- [Database](../docs/database.md)
- [Open Items](../docs/open-items.md)
