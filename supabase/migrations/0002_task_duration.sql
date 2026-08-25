-- Tasks can optionally carry a duration, shown as a resizable block in the
-- Calendar Day view. Null means "point in time" — no block height implied.
alter table tasks add column duration_minutes int check (duration_minutes is null or duration_minutes > 0);
