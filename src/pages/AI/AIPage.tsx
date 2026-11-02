import { Page, PageIntro } from '../../components/ui/PageIntro'
import { AiComposer } from '../../features/ai-assistant/AiComposer'

export function AIPage() {
  return (
    <Page>
      <PageIntro
        title="AI-помощник"
        description="Опишите результат. Aivibe набросает задачи и предложит, кому их отдать."
      />
      <AiComposer layout="assistant" />
    </Page>
  )
}
