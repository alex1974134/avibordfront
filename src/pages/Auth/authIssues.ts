import { isEmail } from '../../utils/email'

export type AuthMode = 'login' | 'register'
export type AuthField = 'name' | 'email' | 'password' | 'confirm'

type AuthIssue =
  | 'nameRequired'
  | 'authEnterEmail'
  | 'emailInvalid'
  | 'authEnterPassword'
  | 'authPasswordShort'
  | 'authPasswordMismatch'

export function authIssues(input: {
  mode: AuthMode
  name: string
  email: string
  password: string
  confirm: string
}): Partial<Record<AuthField, AuthIssue>> {
  const issues: Partial<Record<AuthField, AuthIssue>> = {}
  const email = input.email.trim()

  if (input.mode === 'register' && !input.name.trim()) issues.name = 'nameRequired'
  if (!email) issues.email = 'authEnterEmail'
  else if (!isEmail(email)) issues.email = 'emailInvalid'
  if (!input.password) issues.password = 'authEnterPassword'
  else if (input.mode === 'register' && input.password.length < 6) issues.password = 'authPasswordShort'
  if (input.mode === 'register' && !issues.password && input.password !== input.confirm) {
    issues.confirm = 'authPasswordMismatch'
  }
  return issues
}
