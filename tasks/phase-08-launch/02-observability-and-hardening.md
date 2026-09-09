# Task: Observability, Rate Limiting & Security Hardening

**Phase:** 8 — QA & Launch  
**Week:** 12

## Goal

Establish lightweight, production-grade observability, verify Upstash Redis rate limiting under realistic traffic patterns, and perform pre-launch security hardening without adding heavyweight external dependencies.

## Requirements

1. **Vercel Web Analytics & Core Web Vitals**:
   - Verify `@vercel/analytics` is active in `app/layout.tsx` across storefront, checkout, and admin pages.
   - Confirm real-user performance metrics (LCP, INP, CLS) stream to the Vercel Analytics dashboard.
   - Verify privacy-friendly tracking (no PII or user IDs passed to analytics).

2. **Upstash Redis Rate Limit Verification**:
   - Verify all 3 sliding window limiters function correctly with production Redis credentials:
     - `rl:auth` — 10 requests / 60s per IP (login, signup, password reset).
     - `rl:order` — 5 requests / 60s per IP (order lookup and `/order/*` tracking).
     - `rl:checkout` — 5 requests / 60s per IP (order placement to prevent inventory denial).
   - Test fail-open resilience: ensure app allows legitimate traffic if Redis experiences temporary downtime or connection timeouts.
   - Verify edge IP extraction logic in `lib/supabase/rate-limit.ts` (`x-real-ip` and trusted edge `x-forwarded-for`).

3. **Production Logging & Alerting**:
   - Configure Vercel runtime logs and error thresholds.
   - Ensure sensitive credentials (auth passwords, session tokens, service-role keys) are never printed to runtime logs.
   - Verify email dispatch logging in `lib/email/resend.tsx` outputs clear success IDs or failure diagnostics.

4. **Security & Header Hardening**:
   - Audit HTTP response headers set by `lib/supabase/middleware.ts`:
     - `X-Frame-Options: DENY` (clickjacking protection).
     - `X-Content-Type-Options: nosniff` (MIME sniffing prevention).
     - `Referrer-Policy: strict-origin-when-cross-origin`.
     - `Permissions-Policy: camera=(), microphone=(), geolocation=()`.
   - Verify `next@16.3.4` maintains 0 known vulnerabilities (`npm audit`).
   - Validate robots.txt disallow rules against private endpoints (`/account/`, `/checkout`, `/bag`, `/cart`, `/order/`, `/admin/`).

## Acceptance Criteria

- [x] Vercel Analytics receives real traffic events from preview/production deployments.
- [x] Upstash Redis rate limits enforce thresholds and return HTTP 429 / user-friendly error messages when exceeded.
- [x] Redis downtime simulation confirms site fails open without crashing checkout.
- [x] Production runtime logs capture unexpected 5xx errors with clean stack traces.
- [x] Security headers verified using browser DevTools or `curl -I`.
- [x] `npm audit` returns 0 vulnerabilities before launch.

## Dependencies

- Phase 1 & 2 security remediations (Auth callback host validation, JSON-LD sanitization).
- Upstash Redis database provisioned with REST URL and token.
- `@vercel/analytics` package installed and initialized in RootLayout.

## Files to Modify

| File | Action | Description |
|---|---|---|
| `app/layout.tsx` | Verify | Ensure `<Analytics />` component is mounted |
| `lib/supabase/rate-limit.ts` | Verify | Validate sliding window prefixes and IP parsing |
| `lib/supabase/middleware.ts` | Verify | Verify security headers and route matching |
| `docs/deployment.md` | Update | Document observability and rate-limiting operational runbook |

## Definition of Done

- [x] Observability active on Vercel dashboard.
- [x] Rate limit thresholds tested and validated under concurrent test requests.
- [x] Security headers and audit verification checklist signed off.
- [x] No client bundle exposes server environment variables or service keys.
