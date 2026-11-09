import type { Activity, User } from '../../types'
import { localized } from '../../i18n/content'
import { useI18n } from '../../i18n/useI18n'
import { formatRelative } from '../../utils/format'
import { statusFromMeta } from '../../utils/labels'
import { Avatar } from '../../components/ui/Avatar'
import { Card } from '../../components/ui/Card'

function ActivityCopy({ activity }: { activity: Activity }) {
  const { locale, t } = useI18n()
  const targetText = localized(locale, `activity.${activity.id}.target`, activity.target)
  const target = <span className="font-medium text-ink">{targetText}</span>
  const meta = statusFromMeta(activity.meta, locale)
  const metaText = localized(locale, `activity.${activity.id}.meta`, meta)
  switch (activity.type) {
    case 'task_created':
      return (
        <>
          {t('actCreated')} {target}
        </>
      )
    case 'task_completed':
      return (
        <>
          {t('actCompleted')} {target}
        </>
      )
    case 'status_changed':
      return (
        <>
          {t('actMoved')} {target} {t('actMovedTo')} {metaText}
        </>
      )
    case 'member_added':
      return (
        <>
          {t('actAdded')} <span className="font-medium text-ink">{activity.meta}</span> {t('actAddedTo')} {target}
        </>
      )
    case 'comment':
      return (
        <>
          {t('actCommented')} {target}
        </>
      )
  }
}

export function ActivityFeed({ activities, users }: { activities: Activity[]; users: User[] }) {
  const { locale, t } = useI18n()
  return (
    <Card padding={false}>
      <div className="border-b border-line px-4 py-3">
        <h2 className="text-sm font-semibold text-ink">{t('recentActivity')}</h2>
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
                {activity.detail ? (
                  <p className="mt-1 text-xs leading-5 text-faint">
                    {localized(locale, `activity.${activity.id}.detail`, activity.detail)}
                  </p>
                ) : null}
              </div>
              <time className="shrink-0 text-xs text-faint" dateTime={activity.timestamp}>
                {formatRelative(activity.timestamp, Date.now(), locale)}
              </time>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
