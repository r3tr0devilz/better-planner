-- Widen the capture_provider check constraint to allow "openrouter" as a
-- third Capture AI provider alongside anthropic/ollama. 0004 (already
-- applied) named the constraint user_settings_capture_provider_check by
-- Postgres default, so it's dropped and re-added rather than edited in
-- place — that migration already ran and its file stays as history.
alter table user_settings drop constraint user_settings_capture_provider_check;
alter table user_settings add constraint user_settings_capture_provider_check
  check (capture_provider in ('anthropic', 'ollama', 'openrouter'));
