import { useEffect } from 'react'
import { MotionConfig } from 'framer-motion'
import { RouterProvider } from 'react-router-dom'
import { startAuthListener, useAuthStore } from '../store/useAuthStore'
import { useAppStore } from '../store/useAppStore'
import { router } from './router'

export function App() {
  useEffect(() => {
    const stopAuth = startAuthListener()
    const unsubUsers = useAppStore.subscribe((state, prev) => {
      if (state.users === prev.users) return
      const { sessionUserId, syncUser } = useAuthStore.getState()
      if (!sessionUserId) return
      const user = state.users.find((item) => item.id === sessionUserId)
      if (!user) return
      syncUser(user)
    })
    return () => {
      stopAuth()
      unsubUsers()
    }
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      <RouterProvider router={router} />
    </MotionConfig>
  )
}
