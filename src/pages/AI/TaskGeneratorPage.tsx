import { useI18n } from '../../i18n/useI18n'
import { Page, PageIntro } from '../../components/ui/PageIntro'
import { AiComposer } from '../../features/ai-assistant/AiComposer'

export function TaskGeneratorPage() {
  const { t } = useI18n()
  return (
    <Page>
      <PageIntro title={t('navGenerator')} description={t('aiGeneratorIntro')} />
      <AiComposer layout="generator" />
    </Page>
  )
}
