import type { DocumentCategory } from '../../types'

export const documentCategories: DocumentCategory[] = ['Product', 'Engineering', 'Design', 'Research']

export type KnowledgeFilter = DocumentCategory | 'All'

export const knowledgeFilters: KnowledgeFilter[] = ['All', ...documentCategories]
