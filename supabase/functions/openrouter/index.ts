import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
const MODEL = 'openai/gpt-6-luna'

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string }

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json', Connection: 'keep-alive' },
  })
}

async function resolveOpenRouterApiKey(): Promise<string | null> {
  const fromEnv = Deno.env.get('OPENROUTER_API_KEY')
  if (fromEnv) return fromEnv

  const dbUrl = Deno.env.get('SUPABASE_DB_URL')
  if (!dbUrl) return null

  const { default: postgres } = await import('https://deno.land/x/postgresjs@v3.4.5/mod.js')
  const sql = postgres(dbUrl, { max: 1 })
  try {
    const rows = await sql<{ decrypted_secret: string }[]>`
      select decrypted_secret from vault.decrypted_secrets where name = 'OPENROUTER_API_KEY' limit 1
    `
    return rows[0]?.decrypted_secret ?? null
  } finally {
    await sql.end({ timeout: 0 })
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  const apiKey = await resolveOpenRouterApiKey()
  if (!apiKey) {
    return jsonResponse({ error: 'OPENROUTER_API_KEY is not configured' }, 500)
  }

  let body: { prompt?: string; messages?: ChatMessage[]; json?: boolean }
  try {
    body = await req.json()
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400)
  }

  let messages: ChatMessage[]
  if (Array.isArray(body.messages) && body.messages.length > 0) {
    messages = body.messages
  } else if (typeof body.prompt === 'string' && body.prompt.trim()) {
    messages = [{ role: 'user', content: body.prompt.trim() }]
  } else {
    return jsonResponse({ error: 'Provide prompt or non-empty messages' }, 400)
  }

  const upstream = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': Deno.env.get('SUPABASE_URL') ?? 'https://supabase.co',
      'X-Title': 'AivibeBoard',
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      ...(body.json ? { response_format: { type: 'json_object' } } : {}),
    }),
  })

  const payload = await upstream.json().catch(() => null)

  if (!upstream.ok) {
    const message =
      typeof payload === 'object' && payload !== null && 'error' in payload
        ? String((payload as { error: unknown }).error)
        : upstream.statusText || 'OpenRouter request failed'
    return jsonResponse({ error: message }, upstream.status >= 400 && upstream.status < 600 ? upstream.status : 502)
  }

  const text =
    typeof payload === 'object' &&
    payload !== null &&
    'choices' in payload &&
    Array.isArray((payload as { choices: unknown }).choices) &&
    (payload as { choices: { message?: { content?: string } }[] }).choices[0]?.message?.content

  if (typeof text !== 'string') {
    return jsonResponse({ error: 'Unexpected OpenRouter response' }, 502)
  }

  return jsonResponse({ text, model: MODEL })
})
