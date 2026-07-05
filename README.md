# Bashtoli

E-commerce platform for a local business selling handcrafted items, mugs, hats, and similar products. Customer-facing storefront plus owner/staff inventory and order management.

**Status:** Phase 1 (Setup & Schema) in progress. Next.js project initialized.

## Quick Links

- [Documentation](./docs/README.md) — PRD, architecture, database schema, tech stack, and more
- [Tasks](./tasks/README.md) — Phase-by-phase implementation tasks

## Tech Stack

Next.js (App Router) · Supabase (Postgres + Auth + Storage) · Tailwind CSS · Resend · Vercel

## Getting Started

Implementation begins with [Phase 1: Setup & Schema](./tasks/phase-01-setup/01-init-nextjs.md).

Once the Next.js project is initialized:

```bash
cp .env.local.example .env.local
# Fill in Supabase and Resend credentials
npm install
npm run dev
```

## Project Timeline

12 weeks across 8 phases: Setup → Admin MVP → Storefront → Checkout → Accounts → Admin Ops → Polish → Launch.

See [docs/prd.md](./docs/prd.md) for full requirements and [tasks/README.md](./tasks/README.md) for the task breakdown.
