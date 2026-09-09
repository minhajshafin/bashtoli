# Deployment

## Hosting

| Service | Role |
|---|---|
| Vercel | Next.js application hosting & edge runtime |
| Supabase | Database, auth, file storage |
| Upstash | Serverless Redis for distributed rate limiting |
| Resend | Transactional email notifications |

## Environments

### Local Development

1. Clone repository
2. Copy `.env.local.example` → `.env.local`
3. Fill in Supabase, Upstash Redis, and Resend credentials
4. Run `npm run dev`

### Staging (Recommended)

- Separate Supabase project or branch
- Vercel preview/staging deployment
- Upstash Redis staging database
- Resend test mode
- Used for owner review before launch (Phase 7–8)

### Production

- Supabase production project
- Vercel production deployment
- Upstash Redis production REST credentials (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`)
- Resend production API key
- Vercel Web Analytics & Speed Insights enabled
- Custom domain (`bashtoli.com`)

## Environment Variables

See [Tech Stack — Environment Variables](./tech-stack.md#environment-variables-planned) for the full list.

**Critical:** `SUPABASE_SERVICE_ROLE_KEY` must never be exposed to the client. Verify with `grep` that it does not appear in client bundles.

## Vercel Configuration (Planned)

```
vercel.json (if needed)
├── Build command: next build
├── Output: .next
└── Environment variables set in Vercel dashboard
```

## Supabase Setup

1. Create Supabase project (Phase 1)
2. Run migrations from `supabase/migrations/` in order (`001_` → `008_`)
3. Configure Storage bucket `product-images` (public, 2 MB limit, WebP/JPEG/PNG)
4. Set up RLS policies (migration `008_rls_policies.sql`)
5. Bootstrap first admin user — see section below

## Bootstrapping the First Admin User

There is no admin UI until Phase 2. Use this one-time SQL script to promote
the first user to `admin` immediately after they sign up.

### Step-by-step

1. **Sign up** via the app's login page (or via Supabase Dashboard →
   Authentication → Add user).

2. **Copy the user UUID** from:
   `Supabase Dashboard → Authentication → Users → click the user row → copy UUID`

3. **Open the SQL script** at `supabase/scripts/bootstrap-admin.sql`.

4. **Replace `<USER_UUID>`** on line 19 with the real UUID, e.g.:
   ```sql
   target_user_id uuid := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
   ```

5. **Run the script** in:
   `Supabase Dashboard → SQL Editor → paste → Run`

6. The script prints a `NOTICE` confirming the promotion and then returns
   a `SELECT` showing all admin profiles for verification.

### Fallback: manual dashboard update

If the SQL Editor is not available, update the role directly:

1. `Supabase Dashboard → Table Editor → profiles`
2. Find the row by user ID
3. Click the `role` cell → change value to `admin` → Save

### Dev environment default credentials

A default admin account has been created for the **development** Supabase project:

| Field    | Value                  |
|----------|------------------------|
| Email    | `admin@example.com`    |
| Password | `mypassword123`        |
| Role     | `admin`                |
| UUID     | `570f141c-c3c1-45fb-aec5-93a463932bfc` |

> [!CAUTION]
> **Change these credentials before going to production.**
> Log in to the Supabase Dashboard → Authentication → Users, select this user,
> and update the email and password to the real owner's credentials.
> Alternatively, delete this account and run `bootstrap-admin.sql` with a
> newly signed-up real account.

### Notes

- The script is **idempotent** — safe to run multiple times on the same user.
- Running it on an already-admin user produces the same result.
- **Do not hardcode the UUID** in the repository — always paste it at run time.
- For production: run the script once, then remove the UUID from your clipboard.

## Rate Limiting & Abuse Prevention (Upstash Redis)

Distributed rate limiting is enforced in `proxy.ts` (Next.js Edge middleware) and Server Actions using `@upstash/ratelimit` over HTTPS REST.

### Active Limits

| Key Prefix | Target Route / Action | Sliding Window Limit | Action on Exceeded |
|---|---|---|---|
| `rl:auth` | `/login`, `/signup`, `/forgot-password`, `/reset-password` | **10 requests / 60 seconds** per IP | HTTP 429 + `Retry-After` header |
| `rl:order` | `/order/lookup`, `/order/:orderNumber` | **5 requests / 60 seconds** per IP | HTTP 429 + `Retry-After` header |
| `rl:checkout` | `createOrderAction` (COD checkout submission) | **5 requests / 60 seconds** per IP | Friendly error toast in checkout UI |

### Edge IP Extraction & Security

Client IP is extracted in `lib/supabase/rate-limit.ts`:
- Uses `x-real-ip` (set by Vercel edge infrastructure, immune to client header spoofing).
- Falls back to the rightmost IP in `x-forwarded-for` (the entry appended by the trusted edge proxy, ignoring any client-injected prefixes).
- Normalizes loopback `::1` to `127.0.0.1`.

### Fail-Open Resilience Architecture

If `UPSTASH_REDIS_REST_URL` is unconfigured, or if Upstash experiences temporary downtime or connection timeouts, all rate limiters automatically fail open (`{ limited: false }`) with diagnostic console errors. This ensures legitimate customer checkouts and logins are never blocked during infrastructure disruptions.

### Operational Runbook: Rate Limit Management

1. **Unblocking a Legitimate IP:**
   If a legitimate user or office IP is temporarily rate limited:
   ```bash
   # Connect via Upstash CLI or Web Console
   DEL rl:auth:<IP_ADDRESS>
   DEL rl:checkout:<IP_ADDRESS>
   ```
2. **Adjusting Thresholds for Flash Sales / Promotions:**
   Adjust the sliding window parameters in `lib/supabase/rate-limit.ts` (e.g. `Ratelimit.slidingWindow(20, '60 s')`) and deploy.

---

## Observability & Error Monitoring

Bashtoli uses a zero-dependency, cloud-native observability stack optimized for Next.js on Vercel:

1. **Vercel Web Analytics & Real User Monitoring (RUM):**
   - Initialized via `<Analytics />` from `@vercel/analytics/react` in [`app/layout.tsx`](file:///home/billy/Projects/bashtoli/app/layout.tsx).
   - Monitors live pageviews, referrers, and geo-distribution without cookies or PII collection.

2. **Core Web Vitals & Speed Insights:**
   - Tracks real-world Largest Contentful Paint (LCP), Interaction to Next Paint (INP), and Cumulative Layout Shift (CLS).
   - Enabled via Content-Security-Policy headers allowing `https://va.vercel-scripts.com` and `https://vitals.vercel-insights.com`.

3. **Vercel Serverless Function & Edge Runtime Logs:**
   - Real-time streaming of all Server Action errors, failed database operations, and Resend email dispatches.
   - Configured with alerts for any sudden spike in HTTP 5xx responses.

---

## Launch Checklist (Phase 8)

### Pre-Deploy

- [ ] All 6 Playwright E2E suites passing (`npm run test:e2e`)
- [ ] All 13 unit test suites passing (`npm test`)
- [ ] 0 lint errors (`npm run lint`) and 0 vulnerabilities (`npm audit`)
- [ ] Vercel Analytics active in RootLayout
- [ ] Upstash Redis credentials set in Vercel production environment
- [ ] Supabase RLS policies and guest order claiming RPC active
- [ ] Resend domain verified (`orders@bashtoli.com`) with production API key
- [ ] Owner has verified real product catalog, pricing, and initial stock
- [ ] About/Contact pages and WhatsApp contact link populated

### Deploy

- [ ] Deploy to Vercel production
- [ ] Verify custom domain (`bashtoli.com`) SSL and DNS propagation
- [ ] Smoke test: browse → cart → checkout → admin order inspection
- [ ] Verify transactional email delivery (owner notification + customer receipt)

### Post-Launch

- [ ] Handoff training session with owner/staff
- [ ] Review Vercel Analytics and Core Web Vitals over the first 48 hours
- [ ] Monitor Upstash Redis usage and rate limiting analytics

## Rollback Plan

- Vercel instant rollback to previous successful deployment.
- Database migrations are backward-compatible.
- Staging environment remains available for hotfix verification.

## Monitoring Post-Launch

| Tool | What to Watch |
|---|---|
| Vercel Runtime Logs | Server Action errors, 5xx responses, Resend dispatches |
| Vercel Analytics | Real-user page traffic, top referrers, bounce rate |
| Vercel Speed Insights | Core Web Vitals (LCP < 2.5s, INP < 200ms, CLS < 0.1) |
| Upstash Redis Console | Rate limiting key hits, command volume, latency |
| Supabase Dashboard | Postgres connections, disk IOPS, auth sessions |
| Resend Dashboard | Email delivery rates, bounce / spam reports |
