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

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
  end?: boolean
}

export const mainNav: NavItem[] = [
  { label: 'Обзор', to: '/dashboard', icon: LayoutDashboard, end: true },
  { label: 'Мои задачи', to: '/tasks', icon: ListTodo, end: true },
  { label: 'Проекты', to: '/projects', icon: FolderKanban, end: true },
  { label: 'Команда', to: '/team', icon: Users, end: true },
  { label: 'База знаний', to: '/knowledge-base', icon: BookOpen, end: true },
]

export const aiNav: NavItem[] = [
  { label: 'AI-помощник', to: '/ai', icon: Sparkles, end: true },
  { label: 'Генератор задач', to: '/ai/generator', icon: WandSparkles, end: true },
]

export const systemNav: NavItem[] = [
  { label: 'Интеграция Telegram', to: '/integrations', icon: Bot, end: true },
  { label: 'Настройки', to: '/settings', icon: Settings, end: true },
]

export function pageTitle(pathname: string, workspaceName: string): { title: string; crumbs: string[] } {
  const routes: { path: string; title: string; section: string }[] = [
    { path: '/dashboard', title: 'Обзор', section: workspaceName },
    { path: '/tasks', title: 'Мои задачи', section: workspaceName },
    { path: '/projects', title: 'Проекты', section: workspaceName },
    { path: '/team', title: 'Команда', section: workspaceName },
    { path: '/knowledge-base', title: 'База знаний', section: workspaceName },
    { path: '/ai/generator', title: 'Генератор задач', section: 'AI' },
    { path: '/ai', title: 'AI-помощник', section: 'AI' },
    { path: '/integrations', title: 'Интеграция Telegram', section: workspaceName },
    { path: '/settings', title: 'Настройки', section: workspaceName },
  ]
  const match = routes.find((route) => pathname === route.path)
  if (!match) return { title: 'AivibeBoard', crumbs: [workspaceName] }
  return { title: match.title, crumbs: [match.section, match.title] }
}
