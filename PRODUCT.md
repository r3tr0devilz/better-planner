# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

A single user (no public sign-up — an account is created directly in Supabase, matching the source system this was spec'd from). That person is juggling several distinct areas of life at once: personal/home life, client projects and retainers, and a learning/jobseeking track (online courses + job search). The job to be done: get things out of their head and into the system with near-zero friction (voice or text), and trust the system to file each item under the right domain/project without manual upkeep.

## Product Purpose

A personal life-organization dashboard that ties tasks, routines, projects/retainers, a content pipeline, a people CRM, and a notes/journal/quotes/books library together under top-level "domains." It exists because prior tools (Notion, Apple Notes, jumping between apps) became so elaborate to maintain that the friction of upkeep stopped the user from actually using them — notes and intentions went in and never came back out. Success means capture is fast enough that everything reliably lands in the right place, and nothing has to be tracked in the user's memory or on paper to survive.

## Positioning

The mechanism is frictionless, AI-assisted capture: voice or text goes in, and parsing (Claude, server-side) turns it into a structured record correctly tagged to a domain/project without the user doing that filing by hand. The meaningful difference from a generic task manager or Notion setup is that one system flexes across every real area of a life — home, client work, job search/learning — instead of being shaped for one workflow (e.g. business project management) that personal life then gets awkwardly forced into.

## Operating Context

- Confirmed top-level domains/areas for this user: personal/home life, client projects & retainers, and learning (online courses) + jobseeking. (Plan.md's domains — Field Notes, Hill Media Group, YouTube channels — belong to the video's source system, not this user; see Evidence on Hand.)
- Today dashboard is the daily hub: top-3 tasks, calendar entries, all open tasks sorted by due date, "slipping" (gone-stale) projects/tasks, a routine checklist with streaks, a rotating resurfaced note/quote/verse, and items flagged for review.
- Capture happens via voice or text entry in the web app; parsing runs server-side through `/api/capture` (Claude by default, swappable to a local Ollama model for local dev only).
- Data lives in Supabase (Postgres/Auth). Installable as a PWA (manifest + service worker) so the same app works across PC, phone, and tablet.

## Capabilities and Constraints

- Built: auth, domains, projects/areas (milestones, checklists, checklist templates, activity log), tasks, routines (streaks), Today dashboard, AI-assisted capture (voice or text), content pipeline, people CRM, library (notes/journal/quotes/books/highlights).
- Single-user only by design — no multi-tenant support, no public sign-up surface. Preserve this; do not add a signup flow.
- Near-term priority: Google Calendar sync (pull events onto the Today dashboard).
- Roadmap, not yet prioritized: push notifications (provider undecided — the source system used Pushover, not confirmed for this build) and search/AI-chat over the user's own data.
- Inventory has a page but is a stub, not fleshed out. A kanban view for the content pipeline is not built.

## Brand Commitments

Name: "Better Planner."

## Evidence on Hand

- `Plan.md` is a video transcript of a different person (the source system's builder) narrating their own app — useful as the original mechanism/feature spec, but its example domains, people, and content are not this user's real data and must not be treated as such.
- `mobile-ui-design-principles.md` is a distilled reference on desktop-vs-mobile design differences — design guidance, not product content.
- No real personal content (actual tasks, journal entries, contacts, book highlights) is on hand yet for this user's own domains; future work must not fabricate sample data as if it were real.

## Product Principles

1. Capture stays frictionless — voice or text, seconds not minutes — because friction is exactly why every prior tool got abandoned.
2. One system flexes across every real domain of this user's life (home, client work, job search/learning) rather than forcing personal life into a tool shaped for business workflows.
3. Recurring surfaces (slipping items, resurfacing, review flags) do the remembering, so the user never has to hold an open loop in their own head.
4. Single-user by design — no multi-tenant complexity or public sign-up surface to maintain.
5. AI does the filing work (domain/project/priority assignment) so structure never becomes manual busywork.
