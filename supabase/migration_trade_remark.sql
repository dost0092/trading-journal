-- Adds an optional free-form journal remark to each trade.
-- Existing trades keep working; their remark is simply null (shown as empty).
alter table public.trades
  add column if not exists remark text;
