import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { PanelLeft, Plus, Search } from 'lucide-react'
import { useWorkspaceData } from '../../hooks/useWorkspaceData'
import { useAppStore } from '../../store/useAppStore'
import { Avatar } from '../ui/Avatar'
import { Button } from '../ui/Button'
import { IconButton } from '../ui/IconButton'
import { pageTitle } from './navigation'
import { NotificationMenu } from './NotificationMenu'
import { SearchField } from './SearchField'

export function Header() {
  const location = useLocation()
  const { workspace, currentUser } = useWorkspaceData()
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen)
  const openTaskModal = useAppStore((state) => state.openTaskModal)
  const [searchOpen, setSearchOpen] = useState(false)
  const meta = pageTitle(location.pathname, workspace.name)

  useEffect(() => {
    document.title = `${meta.title} · AivibeBoard`
    setSearchOpen(false)
  }, [meta.title])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        const fields = document.querySelectorAll<HTMLInputElement>('input[data-search="workspace"]')
        const visible = Array.from(fields).find((field) => field.offsetParent !== null) ?? fields[0]
        visible?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-white/90 backdrop-blur">
      <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
        <IconButton className="lg:hidden" label="Открыть меню" onClick={() => setSidebarOpen(true)}>
          <PanelLeft className="h-4 w-4" />
        </IconButton>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink">{meta.title}</p>
          <p className="truncate text-xs text-faint">{meta.crumbs.join(' / ')}</p>
        </div>
        <div className="ml-auto hidden min-w-0 flex-1 md:block md:max-w-sm">
          <SearchField />
        </div>
        <div className="ml-auto flex items-center gap-1.5 md:ml-0">
          <IconButton className="md:hidden" label="Поиск" onClick={() => setSearchOpen((value) => !value)}>
            <Search className="h-4 w-4" />
          </IconButton>
          <Button className="hidden sm:inline-flex" size="sm" icon={<Plus className="h-3.5 w-3.5" />} onClick={openTaskModal}>
            Новая задача
          </Button>
          <IconButton className="sm:hidden" label="Новая задача" onClick={openTaskModal}>
            <Plus className="h-4 w-4" />
          </IconButton>
          <NotificationMenu />
          <Link
            to="/settings"
            aria-label="Открыть профиль"
            className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
          >
            <Avatar user={currentUser} size="sm" />
          </Link>
        </div>
      </div>
      {searchOpen ? (
        <div className="px-4 pb-3 md:hidden">
          <SearchField autoFocus />
        </div>
      ) : null}
    </header>
  )
}
