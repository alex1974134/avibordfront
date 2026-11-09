import type { MessageKey } from '../i18n/messages'
import { t } from '../i18n/translate'

export interface AuthFeedback {
  message: string
  confirm?: boolean
}

const rules: Array<{ key: MessageKey; match: (code: string, text: string) => boolean }> = [
  {
    key: 'authBadCredentials',
    match: (code, text) => code === 'invalid_credentials' || text.includes('invalid login credentials'),
  },
  {
    key: 'authConfirmEmail',
    match: (code, text) => code === 'email_not_confirmed' || text.includes('email not confirmed'),
  },
  {
    key: 'emailTaken',
    match: (code, text) =>
      code === 'user_already_exists' || text.includes('already registered') || text.includes('already been registered'),
  },
  {
    key: 'authWeakPassword',
    match: (code, text) => code === 'weak_password' || text.includes('password'),
  },
  {
    key: 'authRateLimit',
    match: (code, text) => code === 'over_request_rate_limit' || text.includes('rate limit'),
  },
  {
    key: 'authBadEmail',
    match: (code, text) => code === 'email_address_invalid' || (text.includes('email address') && text.includes('invalid')),
  },
  {
    key: 'authSignupOff',
    match: (code, text) => code === 'signup_disabled' || text.includes('signups not allowed'),
  },
]

export function messageFromError(error: { message: string; code?: string }, fallback: MessageKey): AuthFeedback {
  const code = error.code ?? ''
  const text = error.message.toLowerCase()
  const rule = rules.find((item) => item.match(code, text))
  return { message: t(rule?.key ?? fallback) }
}
