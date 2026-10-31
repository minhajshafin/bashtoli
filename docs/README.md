# Bashtoli — Documentation

E-commerce platform for an artisanal Bangladeshi brand selling handcrafted bamboo goods, mugs, wearables, and home decor. Full-featured customer storefront with Cash-on-Delivery (COD) checkout, customer accounts, and an administrative dashboard for order fulfillment, inventory tracking, and dynamic visual merchandising.

> [!NOTE]
> **Documentation Lifecycle**:
> The `docs/` directory is the permanent, standalone technical and operational documentation repository for this project.

---

## Document Index

| Document | Description | Audience |
|---|---|---|
| [Project Handover](./handover.md) | Comprehensive platform handover, credentials matrix, workflows, and operations sign-off | Store Owner & Stakeholders |
| [Admin Guide](./admin-guide.md) | Store owner operations manual, visual CMS controls, staff access, and incident runbook | Owner & Operational Staff |
| [PRD](./prd.md) | Product requirements, scope, fulfillment rules, and functional specifications | Product & Engineering |
| [Architecture](./architecture.md) | System design, route protection, auth flows, Upstash Redis rate limiting, and integrations | Engineering |
| [Database](./database.md) | PostgreSQL schema, 6 consolidated migrations, RLS policies, and atomic RPCs | Engineering & DBA |
| [Tech Stack](./tech-stack.md) | Frameworks, libraries, pinned dependencies, and environment variable matrix | Engineering & DevOps |
| [Testing](./testing.md) | Playwright E2E suites, Vitest unit testing, and test automation runbooks | QA & Engineering |
| [Deployment](./deployment.md) | Vercel production hosting, Supabase provisioning, Upstash Redis, and pre-launch checklist | DevOps & Release |
| [Open Items](./open-items.md) | Decision log, resolved technical architecture, and deferred v1.1 features | Stakeholders |

---

## Project Status

- **Current State:** **Phase 8 — QA, Hardening & Launch Completed (Final Handover)**
- **Build Status:** All 8 project phases complete; comprehensive Playwright E2E suite passing (8/8 journeys); 108 unit tests passing across 15 suites; 0 ESLint errors; strict TypeScript passing; production build validated (54/54 routes with PPR).
- **Core Milestones Delivered:**
  1. **Phase 1 (Setup & Schema)**: Consolidated 6 baseline database migrations, RLS security, and admin bootstrap.
  2. **Phase 2 (Admin MVP)**: Product/category/variant CRUD, multi-image upload, and draft toggle.
  3. **Phase 3 (Storefront Core)**: Category navigation, responsive product grid, PDP image gallery, variant selectors, and guest cart.
  4. **Phase 4 (Checkout & Emails)**: Cash on Delivery checkout, automated order number generation (`ORD-YYYYMMDD-NNNN`), delivery fees (৳70 Inside Dhaka / ৳120 Outside Dhaka), and Resend transactional notifications.
  5. **Phase 5 (Customer Accounts)**: Supabase Auth, saved shipping addresses, persistent wishlist, cart merging on login, and guest order claiming via atomic RPC.
  6. **Phase 6 (Admin Operations)**: Order fulfillment state machine (`pending` → `delivered`), inventory auto-restock on cancellation, staff role permissions, and immutable audit logging.
  7. **Phase 7 (Storefront Merchandising & Polish)**: Dynamic hero carousel manager, 7-slot category collage grid, customer item suggestions with honeypot bot defense, and responsive design.
  8. **Phase 8 (Pre-Launch & Hardening)**: Playwright regression coverage, Upstash Redis rate limiting (`rl:auth`, `rl:order`, `rl:checkout`), Vercel analytics, migration consolidation, and owner handoff.
