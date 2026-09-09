# Bashtoli (বাঁশতলী)

Modern e-commerce platform for handcrafted bamboo products, artisanal mugs, wearables, and sustainable home decor. Built with Next.js 16 (App Router), Supabase (PostgreSQL, Auth & Storage), Upstash Redis (Edge Rate Limiting), and Tailwind CSS.

---

## Features

- **Storefront**: Responsive catalog browsing, dynamic hero carousel, curated 7-slot category collage, product detail gallery, and multi-variant SKU selection.
- **Cart & Checkout**: Persistent guest bag, authenticated cart merging, and Cash on Delivery (COD) checkout with zone-based delivery fee computation (৳70 Inside Dhaka / ৳120 Outside Dhaka).
- **Customer Accounts**: Supabase authentication, saved shipping addresses, persistent cross-device wishlist, order history, and guest order claiming via atomic RPC.
- **Admin Dashboard (`/admin`)**: Order fulfillment workflow (`pending` → `delivered`), automatic stock restitution on cancellation, catalog and variant inventory management, dynamic storefront visual merchandising, and staff access control with immutable audit logs.
- **Security & Reliability**: Server-authoritative checkout totals, atomic inventory reservation, distributed rate limiting with fail-open fallback, honeypot bot defense, and non-circular Row-Level Security (RLS) policies.

---

## Documentation

For setup instructions, technical architecture, database schemas, and operational runbooks, please refer to the documentation in [`docs/`](./docs):

| Document | Purpose |
|---|---|
| **[Documentation Index](./docs/README.md)** | Overview of all documentation and current project status |
| **[Store Owner Guide & Runbook](./docs/admin-guide.md)** | Step-by-step operations manual for staff, visual CMS controls, and incident runbooks |
| **[Setup & Deployment Guide](./docs/deployment.md)** | Local environment setup, Supabase configuration, Upstash Redis, and Vercel production deployment |
| **[Product Requirements (PRD)](./docs/prd.md)** | Product vision, functional requirements, and fulfillment specifications |
| **[System Architecture](./docs/architecture.md)** | System design, route structure, authentication flows, rate limiting, and component layers |
| **[Database Schema & Migrations](./docs/database.md)** | Consolidated 6-file migration structure, master script, table relationships, and RLS policies |
| **[Tech Stack & Environment](./docs/tech-stack.md)** | Pinned dependency matrix, security guardrails, and environment variable references |
| **[Testing & QA](./docs/testing.md)** | Vitest unit test suite and Playwright end-to-end regression testing runbook |
| **[Decision Log](./docs/open-items.md)** | Record of resolved architectural decisions and post-launch roadmap |
