import { useI18n } from '../../i18n/useI18n'
import type { Locale } from '../../i18n/locale'
import { cn } from '../../utils/cn'

const options: Locale[] = ['ru', 'en']

export function LanguageSwitch() {
  const { locale, setLocale, t } = useI18n()

  return (
    <div role="group" aria-label={t('language')} className="flex h-8 items-center rounded-lg border border-line bg-white p-0.5">
      {options.map((item) => {
        const active = locale === item
        return (
          <button
            key={item}
            type="button"
            aria-pressed={active}
            onClick={() => setLocale(item)}
            className={cn(
              'h-7 cursor-pointer rounded-md px-2 text-xs font-semibold tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30',
              active ? 'bg-accent-soft text-accent' : 'text-muted hover:text-ink',
            )}
          >
            {item.toUpperCase()}
          </button>
        )
      })}
    </div>
  )
}
