import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { LoaderCircle, Sparkles } from 'lucide-react'
import { useWorkspaceData } from '../../hooks/useWorkspaceData'
import { useAppStore } from '../../store/useAppStore'
import { draftPlan } from '../../utils/decompose'
import { Button } from '../../components/ui/Button'
import { Textarea } from '../../components/ui/Input'
import { AiHistory } from './AiHistory'
import { AiResult } from './AiResult'

const steps = [
  { title: 'Опишите результат', body: 'Напишите, чего хотите добиться, а не шаблон тикета.' },
  { title: 'Проверьте черновик', body: 'Исполнители, приоритет и оценки — это предложения.' },
  { title: 'Добавьте в проект', body: 'Принятые задачи попадут в «Мои задачи» со статусом «К выполнению».' },
]

export function AiComposer({ layout }: { layout: 'card' | 'assistant' | 'generator' }) {
  const { members, allProjects, workspace } = useWorkspaceData()
  const aiDraft = useAppStore((state) => state.aiDraft)
  const setAiDraft = useAppStore((state) => state.setAiDraft)
  const turns = useAppStore((state) => state.aiTurns)
  const activeAiTurnId = useAppStore((state) => state.activeAiTurnId)
  const addAiTurn = useAppStore((state) => state.addAiTurn)
  const setActiveAiTurn = useAppStore((state) => state.setActiveAiTurn)
  const addGeneratedTasks = useAppStore((state) => state.addGeneratedTasks)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [projectId, setProjectId] = useState(allProjects[0]?.id ?? '')
  const [savedTurnId, setSavedTurnId] = useState<string | null>(null)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  useEffect(() => {
    if (!allProjects.some((project) => project.id === projectId)) {
      setProjectId(allProjects[0]?.id ?? '')
    }
  }, [allProjects, projectId])

  const active = turns.find((turn) => turn.id === activeAiTurnId) ?? null

  const generate = () => {
    const prompt = aiDraft.trim()
    if (!prompt) {
      setError('Опишите, чего хотите добиться.')
      return
    }
    setError('')
    setLoading(true)
    window.setTimeout(() => {
      const plan = draftPlan(prompt, members.map((member) => member.id))
      addAiTurn({
        id: crypto.randomUUID(),
        prompt,
        summary: plan.summary,
        createdAt: new Date().toISOString(),
        tasks: plan.tasks,
      })
      if (mounted.current) {
        setLoading(false)
        setSavedTurnId(null)
      }
    }, 700)
  }

  const composer = (
    <div id={layout === 'card' ? 'ai-assistant' : undefined} className="rounded-xl border border-accent-ring bg-white p-4 shadow-[0_1px_2px_rgb(22_24_29/0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-accent">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-soft">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="text-xs font-medium">AI-помощник</span>
        </div>
        {layout === 'card' ? (
          <Link to="/ai" className="text-xs font-medium text-muted hover:text-ink">
            Открыть
          </Link>
        ) : null}
      </div>
      {layout === 'card' ? (
        <>
          <h2 className="mt-3 text-base font-semibold tracking-tight text-ink">Пусть AI разложит работу</h2>
          <p className="mt-1 text-sm leading-6 text-muted">
            Превратите сложную идею в набор задач, назначьте ответственных и ускорьте работу.
          </p>
        </>
      ) : null}
      <div className="mt-4">
        <label className="sr-only" htmlFor="ai-goal">
          Опишите, чего хотите добиться
        </label>
        <Textarea
          id="ai-goal"
          value={aiDraft}
          placeholder="Опишите, чего хотите добиться..."
          onChange={(event) => {
            setAiDraft(event.target.value)
            if (error) setError('')
          }}
        />
        {error ? <p className="mt-1.5 text-xs text-rose-600">{error}</p> : null}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button onClick={generate} disabled={loading} icon={loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}>
            {loading ? 'Собираем…' : 'Сгенерировать задачи'}
          </Button>
          <p className="text-xs text-faint">Черновик по вашему тексту. Внешняя модель не вызывается.</p>
        </div>
      </div>
      {active ? (
        <AiResult
          turn={active}
          users={members}
          projects={allProjects}
          projectId={projectId}
          saved={savedTurnId === active.id}
          onProject={setProjectId}
          onAdd={() => {
            const ready = active.tasks.filter((task) => task.assigneeId)
            if (!projectId || ready.length === 0) return
            addGeneratedTasks({ projectId, tasks: ready, workspaceId: workspace.id })
            setSavedTurnId(active.id)
          }}
        />
      ) : null}
    </div>
  )

  if (layout === 'card') return composer

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(240px,0.7fr)]">
      {composer}
      {layout === 'assistant' ? (
        <AiHistory
          turns={turns}
          activeId={activeAiTurnId}
          onSelect={(turn) => {
            setActiveAiTurn(turn.id)
            setAiDraft(turn.prompt)
          }}
        />
      ) : (
        <div className="rounded-xl border border-line bg-white p-4 shadow-[0_1px_2px_rgb(22_24_29/0.04)]">
          <h2 className="text-sm font-semibold text-ink">Как собирается черновик</h2>
          <ol className="mt-3 flex flex-col gap-3">
            {steps.map((step, index) => (
              <li key={step.title} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-medium text-accent">
                  {index + 1}
                </span>
                <span>
                  <span className="block text-sm font-medium text-ink">{step.title}</span>
                  <span className="mt-0.5 block text-xs leading-5 text-muted">{step.body}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}
