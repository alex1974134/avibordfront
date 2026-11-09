import { getLocale, type Locale } from '../i18n/locale'
import { translate } from '../i18n/translate'

function dateLocale(locale: Locale): string {
  return locale === 'ru' ? 'ru-RU' : 'en-US'
}

export function parseDate(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return new Date(value)

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (!year || !month || !day) return new Date(value)
  return new Date(year, month - 1, day)
}

export function formatShortDate(value: string, locale: Locale = getLocale()): string {
  return parseDate(value).toLocaleDateString(dateLocale(locale), { month: 'short', day: 'numeric' })
}

export function noun(locale: Locale, count: number, ru: [string, string, string], en: [string, string]): string {
  if (locale === 'en') return Math.abs(count) === 1 ? en[0] : en[1]
  return plural(count, ru[0], ru[1], ru[2])
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

export function formatDeadline(value: string, now = new Date(), locale: Locale = getLocale()): DeadlineLabel {
  const date = parseDate(value)
  if (Number.isNaN(date.getTime())) return { label: translate(locale, 'noDate'), overdue: false }

  const diffDays = Math.round((startOfDay(date) - startOfDay(now)) / 86_400_000)
  if (diffDays < 0) return { label: formatShortDate(value, locale), overdue: true }
  if (diffDays === 0) return { label: translate(locale, 'today'), overdue: false }
  if (diffDays === 1) return { label: translate(locale, 'tomorrow'), overdue: false }
  return { label: formatShortDate(value, locale), overdue: false }
}

export function formatRelative(value: string, now = Date.now(), locale: Locale = getLocale()): string {
  const diff = now - parseDate(value).getTime()
  const minutes = Math.round(diff / 60_000)
  if (Number.isNaN(minutes) || minutes < 1) return translate(locale, 'justNow')
  if (minutes < 60) return translate(locale, 'minutesAgo', { count: minutes })
  const hours = Math.round(minutes / 60)
  if (hours < 24) return translate(locale, 'hoursAgo', { count: hours })
  const days = Math.round(hours / 24)
  if (days === 1) return translate(locale, 'yesterday')
  if (days < 7) return translate(locale, 'daysAgo', { count: days })
  return formatShortDate(value, locale)
}

export function formatBytes(bytes: number, locale: Locale = getLocale()): string {
  if (locale === 'en') {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }
  if (bytes < 1024) return `${bytes} Б`
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} КБ`
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} МБ`
}

export function sizeText(size: string, locale: Locale = getLocale()): string {
  if (locale === 'en') return size.replace(/МБ/g, 'MB').replace(/КБ/g, 'KB').replace(/Б/g, 'B').replace(',', '.')
  return size.replace(/MB/g, 'МБ').replace(/KB/g, 'КБ').replace(/\bB\b/g, 'Б').replace('.', ',')
}

export function plusDays(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}
