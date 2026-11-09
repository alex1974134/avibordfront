import { useEffect, useState } from 'react'
import { useWorkspaceData } from '../../hooks/useWorkspaceData'
import { useAppStore } from '../../store/useAppStore'
import { useAuthStore } from '../../store/useAuthStore'
import type { PreferenceKey } from '../../types'
import { localized, roleText } from '../../i18n/content'
import { useI18n } from '../../i18n/useI18n'
import { noun } from '../../utils/format'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Field, Input } from '../../components/ui/Input'
import { Page, PageIntro } from '../../components/ui/PageIntro'
import { Switch } from '../../components/ui/Switch'

const preferenceCopy: { key: PreferenceKey; title: 'prefProduct' | 'prefComments' | 'prefAi'; body: 'prefProductBody' | 'prefCommentsBody' | 'prefAiBody' }[] = [
  { key: 'product', title: 'prefProduct', body: 'prefProductBody' },
  { key: 'comments', title: 'prefComments', body: 'prefCommentsBody' },
  { key: 'ai', title: 'prefAi', body: 'prefAiBody' },
]

export function SettingsPage() {
  const { currentUser, workspace, members } = useWorkspaceData()
  const users = useAppStore((state) => state.users)
  const updateCurrentUser = useAppStore((state) => state.updateCurrentUser)
  const preferences = useAppStore((state) => state.preferences)
  const togglePreference = useAppStore((state) => state.togglePreference)
  const logout = useAuthStore((state) => state.logout)
  const [name, setName] = useState(currentUser.name)
  const [role, setRole] = useState(currentUser.role)
  const [email, setEmail] = useState(currentUser.email)
  const [error, setError] = useState('')
  const { locale, t } = useI18n()
  const roleValue = role === currentUser.role ? roleText(locale, currentUser.role) : role

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
      setError(t('nameRequired'))
      return
    }
    if (!/^\S+@\S+\.\S+$/.test(nextEmail)) {
      setError(t('emailInvalid'))
      return
    }
    const taken = users.some((user) => user.id !== currentUser.id && user.email.toLowerCase() === nextEmail.toLowerCase())
    if (taken) {
      setError(t('emailTaken'))
      return
    }
    setError('')
    updateCurrentUser({ name: nextName, role: role.trim() || currentUser.role, email: nextEmail })
  }

  return (
    <Page>
      <PageIntro title={t('navSettings')} description={t('settingsIntro')} />
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-ink">{t('profile')}</h2>
          <form
            className="mt-4 flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault()
              save()
            }}
          >
            <Field label={t('name')}>
              <Input value={name} onChange={(event) => setName(event.target.value)} />
            </Field>
            <Field label={t('role')}>
              <Input value={roleValue} onChange={(event) => setRole(event.target.value)} />
            </Field>
            <Field label={t('email')} error={error}>
              <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            </Field>
            <div>
              <Button type="submit" disabled={!dirty}>
                {t('saveProfile')}
              </Button>
            </div>
          </form>
        </Card>
        <div className="flex flex-col gap-4">
          <Card padding={false}>
            <div className="border-b border-line px-4 py-3">
              <h2 className="text-sm font-semibold text-ink">{t('notifications')}</h2>
            </div>
            <div className="divide-y divide-line px-4">
              {preferenceCopy.map((item) => (
                <div key={item.key} className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-ink">{t(item.title)}</p>
                    <p className="text-xs leading-5 text-muted">{t(item.body)}</p>
                  </div>
                  <Switch
                    label={t(item.title)}
                    checked={preferences[item.key]}
                    onChange={() => togglePreference(item.key)}
                  />
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <h2 className="text-sm font-semibold text-ink">{t('space')}</h2>
            <p className="mt-2 text-sm text-ink">{localized(locale, `workspace.${workspace.id}.name`, workspace.name)}</p>
            <p className="mt-1 text-xs text-faint">
              {t('planLine', {
                plan: localized(locale, `workspace.${workspace.id}.plan`, workspace.plan),
                count: members.length,
                word: noun(locale, members.length, ['участник', 'участника', 'участников'], ['member', 'members']),
              })}
            </p>
            <p className="mt-3 text-xs leading-5 text-muted">{t('switchSpaceHint')}</p>
          </Card>
          <Card>
            <h2 className="text-sm font-semibold text-ink">{t('appearance')}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{t('appearanceBody')}</p>
          </Card>
          <Card>
            <h2 className="text-sm font-semibold text-ink">{t('session')}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{t('signedInAs', { email: currentUser.email })}</p>
            <div className="mt-4">
              <Button variant="secondary" onClick={logout}>
                {t('logout')}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </Page>
  )
}
