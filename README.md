# Better Planner

A personal life-organization dashboard — tasks, routines, projects/retainers, a
content pipeline, a people CRM, and a notes/journal/quotes/books library, all
tied to top-level "domains." Installable as a PWA so one app works across PC,
phone, and tablet. See [Plan.md](./Plan.md) for the source brief.

Phase 1 (this build): auth, domains, projects/areas (milestones, checklists,
checklist templates, activity log), tasks, routines (streaks), the Today
dashboard, and AI-assisted capture (voice or text → a structured task).
Content, People, Library, and Inventory land in later phases.

## Setup

1. **Supabase** — create a project at [supabase.com](https://supabase.com),
   then in the SQL editor run [`supabase/migrations/0001_init.sql`](./supabase/migrations/0001_init.sql).
   (Or, for local dev: `npx supabase start`, which applies it automatically.)
2. **Environment** — copy `.env.local.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from your Supabase project's API settings
   - `ANTHROPIC_API_KEY` — from [console.anthropic.com](https://console.anthropic.com), used server-side by `/api/capture`
3. **A user account** — this app has no public sign-up page (it's single-user,
   like the source system). Create your login in the Supabase dashboard under
   Authentication → Users, or via `supabase.auth.admin.createUser(...)`.
4. `npm install && npm run dev`, then sign in at [http://localhost:3000](http://localhost:3000).

## Stack

Next.js (App Router) + Tailwind, Supabase (Postgres/Auth), Claude (`claude-opus-5`)
for capture parsing, Web Speech API for voice, installable via a manifest + service worker.
