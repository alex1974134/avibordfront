import { getLocale, type Locale } from '../../i18n/locale'
import { translate } from '../../i18n/translate'
import type { GeneratedTask } from '../../types'
import { countWord } from '../../utils/format'
import { draftThemes, generalSteps, type Copy } from './draftCatalog'

export interface DraftPlan {
  summary: string
  tasks: GeneratedTask[]
}

function shorten(prompt: string): string {
  const clean = prompt.replace(/\s+/g, ' ').trim()
  if (clean.length <= 84) return clean
  return `${clean.slice(0, 81)}...`
}

function pick(copy: Copy, locale: Locale): string {
  return copy[locale]
}

export function draftPlan(prompt: string, assigneeIds: string[], locale: Locale = getLocale()): DraftPlan {
  const goal = shorten(prompt)
  const theme = draftThemes.find((item) => item.test.test(prompt))
  const steps = theme?.steps ?? generalSteps
  const tasks = steps.map((step, index) => ({
    id: crypto.randomUUID(),
    title: pick(step.title(goal), locale),
    detail: pick(step.detail, locale),
    priority: step.priority,
    estimate: pick(step.estimate, locale),
    assigneeId: assigneeIds[index % Math.max(assigneeIds.length, 1)] ?? '',
  }))
  const word = countWord(locale, tasks.length, 'taskAcc')

  return {
    summary: theme
      ? translate(locale, 'aiSummaryTheme', { count: tasks.length, word, theme: translate(locale, theme.label) })
      : translate(locale, 'aiSummaryNote', { count: tasks.length, word }),
    tasks,
  }
}
