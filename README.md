# Better Planner

A personal life-organization dashboard — tasks, routines, projects/retainers, a
content pipeline, a people CRM, and a notes/journal/quotes/books library, all
tied to top-level "domains." Installable as a PWA so one app works across PC,
phone, and tablet. See [Plan.md](./Plan.md) for the source brief.

Built so far: auth, domains, projects/areas (milestones, checklists, checklist
templates, activity log), tasks, routines (streaks), the Today dashboard,
AI-assisted capture (voice or text → a structured task), a content pipeline,
a people CRM, and a library (notes/journal/quotes/books/highlights).
Google Calendar sync, push notifications, and search/AI-chat are next.

## Setup

1. **Supabase** — create a project at [supabase.com](https://supabase.com),
   then in the SQL editor run [`supabase/migrations/0001_init.sql`](./supabase/migrations/0001_init.sql).
   (Or, for local dev: `npx supabase start`, which applies it automatically.)
2. **Environment** — copy `.env.local.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from your Supabase project's API settings
   - `ANTHROPIC_API_KEY` — from [console.anthropic.com](https://console.anthropic.com), used server-side by `/api/capture`
   - Optional: set `CAPTURE_LLM_PROVIDER=ollama` (plus `OLLAMA_BASE_URL`/`OLLAMA_MODEL`) to parse
     captures with a local Ollama model instead of Claude — see the commented-out block in
     `.env.local.example`. Only useful where Ollama is actually reachable (local dev, not a
     deployed server, unless it's tunneled).
3. **A user account** — this app has no public sign-up page (it's single-user,
   like the source system). Create your login in the Supabase dashboard under
   Authentication → Users, or via `supabase.auth.admin.createUser(...)`.
4. `npm install && npm run dev`, then sign in at [http://localhost:3000](http://localhost:3000).

## Stack

Next.js (App Router) + Tailwind, Supabase (Postgres/Auth), Claude (`claude-opus-5`)
for capture parsing (swappable for a local Ollama model, see Setup), Web Speech
API for voice, installable via a manifest + service worker.
