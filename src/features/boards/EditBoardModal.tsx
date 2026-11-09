import { useEffect, useState } from 'react'
import type { Project } from '../../types'
import { roleText } from '../../i18n/content'
import { useI18n } from '../../i18n/useI18n'
import { useWorkspaceData } from '../../hooks/useWorkspaceData'
import { useAppStore } from '../../store/useAppStore'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { Field, Input, Textarea } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'

export function EditBoardModal({
  project,
  open,
  onClose,
}: {
  project: Project | null
  open: boolean
  onClose: () => void
}) {
  const updateBoard = useAppStore((state) => state.updateBoard)
  const { members, currentUser } = useWorkspaceData()
  const { locale, t } = useI18n()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [memberIds, setMemberIds] = useState<string[]>([])
  const [nameError, setNameError] = useState('')
  const [descriptionError, setDescriptionError] = useState('')
  const [membersError, setMembersError] = useState('')

  useEffect(() => {
    if (!open || !project) return
    setName(project.name)
    setDescription(project.description)
    setMemberIds([...project.memberIds])
    setNameError('')
    setDescriptionError('')
    setMembersError('')
  }, [open, project])

  const toggleMember = (id: string) => {
    setMemberIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))
    setMembersError('')
  }

  const submit = () => {
    if (!project) return
    const nextName = name.trim()
    const nextDescription = description.trim()
    const nextNameError = nextName ? '' : t('boardNameRequired')
    const nextDescriptionError = nextDescription ? '' : t('boardDescriptionRequired')
    const nextMembersError = memberIds.length > 0 ? '' : t('boardMembersRequired')
    setNameError(nextNameError)
    setDescriptionError(nextDescriptionError)
    setMembersError(nextMembersError)
    if (nextNameError || nextDescriptionError || nextMembersError) return
    const ok = updateBoard(project.id, { name: nextName, description: nextDescription, memberIds })
    if (!ok) return
    onClose()
  }

  if (!project) return null

  return (
    <Modal
      open={open}
      title={t('editBoard')}
      description={t('editBoardHint')}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button type="submit" form="edit-board-form">
            {t('saveBoard')}
          </Button>
        </>
      }
    >
      <form
        id="edit-board-form"
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
