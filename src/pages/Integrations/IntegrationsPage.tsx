import { useI18n } from '../../i18n/useI18n'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
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
          <h2 className="text-sm font-semibold text-ink">{t('telegramFlowTitle')}</h2>
          <ol className="mt-3 flex flex-col gap-3">
            {flow.map((step, index) => (
              <li key={step.title} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-medium text-muted">
                  {index + 1}
                </span>
                <span>
                  <span className="block text-sm font-medium text-ink">{t(step.title)}</span>
                  <span className="mt-0.5 block text-xs leading-5 text-muted">{t(step.body)}</span>
                </span>
              </li>
            ))}
          </ol>
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
