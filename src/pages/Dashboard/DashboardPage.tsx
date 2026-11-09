import { Plus, Sparkles } from 'lucide-react'
import { AiComposer } from '../../features/ai-assistant/AiComposer'
import { ActivityFeed } from '../../features/dashboard/ActivityFeed'
import { MyTasks } from '../../features/dashboard/MyTasks'
import { ProjectOverview } from '../../features/dashboard/ProjectOverview'
import { StatGrid } from '../../features/dashboard/StatGrid'
import { useWorkspaceData } from '../../hooks/useWorkspaceData'
import { useAppStore } from '../../store/useAppStore'
import { useI18n } from '../../i18n/useI18n'
import { firstName } from '../../utils/initials'
import { Page } from '../../components/ui/PageIntro'
import { Button } from '../../components/ui/Button'

export function DashboardPage() {
  const data = useWorkspaceData()
  const openTaskModal = useAppStore((state) => state.openTaskModal)
  const name = firstName(data.currentUser.name)
  const { t } = useI18n()

  const askAi = () => {
    const field = document.getElementById('ai-goal')
    field?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    if (field instanceof HTMLTextAreaElement) field.focus()
  }

  return (
    <Page>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-ink">{t('greeting', { name })}</h1>
          <p className="mt-1 text-sm text-muted">{t('greetingSub')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={<Plus className="h-4 w-4" />} onClick={openTaskModal}>
            {t('newTask')}
          </Button>
          <Button icon={<Sparkles className="h-4 w-4" />} onClick={askAi}>
            {t('askAi')}
          </Button>
        </div>
      </div>
      <StatGrid stats={data.stats} trend={data.workspace.projectTrend} members={data.members} />
      <ProjectOverview projects={data.projects} users={data.members} searchQuery={data.searchQuery} />
      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.8fr)]">
        <MyTasks
          tasks={data.myTasks.slice(0, 6)}
          total={data.myTasks.length}
          users={data.members}
          projects={data.allProjects}
          searchQuery={data.searchQuery}
        />
        <div className="flex flex-col gap-4">
          <AiComposer layout="card" />
          <ActivityFeed activities={data.activities.slice(0, 6)} users={data.members} />
        </div>
      </div>
    </Page>
  )
}
