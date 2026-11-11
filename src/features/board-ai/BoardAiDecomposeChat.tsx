import { useEffect, useRef } from 'react'
import { LoaderCircle, Sparkles, X } from 'lucide-react'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { Select, Textarea } from '../../components/ui/Input'
import type { User } from '../../types'
import { cn } from '../../utils/cn'
import { PriorityBadge } from '../tasks/PriorityBadge'
import { useBoardTaskDecompose } from './useBoardTaskDecompose'

export function BoardAiDecomposeChat({
  projectId,
  workspaceId,
  memberIds,
  users,
}: {
  projectId: string
  workspaceId: string
  memberIds: string[]
  users: User[]
}) {
  const members = memberIds
    .map((id) => users.find((user) => user.id === id))
    .filter((user): user is User => Boolean(user))

  const chat = useBoardTaskDecompose({ projectId, workspaceId, memberIds, members })
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chat.open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') chat.setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [chat])

  return (
    <>
      {chat.open ? (
        <div
          ref={panelRef}
          className="fixed bottom-24 right-6 z-40 flex w-[min(100vw-2rem,24rem)] flex-col overflow-hidden rounded-xl border border-accent-ring bg-white shadow-xl"
          role="dialog"
          aria-label={chat.t('boardAiTitle')}
        >
          <header className="flex items-start justify-between gap-2 border-b border-line bg-accent-soft/40 px-4 py-3">
            <div className="flex items-center gap-2 text-accent">
              <Sparkles className="h-4 w-4" />
              <div>
                <h2 className="text-sm font-semibold text-ink">{chat.t('boardAiTitle')}</h2>
                <p className="text-xs text-muted">{chat.t('boardAiSubtitle')}</p>
              </div>
            </div>
            <button
              type="button"
              className="rounded-md p-1 text-muted hover:bg-white hover:text-ink"
              aria-label={chat.t('boardAiClose')}
              onClick={() => chat.setOpen(false)}
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div className="flex max-h-[min(70vh,28rem)] flex-col gap-3 overflow-y-auto p-4">
            {!chat.hasMembers ? (
              <p className="text-sm text-rose-600">{chat.t('boardAiNoMembers')}</p>
            ) : (
              <>
                <Textarea
                  id="board-ai-goal"
                  value={chat.goal}
                  rows={4}
                  className="min-h-[88px] resize-none"
                  placeholder={chat.t('boardAiPlaceholder')}
                  onChange={(event) => {
                    chat.setGoal(event.target.value)
                    if (chat.error) chat.clearError()
                  }}
                />
                {chat.error ? <p className="text-xs text-rose-600">{chat.error}</p> : null}
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    disabled={!chat.canGenerate}
                    onClick={() => void chat.generate()}
                    icon={chat.loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  >
                    {chat.loading ? chat.t('aiGathering') : chat.t('boardAiGenerate')}
                  </Button>
                  {(chat.tasks.length > 0 || chat.goal) && (
                    <Button size="sm" variant="secondary" onClick={chat.clear}>
                      {chat.t('boardAiReset')}
                    </Button>
                  )}
                </div>

                {chat.summary ? <p className="text-sm leading-6 text-ink">{chat.summary}</p> : null}

                {chat.tasks.length > 0 ? (
                  <ul className="flex flex-col gap-2">
                    {chat.tasks.map((task) => {
                      const assignee = members.find((member) => member.id === task.assigneeId)
                      return (
                        <li key={task.id} className="rounded-lg border border-line bg-zinc-50/80 px-3 py-2.5">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium text-ink">{task.title}</p>
                            <span className="shrink-0 text-[11px] text-faint">{task.estimate}</span>
                          </div>
                          {task.detail ? <p className="mt-1 text-xs leading-5 text-muted">{task.detail}</p> : null}
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <PriorityBadge priority={task.priority} />
                            <Select
                              className="max-w-[11rem] text-xs"
                              value={task.assigneeId}
                              aria-label={chat.t('assignTask')}
                              onChange={(event) => chat.updateTaskAssignee(task.id, event.target.value)}
                            >
                              {members.map((member) => (
                                <option key={member.id} value={member.id}>
                                  {member.name}
                                </option>
                              ))}
                            </Select>
                            {assignee ? <Avatar user={assignee} size="xs" /> : null}
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                ) : null}

                {chat.tasks.length > 0 ? (
                  <Button
                    size="sm"
                    className="w-full"
                    disabled={chat.saved || chat.applying}
                    onClick={() => void chat.applyToBoard()}
                  >
                    {chat.saved ? chat.t('boardAiAdded') : chat.applying ? chat.t('aiGathering') : chat.t('boardAiApply')}
                  </Button>
                ) : null}
              </>
            )}
          </div>
        </div>
      ) : null}

      <button
        type="button"
        disabled={!chat.hasMembers}
        title={chat.hasMembers ? chat.t('boardAiTitle') : chat.t('boardAiNoMembers')}
        onClick={() => chat.setOpen((value) => !value)}
        className={cn(
          'fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition',
          chat.hasMembers
            ? 'bg-accent text-white hover:bg-accent/90'
            : 'cursor-not-allowed bg-zinc-300 text-zinc-500',
          chat.open && 'ring-2 ring-accent ring-offset-2',
        )}
        aria-expanded={chat.open}
        aria-label={chat.t('boardAiTitle')}
      >
        <Sparkles className="h-5 w-5" />
      </button>
    </>
  )
}
