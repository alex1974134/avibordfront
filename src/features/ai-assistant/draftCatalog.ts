import type { MessageKey } from '../../i18n/messages'
import type { TaskPriority } from '../../types'

export interface Copy {
  ru: string
  en: string
}

export interface DraftStep {
  title: (goal: string) => Copy
  detail: Copy
  priority: TaskPriority
  estimate: Copy
}

export interface DraftTheme {
  label: MessageKey
  test: RegExp
  steps: DraftStep[]
}

export const generalSteps: DraftStep[] = [
  {
    title: (goal) => ({ ru: `Уточнить результат для «${goal}»`, en: `Clarify the outcome for “${goal}”` }),
    detail: {
      ru: 'Записать итог, ограничения и то, что точно не входит в работу.',
      en: 'Write down the outcome, the constraints, and what is out of scope.',
    },
    priority: 'high',
    estimate: { ru: '2 ч', en: '2 h' },
  },
  {
    title: () => ({ ru: 'Разрезать работу на короткие шаги', en: 'Split the work into short steps' }),
    detail: {
      ru: 'Выстроить порядок самых маленьких частей, которые можно сдать отдельно.',
      en: 'Order the smallest pieces that can be delivered on their own.',
    },
    priority: 'high',
    estimate: { ru: '3 ч', en: '3 h' },
  },
  {
    title: () => ({ ru: 'Назначить ответственных и точку проверки', en: 'Assign owners and a review point' }),
    detail: {
      ru: 'Сопоставить каждый шаг с человеком и решить, кто принимает результат.',
      en: 'Match each step with a person and decide who accepts the result.',
    },
    priority: 'medium',
    estimate: { ru: '1 ч', en: '1 h' },
  },
  {
    title: () => ({ ru: 'Сверить результат с исходным запросом', en: 'Check the result against the original request' }),
    detail: {
      ru: 'Сравнить сделанное с изначальной целью, прежде чем закрывать.',
      en: 'Compare what was done with the original goal before closing it.',
    },
    priority: 'medium',
    estimate: { ru: '1 ч', en: '1 h' },
  },
]

export const draftThemes: DraftTheme[] = [
  {
    label: 'themeDesign',
    test: /design|ui|layout|screen|page|dashboard|wireframe|дизайн|макет|экран|страниц|обзор|интерфейс/i,
    steps: [
      {
        title: (goal) => ({ ru: `Собрать сценарий для «${goal}»`, en: `Map the flow for “${goal}”` }),
        detail: {
          ru: 'Назвать пользователя, точку входа и состояние, которое считается готовым.',
          en: 'Name the user, the entry point, and the state that counts as done.',
        },
        priority: 'high',
        estimate: { ru: '2 ч', en: '2 h' },
      },
      {
        title: () => ({ ru: 'Набросать ключевые экраны', en: 'Sketch the key screens' }),
        detail: {
          ru: 'Закрыть пустое, загрузочное и готовое состояния до визуальной полировки.',
          en: 'Cover empty, loading, and ready states before visual polish.',
        },
        priority: 'high',
        estimate: { ru: '1 д', en: '1 d' },
      },
      {
        title: () => ({ ru: 'Сверить черновик с разработкой', en: 'Review the draft with engineering' }),
        detail: {
          ru: 'Отметить, что можно переиспользовать, а чему нужен новый компонент.',
          en: 'Mark what can be reused and what needs a new component.',
        },
        priority: 'medium',
        estimate: { ru: '1 ч', en: '1 h' },
      },
      {
        title: () => ({ ru: 'Описать передачу в разработку', en: 'Write the handoff notes' }),
        detail: {
          ru: 'Оставить отступы, тексты и заметки о поведении, по которым можно собрать экран.',
          en: 'Leave spacing, copy, and behavior notes someone can build from.',
        },
        priority: 'low',
        estimate: { ru: '2 ч', en: '2 h' },
      },
    ],
  },
  {
    label: 'themeMarketing',
    test: /market|launch|website|copy|homepage|pricing|campaign|маркет|запуск|сайт|текст|цен|кампан/i,
    steps: [
      {
        title: (goal) => ({ ru: `Сформулировать сообщение для «${goal}»`, en: `Write the message for “${goal}”` }),
        detail: {
          ru: 'Написать одну фразу, которую посетитель сможет повторить после страницы.',
          en: 'Write one sentence a visitor could repeat after the page.',
        },
        priority: 'high',
        estimate: { ru: '2 ч', en: '2 h' },
      },
      {
        title: () => ({ ru: 'Наметить страницу или материал', en: 'Outline the page or asset' }),
        detail: {
          ru: 'Выстроить блоки и доказательства, которые нужны каждому из них.',
          en: 'Lay out the sections and the proof each one needs.',
        },
        priority: 'medium',
        estimate: { ru: '3 ч', en: '3 h' },
      },
      {
        title: () => ({ ru: 'Проверить формулировки с продуктом и дизайном', en: 'Check the wording with product and design' }),
        detail: {
          ru: 'Сверить обещания с тем, что продукт действительно умеет.',
          en: 'Match the promises with what the product actually does.',
        },
        priority: 'medium',
        estimate: { ru: '1 ч', en: '1 h' },
      },
      {
        title: () => ({ ru: 'Собрать чеклист публикации', en: 'Build the publish checklist' }),
        detail: {
          ru: 'Ссылки, аналитика и человек, который делает финальный проход.',
          en: 'Links, analytics, and the person who does the final pass.',
        },
        priority: 'low',
        estimate: { ru: '1 ч', en: '1 h' },
      },
    ],
  },
  {
    label: 'themeIntegration',
    test: /api|backend|integrat|telegram|bot|webhook|auth|интеграц|телеграм|бот|авториз/i,
    steps: [
      {
        title: (goal) => ({ ru: `Описать контракт для «${goal}»`, en: `Describe the contract for “${goal}”` }),
        detail: {
          ru: 'Перечислить входы, выходы и ошибку, которую должен увидеть человек.',
          en: 'List the inputs, outputs, and the error a person should see.',
        },
        priority: 'critical',
        estimate: { ru: '3 ч', en: '3 h' },
      },
      {
        title: () => ({ ru: 'Пройти успешный сценарий', en: 'Walk the happy path' }),
        detail: {
          ru: 'Провести один удачный запрос от сигнала до созданной задачи.',
          en: 'Take one successful request from the signal to a created task.',
        },
        priority: 'high',
        estimate: { ru: '3 ч', en: '3 h' },
      },
      {
        title: () => ({ ru: 'Закрыть сценарии ошибок', en: 'Cover the failure cases' }),
        detail: {
          ru: 'Решить повторы, дубли и кому уходит уведомление.',
          en: 'Decide retries, duplicates, and who gets notified.',
        },
        priority: 'high',
        estimate: { ru: '2 ч', en: '2 h' },
      },
      {
        title: () => ({ ru: 'Написать заметку о запуске', en: 'Write the launch note' }),
        detail: {
          ru: 'Объяснить, как команда включает это и как понимает, что всё сработало.',
          en: 'Explain how the team turns it on and how they know it worked.',
        },
        priority: 'medium',
        estimate: { ru: '1 ч', en: '1 h' },
      },
    ],
  },
]
