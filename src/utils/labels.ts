import { getLocale, type Locale } from '../i18n/locale'
import { translate, type MessageKey } from '../i18n/translate'
import type { DocumentCategory, ProjectStatus, TaskPriority, TaskStatus } from '../types'

const statusKey: Record<TaskStatus, MessageKey> = {
  todo: 'statusTodo',
  in_progress: 'statusInProgress',
  review: 'statusReview',
  done: 'statusDone',
}

const priorityKey: Record<TaskPriority, MessageKey> = {
  low: 'priorityLow',
  medium: 'priorityMedium',
  high: 'priorityHigh',
  critical: 'priorityCritical',
}

const projectStatusKey: Record<ProjectStatus, MessageKey> = {
  on_track: 'projectOnTrack',
  at_risk: 'projectAtRisk',
  paused: 'projectPaused',
  completed: 'projectCompleted',
}

const categoryKey: Record<DocumentCategory, MessageKey> = {
  Product: 'categoryProduct',
  Engineering: 'categoryEngineering',
  Design: 'categoryDesign',
  Research: 'categoryResearch',
}

export const taskStatuses: TaskStatus[] = ['todo', 'in_progress', 'review', 'done']
export const priorities: TaskPriority[] = ['low', 'medium', 'high', 'critical']
export const projectStatuses: ProjectStatus[] = ['on_track', 'at_risk', 'paused', 'completed']

export function statusText(status: TaskStatus, locale: Locale = getLocale()): string {
  return translate(locale, statusKey[status])
}

export function priorityText(priority: TaskPriority, locale: Locale = getLocale()): string {
  return translate(locale, priorityKey[priority])
}

export function projectStatusText(status: ProjectStatus, locale: Locale = getLocale()): string {
  return translate(locale, projectStatusKey[status])
}

export function categoryText(category: DocumentCategory, locale: Locale = getLocale()): string {
  return translate(locale, categoryKey[category])
}

const statusAliases: Record<string, TaskStatus> = {
  todo: 'todo',
  in_progress: 'in_progress',
  review: 'review',
  done: 'done',
  'К выполнению': 'todo',
  'В работе': 'in_progress',
  'На проверке': 'review',
  'Готово': 'done',
  'To do': 'todo',
  'In progress': 'in_progress',
  'In review': 'review',
  Done: 'done',
}

export function statusFromMeta(meta: string | undefined, locale: Locale = getLocale()): string {
  if (!meta) return ''
  const status = statusAliases[meta]
  return status ? statusText(status, locale) : meta
}
