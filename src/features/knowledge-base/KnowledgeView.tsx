import { useRef, useState } from 'react'
import { FileText, Upload } from 'lucide-react'
import { useWorkspaceData } from '../../hooks/useWorkspaceData'
import { useAppStore } from '../../store/useAppStore'
import type { DocumentCategory, KnowledgeDocument } from '../../types'
import { formatBytes, formatShortDate, plural } from '../../utils/format'
import { documentCategoryLabel } from '../../utils/labels'
import { cn } from '../../utils/cn'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { Badge } from '../../components/ui/Badge'

const categories: Array<DocumentCategory | 'All'> = ['All', 'Product', 'Engineering', 'Design', 'Research']

function categoryLabel(item: DocumentCategory | 'All'): string {
  return item === 'All' ? 'Все' : documentCategoryLabel[item]
}

export function KnowledgeView() {
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
    const matchesQuery = document.name.toLowerCase().includes(query.trim().toLowerCase())
    return matchesCategory && matchesQuery
  })

  const takeFiles = (list: FileList | null) => {
    if (!list || list.length === 0) return
    const next = Array.from(list).map((file) => ({
      id: crypto.randomUUID(),
      workspaceId: workspace.id,
      name: file.name,
      category: uploadCategory,
      size: formatBytes(file.size),
      updatedAt: new Date().toISOString().slice(0, 10),
      ownerId: currentUser.id,
    }))
    addDocuments(next)
    showToast(
      next.length === 1
        ? 'Документ добавлен'
        : `Добавлено ${next.length} ${plural(next.length, 'документ', 'документа', 'документов')}`,
    )
  }

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
      <Card className="p-2">
        <p className="px-2 py-1.5 text-[11px] font-medium tracking-wide text-faint uppercase">Категории</p>
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
                <span>{categoryLabel(item)}</span>
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
          <p className="mt-3 text-sm font-medium text-ink">Перетащите файлы сюда</p>
          <p className="mt-1 text-xs text-faint">Они останутся в этой демо-сессии и никуда не загружаются.</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <label className="text-xs text-muted">
              Сохранить в
              <select
                aria-label="Категория загрузки"
                value={uploadCategory}
                onChange={(event) => setUploadCategory(event.target.value as DocumentCategory)}
                className="ml-2 h-8 rounded-lg border border-line bg-white px-2 text-sm text-ink"
              >
                {categories
                  .filter((item) => item !== 'All')
                  .map((item) => (
                    <option key={item} value={item}>
                      {categoryLabel(item)}
                    </option>
                  ))}
              </select>
            </label>
            <Button variant="secondary" size="sm" onClick={() => inputRef.current?.click()}>
              Выбрать файлы
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
            placeholder="Поиск документов"
            aria-label="Поиск документов"
            className="sm:max-w-xs"
          />
          <p className="text-xs text-faint">
            {visible.length} {plural(visible.length, 'документ', 'документа', 'документов')}
          </p>
        </div>

        {visible.length === 0 ? (
          <EmptyState title="Документов нет" description="Выберите другую категорию или добавьте файл выше." />
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
                        <span className="block truncate text-sm font-medium text-ink">{document.name}</span>
                        <span className="mt-0.5 block text-xs text-faint">
                          {owner?.name ?? 'Неизвестно'} · {formatShortDate(document.updatedAt)} · {document.size}
                        </span>
                      </span>
                      <Badge>{documentCategoryLabel[document.category]}</Badge>
                    </button>
                  </li>
                )
              })}
            </ul>
          </Card>
        )}
      </div>

      <Modal open={preview !== null} title={preview?.name ?? 'Документ'} onClose={() => setPreview(null)}>
        {preview ? (
          <div className="flex flex-col gap-3 text-sm leading-6 text-muted">
            <p>
              «{preview.name}» хранится в этой демо-сессии. Позже его можно будет проиндексировать, чтобы помощник
              опирался на него при черновиках задач.
            </p>
            <p className="text-xs text-faint">
              {documentCategoryLabel[preview.category]} · {preview.size} · Обновлён {formatShortDate(preview.updatedAt)}
            </p>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
