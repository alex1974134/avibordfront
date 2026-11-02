import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

const control =
  'w-full rounded-lg border border-line bg-white text-sm text-ink outline-none transition placeholder:text-faint focus:border-accent focus:ring-2 focus:ring-accent/20'

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string
  hint?: string
  error?: string
  children: ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-ink">{label}</span>
      {children}
      {error ? <span className="text-xs text-rose-600">{error}</span> : null}
      {!error && hint ? <span className="text-xs text-faint">{hint}</span> : null}
    </label>
  )
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(control, 'h-9 px-3', className)} {...props} />
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(control, 'min-h-24 resize-y px-3 py-2 leading-6', className)} {...props} />
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(control, 'h-9 px-3', className)} {...props} />
}
