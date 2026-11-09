import type { Locale } from './locale'
import { translate } from './translate'

interface Pair {
  ru: string
  en: string
}

const pairs: Array<[string, string, string]> = [
  ['project.p-aivibe.name', 'Разработка AivibeBoard', 'AivibeBoard development'],
  ['project.p-aivibe.description', 'Оболочка продукта, модель задач и AI-сценарии поверх них.', 'The product shell, the task model, and AI flows on top of them.'],
  ['project.p-medialog.name', 'Платформа Medialog AI', 'Medialog AI platform'],
  ['project.p-medialog.description', 'Поиск по знаниям и сценарии проверки для клинической команды.', 'Knowledge search and review flows for the clinical team.'],
  ['project.p-marketing.name', 'Маркетинговый сайт', 'Marketing site'],
  ['project.p-marketing.description', 'Сайт запуска, история продукта и форма раннего доступа.', 'Launch site, product story, and early-access form.'],
  ['project.p-automation.name', 'Внутренняя автоматизация', 'Internal automation'],
  ['project.p-automation.description', 'Приём заявок, маршрутизация и еженедельный отчёт, который команда читает.', 'Intake, routing, and the weekly report the team actually reads.'],
  ['project.p-insights.name', 'Дашборд аналитики', 'Analytics dashboard'],
  ['project.p-insights.description', 'Спокойный срез состояния воронки для встречи с руководством.', 'A calm funnel snapshot for the leadership meeting.'],
  ['project.p-migration.name', 'Миграция данных', 'Data migration'],
  ['project.p-migration.description', 'Перенос старых выгрузок в общую модель хранилища.', 'Moving old exports into the shared warehouse model.'],
  ['task.t1.title', 'Описать промпт декомпозиции задач', 'Write the task decomposition prompt'],
  ['task.t2.title', 'Уточнить иерархию информации на обзоре', 'Clarify the information hierarchy on the overview'],
  ['task.t3.title', 'Согласовать текст главного экрана', 'Agree the home screen copy'],
  ['task.t4.title', 'Разобрать риски поставки Medialog', 'Review Medialog delivery risks'],
  ['task.t5.title', 'Описать приём задач из Telegram', 'Describe task intake from Telegram'],
  ['task.t6.title', 'Закрыть действия с ретроспективы', 'Close the retrospective actions'],
  ['task.t7.title', 'Нарисовать пустые состояния проектов', 'Draw the empty states for projects'],
  ['task.t8.title', 'Обновить обработку сессии авторизации', 'Update auth session handling'],
  ['task.t9.title', 'Набросать контракт API задач', 'Sketch the tasks API contract'],
  ['task.t10.title', 'Довести панель цитат', 'Finish the citations panel'],
  ['task.t11.title', 'Задать лимиты загрузки в базу знаний', 'Set knowledge base upload limits'],
  ['task.t12.title', 'Закончить чеклист запуска', 'Finish the launch checklist'],
  ['task.t13.title', 'Сверстать блок с ценами', 'Build the pricing block'],
  ['task.t14.title', 'Набросать еженедельную сводку', 'Draft the weekly summary'],
  ['task.t15.title', 'Описать правила маршрутизации заявок', 'Describe request routing rules'],
  ['task.t16.title', 'Подготовить отчёт для стейкхолдеров', 'Prepare the stakeholder report'],
  ['task.t17.title', 'Определить метрики воронки', 'Define funnel metrics'],
  ['task.t18.title', 'Добавить подписи к графикам', 'Add labels to the charts'],
  ['task.t19.title', 'Проверить схему хранилища', 'Check the warehouse schema'],
  ['task.t20.title', 'Сопоставить поля старого CSV', 'Map the old CSV fields'],
  ['doc.d1.name', 'Бриф продукта AivibeBoard.pdf', 'AivibeBoard product brief.pdf'],
  ['doc.d2.name', 'Заметки о модели задач.md', 'Task model notes.md'],
  ['doc.d3.name', 'Макеты обзора.fig', 'Overview mockups.fig'],
  ['doc.d4.name', 'Исследование Medialog.docx', 'Medialog research.docx'],
  ['doc.d5.name', 'Чеклист запуска.pdf', 'Launch checklist.pdf'],
  ['doc.d6.name', 'Спецификация приёма из Telegram.md', 'Telegram intake spec.md'],
  ['doc.d7.name', 'Метрики аналитики.xlsx', 'Analytics metrics.xlsx'],
  ['doc.d8.name', 'Сопоставление хранилища.csv', 'Warehouse mapping.csv'],
  ['note.n1.title', 'Нужна проверка', 'Review needed'],
  ['note.n1.body', 'София просит посмотреть иерархию обзора.', 'Sofia asked for a look at the overview hierarchy.'],
  ['note.n2.title', 'Срок завтра', 'Due tomorrow'],
  ['note.n2.body', 'Промпт декомпозиции задач нужно сдать 3 ноября.', 'The task decomposition prompt is due on November 3.'],
  ['note.n3.title', 'Medialog отстаёт', 'Medialog is behind'],
  ['note.n3.body', 'Майя отметила платформу Medialog AI как рискованную.', 'Maya marked the Medialog AI platform as at risk.'],
  ['note.n4.title', 'Новый комментарий', 'New comment'],
  ['note.n4.body', 'Нина прокомментировала контракт API задач.', 'Nina commented on the tasks API contract.'],
  ['note.n5.title', 'Заметки к отчёту', 'Notes for the report'],
  ['note.n5.body', 'Оуэн поделился заметками к отчёту для стейкхолдеров.', 'Owen shared notes for the stakeholder report.'],
  ['note.n6.title', 'Схема перенесена', 'Schema moved back'],
  ['note.n6.body', 'Маркус вернул проверку схемы хранилища в «К выполнению».', 'Marcus moved the warehouse schema check back to To do.'],
  ['activity.a5.detail', 'Предложила набор статусов и поле исполнителя.', 'Suggested a set of statuses and an assignee field.'],
  ['activity.a7.detail', 'Добавил три аккаунта, которые нужно выделить.', 'Added three accounts that should be called out.'],
  ['workspace.ws-studio.trend', '+1 за месяц', '+1 this month'],
  ['workspace.ws-north.plan', 'Команда', 'Team'],
  ['workspace.ws-north.trend', 'Без изменений', 'No change'],
]

