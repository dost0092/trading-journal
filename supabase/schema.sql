-- Run this in Supabase Dashboard → SQL Editor

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'user' check (role in ('user', 'superadmin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Superadmin can read all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'superadmin'
    )
  );

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'user'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Make yourself superadmin (replace with your email after signup):
-- update public.profiles set role = 'superadmin' where email = 'you@email.com';

-- Future: trades table (ready for next step)
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
  image_url text,
  created_at timestamptz not null default now()
);

alter table public.trades enable row level security;

create policy "Users manage own trades"
  on public.trades for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Superadmin read all trades"
  on public.trades for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'superadmin'
    )
  );
