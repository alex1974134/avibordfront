import { useEffect } from 'react'
import { MotionConfig } from 'framer-motion'
import { RouterProvider } from 'react-router-dom'
import { finishAuthHydration, useAuthStore } from '../store/useAuthStore'
import { useAppStore } from '../store/useAppStore'
import { router } from './router'

export function App() {
  useEffect(() => {
    const finish = () => finishAuthHydration()
    if (useAuthStore.persist.hasHydrated()) finish()
    const unsubHydration = useAuthStore.persist.onFinishHydration(finish)
    const unsubUsers = useAppStore.subscribe((state, prev) => {
      if (state.users === prev.users) return
      const { sessionUserId, accounts, syncUser } = useAuthStore.getState()
      if (!sessionUserId) return
      const user = state.users.find((item) => item.id === sessionUserId)
      const account = accounts.find((item) => item.user.id === sessionUserId)
      if (!user || !account) return
      const previous = account.user
      const same =
        user.name === previous.name &&
        user.email === previous.email &&
        user.role === previous.role &&
        user.initials === previous.initials &&
        user.color === previous.color &&
        user.workspaceIds.length === previous.workspaceIds.length &&
        user.workspaceIds.every((id, index) => id === previous.workspaceIds[index])
      if (!same) syncUser(user)
    })
    return () => {
      unsubHydration()
      unsubUsers()
    }
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      <RouterProvider router={router} />
    </MotionConfig>
  )
}
