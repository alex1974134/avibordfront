import { asTeamRole, roleText, teamRoleIds, type TeamRoleId } from '../../i18n/content'
import type { Locale } from '../../i18n/locale'
import type { OpenRouterChatMessage } from '../../lib/openrouter'
import type { User } from '../../types'

function rosterLine(member: User, locale: Locale): string {
  const teamRole = asTeamRole(member.role)
  const roleLabel = roleText(locale, member.role)
  const id = teamRole ?? 'unknown'
  return `- id: ${member.id}; name: ${member.name}; teamRole: ${id}; roleLabel: ${roleLabel}`
}

function systemContent(locale: Locale, members: User[]): string {
  const roles = teamRoleIds.join('|')
  const roster = members.map((member) => rosterLine(member, locale)).join('\n')

  if (locale === 'en') {
    return [
      'You are a task planner for AivibeBoard. Break the user goal into 4 to 10 actionable tasks.',
      'Assign each task to the best teamRole from the board roster. Use only assigneeRole values from this list:',
      roles,
      'Board members (use teamRole for assigneeRole, not id):',
      roster,
      'Respond with JSON only, no markdown. Schema:',
      '{"summary":"string","tasks":[{"title":"string","detail":"string","priority":"low|medium|high|critical","estimate":"string","assigneeRole":"one of team roles"}]}',
    ].join('\n')
  }

  return [
    'Ты планировщик задач AivibeBoard. Разбей цель пользователя на 4–10 конкретных задач.',
    'Для каждой задачи выбери подходящий teamRole из состава доски. assigneeRole только из списка:',
    roles,
    'Участники доски (в assigneeRole пиши teamRole, не id):',
    roster,
    'Ответ — только JSON, без markdown. Схема:',
    '{"summary":"string","tasks":[{"title":"string","detail":"string","priority":"low|medium|high|critical","estimate":"string","assigneeRole":"одна из ролей"}]}',
  ].join('\n')
}

export function buildDecomposeMessages(
  goal: string,
  members: User[],
  locale: Locale,
): OpenRouterChatMessage[] {
  return [
    { role: 'system', content: systemContent(locale, members) },
    { role: 'user', content: goal.trim() },
  ]
}

export type { TeamRoleId }
