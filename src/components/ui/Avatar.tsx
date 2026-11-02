import type { User } from '../../types'
import { cn } from '../../utils/cn'

type AvatarSize = 'xs' | 'sm' | 'md'

const sizes: Record<AvatarSize, string> = {
  xs: 'h-5 w-5 text-[9px]',
  sm: 'h-6 w-6 text-[10px]',
  md: 'h-8 w-8 text-xs',
}

export function Avatar({
  user,
  size = 'md',
}: {
  user: Pick<User, 'name' | 'initials' | 'color'>
  size?: AvatarSize
}) {
  return (
    <span
      title={user.name}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-medium text-white',
        sizes[size],
      )}
      style={{ backgroundColor: user.color }}
    >
      {user.initials}
    </span>
  )
}

export function AvatarGroup({ users, max = 4 }: { users: User[]; max?: number }) {
  const shown = users.slice(0, max)
  const extra = users.length - shown.length

  return (
    <div className="flex items-center">
      {shown.map((user) => (
        <span key={user.id} className="-ml-1.5 rounded-full ring-2 ring-white first:ml-0">
          <Avatar user={user} size="sm" />
        </span>
      ))}
      {extra > 0 ? (
        <span className="-ml-1.5 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-zinc-100 px-1 text-[10px] font-medium text-muted ring-2 ring-white">
          +{extra}
        </span>
      ) : null}
    </div>
  )
}
