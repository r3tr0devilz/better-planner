-- Today's masthead greets the user by name — stored alongside the other
-- per-user settings rather than a new table.
alter table user_settings add column display_name text;
