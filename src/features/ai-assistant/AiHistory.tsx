import type { AiTurn } from '../../types'
import { formatRelative } from '../../utils/format'
import { cn } from '../../utils/cn'

export function AiHistory({
  turns,
  activeId,
  onSelect,
}: {
  turns: AiTurn[]
  activeId: string | null
  onSelect: (turn: AiTurn) => void
}) {
  return (
    <div className="rounded-xl border border-line bg-white p-4 shadow-[0_1px_2px_rgb(22_24_29/0.04)]">
      <h2 className="text-sm font-semibold text-ink">История</h2>
      {turns.length === 0 ? (
        <p className="mt-3 text-sm leading-6 text-muted">Черновики этой сессии появятся здесь.</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-1">
          {turns.map((turn) => {
            const active = turn.id === activeId
            return (
              <li key={turn.id}>
                <button
                  type="button"
                  onClick={() => onSelect(turn)}
                  className={cn(
                    'w-full cursor-pointer rounded-lg px-2.5 py-2 text-left',
                    active ? 'bg-accent-soft' : 'hover:bg-zinc-50',
                  )}
                >
                  <span className="line-clamp-2 text-sm text-ink">{turn.prompt}</span>
                  <span className="mt-1 block text-[11px] text-faint">{formatRelative(turn.createdAt)}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
