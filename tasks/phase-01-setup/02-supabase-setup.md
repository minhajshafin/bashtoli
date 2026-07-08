# Task: Supabase Project Setup

**Phase:** 1 — Setup & Schema  
**Week:** 1

## Goal

Create and configure the Supabase project for local development and production, including Storage bucket for product images.

## Requirements

- Create Supabase project (dev/local)
- Install `@supabase/supabase-js` and `@supabase/ssr`
- Create Supabase client helpers for browser and server contexts
- Configure Storage bucket for product images (public read, authenticated write)
- Set recommended image constraints: 1200×1200, WebP/JPEG, max 2 MB
- Connect environment variables to Next.js app

## Acceptance Criteria

- [x] Supabase project created and credentials stored in `.env.local`
- [x] Browser client helper returns authenticated session
- [x] Server client helper works in Server Components and Server Actions
- [x] Storage bucket `product-images` exists with correct policies
- [x] Test upload/download of an image succeeds from server context

## Dependencies

- [01-init-nextjs.md](./01-init-nextjs.md)

## Files to Modify

| File | Action |
|---|---|
| `lib/supabase/client.ts` | Create |
| `lib/supabase/server.ts` | Create |
| `lib/supabase/middleware.ts` | Create |
| `.env.local.example` | Update |
| `middleware.ts` | Create (session refresh stub) |

## Definition of Done

- [x] Supabase clients tested in browser and server contexts
- [x] Storage bucket configured with RLS policies
- [x] No service role key exposed in client-side code
- [x] Dev credentials documented in `.env.local.example`
