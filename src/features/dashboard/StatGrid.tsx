import { FolderKanban, ListTodo, CircleCheck, Users } from 'lucide-react'
import type { ReactNode } from 'react'
import type { User } from '../../types'
import type { DashboardStats } from '../../utils/stats'
import { AvatarGroup } from '../../components/ui/Avatar'
import { Card } from '../../components/ui/Card'

function StatCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string
  value: string
  detail: ReactNode
  icon: ReactNode
}) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] text-muted">{label}</p>
          <p className="mt-2 text-[26px] leading-none font-semibold tracking-tight text-ink tabular-nums">{value}</p>
          <div className="mt-2 text-xs text-faint">{detail}</div>
        </div>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-50 text-muted">{icon}</span>
      </div>
    </Card>
  )
}

export function StatGrid({
  stats,
  trend,
  members,
}: {
  stats: DashboardStats
  trend: string
  members: User[]
}) {
  const trendUp = trend.startsWith('+')
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Активные проекты"
        value={String(stats.activeProjects)}
        detail={<span className={trendUp ? 'text-emerald-700' : undefined}>{trend}</span>}
        icon={<FolderKanban className="h-4 w-4" />}
      />
      <StatCard
        label="Мои задачи"
        value={String(stats.myTasks)}
        detail={`${stats.myInProgress} в работе`}
        icon={<ListTodo className="h-4 w-4" />}
      />
      <StatCard
        label="Завершено"
        value={String(stats.completed)}
        detail={`${stats.completionRate}% от всех задач`}
        icon={<CircleCheck className="h-4 w-4" />}
      />
      <StatCard
        label="Участники"
        value={String(stats.members)}
        detail={<AvatarGroup users={members} />}
        icon={<Users className="h-4 w-4" />}
      />
    </div>
  )
}
