import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { LoaderCircle, Sparkles, Trash2 } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Textarea } from '../../components/ui/Input'
import { cn } from '../../utils/cn'
import { useAiLiveChat } from './useAiLiveChat'

export function AiLiveChat() {
  const chat = useAiLiveChat()
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = listRef.current
    if (!node) return
    node.scrollTop = node.scrollHeight
  }, [chat.messages, chat.loading])

  const onSubmit = () => {
    if (!chat.canSend) return
    void chat.send()
  }

  return (
    <div
      id="ai-assistant"
      className="flex h-full min-h-[360px] flex-col rounded-xl border border-accent-ring bg-white p-4 shadow-[0_1px_2px_rgb(22_24_29/0.04)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-accent">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-soft">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="text-xs font-medium">{chat.t('navAi')}</span>
        </div>
        <div className="flex items-center gap-2">
          {chat.messages.length > 0 ? (
            <button
              type="button"
              onClick={chat.clearChat}
              className="inline-flex items-center gap-1 text-xs font-medium text-muted hover:text-ink"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {chat.t('aiChatClear')}
            </button>
          ) : null}
          <Link to="/ai" className="text-xs font-medium text-muted hover:text-ink">
            {chat.t('aiOpen')}
          </Link>
        </div>
      </div>

      <h2 className="mt-3 text-base font-semibold tracking-tight text-ink">{chat.t('aiChatTitle')}</h2>
      <p className="mt-1 text-sm leading-6 text-muted">{chat.t('aiChatSubtitle')}</p>

      <div
        ref={listRef}
        className="mt-4 flex max-h-64 min-h-40 flex-1 flex-col gap-3 overflow-y-auto rounded-lg border border-line bg-zinc-50/80 p-3"
        aria-live="polite"
      >
        {chat.messages.length === 0 ? (
          <p className="m-auto max-w-[28ch] text-center text-sm text-faint">{chat.t('aiChatEmpty')}</p>
        ) : (
          chat.messages.map((message) => (
            <div
              key={message.id}
              className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              <ChatBubble role={message.role} content={message.content} />
            </div>
          ))
        )}
        {chat.loading ? (
          <ChatBubble role="assistant" content="" loading label={chat.t('aiGathering')} />
        ) : null}
      </div>

      <div className="mt-4">
        <label className="sr-only" htmlFor="ai-chat-input">
          {chat.t('aiChatInputLabel')}
        </label>
        <Textarea
          id="ai-chat-input"
          value={chat.draft}
          rows={3}
          className="min-h-[72px] resize-none"
          placeholder={chat.t('aiChatPlaceholder')}
          onChange={(event) => {
            chat.setDraft(event.target.value)
            if (chat.error) chat.clearError()
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              onSubmit()
            }
          }}
        />
        {chat.error ? <p className="mt-1.5 text-xs text-rose-600">{chat.error}</p> : null}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button
            onClick={onSubmit}
            disabled={!chat.canSend}
            icon={chat.loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          >
            {chat.loading ? chat.t('aiGathering') : chat.t('aiChatSend')}
          </Button>
          <p className="text-xs text-faint">{chat.t('aiChatCloudNote')}</p>
        </div>
      </div>
    </div>
  )
}

function ChatBubble({
  role,
  content,
  loading,
  label,
}: {
  role: 'user' | 'assistant'
  content: string
  loading?: boolean
  label?: string
}) {
  const isUser = role === 'user'
  return (
    <div
      className={cn(
        'max-w-[92%] rounded-xl px-3 py-2 text-sm leading-6',
        isUser ? 'bg-accent text-white' : 'border border-line bg-white text-ink',
      )}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2 text-muted">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          {label}
        </span>
      ) : (
        <p className="whitespace-pre-wrap">{content}</p>
      )}
    </div>
  )
}
