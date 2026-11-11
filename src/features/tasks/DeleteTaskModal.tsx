import { localized } from '../../i18n/content'
import { useI18n } from '../../i18n/useI18n'
import { useAppStore } from '../../store/useAppStore'
import type { Task } from '../../types'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'

export function DeleteTaskModal({
  task,
  open,
  onClose,
}: {
  task: Task | null
  open: boolean
  onClose: () => void
}) {
  const deleteTask = useAppStore((state) => state.deleteTask)
  const { locale, t } = useI18n()

  if (!task) return null

  const title = localized(locale, `task.${task.id}.title`, task.title)

  const confirm = () => {
    deleteTask(task.id)
    onClose()
  }

  return (
    <Modal
      open={open}
      title={t('deleteTaskTitle')}
      description={t('deleteTaskBody', { name: title })}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button variant="danger" onClick={confirm}>
            {t('deleteTask')}
          </Button>
        </>
      }
    >
      {null}
    </Modal>
  )
}
