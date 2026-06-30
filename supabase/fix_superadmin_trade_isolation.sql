-- Run in Supabase SQL Editor: stop superadmins from seeing other users' trades

drop policy if exists "Superadmin read all trades" on public.trades;
