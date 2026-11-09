import { useI18n } from '../../i18n/useI18n'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { NumberedSteps } from '../../components/ui/NumberedSteps'
import { Page, PageIntro } from '../../components/ui/PageIntro'
import { TelegramCard } from '../../features/telegram/TelegramCard'

const flow = [
  { title: 'telegramStep1Title', body: 'telegramStep1Body' },
  { title: 'telegramStep2Title', body: 'telegramStep2Body' },
  { title: 'telegramStep3Title', body: 'telegramStep3Body' },
] as const

export function IntegrationsPage() {
  const { t } = useI18n()
  return (
    <Page>
      <PageIntro title={t('navTelegram')} description={t('telegramIntro')} />
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(260px,0.75fr)]">
        <TelegramCard />
        <Card>
          <NumberedSteps title={t('telegramFlowTitle')} steps={flow} />
        </Card>
      </div>
      <Card className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-ink">{t('otherSoon')}</h2>
          <p className="mt-1 text-sm text-muted">{t('otherSoonBody')}</p>
        </div>
        <Badge>{t('notConnected')}</Badge>
      </Card>
    </Page>
  )
}
