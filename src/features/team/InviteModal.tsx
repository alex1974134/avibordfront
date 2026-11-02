import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { useWorkspaceData } from '../../hooks/useWorkspaceData'
import { useAppStore } from '../../store/useAppStore'
import { Button } from '../../components/ui/Button'
import { Field, Input, Select } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'

const roles = ['Продукт', 'Дизайн', 'Разработка', 'Маркетинг', 'Операции']

export function InviteModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const users = useAppStore((state) => state.users)
  const inviteMember = useAppStore((state) => state.inviteMember)
  const { workspace } = useWorkspaceData()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState(roles[0] ?? 'Продукт')
  const [error, setError] = useState('')

  const reset = () => {
    setName('')
    setEmail('')
    setRole(roles[0] ?? 'Продукт')
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
      setError('Добавьте имя.')
      return
    }
    if (!/^\S+@\S+\.\S+$/.test(nextEmail)) {
      setError('Введите корректную почту.')
      return
    }
    if (users.some((user) => user.email.toLowerCase() === nextEmail)) {
      setError('Эта почта уже есть в пространстве.')
      return
    }
    inviteMember({ name: nextName, email: nextEmail, role })
    close()
  }

  return (
    <Modal
      open={open}
      title="Пригласить в команду"
      description={`Человек появится в «${workspace.name}».`}
      onClose={close}
      footer={
        <>
          <Button variant="secondary" onClick={close}>
            Отмена
          </Button>
          <Button type="submit" form="invite-form">
            Отправить приглашение
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
        <Field label="Имя" error={error && !name.trim() ? error : undefined}>
          <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Анна Иванова" />
        </Field>
        <Field label="Почта" error={name.trim() ? error : undefined}>
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="jordan@aivibe.io"
          />
        </Field>
        <Field label="Роль">
          <Select value={role} onChange={(event) => setRole(event.target.value)}>
            {roles.map((item) => (
              <option key={item} value={item}>
                {item}
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
  return (
    <>
      <Button size="sm" icon={<UserPlus className="h-3.5 w-3.5" />} onClick={() => setOpen(true)}>
        Пригласить
      </Button>
      <InviteModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
