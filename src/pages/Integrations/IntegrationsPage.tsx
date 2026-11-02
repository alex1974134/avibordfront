import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { Page, PageIntro } from '../../components/ui/PageIntro'
import { TelegramCard } from '../../features/telegram/TelegramCard'

const flow = [
  { title: 'Напишите боту', body: 'Опишите результат обычным языком и упомяните исполнителя, если он известен.' },
  { title: 'Aivibe собирает задачу', body: 'Заметка сопоставляется с проектом и возвращается со статусом «К выполнению».' },
  { title: 'Доска остаётся в синхроне', body: 'Смену статуса можно отправить обратно в тот же чат.' },
]

export function IntegrationsPage() {
  return (
    <Page>
      <PageIntro
        title="Интеграция Telegram"
        description="Забирайте работу из переписки, которая у команды уже открыта."
      />
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(260px,0.75fr)]">
        <TelegramCard />
        <Card>
          <h2 className="text-sm font-semibold text-ink">От сообщения к задаче</h2>
          <ol className="mt-3 flex flex-col gap-3">
            {flow.map((step, index) => (
              <li key={step.title} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-medium text-muted">
                  {index + 1}
                </span>
                <span>
                  <span className="block text-sm font-medium text-ink">{step.title}</span>
                  <span className="mt-0.5 block text-xs leading-5 text-muted">{step.body}</span>
                </span>
              </li>
            ))}
          </ol>
        </Card>
      </div>
      <Card className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-ink">Другие подключения позже</h2>
          <p className="mt-1 text-sm text-muted">Slack, приём из почты и синхронизация календаря — в планах.</p>
        </div>
        <Badge>Не подключено</Badge>
      </Card>
    </Page>
  )
}
