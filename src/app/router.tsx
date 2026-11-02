import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { AIPage } from '../pages/AI/AIPage'
import { TaskGeneratorPage } from '../pages/AI/TaskGeneratorPage'
import { DashboardPage } from '../pages/Dashboard/DashboardPage'
import { IntegrationsPage } from '../pages/Integrations/IntegrationsPage'
import { KnowledgeBasePage } from '../pages/KnowledgeBase/KnowledgeBasePage'
import { ProjectsPage } from '../pages/Projects/ProjectsPage'
import { SettingsPage } from '../pages/Settings/SettingsPage'
import { TasksPage } from '../pages/Tasks/TasksPage'
import { TeamPage } from '../pages/Team/TeamPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'tasks', element: <TasksPage /> },
      { path: 'projects', element: <ProjectsPage /> },
      { path: 'team', element: <TeamPage /> },
      { path: 'knowledge-base', element: <KnowledgeBasePage /> },
      { path: 'ai', element: <AIPage /> },
      { path: 'ai/generator', element: <TaskGeneratorPage /> },
      { path: 'integrations', element: <IntegrationsPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: '*', element: <Navigate to="/dashboard" replace /> },
    ],
  },
])
