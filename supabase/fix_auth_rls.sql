-- Run this in Supabase SQL Editor to fix auth, RLS, and superadmin accounts

-- Avoid RLS recursion when checking superadmin role
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

drop policy if exists "Superadmin can read all profiles" on public.profiles;
create policy "Superadmin can read all profiles"
  on public.profiles for select
  using (public.is_superadmin());

drop policy if exists "Superadmin can update all profiles" on public.profiles;
create policy "Superadmin can update all profiles"
  on public.profiles for update
  using (public.is_superadmin());

drop policy if exists "Superadmin read all trades" on public.trades;
create policy "Superadmin read all trades"
  on public.trades for select
  using (public.is_superadmin());

-- Create or repair profile for the signed-in user
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

-- Fix your superadmin accounts now
update public.profiles
set role = 'superadmin', status = 'approved'
where lower(email) in (
  'waqasdostdost0092@gmail.com',
  'waqaskhan.dost0092@gmail.com'
);

-- Create profiles for auth users that have no profile row yet
insert into public.profiles (id, email, full_name, role, status)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
  case
    when lower(u.email) in (
      'waqasdostdost0092@gmail.com',
      'waqaskhan.dost0092@gmail.com'
    ) then 'superadmin'
    else 'user'
  end,
  case
    when lower(u.email) in (
      'waqasdostdost0092@gmail.com',
      'waqaskhan.dost0092@gmail.com'
    ) then 'approved'
    else 'pending'
  end
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id);
