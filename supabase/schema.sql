-- Run this in Supabase Dashboard → SQL Editor (fresh project)

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'user' check (role in ('user', 'superadmin')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

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

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Superadmin can read all profiles"
  on public.profiles for select
  using (public.is_superadmin());

create policy "Superadmin can update all profiles"
  on public.profiles for update
  using (public.is_superadmin());

-- Auto-create profile on signup; superadmin emails get instant access
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  user_role text := 'user';
  user_status text := 'pending';
begin
  if lower(new.email) in (
    'waqasdostdost0092@gmail.com',
    'waqaskhan.dost0092@gmail.com'
  ) then
    user_role := 'superadmin';
    user_status := 'approved';
  end if;

  insert into public.profiles (id, email, full_name, role, status)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    user_role,
    user_status
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.ensure_user_profile()
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  u auth.users%rowtype;
  p public.profiles%rowtype;
  user_role text := 'user';
  user_status text := 'pending';
begin
  select * into u from auth.users where id = auth.uid();
  if not found then
    raise exception 'Not authenticated';
  end if;

  if lower(u.email) in (
    'waqasdostdost0092@gmail.com',
    'waqaskhan.dost0092@gmail.com'
  ) then
    user_role := 'superadmin';
    user_status := 'approved';
  end if;

  insert into public.profiles (id, email, full_name, role, status)
  values (
    u.id,
    u.email,
    coalesce(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
    user_role,
    user_status
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(public.profiles.full_name, excluded.full_name),
    role = case
      when lower(excluded.email) in (
        'waqasdostdost0092@gmail.com',
        'waqaskhan.dost0092@gmail.com'
      ) then 'superadmin'
      else public.profiles.role
    end,
    status = case
      when lower(excluded.email) in (
        'waqasdostdost0092@gmail.com',
        'waqaskhan.dost0092@gmail.com'
      ) then 'approved'
      when public.profiles.role = 'superadmin' then 'approved'
      else public.profiles.status
    end
  returning * into p;

  return p;
end;
$$;

grant execute on function public.ensure_user_profile() to authenticated;

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
  using (public.is_superadmin());
