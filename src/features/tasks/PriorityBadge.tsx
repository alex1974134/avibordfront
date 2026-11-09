import type { TaskPriority } from '../../types'
import { useI18n } from '../../i18n/useI18n'
import { priorityText } from '../../utils/labels'
import { Badge, type BadgeTone } from '../../components/ui/Badge'

const tones: Record<TaskPriority, BadgeTone> = {
  low: 'neutral',
  medium: 'info',
  high: 'warning',
  critical: 'danger',
}

export const priorityDot: Record<TaskPriority, string> = {
  low: 'bg-zinc-300',
  medium: 'bg-sky-500',
  high: 'bg-amber-500',
  critical: 'bg-rose-500',
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const { locale } = useI18n()
  return <Badge tone={tones[priority]}>{priorityText(priority, locale)}</Badge>
}
