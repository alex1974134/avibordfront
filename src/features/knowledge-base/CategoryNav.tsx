import type { KnowledgeDocument } from '../../types'
import { useI18n } from '../../i18n/useI18n'
import { categoryText } from '../../utils/labels'
import { cn } from '../../utils/cn'
import { Card } from '../../components/ui/Card'
import { knowledgeFilters, type KnowledgeFilter } from './categories'

export function CategoryNav({
  documents,
  category,
  onSelect,
}: {
  documents: KnowledgeDocument[]
  category: KnowledgeFilter
  onSelect: (item: KnowledgeFilter) => void
}) {
  const { locale, t } = useI18n()

  return (
    <Card className="p-2">
      <p className="px-2 py-1.5 text-[11px] font-medium tracking-wide text-faint uppercase">{t('categories')}</p>
      <div className="flex flex-col gap-0.5">
        {knowledgeFilters.map((item) => {
          const count = item === 'All' ? documents.length : documents.filter((document) => document.category === item).length
          const active = item === category
          return (
            <button
              key={item}
              type="button"
              onClick={() => onSelect(item)}
              className={cn(
                'flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm',
                active ? 'bg-accent-soft font-medium text-accent' : 'text-muted hover:bg-zinc-50 hover:text-ink',
              )}
            >
              <span>{item === 'All' ? t('all') : categoryText(item, locale)}</span>
              <span className="text-xs text-faint">{count}</span>
            </button>
          )
        })}
      </div>
    </Card>
  )
}
