import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { useWorkspaceData } from '../../hooks/useWorkspaceData'
import { inviteRoleIds, localized, roleText } from '../../i18n/content'
import { useI18n } from '../../i18n/useI18n'
import { useAppStore } from '../../store/useAppStore'
import { isEmail } from '../../utils/email'
import { Button } from '../../components/ui/Button'
import { Field, Input, Select } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'

export function InviteModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const users = useAppStore((state) => state.users)
  const inviteMember = useAppStore((state) => state.inviteMember)
  const { workspace } = useWorkspaceData()
  const { locale, t } = useI18n()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<(typeof inviteRoleIds)[number]>(inviteRoleIds[0])
  const [error, setError] = useState('')

  const reset = () => {
    setName('')
    setEmail('')
    setRole(inviteRoleIds[0])
    setError('')
  }

  const close = () => {
    reset()
    onClose()
  }

  const submit = () => {
    const nextName = name.trim()
    const nextEmail = email.trim().toLowerCase()
    if (!nextName) {
      setError(t('addName'))
      return
    }
    if (!isEmail(nextEmail)) {
      setError(t('emailInvalid'))
      return
    }
    if (users.some((user) => user.email.toLowerCase() === nextEmail)) {
      setError(t('emailTakenSpace'))
      return
    }
    inviteMember({ name: nextName, email: nextEmail, role })
    close()
  }

  return (
    <Modal
      open={open}
      title={t('inviteTitle')}
      description={t('inviteBody', { name: localized(locale, `workspace.${workspace.id}.name`, workspace.name) })}
      onClose={close}
      footer={
        <>
          <Button variant="secondary" onClick={close}>
            {t('cancel')}
          </Button>
          <Button type="submit" form="invite-form">
            {t('inviteSend')}
          </Button>
        </>
      }
    >
      <form
        id="invite-form"
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          submit()
        }}
      >
        <Field label={t('name')} error={error && !name.trim() ? error : undefined}>
          <Input value={name} onChange={(event) => setName(event.target.value)} placeholder={t('namePlaceholder')} />
        </Field>
        <Field label={t('email')} error={name.trim() ? error : undefined}>
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="jordan@aivibe.io"
          />
        </Field>
        <Field label={t('role')}>
          <Select value={role} onChange={(event) => setRole(event.target.value as (typeof inviteRoleIds)[number])}>
            {inviteRoleIds.map((item) => (
              <option key={item} value={item}>
                {roleText(locale, item)}
              </option>
            ))}
          </Select>
        </Field>
      </form>
    </Modal>
  )
}

export function InviteButton() {
  const [open, setOpen] = useState(false)
  const { t } = useI18n()
  return (
    <>
      <Button size="sm" icon={<UserPlus className="h-3.5 w-3.5" />} onClick={() => setOpen(true)}>
        {t('invite')}
      </Button>
      <InviteModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
