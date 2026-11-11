import { isTeamRole } from '../../i18n/content'
import { isEmail } from '../../utils/email'

export type AuthMode = 'login' | 'register'
export type AuthField = 'name' | 'role' | 'email' | 'password' | 'confirm'

type AuthIssue =
  | 'nameRequired'
  | 'authRoleRequired'
  | 'authEnterEmail'
  | 'emailInvalid'
  | 'authEnterPassword'
  | 'authPasswordShort'
  | 'authPasswordMismatch'

export function authIssues(input: {
  mode: AuthMode
  name: string
  role: string
  email: string
  password: string
  confirm: string
}): Partial<Record<AuthField, AuthIssue>> {
  const issues: Partial<Record<AuthField, AuthIssue>> = {}
  const email = input.email.trim()

  if (input.mode === 'register' && !input.name.trim()) issues.name = 'nameRequired'
  if (input.mode === 'register' && !isTeamRole(input.role)) issues.role = 'authRoleRequired'
  if (!email) issues.email = 'authEnterEmail'
  else if (!isEmail(email)) issues.email = 'emailInvalid'
  if (!input.password) issues.password = 'authEnterPassword'
  else if (input.mode === 'register' && input.password.length < 6) issues.password = 'authPasswordShort'
  if (input.mode === 'register' && !issues.password && input.password !== input.confirm) {
    issues.confirm = 'authPasswordMismatch'
  }
  return issues
}
