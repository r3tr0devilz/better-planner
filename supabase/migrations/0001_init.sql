-- Better Planner schema. Every table is owned by a single user (auth.uid())
-- and locked down with row level security, mirroring the login-protected
-- system from the source video.

create extension if not exists pgcrypto;

-- ── domains ────────────────────────────────────────────────────────────────
create table domains (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  color text not null default '#8c9eff',
  icon text,
  created_at timestamptz not null default now()
);

-- ── projects / areas ───────────────────────────────────────────────────────
create table projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  domain_id uuid references domains (id) on delete set null,
  name text not null,
  kind text not null default 'project' check (kind in ('project', 'area')),
  engagement text not null default 'project' check (engagement in ('project', 'retainer')),
  status text not null default 'active',
  start_date date,
  end_date date,
  hours_logged numeric not null default 0,
  created_at timestamptz not null default now()
);

create table milestones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  project_id uuid not null references projects (id) on delete cascade,
  name text not null,
  percent_complete int not null default 0 check (percent_complete between 0 and 100),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table checklist_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table checklist_template_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  template_id uuid not null references checklist_templates (id) on delete cascade,
  text text not null,
  sort_order int not null default 0
);

-- ── content pipeline ───────────────────────────────────────────────────────
create table content_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  domain_id uuid references domains (id) on delete set null,
  title text not null,
  content_type text not null default 'video' check (content_type in ('video', 'article', 'podcast', 'newsletter')),
  status text not null default 'idea' check (status in ('idea', 'outlining', 'editing', 'waiting', 'published')),
  url text,
  publish_date date,
  outline_markdown text,
  created_at timestamptz not null default now()
);

-- ── checklists (attach to a project OR a content item) ────────────────────
create table checklists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  project_id uuid references projects (id) on delete cascade,
  content_item_id uuid references content_items (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  constraint checklists_one_parent check (
    (project_id is not null)::int + (content_item_id is not null)::int = 1
  )
);

create table checklist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  checklist_id uuid not null references checklists (id) on delete cascade,
  text text not null,
  done boolean not null default false,
  sort_order int not null default 0
);

create table activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  project_id uuid not null references projects (id) on delete cascade,
  note text,
  minutes int not null default 0,
  logged_at timestamptz not null default now()
);

-- ── tasks ──────────────────────────────────────────────────────────────────
create table tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  domain_id uuid references domains (id) on delete set null,
  project_id uuid references projects (id) on delete set null,
  content_item_id uuid references content_items (id) on delete set null,
  title text not null,
  notes text,
  due_at timestamptz,
  reminder_at timestamptz,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  status text not null default 'open' check (status in ('open', 'done')),
  is_top_three boolean not null default false,
  recurring_rule text,
  created_at timestamptz not null default now()
);

create index tasks_user_due_idx on tasks (user_id, due_at);
create index tasks_user_status_idx on tasks (user_id, status);

-- ── routines ───────────────────────────────────────────────────────────────
create table routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  description text,
  time_of_day text not null default 'anytime' check (time_of_day in ('morning', 'afternoon', 'evening', 'anytime')),
  specific_time time,
  notify boolean not null default false,
  mode text not null default 'ongoing' check (mode in ('ongoing', 'fixed_days')),
  total_days int,
  start_date date not null default current_date,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

create table routine_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  routine_id uuid not null references routines (id) on delete cascade,
  date date not null,
  completed boolean not null default true,
  unique (routine_id, date)
);

-- ── people (personal CRM) ──────────────────────────────────────────────────
create table people (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  birthday date,
  anniversary date,
  created_at timestamptz not null default now()
);

create table people_facts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  person_id uuid not null references people (id) on delete cascade,
  fact text not null,
  created_at timestamptz not null default now()
);

create table people_interactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  person_id uuid not null references people (id) on delete cascade,
  occurred_at timestamptz not null default now(),
  note text
);

-- ── library ────────────────────────────────────────────────────────────────
create table books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null,
  author text,
  cover_url text,
  status text not null default 'want' check (status in ('want', 'reading', 'finished', 'abandoned')),
  format text,
  started_at date,
  finished_at date,
  rating int check (rating between 1 and 5),
  isbn text,
  created_at timestamptz not null default now()
);

create table library_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind text not null default 'note' check (kind in ('note', 'quote', 'journal')),
  source text,
  body text not null,
  tags text[] not null default '{}',
  image_url text,
  flagged_for_review boolean not null default false,
  book_id uuid references books (id) on delete set null,
  created_at timestamptz not null default now()
);

create table highlights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  book_id uuid not null references books (id) on delete cascade,
  quote text not null,
  created_at timestamptz not null default now()
);

create table highlight_thoughts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  highlight_id uuid not null references highlights (id) on delete cascade,
  thought text not null,
  created_at timestamptz not null default now()
);

-- ── inventory ──────────────────────────────────────────────────────────────
create table inventory_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  photo_url text,
  location text,
  added_at timestamptz not null default now(),
  removed_at timestamptz
);

-- ── capture / notifications ───────────────────────────────────────────────
create table capture_inbox (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  raw_text text not null,
  source text not null default 'text' check (source in ('text', 'voice')),
  parsed_result jsonb,
  created_at timestamptz not null default now()
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ── settings / integrations ───────────────────────────────────────────────
create table integration_status (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  provider text not null,
  connected boolean not null default false,
  last_synced_at timestamptz,
  unique (user_id, provider)
);

create table user_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique default auth.uid() references auth.users (id) on delete cascade,
  timezone text not null default 'UTC'
);

-- ── row level security: every table is private to its owner ───────────────
-- RLS policies only take effect once the role also holds the underlying SQL
-- grant — Supabase doesn't auto-grant on tables created outside the dashboard.
do $$
declare
  t text;
begin
  for t in
    select unnest(array[
      'domains', 'projects', 'milestones', 'checklist_templates', 'checklist_template_items',
      'content_items', 'checklists', 'checklist_items', 'activity_logs', 'tasks',
      'routines', 'routine_completions', 'people', 'people_facts', 'people_interactions',
      'books', 'library_notes', 'highlights', 'highlight_thoughts', 'inventory_items',
      'capture_inbox', 'notifications', 'integration_status', 'user_settings'
    ])
  loop
    execute format('grant select, insert, update, delete on %I to authenticated', t);
    execute format('alter table %I enable row level security', t);
    execute format(
      'create policy "owner_only" on %I for all using (user_id = auth.uid()) with check (user_id = auth.uid())',
      t
    );
  end loop;
end $$;

-- new tables from later migrations should be usable by authenticated users
-- without needing a matching grant statement remembered every time.
alter default privileges in schema public grant select, insert, update, delete on tables to authenticated;
