import { supabase } from './supabase'
import type { Project, ProjectStatus } from '../types'

interface BoardRow {
  id: string
  workspace_id: string
  name: string
  description: string
  status: ProjectStatus
  progress: number
  task_count: number
  deadline: string
  board_members: { user_id: string }[] | null
}

function toProject(row: BoardRow): Project {
  const memberIds = row.board_members?.map((item) => item.user_id) ?? []
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    name: row.name,
    description: row.description,
    status: row.status,
    progress: row.progress,
    taskCount: row.task_count,
    deadline: row.deadline,
    memberIds,
  }
}

export async function fetchBoards(workspaceId: string): Promise<Project[]> {
  const { data, error } = await supabase
    .from('boards')
    .select('id, workspace_id, name, description, status, progress, task_count, deadline, board_members(user_id)')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data as BoardRow[]).map(toProject)
}

export async function createBoard(input: {
  workspaceId: string
  name: string
  description: string
  memberIds: string[]
  createdBy: string
  deadline: string
}): Promise<Project> {
  const { data: board, error } = await supabase
    .from('boards')
    .insert({
      workspace_id: input.workspaceId,
      name: input.name,
      description: input.description,
      deadline: input.deadline,
      created_by: input.createdBy,
    })
    .select('id, workspace_id, name, description, status, progress, task_count, deadline')
    .single()
  if (error || !board) throw error ?? new Error('Board insert failed')

  const memberIds = [...new Set(input.memberIds)]
  if (memberIds.length > 0) {
    const { error: membersError } = await supabase.from('board_members').insert(
      memberIds.map((user_id) => ({ board_id: board.id, user_id })),
    )
    if (membersError) throw membersError
  }

  return {
    id: board.id,
    workspaceId: board.workspace_id,
    name: board.name,
    description: board.description,
    status: board.status,
    progress: board.progress,
    taskCount: board.task_count,
    deadline: board.deadline,
    memberIds,
  }
}
