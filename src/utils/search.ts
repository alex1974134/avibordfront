export function filterByQuery<T>(items: T[], query: string, text: (item: T) => string): T[] {
  const needle = query.trim().toLowerCase()
  if (!needle) return items
  return items.filter((item) => text(item).toLowerCase().includes(needle))
}
