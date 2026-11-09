import { localized } from '../../i18n/content'
import { useI18n } from '../../i18n/useI18n'
import type { Project } from '../../types'
import { useAppStore } from '../../store/useAppStore'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'

export function DeleteBoardModal({
  project,
  open,
  onClose,
}: {
  project: Project | null
  open: boolean
  onClose: () => void
}) {
  const deleteBoard = useAppStore((state) => state.deleteBoard)
  const { locale, t } = useI18n()

  if (!project) return null

  const displayName = localized(locale, `project.${project.id}.name`, project.name)

  const confirm = () => {
    deleteBoard(project.id)
    onClose()
  }

  return (
    <Modal
      open={open}
      title={t('deleteBoardTitle')}
      description={t('deleteBoardBody', { name: displayName })}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button variant="danger" onClick={confirm}>
            {t('deleteBoardConfirm')}
          </Button>
        </>
      }
    >
      <p className="text-sm text-muted">{t('deleteBoardNote')}</p>
    </Modal>
  )
}
