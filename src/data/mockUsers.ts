import type { User } from '../types'

export const CURRENT_USER_ID = 'u-alex'

export const users: User[] = [
  {
    id: 'u-alex',
    name: 'Alex Morgan',
    role: 'Руководитель продукта',
    email: 'alex@aivibe.io',
    initials: 'AM',
    color: '#4f46e5',
    workspaceIds: ['ws-studio', 'ws-north'],
  },
  {
    id: 'u-sofia',
    name: 'Sofia Chen',
    role: 'Продуктовый дизайнер',
    email: 'sofia@aivibe.io',
    initials: 'SC',
    color: '#0f766e',
    workspaceIds: ['ws-studio'],
  },
  {
    id: 'u-marcus',
    name: 'Marcus Hale',
    role: 'Старший инженер',
    email: 'marcus@aivibe.io',
    initials: 'MH',
    color: '#9a3412',
    workspaceIds: ['ws-studio', 'ws-north'],
  },
  {
    id: 'u-nina',
    name: 'Nina Volkova',
    role: 'Фронтенд-инженер',
    email: 'nina@aivibe.io',
    initials: 'NV',
    color: '#1d4ed8',
    workspaceIds: ['ws-studio'],
  },
  {
    id: 'u-leo',
    name: 'Leo Park',
    role: 'Маркетинг',
    email: 'leo@aivibe.io',
    initials: 'LP',
    color: '#9d174d',
    workspaceIds: ['ws-studio'],
  },
  {
    id: 'u-maya',
    name: 'Maya Ortiz',
    role: 'Менеджер проектов',
    email: 'maya@aivibe.io',
    initials: 'MO',
    color: '#6d28d9',
    workspaceIds: ['ws-studio', 'ws-north'],
  },
  {
    id: 'u-owen',
    name: 'Owen Blake',
    role: 'Аналитик данных',
    email: 'owen@northwind.io',
    initials: 'OB',
    color: '#0369a1',
    workspaceIds: ['ws-north'],
  },
]
