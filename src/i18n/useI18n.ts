import { useCallback } from 'react'
import { useLocaleStore, type Locale } from './locale'
import { translate, type MessageKey } from './translate'

export function useI18n() {
  const locale = useLocaleStore((state) => state.locale)
  const setLocale = useLocaleStore((state) => state.setLocale)
  const t = useCallback(
    (key: MessageKey, vars?: Record<string, string | number>) => translate(locale, key, vars),
    [locale],
  )
  return { locale, setLocale, t }
}

export type { Locale, MessageKey }
