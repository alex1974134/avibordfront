import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { useDismiss } from '../../hooks/useDismiss'
import { useWorkspaceData } from '../../hooks/useWorkspaceData'
import { useAppStore } from '../../store/useAppStore'
import { formatRelative } from '../../utils/format'
import { IconButton } from '../ui/IconButton'

export function NotificationMenu() {
  const navigate = useNavigate()
  const { notifications } = useWorkspaceData()
  const markNotificationRead = useAppStore((state) => state.markNotificationRead)
  const markAllNotificationsRead = useAppStore((state) => state.markAllNotificationsRead)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const unread = notifications.filter((item) => !item.read).length

  useDismiss(open, ref, () => setOpen(false))

  return (
    <div ref={ref} className="relative">
      <IconButton label="Уведомления" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        <Bell className="h-4 w-4" />
      </IconButton>
      {unread > 0 ? (
        <span className="pointer-events-none absolute top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] leading-none font-medium text-white">
          {unread}
        </span>
      ) : null}
      {open ? (
        <div className="absolute top-[calc(100%+8px)] right-0 z-30 w-[min(22rem,calc(100vw-2rem))] rounded-xl border border-line bg-white shadow-lg">
          <div className="flex items-center justify-between gap-3 border-b border-line px-3 py-2.5">
            <p className="text-sm font-medium text-ink">Уведомления</p>
            {unread > 0 ? (
              <button
                type="button"
                onClick={markAllNotificationsRead}
                className="cursor-pointer text-xs font-medium text-accent hover:text-accent-hover"
              >
                Прочитать все
              </button>
            ) : null}
          </div>
          {notifications.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted">Новых уведомлений нет.</p>
          ) : (
            <ul className="max-h-80 overflow-auto p-1.5">
              {notifications.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      markNotificationRead(item.id)
                      setOpen(false)
                      navigate(item.href)
                    }}
                    className="flex w-full cursor-pointer gap-2 rounded-lg px-2 py-2 text-left hover:bg-zinc-50"
                  >
                    <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${item.read ? 'bg-transparent' : 'bg-accent'}`} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="truncate text-sm font-medium text-ink">{item.title}</span>
                        <span className="shrink-0 text-[11px] text-faint">{formatRelative(item.timestamp)}</span>
                      </span>
                      <span className="mt-0.5 block text-xs leading-5 text-muted">{item.body}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  )
}
