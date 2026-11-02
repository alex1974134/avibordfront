import type { Activity, User } from '../../types'
import { formatRelative } from '../../utils/format'
import { Avatar } from '../../components/ui/Avatar'
import { Card } from '../../components/ui/Card'

function ActivityCopy({ activity }: { activity: Activity }) {
  const target = <span className="font-medium text-ink">{activity.target}</span>
  switch (activity.type) {
    case 'task_created':
      return <>создал(а) {target}</>
    case 'task_completed':
      return <>завершил(а) {target}</>
    case 'status_changed':
      return (
        <>
          перевёл(а) {target} в {activity.meta}
        </>
      )
    case 'member_added':
      return (
        <>
          добавил(а) <span className="font-medium text-ink">{activity.meta}</span> в {target}
        </>
      )
    case 'comment':
      return <>прокомментировал(а) {target}</>
  }
}

export function ActivityFeed({ activities, users }: { activities: Activity[]; users: User[] }) {
  return (
    <Card padding={false}>
      <div className="border-b border-line px-4 py-3">
        <h2 className="text-sm font-semibold text-ink">Недавняя активность</h2>
      </div>
      <ul className="divide-y divide-line px-4">
        {activities.map((activity) => {
          const user = users.find((item) => item.id === activity.userId)
          if (!user) return null
          return (
            <li key={activity.id} className="flex gap-3 py-3">
              <Avatar user={user} size="xs" />
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-5 text-muted">
                  <span className="font-medium text-ink">{user.name}</span> <ActivityCopy activity={activity} />
                </p>
                {activity.detail ? <p className="mt-1 text-xs leading-5 text-faint">{activity.detail}</p> : null}
              </div>
              <time className="shrink-0 text-xs text-faint" dateTime={activity.timestamp}>
                {formatRelative(activity.timestamp)}
              </time>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
