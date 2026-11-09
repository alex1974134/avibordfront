import { useEffect, useRef, useState } from 'react'
import { useDismiss } from '../../hooks/useDismiss'
import type { TaskStatus } from '../../types'
import { cn } from '../../utils/cn'
import { useI18n } from '../../i18n/useI18n'
import { statusText, taskStatuses } from '../../utils/labels'

const tones: Record<TaskStatus, string> = {
  todo: 'bg-zinc-100 text-zinc-600',
  in_progress: 'bg-accent-soft text-accent',
  review: 'bg-amber-50 text-amber-800',
  done: 'bg-emerald-50 text-emerald-800',
}

export function StatusMenu({ status, onChange }: { status: TaskStatus; onChange: (status: TaskStatus) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { locale, t } = useI18n()
  useDismiss(open, ref, () => setOpen(false))

  useEffect(() => {
    setOpen(false)
  }, [status])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('statusLabel', { status: statusText(status, locale) })}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          'cursor-pointer rounded-md px-1.5 py-0.5 text-[11px] font-medium whitespace-nowrap',
          tones[status],
        )}
      >
        {statusText(status, locale)}
      </button>
      {open ? (
        <ul
          role="listbox"
          className="absolute right-0 z-20 mt-1 w-36 rounded-lg border border-line bg-white p-1 shadow-lg"
        >
          {taskStatuses.map((item) => (
            <li key={item}>
              <button
                type="button"
                role="option"
                aria-selected={item === status}
                onClick={() => onChange(item)}
                className={cn(
                  'flex w-full cursor-pointer rounded-md px-2 py-1.5 text-left text-xs',
                  item === status ? 'bg-accent-soft font-medium text-accent' : 'text-ink hover:bg-zinc-50',
                )}
              >
                {statusText(item, locale)}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
