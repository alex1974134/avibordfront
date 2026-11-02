import { motion } from 'framer-motion'
import type { AiTurn, Project, User } from '../../types'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/Input'
import { PriorityBadge } from '../tasks/PriorityBadge'

export function AiResult({
  turn,
  users,
  projects,
  projectId,
  saved,
  onProject,
  onAdd,
}: {
  turn: AiTurn
  users: User[]
  projects: Project[]
  projectId: string
  saved: boolean
  onProject: (id: string) => void
  onAdd: () => void
}) {
  const project = projects.find((item) => item.id === projectId)

  return (
    <div className="mt-4 border-t border-line pt-4">
      <p className="text-sm leading-6 text-ink">{turn.summary}</p>
      <motion.ul
        className="mt-3 flex flex-col gap-2"
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.05 } } }}
      >
        {turn.tasks.map((task) => {
          const assignee = users.find((user) => user.id === task.assigneeId)
          return (
            <motion.li
              key={task.id}
              variants={{ hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0 } }}
              className="rounded-lg border border-line bg-zinc-50/70 px-3 py-2.5"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm leading-5 font-medium text-ink">{task.title}</p>
                <span className="shrink-0 text-[11px] text-faint">{task.estimate}</span>
              </div>
              <p className="mt-1 text-xs leading-5 text-muted">{task.detail}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {assignee ? (
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted">
                    <Avatar user={assignee} size="xs" />
                    {assignee.name}
                  </span>
                ) : null}
                <PriorityBadge priority={task.priority} />
              </div>
            </motion.li>
          )
        })}
      </motion.ul>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <Select className="sm:max-w-xs" value={projectId} onChange={(event) => onProject(event.target.value)} aria-label="Проект">
          {projects.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </Select>
        <Button size="sm" onClick={onAdd} disabled={saved || !project}>
          {saved ? `Добавлено в «${project?.name ?? 'проект'}»` : 'Добавить на доску'}
        </Button>
      </div>
    </div>
  )
}
