# Task: Sentry Error Monitoring

**Phase:** 8 — QA & Launch  
**Week:** 12

## Goal

Set up Sentry error monitoring on the Next.js application before production launch.

## Requirements

- Install `@sentry/nextjs`
- Configure Sentry DSN via environment variable
- Capture unhandled errors in storefront and admin
- Source maps uploaded for readable stack traces
- Test error capture with intentional test error
- Sentry active in production only (or separate dev DSN)

## Acceptance Criteria

- [ ] Sentry initialized in Next.js app
- [ ] Test error appears in Sentry dashboard
- [ ] Source maps provide readable stack traces
- [ ] `SENTRY_DSN` documented in `.env.local.example`
- [ ] No Sentry noise from expected errors (404, validation)

## Dependencies

- Phase 1 (Next.js project initialized)

## Files to Modify

| File | Action |
|---|---|
| `sentry.client.config.ts` | Create |
| `sentry.server.config.ts` | Create |
| `sentry.edge.config.ts` | Create |
| `next.config.ts` | Update |
| `.env.local.example` | Update |

## Definition of Done

- [ ] Sentry receiving errors in dashboard
- [ ] Production DSN configured in Vercel
- [ ] Documentation updated in [Deployment](../docs/deployment.md)
