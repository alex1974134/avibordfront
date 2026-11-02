export function returnPath(state: unknown): string {
  if (!state || typeof state !== 'object' || !('from' in state)) return '/dashboard'
  const from = state.from
  if (typeof from !== 'string' || !from.startsWith('/') || from.startsWith('//')) return '/dashboard'
  if (from === '/login' || from === '/register' || from.startsWith('/login?') || from.startsWith('/register?')) {
    return '/dashboard'
  }
  return from
}
