import { useEffect, useId, useState, type FormEvent, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useI18n } from '../../i18n/useI18n'
import { returnPath } from '../../utils/returnPath'
import { LanguageSwitch } from '../../components/layout/LanguageSwitch'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Field, Input, Select } from '../../components/ui/Input'
import { isTeamRole, roleText, teamRoleIds } from '../../i18n/content'
import { useAuthStore } from '../../store/useAuthStore'
import { cn } from '../../utils/cn'
import { authIssues, type AuthField, type AuthMode } from './authIssues'
import { PasswordField } from './PasswordField'

function readDraft(state: unknown): { name: string; email: string; from?: string } {
  if (!state || typeof state !== 'object') return { name: '', email: '' }
  const record = state as { name?: unknown; email?: unknown; from?: unknown }
  return {
    name: typeof record.name === 'string' ? record.name : '',
    email: typeof record.email === 'string' ? record.email : '',
    from: typeof record.from === 'string' ? record.from : undefined,
  }
}

export function AuthPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const register = useAuthStore((state) => state.register)
  const mode: AuthMode = location.pathname === '/register' ? 'register' : 'login'
  const draft = readDraft(location.state)
  const formId = useId()
  const [name, setName] = useState(draft.name)
  const [role, setRole] = useState('')
  const [email, setEmail] = useState(draft.email)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<Partial<Record<AuthField, string>>>({})
  const [notice, setNotice] = useState('')
  const [pending, setPending] = useState(false)
  const { locale, t } = useI18n()

  useEffect(() => {
    document.title = `${mode === 'register' ? t('authRegister') : t('authLogin')} · AivibeBoard`
  }, [mode, t])

  const switchMode = (next: AuthMode) => {
    if (next === mode) return
    setErrors({})
    setNotice('')
    setPassword('')
    setConfirm('')
    navigate(next === 'register' ? '/register' : '/login', {
      replace: true,
      state: { from: draft.from, name, email },
    })
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (pending) return
    const nextEmail = email.trim()
    const issues = authIssues({ mode, name, role, email, password, confirm })
    if (Object.keys(issues).length > 0) {
      setErrors({
        name: issues.name ? t(issues.name) : undefined,
        role: issues.role ? t(issues.role) : undefined,
        email: issues.email ? t(issues.email) : undefined,
        password: issues.password ? t(issues.password) : undefined,
        confirm: issues.confirm ? t(issues.confirm) : undefined,
      })
      setNotice('')
      return
    }

    setPending(true)
    setErrors({})
    setNotice('')
    try {
      const result =
        mode === 'login'
          ? await login(nextEmail, password)
          : await register({
              name: name.trim(),
              email: nextEmail,
              password,
              role: isTeamRole(role) ? role : '',
            })
      if (result?.confirm) {
        setNotice(result.message)
        return
      }
      if (result) {
        setErrors({ email: result.message })
        return
      }
      navigate(returnPath(location.state), { replace: true })
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-canvas px-4 py-10">
      <div className="absolute top-4 right-4">
        <LanguageSwitch />
      </div>
      <div className="w-full max-w-[420px]">
        <div className="mb-6 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-sm font-semibold text-white">
            A
          </span>
          <div>
            <p className="text-sm font-semibold tracking-tight text-ink">AivibeBoard</p>
            <p className="text-[11px] text-faint">{t('workspaceLabel')}</p>
          </div>
        </div>
        <Card className="p-6">
          <h1 className="text-lg font-semibold tracking-tight text-ink">
            {mode === 'login' ? t('authLogin') : t('authRegister')}
          </h1>
          <p className="mt-1 text-sm leading-6 text-muted">
            {mode === 'login' ? t('authLoginLead') : t('authRegisterLead')}
          </p>
          <div className="mt-5 grid grid-cols-2 rounded-lg bg-canvas p-1">
            <ModeButton active={mode === 'login'} onClick={() => switchMode('login')}>
              {t('authLogin')}
            </ModeButton>
            <ModeButton active={mode === 'register'} onClick={() => switchMode('register')}>
              {t('authRegister')}
            </ModeButton>
          </div>
          <form className="mt-5 flex flex-col gap-4" noValidate onSubmit={submit}>
            {mode === 'register' ? (
              <>
                <Field label={t('name')} error={errors.name}>
                  <Input
                    id={`${formId}-name`}
                    autoComplete="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                </Field>
                <Field label={t('role')} error={errors.role}>
                  <Select
                    id={`${formId}-role`}
                    value={role}
                    onChange={(event) => setRole(event.target.value)}
                  >
                    <option value="">{t('authRolePlaceholder')}</option>
                    {teamRoleIds.map((item) => (
                      <option key={item} value={item}>
                        {roleText(locale, item)}
                      </option>
                    ))}
                  </Select>
                </Field>
              </>
            ) : null}
            <Field label={t('email')} error={errors.email}>
              <Input
                id={`${formId}-email`}
                type="email"
                autoComplete="email"
                inputMode="email"
                spellCheck={false}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </Field>
            <PasswordField
              id={`${formId}-password`}
              label={t('authPassword')}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              error={errors.password}
              onChange={setPassword}
            />
            {mode === 'register' ? (
              <PasswordField
                id={`${formId}-confirm`}
                label={t('authConfirm')}
                autoComplete="new-password"
                value={confirm}
                error={errors.confirm}
                onChange={setConfirm}
              />
            ) : null}
            {notice ? <p className="text-sm leading-5 text-accent">{notice}</p> : null}
            <Button type="submit" className="mt-1 w-full" disabled={pending}>
              {pending ? t('authWait') : mode === 'login' ? t('authSignIn') : t('authCreate')}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}

function ModeButton({
  active,
  children,
  onClick,
}: {
  active: boolean
  children: ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className={cn(
        'h-8 cursor-pointer rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30',
        active ? 'bg-white text-ink shadow-[0_1px_2px_rgb(22_24_29/0.06)]' : 'text-muted hover:text-ink',
      )}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
