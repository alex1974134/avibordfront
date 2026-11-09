import { useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { useI18n } from '../../i18n/useI18n'
import type { DocumentCategory } from '../../types'
import { categoryText } from '../../utils/labels'
import { cn } from '../../utils/cn'
import { Button } from '../../components/ui/Button'
import { documentCategories } from './categories'

export function UploadZone({
  uploadCategory,
  onCategory,
  onFiles,
}: {
  uploadCategory: DocumentCategory
  onCategory: (category: DocumentCategory) => void
  onFiles: (files: FileList | null) => void
}) {
  const { locale, t } = useI18n()
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault()
        setDragging(false)
        onFiles(event.dataTransfer.files)
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
            onChange={(event) => onCategory(event.target.value as DocumentCategory)}
            className="ml-2 h-8 rounded-lg border border-line bg-white px-2 text-sm text-ink"
          >
            {documentCategories.map((item) => (
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
            onFiles(event.target.files)
            event.target.value = ''
          }}
        />
      </div>
    </div>
  )
}
