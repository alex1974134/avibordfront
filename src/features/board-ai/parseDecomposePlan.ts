import { asTeamRole, isTeamRole, teamRoleIds, type TeamRoleId } from '../../i18n/content'
import type { GeneratedTask, TaskPriority, User } from '../../types'

const priorities: TaskPriority[] = ['low', 'medium', 'high', 'critical']

const roleAliases: Record<string, TeamRoleId> = {
  design: 'designer',
  ui: 'designer',
  ux: 'designer',
  test: 'qa',
  testing: 'qa',
  ops: 'devops',
  sysadmin: 'admin',
  pm: 'pm',
  lead: 'lead',
  mobile: 'mobile',
  ios: 'mobile',
  android: 'mobile',
  fe: 'frontend',
  be: 'backend',
}

function normalizeRole(raw: string): TeamRoleId | null {
  const key = raw.trim().toLowerCase()
  if (isTeamRole(key)) return key
  if (roleAliases[key]) return roleAliases[key]
  for (const id of teamRoleIds) {
    if (key.includes(id)) return id
  }
  return null
}

function resolveAssignee(role: TeamRoleId | null, members: User[], index: number): string {
  if (role) {
    const exact = members.find((member) => asTeamRole(member.role) === role)
    if (exact) return exact.id
  }
  return members[index % members.length]?.id ?? members[0]?.id ?? ''
}

function parsePriority(value: unknown): TaskPriority {
  if (typeof value === 'string' && (priorities as readonly string[]).includes(value)) {
    return value as TaskPriority
  }
  return 'medium'
}

export interface DecomposePlan {
  summary: string
  tasks: GeneratedTask[]
}

export function parseDecomposePlan(raw: string, members: User[]): DecomposePlan {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error('Invalid AI JSON')
  }

  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('Invalid AI JSON')
  }

  const summary = typeof (parsed as { summary?: unknown }).summary === 'string'
    ? (parsed as { summary: string }).summary
    : ''

  const list = (parsed as { tasks?: unknown }).tasks
  if (!Array.isArray(list) || list.length === 0) {
    throw new Error('No tasks in AI response')
  }

  const tasks = list.map((item, index) => {
    if (typeof item !== 'object' || item === null) {
      throw new Error('Invalid task entry')
    }
    const row = item as Record<string, unknown>
    const title = typeof row.title === 'string' ? row.title.trim() : ''
    if (!title) throw new Error('Task missing title')

    const detail = typeof row.detail === 'string' ? row.detail.trim() : ''
    const estimate = typeof row.estimate === 'string' ? row.estimate.trim() : ''
    const roleRaw = typeof row.assigneeRole === 'string' ? row.assigneeRole : ''
    const role = normalizeRole(roleRaw)

    return {
      id: crypto.randomUUID(),
      title,
      detail,
      priority: parsePriority(row.priority),
      estimate: estimate || '—',
      assigneeId: resolveAssignee(role, members, index),
    }
  })

  return { summary, tasks }
}