const catalog = new Map<string, Pair>()
const byRu = new Map<string, string>()
const byEn = new Map<string, string>()

for (const [key, ru, en] of pairs) {
  catalog.set(key, { ru, en })
  byRu.set(ru, en)
  byEn.set(en, ru)
}

export function localized(locale: Locale, key: string, value: string): string {
  const pair = catalog.get(key)
  if (pair && (value === pair.ru || value === pair.en)) return pair[locale]
  if (locale === 'en') return byRu.get(value) ?? value
  return byEn.get(value) ?? value
}

export function searchBlob(key: string, value: string): string {
  const pair = catalog.get(key)
  if (!pair) return value
  return `${pair.ru} ${pair.en}`
}

const roles: Pair[] = [
  { ru: 'Руководитель продукта', en: 'Product lead' },
  { ru: 'Продуктовый дизайнер', en: 'Product designer' },
  { ru: 'Старший инженер', en: 'Senior engineer' },
  { ru: 'Фронтенд-инженер', en: 'Frontend engineer' },
  { ru: 'Маркетинг', en: 'Marketing' },
  { ru: 'Менеджер проектов', en: 'Project manager' },
  { ru: 'Аналитик данных', en: 'Data analyst' },
  { ru: 'Участник', en: 'Member' },
  { ru: 'Продукт', en: 'Product' },
  { ru: 'Дизайн', en: 'Design' },
  { ru: 'Разработка', en: 'Engineering' },
  { ru: 'Операции', en: 'Operations' },
]

export const inviteRoleIds = ['product', 'design', 'engineering', 'marketing', 'operations'] as const

const inviteRoles: Record<(typeof inviteRoleIds)[number], Pair> = {
  product: { ru: 'Продукт', en: 'Product' },
  design: { ru: 'Дизайн', en: 'Design' },
  engineering: { ru: 'Разработка', en: 'Engineering' },
  marketing: { ru: 'Маркетинг', en: 'Marketing' },
  operations: { ru: 'Операции', en: 'Operations' },
}

export function displayWorkspaceName(locale: Locale, workspace: { id: string; name: string } | undefined): string {
  if (!workspace) return translate(locale, 'spaceFallback')
  return localized(locale, `workspace.${workspace.id}.name`, workspace.name)
}

export function roleText(locale: Locale, role: string): string {
  const invite = inviteRoles[role as (typeof inviteRoleIds)[number]]
  if (invite) return invite[locale]
  const pair = roles.find((item) => item.ru === role || item.en === role)
  return pair ? pair[locale] : role
}
