-- Create job_reports table and open insert for anon/authenticated
-- Ensures consistent behavior across environments

-- 0) Ensure extensions available for UUID generation
create extension if not exists "pgcrypto";

-- 1) Create the new table for job reports
create table if not exists public.job_reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- The user's report message
  reason text,

  -- A link to the job post being reported.
  -- ON DELETE SET NULL means if the job post is deleted, we keep the report but the link becomes NULL.
  job_post_id uuid references public.job_postings(id) on delete set null
);

-- 2) Enable Row Level Security (RLS) on the new table
alter table public.job_reports enable row level security;

-- 3) Create a policy to allow ANYONE (public/anon) to INSERT a report
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'job_reports'
      and policyname = 'Allow public insert access for reports'
  ) then
    create policy "Allow public insert access for reports"
    on public.job_reports
    for insert
    to anon, authenticated
    with check (true);
  end if;
end $$;
