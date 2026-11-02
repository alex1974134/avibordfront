import { useEffect, useState } from 'react'
import { useWorkspaceData } from '../../hooks/useWorkspaceData'
import { useAppStore } from '../../store/useAppStore'
import type { PreferenceKey } from '../../types'
import { plural } from '../../utils/format'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Field, Input } from '../../components/ui/Input'
import { Page, PageIntro } from '../../components/ui/PageIntro'
import { Switch } from '../../components/ui/Switch'

const preferenceCopy: { key: PreferenceKey; title: string; body: string }[] = [
  { key: 'product', title: 'Обновления проектов', body: 'Смена статуса и сроки по вашим проектам.' },
  { key: 'comments', title: 'Комментарии', body: 'Когда кто-то комментирует задачу, за которой вы следите.' },
  { key: 'ai', title: 'Черновики AI', body: 'Когда сгенерированный черновик готов к проверке.' },
]

export function SettingsPage() {
  const { currentUser, workspace, members } = useWorkspaceData()
  const users = useAppStore((state) => state.users)
  const updateCurrentUser = useAppStore((state) => state.updateCurrentUser)
  const preferences = useAppStore((state) => state.preferences)
  const togglePreference = useAppStore((state) => state.togglePreference)
  const [name, setName] = useState(currentUser.name)
  const [role, setRole] = useState(currentUser.role)
  const [email, setEmail] = useState(currentUser.email)
  const [error, setError] = useState('')

  useEffect(() => {
    setName(currentUser.name)
    setRole(currentUser.role)
    setEmail(currentUser.email)
  }, [currentUser])

  const dirty = name !== currentUser.name || role !== currentUser.role || email !== currentUser.email

  const save = () => {
    const nextName = name.trim()
    const nextEmail = email.trim()
    if (!nextName) {
      setError('Имя обязательно.')
      return
    }
    if (!/^\S+@\S+\.\S+$/.test(nextEmail)) {
      setError('Введите корректную почту.')
      return
    }
    const taken = users.some((user) => user.id !== currentUser.id && user.email.toLowerCase() === nextEmail.toLowerCase())
    if (taken) {
      setError('Эта почта уже занята.')
      return
    }
    setError('')
    updateCurrentUser({ name: nextName, role: role.trim() || currentUser.role, email: nextEmail })
  }

  return (
    <Page>
      <PageIntro title="Настройки" description="Профиль, уведомления и пространство, в котором вы сейчас." />
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-ink">Профиль</h2>
          <form
            className="mt-4 flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault()
              save()
            }}
          >
            <Field label="Имя">
              <Input value={name} onChange={(event) => setName(event.target.value)} />
            </Field>
            <Field label="Роль">
              <Input value={role} onChange={(event) => setRole(event.target.value)} />
            </Field>
            <Field label="Почта" error={error}>
              <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            </Field>
            <div>
              <Button type="submit" disabled={!dirty}>
                Сохранить профиль
              </Button>
            </div>
          </form>
        </Card>
        <div className="flex flex-col gap-4">
          <Card padding={false}>
            <div className="border-b border-line px-4 py-3">
              <h2 className="text-sm font-semibold text-ink">Уведомления</h2>
            </div>
            <div className="divide-y divide-line px-4">
              {preferenceCopy.map((item) => (
                <div key={item.key} className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-ink">{item.title}</p>
                    <p className="text-xs leading-5 text-muted">{item.body}</p>
                  </div>
                  <Switch
                    label={item.title}
                    checked={preferences[item.key]}
                    onChange={() => togglePreference(item.key)}
                  />
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <h2 className="text-sm font-semibold text-ink">Пространство</h2>
            <p className="mt-2 text-sm text-ink">{workspace.name}</p>
            <p className="mt-1 text-xs text-faint">
              Тариф {workspace.plan} · {members.length} {plural(members.length, 'участник', 'участника', 'участников')}
            </p>
            <p className="mt-3 text-xs leading-5 text-muted">Пространство можно сменить в боковой панели.</p>
          </Card>
          <Card>
            <h2 className="text-sm font-semibold text-ink">Оформление</h2>
            <p className="mt-2 text-sm leading-6 text-muted">В этом прототипе по умолчанию светлая тема.</p>
          </Card>
        </div>
      </div>
    </Page>
  )
}
