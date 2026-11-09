import { useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { ChevronRight, LogOut } from 'lucide-react'
import { useWorkspaceData } from '../../hooks/useWorkspaceData'
import { useAppStore } from '../../store/useAppStore'
import { useAuthStore } from '../../store/useAuthStore'
import { roleText } from '../../i18n/content'
import { useI18n } from '../../i18n/useI18n'
import { cn } from '../../utils/cn'
import { Avatar } from '../ui/Avatar'
import { aiNav, mainNav, systemNav, type NavItem } from './navigation'
import { WorkspaceSwitcher } from './WorkspaceSwitcher'

function NavList({ items }: { items: NavItem[] }) {
  const { t } = useI18n()
  const setProjectFilter = useAppStore((state) => state.setProjectFilter)
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen)
  return (
    <div className="flex flex-col gap-0.5">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => {
              if (item.to === '/tasks') {
                setProjectFilter(null)
                setSidebarOpen(false)
              }
            }}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors',
                isActive ? 'bg-accent-soft font-medium text-accent' : 'text-muted hover:bg-zinc-50 hover:text-ink',
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{t(item.labelKey)}</span>
          </NavLink>
        )
      })}
    </div>
  )
}

export function Sidebar() {
  const open = useAppStore((state) => state.sidebarOpen)
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen)
  const location = useLocation()
  const { currentUser } = useWorkspaceData()
  const logout = useAuthStore((state) => state.logout)
  const { locale, t } = useI18n()

  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname, setSidebarOpen])

  return (
    <>
      {open ? (
        <button
          type="button"
          aria-label={t('closeMenu')}
          className="fixed inset-0 z-30 bg-ink/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-[250px] shrink-0 flex-col border-r border-line bg-white transition-transform duration-200 lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center gap-2.5 px-4 pt-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-sm font-semibold text-white">
            A
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight text-ink">AivibeBoard</p>
            <p className="text-[11px] text-faint">{t('workspaceLabel')}</p>
          </div>
        </div>
        <div className="px-3 pt-4">
          <WorkspaceSwitcher />
        </div>
        <div className="scroll-thin mt-4 flex-1 space-y-4 overflow-y-auto px-3 pb-4">
          <NavList items={mainNav} />
          <div>
            <p className="px-2.5 pb-1 text-[11px] font-medium tracking-[0.08em] text-faint uppercase">AI</p>
            <NavList items={aiNav} />
          </div>
          <div className="border-t border-line pt-3">
            <NavList items={systemNav} />
          </div>
        </div>
        <div className="border-t border-line p-3">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 rounded-lg p-2 transition-colors',
                isActive ? 'bg-accent-soft' : 'hover:bg-zinc-50',
              )
            }
          >
            <Avatar user={currentUser} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-ink">{currentUser.name}</span>
              <span className="block truncate text-xs text-faint">{roleText(locale, currentUser.role)}</span>
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-faint" aria-hidden="true" />
          </NavLink>
          <button
            type="button"
            className="mt-1 flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-muted transition-colors hover:bg-zinc-50 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
            onClick={logout}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {t('logout')}
          </button>
        </div>
      </aside>
    </>
  )
}
