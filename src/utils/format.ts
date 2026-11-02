export function parseDate(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return new Date(value)

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (!year || !month || !day) return new Date(value)
  return new Date(year, month - 1, day)
}

export function formatShortDate(value: string): string {
  return parseDate(value).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' })
}

export function plural(count: number, one: string, few: string, many: string): string {
  const abs = Math.abs(count) % 100
  const last = abs % 10
  if (abs > 10 && abs < 20) return many
  if (last > 1 && last < 5) return few
  if (last === 1) return one
  return many
}

export interface DeadlineLabel {
  label: string
  overdue: boolean
}

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

export function formatDeadline(value: string, now = new Date()): DeadlineLabel {
  const date = parseDate(value)
  if (Number.isNaN(date.getTime())) return { label: 'Нет даты', overdue: false }

  const diffDays = Math.round((startOfDay(date) - startOfDay(now)) / 86_400_000)
  if (diffDays < 0) return { label: formatShortDate(value), overdue: true }
  if (diffDays === 0) return { label: 'Сегодня', overdue: false }
  if (diffDays === 1) return { label: 'Завтра', overdue: false }
  return { label: formatShortDate(value), overdue: false }
}

export function formatRelative(value: string, now = Date.now()): string {
  const diff = now - parseDate(value).getTime()
  const minutes = Math.round(diff / 60_000)
  if (Number.isNaN(minutes) || minutes < 1) return 'Только что'
  if (minutes < 60) return `${minutes} мин назад`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} ч назад`
  const days = Math.round(hours / 24)
  if (days === 1) return 'Вчера'
  if (days < 7) return `${days} дн. назад`
  return formatShortDate(value)
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} Б`
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} КБ`
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} МБ`
}

export function plusDays(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}
