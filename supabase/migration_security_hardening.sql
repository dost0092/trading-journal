-- Run in Supabase SQL Editor (safe to re-run)
-- Creates missing tables first, then applies per-user security hardening.

-- ---------------------------------------------------------------------------
-- 1. Helper functions (required by policies below)
-- ---------------------------------------------------------------------------

create or replace function public.is_superadmin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'superadmin'
  );
$$;

grant execute on function public.is_superadmin() to authenticated;

create or replace function public.is_approved()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and (role = 'superadmin' or status = 'approved')
  );
$$;

grant execute on function public.is_approved() to authenticated;

-- ---------------------------------------------------------------------------
-- 2. Create missing tables (your DB was missing user_strategy_configs)
-- ---------------------------------------------------------------------------

create table if not exists public.trades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  time text not null,
  session text not null,
  direction text not null,
  risk_percent numeric not null,
  lot_size numeric not null,
  entry numeric not null,
  stop_loss numeric not null,
  take_profit numeric not null,
  result text not null,
  strategy text not null,
  rules_met jsonb not null default '[]',
  rule_labels jsonb not null default '{}',
  image_url text,
  created_at timestamptz not null default now()
);

alter table public.trades
  add column if not exists rule_labels jsonb not null default '{}';

create table if not exists public.user_strategy_configs (
  user_id uuid primary key references auth.users (id) on delete cascade,
  strategy_names jsonb not null,
  rules_by_strategy jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.trades enable row level security;
alter table public.user_strategy_configs enable row level security;

-- ---------------------------------------------------------------------------
-- 3. Profile protection (users cannot self-approve or change role)
-- ---------------------------------------------------------------------------

create or replace function public.protect_profile_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_superadmin() then
    new.role := old.role;
    new.status := old.status;
    new.email := old.email;
    new.id := old.id;
    new.created_at := old.created_at;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_before_update on public.profiles;
create trigger protect_profile_before_update
  before update on public.profiles
  for each row
  execute function public.protect_profile_fields();

-- ---------------------------------------------------------------------------
-- 4. Trades policies — each user only sees/edits their own rows
-- ---------------------------------------------------------------------------

drop policy if exists "Users manage own trades" on public.trades;
drop policy if exists "Approved users manage own trades" on public.trades;
create policy "Approved users manage own trades"
  on public.trades for all
  using (auth.uid() = user_id and public.is_approved())
  with check (auth.uid() = user_id and public.is_approved());

-- Remove cross-user trade access for superadmins (each user sees only their own journal)
drop policy if exists "Superadmin read all trades" on public.trades;

-- ---------------------------------------------------------------------------
-- 5. Strategy config policies — each user only sees/edits their own rules
-- ---------------------------------------------------------------------------

drop policy if exists "Users manage own strategy config" on public.user_strategy_configs;
drop policy if exists "Approved users manage own strategy config" on public.user_strategy_configs;
create policy "Approved users manage own strategy config"
  on public.user_strategy_configs for all
  using (auth.uid() = user_id and public.is_approved())
  with check (auth.uid() = user_id and public.is_approved());

-- ---------------------------------------------------------------------------
-- 6. Trade images — private bucket, owner-only access
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('trade-images', 'trade-images', false)
on conflict (id) do update set public = false;

drop policy if exists "Anyone read trade images" on storage.objects;
drop policy if exists "Users read own trade images" on storage.objects;
create policy "Users read own trade images"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'trade-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users upload own trade images" on storage.objects;
create policy "Users upload own trade images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'trade-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users delete own trade images" on storage.objects;
create policy "Users delete own trade images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'trade-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users update own trade images" on storage.objects;
create policy "Users update own trade images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'trade-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
