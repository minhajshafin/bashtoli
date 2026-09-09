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
| 1. Setup & Schema | 1–2 | [phase-01-setup/](./phase-01-setup/) | 8 | Completed |
| 2. Admin MVP + Catalog | 2–3 | [phase-02-admin-mvp/](./phase-02-admin-mvp/) | 5 | Completed |
| 3. Storefront Core | 4–5 | [phase-03-storefront/](./phase-03-storefront/) | 3 | Completed |
| 4. Checkout + Emails | 6–7 | [phase-04-checkout/](./phase-04-checkout/) | 4 | Completed |
| 5. Customer Accounts | 8 | [phase-05-accounts/](./phase-05-accounts/) | 6 | Completed |
| 6. Admin Ops | 9 | [phase-06-admin-ops/](./phase-06-admin-ops/) | 4 | Completed |
| 7. Polish & Content | 10–11 | [phase-07-polish/](./phase-07-polish/) | 5 | Completed |
| 8. QA & Launch | 12 | [phase-08-launch/](./phase-08-launch/) | 4 | Ready for Execution |

## Dependency Flow

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7 → Phase 8
          Admin MVP   Storefront  Checkout   Accounts   Admin Ops   Polish    Launch
```

Guest checkout is proven before account features. Real product data is available before storefront development.

## Phase 8: QA & Launch Details

Phase 8 was modernized to incorporate all post-Phase 7 custom features, consolidated database migrations (001–006), security hardenings, Upstash Redis rate limiters, and admin operations.

| Task | Title | Scope |
|---|---|---|
| [01-expand-e2e-tests.md](./phase-08-launch/01-expand-e2e-tests.md) | Full-Suite E2E Playwright Tests | Guest checkout, admin order fulfillment/status transitions, guest order claiming via RPC, wishlist persistence, storefront hero and 7-slot category collage managers, and customer suggestions with honeypot bot defense |
| [02-observability-and-hardening.md](./phase-08-launch/02-observability-and-hardening.md) | Observability, Rate Limiting & Hardening | Zero-dependency observability with `@vercel/analytics`, Upstash Redis rate limit verification (`rl:auth`, `rl:order`, `rl:checkout`), Vercel runtime logging, and security headers |
| [03-production-deployment.md](./phase-08-launch/03-production-deployment.md) | Production Deployment Runbook | Sequential application of 6 consolidated Supabase migrations, storage bucket configuration, `app_private` role security, Upstash cluster, Resend custom domain, and staging smoke test sequence |
| [04-owner-handoff.md](./phase-08-launch/04-owner-handoff.md) | Owner Handoff, Admin Guide & Incident Runbook | Delivery of `docs/admin-guide.md` covering catalog/variants/images, order fulfillment lifecycle, storefront hero/collage management, staff permissions, and incident runbook (restock recovery, cancellations, rate limit unblocking) |

## Related Documentation

- [PRD](../docs/prd.md)
- [Architecture](../docs/architecture.md)
- [Database](../docs/database.md)
- [Open Items](../docs/open-items.md)
