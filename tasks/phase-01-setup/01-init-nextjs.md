# Task: Initialize Next.js Project

**Phase:** 1 — Setup & Schema  
**Week:** 1

## Goal

Bootstrap the Next.js application with App Router, TypeScript, Tailwind CSS, and project folder structure.

## Requirements

- Create Next.js project with App Router and TypeScript
- Install and configure Tailwind CSS
- Set up planned directory structure (`app/`, `components/`, `lib/`, `supabase/`, `tests/`)
- Add `.env.local.example` with all required environment variable placeholders
- Configure ESLint and basic project scripts (`dev`, `build`, `lint`)
- Add `.gitignore` covering `.env.local`, `node_modules`, `.next`

## Acceptance Criteria

- [ ] `npm run dev` starts the development server without errors
- [ ] `npm run build` completes successfully
- [ ] Tailwind CSS classes render on a placeholder home page
- [ ] Directory structure matches [Architecture — Planned Directory Structure](../docs/architecture.md#13-planned-directory-structure)
- [ ] `.env.local.example` documents all planned env vars from [Tech Stack](../docs/tech-stack.md)

## Dependencies

- None (first task)

## Files to Modify

| File | Action |
|---|---|
| `package.json` | Create |
| `tsconfig.json` | Create |
| `tailwind.config.ts` | Create |
| `postcss.config.js` | Create |
| `next.config.ts` | Create |
| `.env.local.example` | Create |
| `.gitignore` | Create |
| `app/layout.tsx` | Create |
| `app/page.tsx` | Create |
| `app/globals.css` | Create |

## Definition of Done

- [ ] Next.js app runs locally
- [ ] Build passes
- [ ] Folder structure in place
- [ ] Environment template committed (no secrets)
- [ ] Root README updated with setup instructions
