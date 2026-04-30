-- Run this once in the Supabase SQL editor to set up the game_saves table.

create table if not exists public.game_saves (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  save_data   jsonb not null default '{}',
  updated_at  timestamptz not null default now()
);

-- Each user has at most one save row (upsert by user_id)
create unique index if not exists game_saves_user_idx on public.game_saves (user_id);

-- Row-level security: users can only see and modify their own save
alter table public.game_saves enable row level security;

drop policy if exists "own save" on public.game_saves;
create policy "own save" on public.game_saves
  for all using (auth.uid() = user_id);
