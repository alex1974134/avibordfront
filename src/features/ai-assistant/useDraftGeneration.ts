import { useEffect, useRef, useState } from 'react'
import { useWorkspaceData } from '../../hooks/useWorkspaceData'
import { useI18n } from '../../i18n/useI18n'
import { useAppStore } from '../../store/useAppStore'
import { draftPlan } from './draftPlan'

export function useDraftGeneration() {
  const { locale, t } = useI18n()
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
  const [chosenProjectId, setProjectId] = useState<string | null>(null)
  const projectId = allProjects.some((project) => project.id === chosenProjectId)
    ? (chosenProjectId ?? '')
    : (allProjects[0]?.id ?? '')
  const [savedTurnId, setSavedTurnId] = useState<string | null>(null)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const active = turns.find((turn) => turn.id === activeAiTurnId) ?? null

  const generate = () => {
    const prompt = aiDraft.trim()
    if (!prompt) {
      setError(t('aiNeedGoal'))
      return
    }
    setError('')
    setLoading(true)
    window.setTimeout(() => {
      const plan = draftPlan(prompt, members.map((member) => member.id), locale)
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

  const saveActive = () => {
    if (!active || !projectId) return
    const ready = active.tasks.filter((task) => task.assigneeId)
    if (ready.length === 0) return
    addGeneratedTasks({ projectId, tasks: ready, workspaceId: workspace.id })
    setSavedTurnId(active.id)
  }

  const selectTurn = (turnId: string, prompt: string) => {
    setActiveAiTurn(turnId)
    setAiDraft(prompt)
  }

  return {
    t,
    members,
    allProjects,
    aiDraft,
    setAiDraft,
    turns,
    active,
    activeAiTurnId,
    loading,
    error,
    clearError: () => setError(''),
    projectId,
    setProjectId,
    savedTurnId,
    generate,
    saveActive,
    selectTurn,
  }
}
