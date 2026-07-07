-- Run in Supabase SQL Editor: superadmin can view other users' trades (Manage Users → View trades)
-- Regular journal pages still filter by own user_id in the app.

drop policy if exists "Superadmin read all trades" on public.trades;
create policy "Superadmin read all trades"
  on public.trades for select
  to authenticated
  using (public.is_superadmin());

drop policy if exists "Superadmin read all trade images" on storage.objects;
create policy "Superadmin read all trade images"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'trade-images'
    and public.is_superadmin()
  );
