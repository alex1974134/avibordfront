import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { useI18n } from '../../i18n/useI18n'
import { useAppStore } from '../../store/useAppStore'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'

const endpoint = 'https://bot.aivibe.board/demo/hook'
const capabilities = ['cap1', 'cap2', 'cap3', 'cap4'] as const

export function TelegramCard() {
  const connected = useAppStore((state) => state.telegramConnected)
  const setTelegramConnected = useAppStore((state) => state.setTelegramConnected)
  const showToast = useAppStore((state) => state.showToast)
  const [copied, setCopied] = useState(false)
  const { t } = useI18n()

  const copyEndpoint = async () => {
    try {
      await navigator.clipboard.writeText(endpoint)
      setCopied(true)
      showToast(t('toastCopied'))
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      showToast(t('toastCopyFailed'))
    }
  }

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#229ed9] text-white">
            <TelegramMark />
          </span>
          <div>
            <h2 className="text-base font-semibold tracking-tight text-ink">{t('telegramBot')}</h2>
            <p className="text-xs text-faint">@aivibe_board_bot</p>
          </div>
        </div>
        <Badge tone={connected ? 'success' : 'neutral'}>{connected ? t('connected') : t('disconnected')}</Badge>
      </div>
      <p className="mt-4 text-sm leading-6 text-muted">{t('telegramBody')}</p>
      <ul className="mt-4 flex flex-col gap-2">
        {capabilities.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-ink">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <span>{t(item)}</span>
          </li>
        ))}
      </ul>
      {connected ? (
        <div className="mt-4">
          <p className="text-xs font-medium text-muted">{t('demoAddress')}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded-lg border border-line bg-zinc-50 px-3 py-2 text-xs text-ink">
              {endpoint}
            </code>
            <Button variant="secondary" size="sm" icon={<Copy className="h-3.5 w-3.5" />} onClick={() => void copyEndpoint()}>
              {copied ? t('copied') : t('copy')}
            </Button>
          </div>
        </div>
      ) : null}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        {connected ? (
          <Button variant="secondary" onClick={() => setTelegramConnected(false)}>
            {t('disconnect')}
          </Button>
        ) : (
          <Button onClick={() => setTelegramConnected(true)}>{t('connectTelegram')}</Button>
        )}
        <p className="text-xs text-faint">{t('telegramSimulated')}</p>
      </div>
    </Card>
  )
}

function TelegramMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path fill="currentColor" d="M20.7 4.3 3.4 10.9c-1.2.5-1.2 1.1-.2 1.4l4.4 1.4 1.7 5.2c.2.6.1.8.7.8.4 0 .6-.2.8-.4l2.4-2.3 4.9 3.6c.9.5 1.5.2 1.7-.8l3.1-14.6c.3-1.2-.4-1.7-1.2-1.3zM9.2 13.7l8.8-5.5c.4-.3.8-.1.5.2l-7.5 6.8-.3 3.2-1.5-4.7z" />
    </svg>
  )
}
