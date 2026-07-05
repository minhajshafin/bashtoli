# Task: Analytics (Vercel Analytics)

**Phase:** 7 — Polish & Content  
**Week:** 11

## Goal

Integrate Vercel Analytics for basic storefront traffic and Web Vitals tracking. Privacy-friendly, free, and built into Vercel — no cookie consent required.

## Requirements

- Install `@vercel/analytics` package
- Add `<Analytics />` component to `app/layout.tsx` (renders automatically on Vercel; no-op in local dev)
- Enable Vercel Analytics in Vercel project dashboard (one-click)
- Track standard page views automatically (handled by the component)
- No PII in any analytics data
- No cookie consent banner required (Vercel Analytics is cookieless)

## Acceptance Criteria

- [ ] `@vercel/analytics` package installed
- [ ] `<Analytics />` component present in root layout
- [ ] Vercel Analytics enabled in Vercel project dashboard
- [ ] Page views visible in Vercel Analytics dashboard after production deploy
- [ ] No console errors in development (component is a no-op locally)

## Dependencies

- Phase 3 storefront complete
- [03-production-deployment.md](../phase-08-launch/03-production-deployment.md) (analytics live after deploy)

## Files to Modify

| File | Action |
|---|---|
| `app/layout.tsx` | Update (add `<Analytics />` component) |
| `package.json` | Update (add `@vercel/analytics`) |

## Definition of Done

- [ ] Package installed and component added to layout
- [ ] Vercel Analytics dashboard shows data after first production deploy
- [ ] No performance regression from adding the component
