import { supabase } from './supabase'
import type { Task, TaskPriority, TaskStatus } from '../types'

interface TaskRow {
  id: string
  board_id: string
  workspace_id: string
  title: string
  assignee_id: string
  priority: TaskPriority
  status: TaskStatus
  deadline: string
  created_at: string
}

function toTask(row: TaskRow): Task {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    projectId: row.board_id,
    title: row.title,
    assigneeId: row.assignee_id,
    priority: row.priority,
    status: row.status,
    deadline: row.deadline,
    createdAt: row.created_at,
  }
}

const taskColumns = 'id, board_id, workspace_id, title, assignee_id, priority, status, deadline, created_at'

export async function fetchBoardTasks(boardIds: string[]): Promise<Task[]> {
  if (boardIds.length === 0) return []
  const { data, error } = await supabase
    .from('tasks')
    .select(taskColumns)
    .in('board_id', boardIds)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data as TaskRow[]).map(toTask)
}

export async function createBoardTask(input: {
  boardId: string
  workspaceId: string
  title: string
  assigneeId: string
  priority: TaskPriority
  status: TaskStatus
  deadline: string
  createdBy: string
}): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      board_id: input.boardId,
      workspace_id: input.workspaceId,
      title: input.title,
      assignee_id: input.assigneeId,
      priority: input.priority,
      status: input.status,
      deadline: input.deadline,
      created_by: input.createdBy,
    })
    .select(taskColumns)
    .single()
  if (error || !data) throw error ?? new Error('Task insert failed')
  return toTask(data as TaskRow)
}

export async function updateBoardTask(
  id: string,
  patch: {
    title?: string
    assigneeId?: string
    priority?: TaskPriority
    status?: TaskStatus
    deadline?: string
  },
): Promise<void> {
  const row: {
    title?: string
    assignee_id?: string
    priority?: TaskPriority
    status?: TaskStatus
    deadline?: string
  } = {}
  if (patch.title !== undefined) row.title = patch.title
  if (patch.assigneeId !== undefined) row.assignee_id = patch.assigneeId
  if (patch.priority !== undefined) row.priority = patch.priority
  if (patch.status !== undefined) row.status = patch.status
  if (patch.deadline !== undefined) row.deadline = patch.deadline
  const { error } = await supabase.from('tasks').update(row).eq('id', id)
  if (error) throw error
}

export async function deleteBoardTask(id: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) throw error
}
