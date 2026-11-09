-- Boards (projects) scoped by workspace, with member access list.

create table public.boards (
  id uuid primary key default gen_random_uuid(),
  workspace_id text not null,
  name text not null,
  description text not null default '',
  status text not null default 'on_track'
    check (status in ('on_track', 'at_risk', 'paused', 'completed')),
  progress integer not null default 0
    check (progress >= 0 and progress <= 100),
  task_count integer not null default 0
    check (task_count >= 0),
  deadline date not null,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.board_members (
  board_id uuid not null references public.boards (id) on delete cascade,
  user_id text not null,
  primary key (board_id, user_id)
);

alter table public.boards enable row level security;
alter table public.board_members enable row level security;

create policy boards_select_authenticated
  on public.boards
  for select
  to authenticated
  using (true);

create policy boards_insert_own
  on public.boards
  for insert
  to authenticated
  with check (created_by = auth.uid());

create policy board_members_select_authenticated
  on public.board_members
  for select
  to authenticated
  using (true);

create policy board_members_insert_via_board
  on public.board_members
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.boards b
      where b.id = board_members.board_id
        and b.created_by = auth.uid()
    )
  );
