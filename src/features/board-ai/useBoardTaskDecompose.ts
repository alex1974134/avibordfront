import { useCallback, useState } from 'react'
import { useI18n } from '../../i18n/useI18n'
import { callOpenRouterJson } from '../../lib/openrouter'
import { useAppStore } from '../../store/useAppStore'
import type { GeneratedTask, User } from '../../types'
import { buildDecomposeMessages } from './buildDecomposePrompt'
import { parseDecomposePlan } from './parseDecomposePlan'

export function useBoardTaskDecompose({
  projectId,
  workspaceId,
  memberIds,
  members,
}: {
  projectId: string
  workspaceId: string
  memberIds: string[]
  members: User[]
}) {
  const { locale, t } = useI18n()
  const addGeneratedTasks = useAppStore((state) => state.addGeneratedTasks)
  const [open, setOpen] = useState(false)
  const [goal, setGoal] = useState('')
  const [loading, setLoading] = useState(false)
  const [applying, setApplying] = useState(false)
  const [error, setError] = useState('')
  const [summary, setSummary] = useState('')
  const [tasks, setTasks] = useState<GeneratedTask[]>([])
  const [saved, setSaved] = useState(false)

  const hasMembers = memberIds.length > 0 && members.length > 0
  const canGenerate = hasMembers && goal.trim().length > 0 && !loading

  const generate = useCallback(async () => {
    const text = goal.trim()
    if (!text || !hasMembers || loading) return

    setError('')
    setSummary('')
    setTasks([])
    setSaved(false)
    setLoading(true)

    try {
      const messages = buildDecomposeMessages(text, members, locale)
      const raw = await callOpenRouterJson(messages)
      const plan = parseDecomposePlan(raw, members)
      setSummary(plan.summary)
      setTasks(plan.tasks)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('boardAiParseError'))
    } finally {
      setLoading(false)
    }
  }, [goal, hasMembers, loading, locale, members, t])

  const clear = useCallback(() => {
    setGoal('')
    setSummary('')
    setTasks([])
    setError('')
    setSaved(false)
  }, [])

  const updateTaskAssignee = useCallback((taskId: string, assigneeId: string) => {
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, assigneeId } : task)))
    setSaved(false)
  }, [])

  const applyToBoard = useCallback(async () => {
    if (tasks.length === 0 || applying) return
    setApplying(true)
    setError('')
    try {
      const ok = await addGeneratedTasks({ projectId, workspaceId, tasks, memberIds })
      if (ok) {
        setSaved(true)
      } else {
        setError(t('taskSaveFailed'))
        setSaved(false)
      }
    } finally {
      setApplying(false)
    }
  }, [addGeneratedTasks, applying, memberIds, projectId, t, tasks, workspaceId])

  return {
    t,
    open,
    setOpen,
    goal,
    setGoal,
    loading,
    applying,
    error,
    clearError: () => setError(''),
    summary,
    tasks,
    saved,
    hasMembers,
    canGenerate,
    generate,
    clear,
    updateTaskAssignee,
    applyToBoard,
  }
}
