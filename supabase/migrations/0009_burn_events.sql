-- Incense Ledger: a permanent record of every slip that's been lit (task,
-- routine or checklist item completed) or put out (lit, then undone during
-- the char hold). Backs the Ash page and the Today "recent activity" panel.
-- Independent of the source row's own state so the record survives deletes
-- and edits, and keeps entries "put out" produced even though the source
-- item itself reverts to open.
create table burn_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  item_type text not null check (item_type in ('task', 'routine', 'checklist_item')),
  item_id uuid not null,
  title text not null,
  domain_id uuid references domains (id) on delete set null,
  outcome text not null check (outcome in ('burned', 'put_out')),
  -- How long the slip sat open before this event, in minutes — captured at
  -- write time (rather than re-derived from the source row later, which may
  -- since have been edited or deleted). Powers the Ash page's stub length.
  sat_minutes int not null default 0,
  occurred_at timestamptz not null default now()
);

create index burn_events_user_occurred_idx on burn_events (user_id, occurred_at desc);

alter table burn_events enable row level security;
create policy "owner_only" on burn_events for all using (user_id = auth.uid()) with check (user_id = auth.uid());
grant select, insert, update, delete on burn_events to authenticated;
