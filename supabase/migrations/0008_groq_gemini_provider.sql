-- Widen the capture_provider check constraint to allow "groq" and "gemini"
-- as two more Capture AI providers, same pattern as 0006 (openrouter).
alter table user_settings drop constraint user_settings_capture_provider_check;
alter table user_settings add constraint user_settings_capture_provider_check
  check (capture_provider in ('anthropic', 'ollama', 'openrouter', 'groq', 'gemini'));
