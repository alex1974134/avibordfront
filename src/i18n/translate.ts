import { getLocale, type Locale } from './locale'
import { messages, type MessageKey } from './messages'

export type { Locale, MessageKey }

export function translate(locale: Locale, key: MessageKey, vars?: Record<string, string | number>): string {
  const template = messages[locale][key]
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? ''))
}

export function t(key: MessageKey, vars?: Record<string, string | number>): string {
  return translate(getLocale(), key, vars)
}
