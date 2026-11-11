import { useEffect, useRef, useState } from 'react'
import { useDismiss } from '../../hooks/useDismiss'
import type { User } from '../../types'
import { useI18n } from '../../i18n/useI18n'
import { cn } from '../../utils/cn'
import { Avatar } from '../../components/ui/Avatar'

export function AssigneeMenu({
  assignee,
  users,
  onChange,
}: {
  assignee: User | undefined
  users: User[]
  onChange: (userId: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { t } = useI18n()
  useDismiss(open, ref, () => setOpen(false))

  useEffect(() => {
    setOpen(false)
  }, [assignee?.id])

  return (
    <div ref={ref} data-no-drag className="relative min-w-0">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={assignee ? assignee.name : t('assignTask')}
        disabled={users.length === 0}
        onClick={() => setOpen((value) => !value)}
        className="flex max-w-full cursor-pointer items-center gap-1.5 rounded-md py-0.5 pr-1 text-left text-[11px] text-muted hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {assignee ? <Avatar user={assignee} size="xs" /> : null}
        <span className="truncate">{assignee?.name ?? t('assignTask')}</span>
      </button>
      {open ? (
        <ul
          role="listbox"
          className="absolute left-0 z-20 mt-1 max-h-48 w-48 overflow-y-auto rounded-lg border border-line bg-white p-1 shadow-lg"
        >
          {users.map((user) => (
            <li key={user.id}>
              <button
                type="button"
                role="option"
                aria-selected={user.id === assignee?.id}
                onClick={() => onChange(user.id)}
                className={cn(
                  'flex w-full cursor-pointer items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-xs',
                  user.id === assignee?.id ? 'bg-accent-soft font-medium text-accent' : 'text-ink hover:bg-zinc-50',
                )}
              >
                <Avatar user={user} size="xs" />
                <span className="truncate">{user.name}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
