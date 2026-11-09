import { useEffect, useState } from 'react'
import { roleText } from '../../i18n/content'
import { useI18n } from '../../i18n/useI18n'
import { useWorkspaceData } from '../../hooks/useWorkspaceData'
import { useAppStore } from '../../store/useAppStore'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { Field, Input, Textarea } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'

export function NewBoardModal({
  open,
  formKey,
  onClose,
}: {
  open: boolean
  formKey: number
  onClose: () => void
}) {
  const addBoard = useAppStore((state) => state.addBoard)
  const setSearchQuery = useAppStore((state) => state.setSearchQuery)
  const { members, currentUser } = useWorkspaceData()
  const { locale, t } = useI18n()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [memberIds, setMemberIds] = useState<string[]>([])
  const [nameError, setNameError] = useState('')
  const [descriptionError, setDescriptionError] = useState('')
  const [membersError, setMembersError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setName('')
    setDescription('')
    setNameError('')
    setDescriptionError('')
    setMembersError('')
    setMemberIds(members.some((member) => member.id === currentUser.id) ? [currentUser.id] : [])
  }, [formKey])

  const toggleMember = (id: string) => {
    setMemberIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))
    setMembersError('')
  }

  const submit = async () => {
    if (saving) return
    const nextName = name.trim()
    const nextDescription = description.trim()
    const nextNameError = nextName ? '' : t('boardNameRequired')
    const nextDescriptionError = nextDescription ? '' : t('boardDescriptionRequired')
    const nextMembersError = memberIds.length > 0 ? '' : t('boardMembersRequired')
    setNameError(nextNameError)
    setDescriptionError(nextDescriptionError)
    setMembersError(nextMembersError)
    if (nextNameError || nextDescriptionError || nextMembersError) return
    setSaving(true)
    const ok = await addBoard({ name: nextName, description: nextDescription, memberIds })
    setSaving(false)
    if (!ok) return
    setSearchQuery('')
    onClose()
  }

  return (
    <Modal
      open={open}
      title={t('newBoard')}
      description={t('newBoardHint')}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            {t('cancel')}
          </Button>
          <Button type="submit" form="new-board-form" disabled={saving}>
            {t('createBoard')}
          </Button>
        </>
      }
    >
      <form
        id="new-board-form"
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          submit()
        }}
      >
        <Field label={t('boardName')} error={nameError || undefined}>
          <Input
            value={name}
            autoFocus
            onChange={(event) => {
              setName(event.target.value)
              setNameError('')
            }}
            placeholder={t('boardNamePlaceholder')}
          />
        </Field>
        <Field label={t('boardDescription')} error={descriptionError || undefined}>
          <Textarea
            value={description}
            onChange={(event) => {
              setDescription(event.target.value)
              setDescriptionError('')
            }}
            placeholder={t('boardDescriptionPlaceholder')}
          />
        </Field>
        <fieldset className="flex flex-col gap-1.5">
          <legend className="text-sm font-medium text-ink">{t('boardAccess')}</legend>
          <div className="max-h-52 overflow-y-auto rounded-lg border border-line">
            {members.map((member) => {
              const checked = memberIds.includes(member.id)
              return (
                <label
                  key={member.id}
                  className="flex cursor-pointer items-center gap-2.5 border-b border-line px-2.5 py-2 last:border-b-0 hover:bg-zinc-50"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleMember(member.id)}
                    className="h-4 w-4 shrink-0 accent-accent"
                  />
                  <Avatar user={member} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink">
                      {member.name}
                      {member.id === currentUser.id ? <span className="font-normal text-faint"> · {t('you')}</span> : null}
                    </span>
                    <span className="block truncate text-xs text-faint">{roleText(locale, member.role)}</span>
                  </span>
                </label>
              )
            })}
          </div>
          {membersError ? <span className="text-xs text-rose-600">{membersError}</span> : null}
        </fieldset>
      </form>
    </Modal>
  )
}
