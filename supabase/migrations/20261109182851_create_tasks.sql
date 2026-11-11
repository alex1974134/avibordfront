-- Tasks on a saved board. Assignee is a board member id (text, same as board_members.user_id).

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards (id) on delete cascade,
  workspace_id text not null,
  title text not null,
  assignee_id text not null,
  priority text not null default 'medium'
    check (priority in ('low', 'medium', 'high', 'critical')),
  status text not null default 'todo'
    check (status in ('todo', 'in_progress', 'review', 'done')),
  deadline date not null,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index tasks_board_id_idx on public.tasks (board_id);

alter table public.tasks enable row level security;

create policy tasks_select_authenticated
  on public.tasks
  for select
  to authenticated
  using (true);

create policy tasks_insert_authenticated
  on public.tasks
  for insert
  to authenticated
  with check (
    created_by = (select auth.uid())
    and exists (
      select 1
      from public.board_members m
      where m.board_id = tasks.board_id
        and m.user_id = tasks.assignee_id
    )
  );

create policy tasks_update_authenticated
  on public.tasks
  for update
  to authenticated
  using (true)
  with check (
    exists (
      select 1
      from public.board_members m
      where m.board_id = tasks.board_id
        and m.user_id = tasks.assignee_id
    )
  );

create policy tasks_delete_authenticated
  on public.tasks
  for delete
  to authenticated
  using (true);

create or replace function public.sync_board_task_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.boards
      set task_count = task_count + 1
      where id = new.board_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.boards
      set task_count = greatest(task_count - 1, 0)
      where id = old.board_id;
    return old;
  end if;
  return null;
end;
$$;

revoke all on function public.sync_board_task_count() from public, anon, authenticated;

create trigger tasks_sync_board_count
  after insert or delete on public.tasks
  for each row
  execute function public.sync_board_task_count();

grant select, insert, update, delete on public.tasks to anon, authenticated, service_role;
