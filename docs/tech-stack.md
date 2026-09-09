# Tech Stack

## 1. Core Platform

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Framework** | Next.js (App Router, Turbopack) | 16.3.4 | Unified full-stack framework for public storefront, customer accounts, and admin dashboard |
| **UI Library** | React | 19.2.4 | Server and Client component rendering architecture |
| **Styling** | Tailwind CSS | 4.x | Design token styling, fluid responsiveness, and animations |
| **Icons** | Lucide React | 1.35.0 | UI iconography across storefront, cart drawer, and admin dashboard |
| **Database & Auth** | Supabase (PostgreSQL 15+) | Cloud | Managed PostgreSQL, Supabase Auth (`auth.users`), and `app_private` schema security |
| **Object Storage** | Supabase Storage | Cloud | Image asset storage bucket (`product-images`) with public CDN distribution |
| **Edge Rate Limiter** | Upstash Redis | Serverless | Distributed sliding-window rate limiting for authentication, orders, and checkout |
| **Transactional Email** | Resend | 6.17.2 | Automated order confirmation and admin notification delivery |
| **Observability** | Vercel Analytics | 2.0.1 | Zero-dependency Core Web Vitals and user traffic telemetry |
| **Hosting & CDN** | Vercel | Global Edge | Next.js edge runtime and serverless functions deployment |

---

## 2. Testing & Quality Assurance

| Tool | Version | Purpose |
|---|---|---|
| **Playwright** | 1.61.1 | End-to-end regression testing across 8 critical customer and administrative flows |
| **Vitest** | 4.1.10 | High-speed unit testing for server actions, rate limiters, validation schemas, and delivery logic |
| **React Testing Library** | 16.3.2 | Component unit testing with DOM assertions |
| **ESLint** | 9.x | Static code analysis with Next.js Core Web Vitals rules |

---

## 3. Environment Variables Matrix

| Variable | Scope | Required In Production | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Client & Server | Yes | Base URL for the Supabase project |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client & Server | Yes | Anonymous public API key for client-side queries |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Yes | Secret service-role key for backend server actions and atomic RPCs (**never expose to client**) |
| `UPSTASH_REDIS_REST_URL` | Server only | Yes | Upstash serverless Redis REST endpoint for distributed rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | Server only | Yes | REST token for authenticating Upstash Redis queries |
| `RESEND_API_KEY` | Server only | Yes | API key for dispatching transactional emails |
| `ADMIN_NOTIFICATION_EMAIL` | Server only | Yes | Recipient inbox for new order alerts and customer item suggestions |
| `SUGGESTION_RECIPIENT_EMAIL` | Server only | Optional | Dedicated inbox for customer product suggestions (falls back to admin email) |
| `NEXT_PUBLIC_SITE_URL` | Client & Server | Yes | Production canonical URL (e.g. `https://bashtoli.com`) for SEO meta tags and sitemaps |

---

## 4. Key Dependencies (`package.json`)

```json
{
  "dependencies": {
    "next": "16.3.4",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "@supabase/ssr": "^0.12.0",
    "@supabase/supabase-js": "^2.110.0",
    "@upstash/ratelimit": "^2.0.8",
    "@upstash/redis": "^1.38.2",
    "@vercel/analytics": "^2.0.1",
    "lucide-react": "^1.35.0",
    "resend": "^6.17.2",
    "zod": "^4.4.3"
  },
  "devDependencies": {
    "@playwright/test": "^1.61.1",
    "@tailwindcss/postcss": "^4",
    "@testing-library/react": "^16.3.2",
    "eslint": "^9",
    "eslint-config-next": "16.3.4",
    "typescript": "^5",
    "vitest": "^4.1.10"
  }
}
```

---

## 5. Security & Architecture Guardrails

- **Secret Isolation**: `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, and `UPSTASH_REDIS_REST_TOKEN` are strictly isolated to server runtimes and verified to never appear in client browser bundles.
- **Fail-Open Rate Limiting**: If Redis network connectivity experiences downtime, rate limiters gracefully log an operational warning and allow customer checkout and authentication requests to proceed.
- **Strict Server Validation**: All checkout, account, and administrative mutations are validated server-side using Zod schemas before database queries or RPC calls are triggered.
