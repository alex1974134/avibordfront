import type { DocumentCategory, ProjectStatus, TaskPriority, TaskStatus } from '../types'

export const taskStatusLabel: Record<TaskStatus, string> = {
  todo: 'К выполнению',
  in_progress: 'В работе',
  review: 'На проверке',
  done: 'Готово',
}

export const taskStatuses: TaskStatus[] = ['todo', 'in_progress', 'review', 'done']

export const priorityLabel: Record<TaskPriority, string> = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
  critical: 'Критический',
}

export const priorities: TaskPriority[] = ['low', 'medium', 'high', 'critical']

export const projectStatusLabel: Record<ProjectStatus, string> = {
  on_track: 'По плану',
  at_risk: 'Есть риск',
  paused: 'На паузе',
  completed: 'Завершён',
}

export const documentCategoryLabel: Record<DocumentCategory, string> = {
  Product: 'Продукт',
  Engineering: 'Разработка',
  Design: 'Дизайн',
  Research: 'Исследования',
}

export const projectStatuses: ProjectStatus[] = ['on_track', 'at_risk', 'paused', 'completed']
