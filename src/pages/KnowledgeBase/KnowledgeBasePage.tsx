import { useI18n } from '../../i18n/useI18n'
import { Page, PageIntro } from '../../components/ui/PageIntro'
import { KnowledgeView } from '../../features/knowledge-base/KnowledgeView'

export function KnowledgeBasePage() {
  const { t } = useI18n()
  return (
    <Page>
      <PageIntro title={t('navKnowledge')} description={t('knowledgeIntro')} />
      <KnowledgeView />
    </Page>
  )
}
