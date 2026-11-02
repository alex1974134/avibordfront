import { useEffect, useRef, useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { workspaces } from '../../data/workspaces'
import { useDismiss } from '../../hooks/useDismiss'
import { useAppStore } from '../../store/useAppStore'
import { cn } from '../../utils/cn'

export function WorkspaceSwitcher() {
  const workspaceId = useAppStore((state) => state.workspaceId)
  const setWorkspace = useAppStore((state) => state.setWorkspace)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = workspaces.find((item) => item.id === workspaceId) ?? workspaces[0]

  useDismiss(open, ref, () => setOpen(false))

  useEffect(() => {
    setOpen(false)
  }, [workspaceId])

  if (!current) return null

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full cursor-pointer items-center gap-2 rounded-lg border border-line bg-white px-2.5 py-2 text-left transition-colors hover:bg-zinc-50"
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-ink">{current.name}</span>
          <span className="block text-[11px] text-faint">{current.plan}</span>
        </span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-faint" />
      </button>
      {open ? (
        <ul
          role="listbox"
          aria-label="Пространство"
          className="absolute top-[calc(100%+6px)] z-30 w-full rounded-lg border border-line bg-white p-1 shadow-lg"
        >
          {workspaces.map((workspace) => {
            const active = workspace.id === workspaceId
            return (
              <li key={workspace.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => setWorkspace(workspace.id)}
                  className={cn(
                    'flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-left text-sm',
                    active ? 'bg-accent-soft text-accent' : 'text-ink hover:bg-zinc-50',
                  )}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{workspace.name}</span>
                    <span className="block text-[11px] text-faint">{workspace.plan}</span>
                  </span>
                  {active ? <Check className="h-4 w-4 shrink-0" /> : null}
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
