import { cn } from '../../utils/cn'

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  const width = Math.min(100, Math.max(0, value))
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100" role="progressbar" aria-valuenow={width} aria-valuemin={0} aria-valuemax={100}>
      <div className={cn('h-full rounded-full bg-accent', className)} style={{ width: `${width}%` }} />
    </div>
  )
}
