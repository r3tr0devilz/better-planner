-- Lets the Capture AI provider/model be changed from Settings instead of
-- only via env vars — one row per user, read with an env-var fallback when
-- no row exists yet (see src/lib/data/settings.ts).

create table user_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique default auth.uid() references auth.users (id) on delete cascade,
  capture_provider text not null default 'anthropic' check (capture_provider in ('anthropic', 'ollama')),
  capture_model text,
  created_at timestamptz not null default now()
);

alter table user_settings enable row level security;
create policy "owner_only" on user_settings for all using (user_id = auth.uid()) with check (user_id = auth.uid());
