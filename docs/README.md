# Bashtoli — Documentation

E-commerce platform for a local business selling handcrafted items, mugs, hats, and similar products. Customer-facing storefront plus owner/staff inventory and order management.

## Document Index

| Document | Description |
|---|---|
| [PRD](./prd.md) | Product requirements, scope, and functional specs |
| [Architecture](./architecture.md) | System design, routes, auth flow, and integrations |
| [Database](./database.md) | Schema, indexes, RLS policies, and inventory rules |
| [Tech Stack](./tech-stack.md) | Technologies, libraries, and hosting |
| [Testing](./testing.md) | E2E, environments, and observability |
| [Deployment](./deployment.md) | Environments, Vercel setup, and launch checklist |
| [Open Items](./open-items.md) | Decisions pending confirmation with the owner |

## Project Status

**Current state:** Planning complete; implementation not started.

**Timeline:** 12 weeks (3 months)

**Phase dependency flow:**

```
Admin MVP → Storefront → Checkout → Accounts → Admin Ops → Polish → Launch
```

See [tasks/](../tasks/README.md) for phase-by-phase implementation tasks.
