import { useEffect, useId, useState, type FormEvent, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { returnPath } from '../../utils/returnPath'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Field, Input } from '../../components/ui/Input'
import { useAuthStore } from '../../store/useAuthStore'
import { cn } from '../../utils/cn'

type Mode = 'login' | 'register'
type FieldName = 'name' | 'email' | 'password' | 'confirm'

const emailPattern = /^\S+@\S+\.\S+$/

function readDraft(state: unknown): { name: string; email: string; from?: string } {
  if (!state || typeof state !== 'object') return { name: '', email: '' }
  const record = state as { name?: unknown; email?: unknown; from?: unknown }
  return {
    name: typeof record.name === 'string' ? record.name : '',
    email: typeof record.email === 'string' ? record.email : '',
    from: typeof record.from === 'string' ? record.from : undefined,
  }
}

function PasswordField({
  id,
  label,
  value,
  autoComplete,
  error,
  onChange,
}: {
  id: string
  label: string
  value: string
  autoComplete: string
  error?: string
  onChange: (value: string) => void
}) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="flex flex-col gap-1.5 text-sm">
      <label htmlFor={id} className="font-medium text-ink">
        {label}
      </label>
      <div className="relative">
        <Input
          id={id}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          value={value}
          className="pr-10"
          onChange={(event) => onChange(event.target.value)}
        />
        <button
          type="button"
          aria-label={visible ? 'Скрыть пароль' : 'Показать пароль'}
          className="absolute top-0.5 right-0.5 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-faint transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error ? <span className="text-xs text-rose-600">{error}</span> : null}
    </div>
  )
}

export function AuthPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const register = useAuthStore((state) => state.register)
  const mode: Mode = location.pathname === '/register' ? 'register' : 'login'
  const draft = readDraft(location.state)
  const formId = useId()
  const [name, setName] = useState(draft.name)
  const [email, setEmail] = useState(draft.email)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({})
  const [notice, setNotice] = useState('')
  const [pending, setPending] = useState(false)

  useEffect(() => {
    document.title = mode === 'register' ? 'Регистрация · AivibeBoard' : 'Вход · AivibeBoard'
  }, [mode])

  const switchMode = (next: Mode) => {
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
    const nextErrors: Partial<Record<FieldName, string>> = {}
    const nextEmail = email.trim()

    if (mode === 'register' && !name.trim()) nextErrors.name = 'Имя обязательно.'
    if (!nextEmail) nextErrors.email = 'Введите почту.'
    else if (!emailPattern.test(nextEmail)) nextErrors.email = 'Введите корректную почту.'
    if (!password) nextErrors.password = 'Введите пароль.'
    else if (mode === 'register' && password.length < 6) {
      nextErrors.password = 'Пароль должен быть не короче 6 символов.'
    }
    if (mode === 'register' && !nextErrors.password && password !== confirm) {
      nextErrors.confirm = 'Пароли не совпадают.'
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
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
          : await register({ name: name.trim(), email: nextEmail, password })
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
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-10">
      <div className="w-full max-w-[420px]">
        <div className="mb-6 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-sm font-semibold text-white">
            A
          </span>
          <div>
            <p className="text-sm font-semibold tracking-tight text-ink">AivibeBoard</p>
            <p className="text-[11px] text-faint">Рабочее пространство</p>
          </div>
        </div>
        <Card className="p-6">
          <h1 className="text-lg font-semibold tracking-tight text-ink">
            {mode === 'login' ? 'Вход' : 'Регистрация'}
          </h1>
          <p className="mt-1 text-sm leading-6 text-muted">
            {mode === 'login'
              ? 'Введите почту и пароль, чтобы открыть доску.'
              : 'Аккаунт сразу попадёт в пространство Aivibe Studio.'}
          </p>
          <div className="mt-5 grid grid-cols-2 rounded-lg bg-canvas p-1">
            <ModeButton active={mode === 'login'} onClick={() => switchMode('login')}>
              Вход
            </ModeButton>
            <ModeButton active={mode === 'register'} onClick={() => switchMode('register')}>
              Регистрация
            </ModeButton>
          </div>
          <form className="mt-5 flex flex-col gap-4" noValidate onSubmit={submit}>
            {mode === 'register' ? (
              <Field label="Имя" error={errors.name}>
                <Input
                  id={`${formId}-name`}
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </Field>
            ) : null}
            <Field label="Почта" error={errors.email}>
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
              label="Пароль"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              error={errors.password}
              onChange={setPassword}
            />
            {mode === 'register' ? (
              <PasswordField
                id={`${formId}-confirm`}
                label="Повторите пароль"
                autoComplete="new-password"
                value={confirm}
                error={errors.confirm}
                onChange={setConfirm}
              />
            ) : null}
            {notice ? <p className="text-sm leading-5 text-accent">{notice}</p> : null}
            <Button type="submit" className="mt-1 w-full" disabled={pending}>
              {pending ? 'Подождите…' : mode === 'login' ? 'Войти' : 'Создать аккаунт'}
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
