import { useMemo, useState } from 'react'
import { useWorkspaceData } from '../../hooks/useWorkspaceData'
import { localized, searchBlob } from '../../i18n/content'
import { useI18n } from '../../i18n/useI18n'
import { useAppStore } from '../../store/useAppStore'
import type { DocumentCategory, KnowledgeDocument } from '../../types'
import { countWord, formatShortDate, sizeText } from '../../utils/format'
import { categoryText } from '../../utils/labels'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { CategoryNav } from './CategoryNav'
import { DocumentList } from './DocumentList'
import { UploadZone } from './UploadZone'
import type { KnowledgeFilter } from './categories'
import { addedDocsMessage, documentsFromFiles } from './files'

export function KnowledgeView() {
  const { locale, t } = useI18n()
  const { documents, members, workspace, currentUser } = useWorkspaceData()
  const addDocuments = useAppStore((state) => state.addDocuments)
  const showToast = useAppStore((state) => state.showToast)
  const [category, setCategory] = useState<KnowledgeFilter>('All')
  const [query, setQuery] = useState('')
  const [uploadCategory, setUploadCategory] = useState<DocumentCategory>('Product')
  const [preview, setPreview] = useState<KnowledgeDocument | null>(null)

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return documents.filter((document) => {
      const matchesCategory = category === 'All' || document.category === category
      const matchesQuery = searchBlob(`doc.${document.id}.name`, document.name).toLowerCase().includes(needle)
      return matchesCategory && matchesQuery
    })
  }, [category, documents, query])

  const takeFiles = (list: FileList | null) => {
    if (!list || list.length === 0) return
    const next = documentsFromFiles(list, {
      workspaceId: workspace.id,
      category: uploadCategory,
      ownerId: currentUser.id,
      locale,
    })
    addDocuments(next)
    showToast(addedDocsMessage(next.length, locale))
  }

  const selectCategory = (item: KnowledgeFilter) => {
    setCategory(item)
    if (item !== 'All') setUploadCategory(item)
  }

  const previewName = preview ? localized(locale, `doc.${preview.id}.name`, preview.name) : t('document')

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
      <CategoryNav documents={documents} category={category} onSelect={selectCategory} />
      <div className="flex flex-col gap-4">
        <UploadZone uploadCategory={uploadCategory} onCategory={setUploadCategory} onFiles={takeFiles} />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('searchDocs')}
            aria-label={t('searchDocs')}
            className="sm:max-w-xs"
          />
          <p className="text-xs text-faint">{visible.length} {countWord(locale, visible.length, 'document')}</p>
        </div>
        <DocumentList documents={visible} members={members} onOpen={setPreview} />
      </div>
      <Modal open={preview !== null} title={previewName} onClose={() => setPreview(null)}>
        {preview ? (
          <div className="flex flex-col gap-3 text-sm leading-6 text-muted">
            <p>{t('docPreview', { name: previewName })}</p>
            <p className="text-xs text-faint">
              {categoryText(preview.category, locale)} · {sizeText(preview.size, locale)} · {t('updated', { date: formatShortDate(preview.updatedAt, locale) })}
            </p>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
