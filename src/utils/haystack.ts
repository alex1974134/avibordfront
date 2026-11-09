import { searchBlob } from '../i18n/content'

export function projectSearchText(project: { id: string; name: string; description: string }): string {
  return `${searchBlob(`project.${project.id}.name`, project.name)} ${searchBlob(`project.${project.id}.description`, project.description)}`
}

export function projectNameText(project: { id: string; name: string }): string {
  return searchBlob(`project.${project.id}.name`, project.name)
}

export function taskSearchText(task: { id: string; title: string }, projectName = ''): string {
  const title = searchBlob(`task.${task.id}.title`, task.title)
  return projectName ? `${title} ${projectName}` : title
}
