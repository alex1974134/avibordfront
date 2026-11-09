const palette = ['#0f766e', '#1d4ed8', '#9a3412', '#6d28d9', '#0369a1', '#9d174d']
const fallback = '#475569'

export function colorAt(index: number): string {
  return palette[index % palette.length] ?? fallback
}

export function colorFromId(id: string): string {
  let hash = 0
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return colorAt(hash)
}
