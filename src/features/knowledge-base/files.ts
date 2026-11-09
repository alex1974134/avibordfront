import type { Locale } from '../../i18n/locale'
import { translate } from '../../i18n/translate'
import type { DocumentCategory, KnowledgeDocument } from '../../types'
import { countWord, formatBytes } from '../../utils/format'

export function documentsFromFiles(
  list: FileList,
  input: { workspaceId: string; category: DocumentCategory; ownerId: string; locale: Locale },
): KnowledgeDocument[] {
  return Array.from(list).map((file) => ({
    id: crypto.randomUUID(),
    workspaceId: input.workspaceId,
    name: file.name,
    category: input.category,
    size: formatBytes(file.size, input.locale),
    updatedAt: new Date().toISOString().slice(0, 10),
    ownerId: input.ownerId,
  }))
}

export function addedDocsMessage(count: number, locale: Locale): string {
  if (count === 1) return translate(locale, 'toastDocAdded')
  return translate(locale, 'toastDocsAdded', { count, word: countWord(locale, count, 'document') })
}
