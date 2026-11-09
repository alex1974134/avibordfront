import { Link } from 'react-router-dom'
import { LoaderCircle, Sparkles } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Textarea } from '../../components/ui/Input'
import { NumberedSteps } from '../../components/ui/NumberedSteps'
import { AiHistory } from './AiHistory'
import { AiResult } from './AiResult'
import { useDraftGeneration } from './useDraftGeneration'

const steps = [
  { title: 'aiStep1Title', body: 'aiStep1Body' },
  { title: 'aiStep2Title', body: 'aiStep2Body' },
  { title: 'aiStep3Title', body: 'aiStep3Body' },
] as const

export function AiComposer({ layout }: { layout: 'card' | 'assistant' | 'generator' }) {
  const draft = useDraftGeneration()

  const composer = (
    <div id={layout === 'card' ? 'ai-assistant' : undefined} className="rounded-xl border border-accent-ring bg-white p-4 shadow-[0_1px_2px_rgb(22_24_29/0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-accent">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-soft">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="text-xs font-medium">{draft.t('navAi')}</span>
        </div>
        {layout === 'card' ? (
          <Link to="/ai" className="text-xs font-medium text-muted hover:text-ink">
            {draft.t('aiOpen')}
          </Link>
        ) : null}
      </div>
      {layout === 'card' ? (
        <>
          <h2 className="mt-3 text-base font-semibold tracking-tight text-ink">{draft.t('aiCardTitle')}</h2>
          <p className="mt-1 text-sm leading-6 text-muted">{draft.t('aiCardBody')}</p>
        </>
      ) : null}
      <div className="mt-4">
        <label className="sr-only" htmlFor="ai-goal">
          {draft.t('aiGoal')}
        </label>
        <Textarea
          id="ai-goal"
          value={draft.aiDraft}
          placeholder={draft.t('aiGoalPlaceholder')}
          onChange={(event) => {
            draft.setAiDraft(event.target.value)
            if (draft.error) draft.clearError()
          }}
        />
        {draft.error ? <p className="mt-1.5 text-xs text-rose-600">{draft.error}</p> : null}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button
            onClick={draft.generate}
            disabled={draft.loading}
            icon={draft.loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          >
            {draft.loading ? draft.t('aiGathering') : draft.t('aiGenerate')}
          </Button>
          <p className="text-xs text-faint">{draft.t('aiLocalNote')}</p>
        </div>
      </div>
      {draft.active ? (
        <AiResult
          turn={draft.active}
          users={draft.members}
          projects={draft.allProjects}
          projectId={draft.projectId}
          saved={draft.savedTurnId === draft.active.id}
          onProject={draft.setProjectId}
          onAdd={draft.saveActive}
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
          turns={draft.turns}
          activeId={draft.activeAiTurnId}
          onSelect={(turn) => draft.selectTurn(turn.id, turn.prompt)}
        />
      ) : (
        <div className="rounded-xl border border-line bg-white p-4 shadow-[0_1px_2px_rgb(22_24_29/0.04)]">
          <NumberedSteps title={draft.t('aiHow')} steps={steps} tone="accent" />
        </div>
      )}
    </div>
  )
}
