import { useRef, useState } from 'react'
import { FileText, Upload } from 'lucide-react'
import { useWorkspaceData } from '../../hooks/useWorkspaceData'
import { localized, searchBlob } from '../../i18n/content'
import { useI18n } from '../../i18n/useI18n'
import { t as translateNow } from '../../i18n/translate'
import { useAppStore } from '../../store/useAppStore'
import type { DocumentCategory, KnowledgeDocument } from '../../types'
import { formatBytes, formatShortDate, noun, sizeText } from '../../utils/format'
import { categoryText } from '../../utils/labels'
import { cn } from '../../utils/cn'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { Badge } from '../../components/ui/Badge'

const categories: Array<DocumentCategory | 'All'> = ['All', 'Product', 'Engineering', 'Design', 'Research']

export function KnowledgeView() {
  const { locale, t } = useI18n()
  const { documents, members, workspace, currentUser } = useWorkspaceData()
  const addDocuments = useAppStore((state) => state.addDocuments)
  const showToast = useAppStore((state) => state.showToast)
  const [category, setCategory] = useState<DocumentCategory | 'All'>('All')
  const [query, setQuery] = useState('')
  const [uploadCategory, setUploadCategory] = useState<DocumentCategory>('Product')
  const [dragging, setDragging] = useState(false)
  const [preview, setPreview] = useState<KnowledgeDocument | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const visible = documents.filter((document) => {
    const matchesCategory = category === 'All' || document.category === category
    const matchesQuery = searchBlob(`doc.${document.id}.name`, document.name).toLowerCase().includes(query.trim().toLowerCase())
    return matchesCategory && matchesQuery
  })

  const takeFiles = (list: FileList | null) => {
    if (!list || list.length === 0) return
    const next = Array.from(list).map((file) => ({
      id: crypto.randomUUID(),
      workspaceId: workspace.id,
      name: file.name,
      category: uploadCategory,
      size: formatBytes(file.size, locale),
      updatedAt: new Date().toISOString().slice(0, 10),
      ownerId: currentUser.id,
    }))
    addDocuments(next)
    const word = noun(locale, next.length, ['документ', 'документа', 'документов'], ['document', 'documents'])
    showToast(next.length === 1 ? translateNow('toastDocAdded') : translateNow('toastDocsAdded', { count: next.length, word }))
  }

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
      <Card className="p-2">
        <p className="px-2 py-1.5 text-[11px] font-medium tracking-wide text-faint uppercase">{t('categories')}</p>
        <div className="flex flex-col gap-0.5">
          {categories.map((item) => {
            const count = item === 'All' ? documents.length : documents.filter((document) => document.category === item).length
            const active = item === category
            return (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setCategory(item)
                  if (item !== 'All') setUploadCategory(item)
                }}
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

      <div className="flex flex-col gap-4">
        <div
          onDragOver={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault()
            setDragging(false)
            takeFiles(event.dataTransfer.files)
          }}
          className={cn(
            'rounded-xl border border-dashed px-6 py-8 text-center',
            dragging ? 'border-accent bg-accent-soft' : 'border-line-strong bg-white',
          )}
        >
          <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-50 text-muted">
            <Upload className="h-4 w-4" />
          </span>
          <p className="mt-3 text-sm font-medium text-ink">{t('dropFiles')}</p>
          <p className="mt-1 text-xs text-faint">{t('dropHint')}</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <label className="text-xs text-muted">
              {t('saveIn')}
              <select
                aria-label={t('uploadCategory')}
                value={uploadCategory}
                onChange={(event) => setUploadCategory(event.target.value as DocumentCategory)}
                className="ml-2 h-8 rounded-lg border border-line bg-white px-2 text-sm text-ink"
              >
                {categories
                  .filter((item) => item !== 'All')
                  .map((item) => (
                    <option key={item} value={item}>
                      {categoryText(item, locale)}
                    </option>
                  ))}
              </select>
            </label>
            <Button variant="secondary" size="sm" onClick={() => inputRef.current?.click()}>
              {t('chooseFiles')}
            </Button>
            <input
              ref={inputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(event) => {
                takeFiles(event.target.files)
                event.target.value = ''
              }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('searchDocs')}
            aria-label={t('searchDocs')}
            className="sm:max-w-xs"
          />
          <p className="text-xs text-faint">
            {visible.length} {noun(locale, visible.length, ['документ', 'документа', 'документов'], ['document', 'documents'])}
          </p>
        </div>

        {visible.length === 0 ? (
          <EmptyState title={t('noDocs')} description={t('noDocsHint')} />
        ) : (
          <Card padding={false}>
            <ul className="divide-y divide-line">
              {visible.map((document) => {
                const owner = members.find((member) => member.id === document.ownerId)
                return (
                  <li key={document.id}>
                    <button
                      type="button"
                      onClick={() => setPreview(document)}
                      className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left hover:bg-zinc-50"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-50 text-muted">
                        <FileText className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink">{localized(locale, `doc.${document.id}.name`, document.name)}</span>
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
        )}
      </div>

      <Modal
        open={preview !== null}
        title={preview ? localized(locale, `doc.${preview.id}.name`, preview.name) : t('document')}
        onClose={() => setPreview(null)}
      >
        {preview ? (
          <div className="flex flex-col gap-3 text-sm leading-6 text-muted">
            <p>{t('docPreview', { name: localized(locale, `doc.${preview.id}.name`, preview.name) })}</p>
            <p className="text-xs text-faint">
              {categoryText(preview.category, locale)} · {sizeText(preview.size, locale)} · {t('updated', { date: formatShortDate(preview.updatedAt, locale) })}
            </p>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
