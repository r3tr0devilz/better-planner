-- User-defined task states beyond the open/done binary (e.g. "waiting on
-- someone", "blocked") — shown as their own sections on Today and Tasks,
-- with a chip on each slip to cycle through them. NULL state_id keeps a
-- task in the plain "Open" section, unaffected by any of this.
create table task_states (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index task_states_user_sort_idx on task_states (user_id, sort_order);

-- Deleting a state ("drop") un-sets it on every task that was in it rather
-- than deleting those tasks — dropping a state is tidying up the board, not
-- discarding work.
alter table tasks add column state_id uuid references task_states (id) on delete set null;

alter table task_states enable row level security;
create policy "owner_only" on task_states for all using (user_id = auth.uid()) with check (user_id = auth.uid());
grant select, insert, update, delete on task_states to authenticated;
