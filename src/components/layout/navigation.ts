import type { LucideIcon } from 'lucide-react'
import {
  BookOpen,
  Bot,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  Settings,
  Sparkles,
  Users,
  WandSparkles,
} from 'lucide-react'

import type { MessageKey } from '../../i18n/messages'

export interface NavItem {
  labelKey: MessageKey
  to: string
  icon: LucideIcon
  end?: boolean
}

export const mainNav: NavItem[] = [
  { labelKey: 'navOverview', to: '/dashboard', icon: LayoutDashboard, end: true },
  { labelKey: 'navTasks', to: '/tasks', icon: ListTodo, end: true },
  { labelKey: 'navProjects', to: '/projects', icon: FolderKanban, end: true },
  { labelKey: 'navTeam', to: '/team', icon: Users, end: true },
  { labelKey: 'navKnowledge', to: '/knowledge-base', icon: BookOpen, end: true },
]

export const aiNav: NavItem[] = [
  { labelKey: 'navAi', to: '/ai', icon: Sparkles, end: true },
  { labelKey: 'navGenerator', to: '/ai/generator', icon: WandSparkles, end: true },
]

export const systemNav: NavItem[] = [
  { labelKey: 'navTelegram', to: '/integrations', icon: Bot, end: true },
  { labelKey: 'navSettings', to: '/settings', icon: Settings, end: true },
]

export function pageMeta(pathname: string): { titleKey: MessageKey; ai: boolean } | null {
  const routes: { path: string; titleKey: MessageKey; ai?: boolean }[] = [
    { path: '/dashboard', titleKey: 'navOverview' },
    { path: '/tasks', titleKey: 'navTasks' },
    { path: '/projects', titleKey: 'navProjects' },
    { path: '/team', titleKey: 'navTeam' },
    { path: '/knowledge-base', titleKey: 'navKnowledge' },
    { path: '/ai/generator', titleKey: 'navGenerator', ai: true },
    { path: '/ai', titleKey: 'navAi', ai: true },
    { path: '/integrations', titleKey: 'navTelegram' },
    { path: '/settings', titleKey: 'navSettings' },
  ]
  const match = routes.find((route) => pathname === route.path)
  if (!match) return null
  return { titleKey: match.titleKey, ai: Boolean(match.ai) }
}
