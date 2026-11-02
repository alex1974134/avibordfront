import type { GeneratedTask, TaskPriority } from '../types'

interface Step {
  title: (goal: string) => string
  detail: string
  priority: TaskPriority
  estimate: string
}

interface Theme {
  label: string
  test: RegExp
  steps: Step[]
}

export interface DraftPlan {
  summary: string
  tasks: GeneratedTask[]
}

function shorten(prompt: string): string {
  const clean = prompt.replace(/\s+/g, ' ').trim()
  if (clean.length <= 84) return clean
  return `${clean.slice(0, 81)}...`
}

const general: Step[] = [
  {
    title: (goal) => `Уточнить результат для «${goal}»`,
    detail: 'Записать итог, ограничения и то, что точно не входит в работу.',
    priority: 'high',
    estimate: '2 ч',
  },
  {
    title: () => 'Разрезать работу на короткие шаги',
    detail: 'Выстроить порядок самых маленьких частей, которые можно сдать отдельно.',
    priority: 'high',
    estimate: '3 ч',
  },
  {
    title: () => 'Назначить ответственных и точку проверки',
    detail: 'Сопоставить каждый шаг с человеком и решить, кто принимает результат.',
    priority: 'medium',
    estimate: '1 ч',
  },
  {
    title: () => 'Сверить результат с исходным запросом',
    detail: 'Сравнить сделанное с изначальной целью, прежде чем закрывать.',
    priority: 'medium',
    estimate: '1 ч',
  },
]

const themes: Theme[] = [
  {
    label: 'дизайн',
    test: /design|ui|layout|screen|page|dashboard|wireframe|дизайн|макет|экран|страниц|обзор|интерфейс/i,
    steps: [
      {
        title: (goal) => `Собрать сценарий для «${goal}»`,
        detail: 'Назвать пользователя, точку входа и состояние, которое считается готовым.',
        priority: 'high',
        estimate: '2 ч',
      },
      {
        title: () => 'Набросать ключевые экраны',
        detail: 'Закрыть пустое, загрузочное и готовое состояния до визуальной полировки.',
        priority: 'high',
        estimate: '1 д',
      },
      {
        title: () => 'Сверить черновик с разработкой',
        detail: 'Отметить, что можно переиспользовать, а чему нужен новый компонент.',
        priority: 'medium',
        estimate: '1 ч',
      },
      {
        title: () => 'Описать передачу в разработку',
        detail: 'Оставить отступы, тексты и заметки о поведении, по которым можно собрать экран.',
        priority: 'low',
        estimate: '2 ч',
      },
    ],
  },
  {
    label: 'маркетинг',
    test: /market|launch|website|copy|homepage|pricing|campaign|маркет|запуск|сайт|текст|цен|кампан/i,
    steps: [
      {
        title: (goal) => `Сформулировать сообщение для «${goal}»`,
        detail: 'Написать одну фразу, которую посетитель сможет повторить после страницы.',
        priority: 'high',
        estimate: '2 ч',
      },
      {
        title: () => 'Наметить страницу или материал',
        detail: 'Выстроить блоки и доказательства, которые нужны каждому из них.',
        priority: 'medium',
        estimate: '3 ч',
      },
      {
        title: () => 'Проверить формулировки с продуктом и дизайном',
        detail: 'Сверить обещания с тем, что продукт действительно умеет.',
        priority: 'medium',
        estimate: '1 ч',
      },
      {
        title: () => 'Собрать чеклист публикации',
        detail: 'Ссылки, аналитика и человек, который делает финальный проход.',
        priority: 'low',
        estimate: '1 ч',
      },
    ],
  },
  {
    label: 'интеграция',
    test: /api|backend|integrat|telegram|bot|webhook|auth|интеграц|телеграм|бот|авториз/i,
    steps: [
      {
        title: (goal) => `Описать контракт для «${goal}»`,
        detail: 'Перечислить входы, выходы и ошибку, которую должен увидеть человек.',
        priority: 'critical',
        estimate: '3 ч',
      },
      {
        title: () => 'Пройти успешный сценарий',
        detail: 'Провести один удачный запрос от сигнала до созданной задачи.',
        priority: 'high',
        estimate: '3 ч',
      },
      {
        title: () => 'Закрыть сценарии ошибок',
        detail: 'Решить повторы, дубли и кому уходит уведомление.',
        priority: 'high',
        estimate: '2 ч',
      },
      {
        title: () => 'Написать заметку о запуске',
        detail: 'Объяснить, как команда включает это и как понимает, что всё сработало.',
        priority: 'medium',
        estimate: '1 ч',
      },
    ],
  },
]

export function draftPlan(prompt: string, assigneeIds: string[]): DraftPlan {
  const goal = shorten(prompt)
  const theme = themes.find((item) => item.test.test(prompt))
  const steps = theme?.steps ?? general
  const tasks = steps.map((step, index) => ({
    id: crypto.randomUUID(),
    title: step.title(goal),
    detail: step.detail,
    priority: step.priority,
    estimate: step.estimate,
    assigneeId: assigneeIds[index % Math.max(assigneeIds.length, 1)] ?? '',
  }))

  return {
    summary: theme
      ? `Собрано ${tasks.length} задач по теме «${theme.label}». Для каждой предложен исполнитель.`
      : `Собрано ${tasks.length} задач по вашей заметке. Для каждой предложен исполнитель.`,
    tasks,
  }
}
