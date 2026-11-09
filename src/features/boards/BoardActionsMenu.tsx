import { useRef, useState } from 'react'
import { MoreHorizontal } from 'lucide-react'
import { useDismiss } from '../../hooks/useDismiss'
import { useI18n } from '../../i18n/useI18n'
import { IconButton } from '../../components/ui/IconButton'
import { cn } from '../../utils/cn'

export function BoardActionsMenu({
  onOpen,
  onEdit,
  onDelete,
  align = 'right',
}: {
  onOpen?: () => void
  onEdit: () => void
  onDelete: () => void
  align?: 'left' | 'right'
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { t } = useI18n()
  useDismiss(open, ref, () => setOpen(false))

  const run = (action: () => void) => {
    setOpen(false)
    action()
  }

  return (
    <div ref={ref} className="relative shrink-0" onClick={(event) => event.stopPropagation()}>
      <IconButton
        label={t('boardActions')}
        className={cn('h-7 w-7', open && 'bg-zinc-100 text-ink')}
        onClick={() => setOpen((value) => !value)}
      >
        <MoreHorizontal className="h-4 w-4" />
      </IconButton>
      {open ? (
        <ul
          role="menu"
          className={cn(
            'absolute z-20 mt-1 w-40 rounded-lg border border-line bg-white p-1 shadow-lg',
            align === 'right' ? 'right-0' : 'left-0',
          )}
        >
          {onOpen ? (
            <li role="none">
              <button
                type="button"
                role="menuitem"
                onClick={() => run(onOpen)}
                className="flex w-full cursor-pointer rounded-md px-2 py-1.5 text-left text-xs text-ink hover:bg-zinc-50"
              >
                {t('openBoard')}
              </button>
            </li>
          ) : null}
          <li role="none">
            <button
              type="button"
              role="menuitem"
              onClick={() => run(onEdit)}
              className="flex w-full cursor-pointer rounded-md px-2 py-1.5 text-left text-xs text-ink hover:bg-zinc-50"
            >
              {t('editBoard')}
            </button>
          </li>
          <li role="none">
            <button
              type="button"
              role="menuitem"
              onClick={() => run(onDelete)}
              className="flex w-full cursor-pointer rounded-md px-2 py-1.5 text-left text-xs text-rose-700 hover:bg-rose-50"
            >
              {t('deleteBoard')}
            </button>
          </li>
        </ul>
      ) : null}
    </div>
  )
}
