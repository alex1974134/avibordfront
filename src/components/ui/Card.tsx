import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

interface CardProps {
  children: ReactNode
  className?: string
  padding?: boolean
}

export function Card({ children, className, padding = true }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-line bg-white shadow-[0_1px_2px_rgb(22_24_29/0.04)]',
        padding && 'p-4',
        className,
      )}
    >
      {children}
    </div>
  )
}
