-- Performance indexes for Trading Journal
-- Run in Supabase Dashboard → SQL Editor

-- Trades: user-scoped listing ordered by date/time (fetchUserTrades)
create index if not exists idx_trades_user_date_time
  on public.trades (user_id, date desc, time desc);

-- Trades: strategy filtering within a user
create index if not exists idx_trades_user_strategy
  on public.trades (user_id, strategy);

-- Profiles: admin pending-user lookups
create index if not exists idx_profiles_status
  on public.profiles (status)
  where status = 'pending';

-- Profiles: role checks for superadmin
create index if not exists idx_profiles_role
  on public.profiles (role)
  where role = 'superadmin';
