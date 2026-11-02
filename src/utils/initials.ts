export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]
  if (!first) return '?'
  const last = parts[parts.length - 1]
  if (!last || parts.length === 1) return first.slice(0, 2).toUpperCase()
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase()
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? 'there'
}
