-- Google Calendar OAuth: integration_status already tracks
-- provider/connected/last_synced_at (0001_init.sql) — this adds the actual
-- token material to that same row rather than a new table, since one row
-- per (user, provider) already models "one integration connection."
alter table integration_status add column access_token text;
alter table integration_status add column refresh_token text;
alter table integration_status add column token_expires_at timestamptz;
alter table integration_status add column scope text;
