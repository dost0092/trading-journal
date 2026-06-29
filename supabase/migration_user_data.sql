-- Run in Supabase SQL Editor (per-user journal data)

alter table public.trades
  add column if not exists rule_labels jsonb not null default '{}';

create table if not exists public.user_strategy_configs (
  user_id uuid primary key references auth.users (id) on delete cascade,
  strategy_names jsonb not null,
  rules_by_strategy jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.user_strategy_configs enable row level security;

drop policy if exists "Users manage own strategy config" on public.user_strategy_configs;
create policy "Users manage own strategy config"
  on public.user_strategy_configs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Trade image storage
insert into storage.buckets (id, name, public)
values ('trade-images', 'trade-images', true)
on conflict (id) do nothing;

drop policy if exists "Users upload own trade images" on storage.objects;
create policy "Users upload own trade images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'trade-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Anyone read trade images" on storage.objects;
create policy "Anyone read trade images"
  on storage.objects for select
  using (bucket_id = 'trade-images');

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
