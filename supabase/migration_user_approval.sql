-- Run this if you ALREADY ran the old schema.sql (adds approval + superadmin emails)

alter table public.profiles
  add column if not exists status text not null default 'pending';

alter table public.profiles drop constraint if exists profiles_status_check;
alter table public.profiles
  add constraint profiles_status_check check (status in ('pending', 'approved', 'rejected'));

update public.profiles
set role = 'superadmin', status = 'approved'
where lower(email) in (
  'waqasdostdost0092@gmail.com',
  'waqaskhan.dost0092@gmail.com'
);

update public.profiles
set status = 'approved'
where role = 'superadmin';

drop policy if exists "Superadmin can update all profiles" on public.profiles;
create policy "Superadmin can update all profiles"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'superadmin'
    )
  );

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
