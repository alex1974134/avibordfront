import { cn } from '../../utils/cn'

interface FilterChipsProps<T extends string> {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
}

export function FilterChips<T extends string>({ label, value, options, onChange }: FilterChipsProps<T>) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-1.5">
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'h-8 cursor-pointer rounded-lg px-2.5 text-[13px] font-medium transition-colors',
              active ? 'bg-ink text-white' : 'border border-line bg-white text-muted hover:text-ink',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
