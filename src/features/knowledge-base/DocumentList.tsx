import { FileText } from 'lucide-react'
import { localized } from '../../i18n/content'
import { useI18n } from '../../i18n/useI18n'
import type { KnowledgeDocument, User } from '../../types'
import { formatShortDate, sizeText } from '../../utils/format'
import { categoryText } from '../../utils/labels'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { Badge } from '../../components/ui/Badge'

export function DocumentList({
  documents,
  members,
  onOpen,
}: {
  documents: KnowledgeDocument[]
  members: User[]
  onOpen: (document: KnowledgeDocument) => void
}) {
  const { locale, t } = useI18n()

  if (documents.length === 0) {
    return <EmptyState title={t('noDocs')} description={t('noDocsHint')} />
  }

  return (
    <Card padding={false}>
      <ul className="divide-y divide-line">
        {documents.map((document) => {
          const owner = members.find((member) => member.id === document.ownerId)
          return (
            <li key={document.id}>
              <button
                type="button"
                onClick={() => onOpen(document)}
                className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left hover:bg-zinc-50"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-50 text-muted">
                  <FileText className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink">
                    {localized(locale, `doc.${document.id}.name`, document.name)}
                  </span>
                  <span className="mt-0.5 block text-xs text-faint">
                    {owner?.name ?? t('unknown')} · {formatShortDate(document.updatedAt, locale)} · {sizeText(document.size, locale)}
                  </span>
                </span>
                <Badge>{categoryText(document.category, locale)}</Badge>
              </button>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
