import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { returnPath } from '../utils/returnPath'

export function AuthSplash() {
  return <div className="min-h-screen bg-canvas" />
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const hydrated = useAuthStore((state) => state.hydrated)
  const sessionUserId = useAuthStore((state) => state.sessionUserId)
  const location = useLocation()

  if (!hydrated) return <AuthSplash />
  if (!sessionUserId) {
    const from = `${location.pathname}${location.search}`
    return <Navigate to="/login" replace state={{ from }} />
  }
  return children
}

export function GuestOnly({ children }: { children: ReactNode }) {
  const hydrated = useAuthStore((state) => state.hydrated)
  const sessionUserId = useAuthStore((state) => state.sessionUserId)
  const location = useLocation()

  if (!hydrated) return <AuthSplash />
  if (sessionUserId) return <Navigate to={returnPath(location.state)} replace />
  return children
}
