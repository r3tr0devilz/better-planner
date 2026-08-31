-- Lets the Capture AI provider/model be changed from Settings instead of
-- only via env vars. user_settings already exists (0001_init.sql: id,
-- user_id, timezone, with its own owner_only RLS policy already in place)
-- — this adds columns to it rather than creating a new table.
alter table user_settings add column capture_provider text not null default 'anthropic' check (capture_provider in ('anthropic', 'ollama'));
alter table user_settings add column capture_model text;
