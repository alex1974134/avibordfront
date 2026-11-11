import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useWorkspaceData } from '../../hooks/useWorkspaceData'
import { useI18n } from '../../i18n/useI18n'
import { callOpenRouterChat, type OpenRouterChatMessage } from '../../lib/openrouter'
import type { Locale } from '../../i18n/locale'

export interface AiLiveChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

const MAX_API_MESSAGES = 24

function storageKey(workspaceId: string) {
  return `aivibe-ai-chat:${workspaceId}`
}

function readStored(workspaceId: string): AiLiveChatMessage[] {
  try {
    const raw = sessionStorage.getItem(storageKey(workspaceId))
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (row): row is AiLiveChatMessage =>
        typeof row === 'object' &&
        row !== null &&
        typeof (row as AiLiveChatMessage).id === 'string' &&
        ((row as AiLiveChatMessage).role === 'user' || (row as AiLiveChatMessage).role === 'assistant') &&
        typeof (row as AiLiveChatMessage).content === 'string',
    )
  } catch {
    return []
  }
}

function writeStored(workspaceId: string, messages: AiLiveChatMessage[]) {
  try {
    sessionStorage.setItem(storageKey(workspaceId), JSON.stringify(messages))
  } catch {
    /* quota / private mode */
  }
}

function systemPrompt(locale: Locale): string {
  if (locale === 'en') {
    return 'You are the AivibeBoard assistant: help with projects, tasks, and teamwork. Answer clearly and concisely in English unless the user writes in another language.'
  }
  return 'Ты помощник AivibeBoard: помогаешь с проектами, задачами и работой команды. Отвечай ясно и по делу на русском, если пользователь не пишет на другом языке.'
}

function toApiMessages(ui: AiLiveChatMessage[], locale: Locale): OpenRouterChatMessage[] {
  const tail = ui.slice(-MAX_API_MESSAGES)
  return [{ role: 'system', content: systemPrompt(locale) }, ...tail.map(({ role, content }) => ({ role, content }))]
}

export function useAiLiveChat() {
  const { t, locale } = useI18n()
  const { workspace } = useWorkspaceData()
  const workspaceId = workspace.id

  const [messages, setMessages] = useState<AiLiveChatMessage[]>(() => readStored(workspaceId))
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inFlight = useRef(false)

  useEffect(() => {
    setMessages(readStored(workspaceId))
    setDraft('')
    setError('')
  }, [workspaceId])

  useEffect(() => {
    writeStored(workspaceId, messages)
  }, [workspaceId, messages])

  const canSend = useMemo(() => draft.trim().length > 0 && !loading, [draft, loading])

  const send = useCallback(async () => {
    const text = draft.trim()
    if (!text || loading || inFlight.current) return

    const userMessage: AiLiveChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    }

    const nextHistory = [...messages, userMessage]
    setMessages(nextHistory)
    setDraft('')
    setError('')
    setLoading(true)
    inFlight.current = true

    try {
      const reply = await callOpenRouterChat(toApiMessages(nextHistory, locale))
      const assistantMessage: AiLiveChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: reply,
        createdAt: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      setError(err instanceof Error ? err.message : t('aiChatError'))
    } finally {
      setLoading(false)
      inFlight.current = false
    }
  }, [draft, loading, locale, messages, t])

  const clearChat = useCallback(() => {
    setMessages([])
    setError('')
    setDraft('')
    try {
      sessionStorage.removeItem(storageKey(workspaceId))
    } catch {
      /* ignore */
    }
  }, [workspaceId])

  return {
    t,
    messages,
    draft,
    setDraft,
    loading,
    error,
    clearError: () => setError(''),
    canSend,
    send,
    clearChat,
  }
}
