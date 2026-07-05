# Tech Stack

## Core

| Layer | Technology | Notes |
|---|---|---|
| Frontend + Backend | Next.js (App Router) | Single codebase for storefront + admin |
| Database & Auth | Supabase (Postgres) | `auth.users` + `profiles` table; RLS for role-based permissions |
| File/Image Storage | Supabase Storage | Product images |
| Validation | Zod | Server-side validation for checkout and admin mutations |
| Styling | Tailwind CSS | Utility-first CSS |
| Hosting | Vercel | Local + production (staging recommended) |

## Integrations

| Service | Purpose | Notes |
|---|---|---|
| Resend | Transactional email | Order notifications; test mode in dev |
| Sentry | Error monitoring | Free tier on Next.js; set up before launch |

## Client-Side Storage

| Context | Storage | Purpose |
|---|---|---|
| Guest cart | `localStorage` | No login required for cart persistence |
| Logged-in cart | Supabase (`carts` + `cart_items`) | Server-side cart sync |

## Testing

| Tool | Purpose |
|---|---|
| Playwright | E2E happy-path checkout flow (starting Phase 4) |

## Development Tools

| Tool | Purpose |
|---|---|
| Cursor | Primary IDE / AI-assisted development |
| TypeScript | Type safety across the codebase |

## Environment Variables (Planned)

| Variable | Scope | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Server | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Privileged DB operations |
| `RESEND_API_KEY` | Server only | Email sending |
| `SENTRY_DSN` | Server + Client | Error reporting |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Client | WhatsApp deep links |

## Key Dependencies (Planned)

```json
{
  "next": "latest",
  "@supabase/supabase-js": "latest",
  "@supabase/ssr": "latest",
  "zod": "latest",
  "tailwindcss": "latest",
  "@playwright/test": "latest",
  "@sentry/nextjs": "latest"
}
```

Exact versions will be pinned at project initialization (Phase 1).

## Security Notes

- Service role key: server-side only, never in client bundle
- All mutations via Server Actions or Route Handlers with Zod validation
- RLS policies enforce access control at the database layer
- Admin routes protected by Next.js middleware + role guard
