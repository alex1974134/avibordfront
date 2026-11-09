import { useWorkspaceData } from '../../hooks/useWorkspaceData'
import { roleText } from '../../i18n/content'
import { useI18n } from '../../i18n/useI18n'
import { countWord } from '../../utils/format'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { Page, PageIntro } from '../../components/ui/PageIntro'
import { Avatar } from '../../components/ui/Avatar'
import { InviteButton } from '../../features/team/InviteModal'

export function TeamPage() {
  const { members, allProjects, currentUser } = useWorkspaceData()
  const { locale, t } = useI18n()

  return (
    <Page>
      <PageIntro
        title={t('navTeam')}
        description={t('teamIntro')}
        actions={<InviteButton />}
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {members.map((member) => {
          const projectCount = allProjects.filter((project) => project.memberIds.includes(member.id)).length
          return (
            <Card key={member.id}>
              <div className="flex items-start gap-3">
                <Avatar user={member} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-ink">{member.name}</p>
                    {member.id === currentUser.id ? <Badge tone="accent">{t('you')}</Badge> : null}
                  </div>
                  <p className="truncate text-xs text-muted">{roleText(locale, member.role)}</p>
                  <p className="mt-2 truncate text-xs text-faint">{member.email}</p>
                </div>
              </div>
              <p className="mt-4 text-xs text-faint">
                {projectCount} {countWord(locale, projectCount, 'project')}
              </p>
            </Card>
          )
        })}
      </div>
    </Page>
  )
}
