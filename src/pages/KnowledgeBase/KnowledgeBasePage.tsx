import { Page, PageIntro } from '../../components/ui/PageIntro'
import { KnowledgeView } from '../../features/knowledge-base/KnowledgeView'

export function KnowledgeBasePage() {
  return (
    <Page>
      <PageIntro
        title="База знаний"
        description="Брифы, спецификации и исследования, которые позже дадут помощнику контекст для новых задач."
      />
      <KnowledgeView />
    </Page>
  )
}
