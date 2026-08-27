-- Career hub: job applications (kanban), courses, certificates, and a
-- career-specific contacts list kept separate from the personal People CRM.

create table job_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  company text not null,
  role text not null,
  status text not null default 'saved' check (status in ('saved', 'applied', 'interviewing', 'offer', 'rejected', 'archived')),
  deadline date,
  job_link text,
  resume_version text,
  notes text,
  next_follow_up date,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index job_applications_user_status_idx on job_applications (user_id, status);

create table courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  platform text,
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'paused', 'completed')),
  progress_percent int not null default 0 check (progress_percent between 0 and 100),
  deadline date,
  next_lesson text,
  notes text,
  course_link text,
  created_at timestamptz not null default now()
);

create table certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null,
  issuer text,
  earned_date date,
  expiry_date date,
  credential_link text,
  file_link text,
  related_skills text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table career_contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  relationship_type text not null default 'contact' check (relationship_type in ('recruiter', 'mentor', 'referral', 'company_contact', 'contact')),
  company text,
  last_contacted date,
  next_follow_up date,
  notes text,
  created_at timestamptz not null default now()
);

do $$
declare
  t text;
begin
  for t in
    select unnest(array['job_applications', 'courses', 'certificates', 'career_contacts'])
  loop
    execute format('alter table %I enable row level security', t);
    execute format(
      'create policy "owner_only" on %I for all using (user_id = auth.uid()) with check (user_id = auth.uid())',
      t
    );
  end loop;
end $$;
