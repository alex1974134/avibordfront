import type { MessageKey } from '../../i18n/messages'
import { useI18n } from '../../i18n/useI18n'
import { cn } from '../../utils/cn'

export function NumberedSteps({
  title,
  steps,
  tone = 'muted',
}: {
  title: string
  steps: ReadonlyArray<{ title: MessageKey; body: MessageKey }>
  tone?: 'muted' | 'accent'
}) {
  const { t } = useI18n()

  return (
    <>
      <h2 className="text-sm font-semibold text-ink">{title}</h2>
      <ol className="mt-3 flex flex-col gap-3">
        {steps.map((step, index) => (
          <li key={step.title} className="flex gap-3">
            <span
              className={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium',
                tone === 'accent' ? 'bg-accent-soft text-accent' : 'bg-zinc-100 text-muted',
              )}
            >
              {index + 1}
            </span>
            <span>
              <span className="block text-sm font-medium text-ink">{t(step.title)}</span>
              <span className="mt-0.5 block text-xs leading-5 text-muted">{t(step.body)}</span>
            </span>
          </li>
        ))}
      </ol>
    </>
  )
}
