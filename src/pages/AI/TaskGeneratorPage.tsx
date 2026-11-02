import { Page, PageIntro } from '../../components/ui/PageIntro'
import { AiComposer } from '../../features/ai-assistant/AiComposer'

export function TaskGeneratorPage() {
  return (
    <Page>
      <PageIntro
        title="Генератор задач"
        description="Превратите черновой результат в небольшой набор задач и положите их в проект."
      />
      <AiComposer layout="generator" />
    </Page>
  )
}
