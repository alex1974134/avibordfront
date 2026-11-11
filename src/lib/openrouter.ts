import { FunctionsHttpError } from '@supabase/supabase-js'
import { supabase } from './supabase'

export type OpenRouterChatRole = 'user' | 'assistant' | 'system'

export interface OpenRouterChatMessage {
  role: OpenRouterChatRole
  content: string
}

interface OpenRouterSuccess {
  text: string
  model: string
}

interface OpenRouterErrorBody {
  error?: string
}

async function invokeOpenRouter(
  body: { messages: OpenRouterChatMessage[]; json?: boolean },
): Promise<string> {
  const { data, error } = await supabase.functions.invoke<OpenRouterSuccess | OpenRouterErrorBody>('openrouter', {
    body,
  })

  if (error) {
    let detail = error.message
    if (error instanceof FunctionsHttpError) {
      try {
        const body = (await error.context.json()) as OpenRouterErrorBody
        if (body.error) detail = body.error
      } catch {
        /* keep default message */
      }
    }
    throw new Error(detail)
  }

  if (!data || typeof data !== 'object' || !('text' in data) || typeof data.text !== 'string') {
    throw new Error('Unexpected response from AI')
  }

  return data.text
}

export async function callOpenRouterChat(messages: OpenRouterChatMessage[]): Promise<string> {
  return invokeOpenRouter({ messages })
}

export async function callOpenRouterJson(messages: OpenRouterChatMessage[]): Promise<string> {
  return invokeOpenRouter({ messages, json: true })
}
